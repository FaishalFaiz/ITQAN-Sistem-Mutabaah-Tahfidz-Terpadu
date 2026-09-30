-- ==============================================================================
-- ITQAN: Sistem Mutaba'ah & Evaluasi Tahfidz Terpadu untuk Pesantren Modern
-- Database Schema for Supabase (PostgreSQL 15+)
-- File: supabase/schema.sql
-- ==============================================================================
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard > Pilih Proyek Anda
-- 2. Masuk ke menu "SQL Editor" (ikon terminal di sidebar kiri)
-- 3. Klik "New query", paste seluruh isi file ini, lalu klik "Run" (Ctrl+Enter)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUM TYPES
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE santri_status_type AS ENUM ('tercapai', 'tidak_tercapai', 'belum_setor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE setoran_type AS ENUM ('ziyadah', 'murojaah');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grade_type AS ENUM ('mumtaz', 'jayyid', 'iadah');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wa_provider_type AS ENUM ('fonnte', 'waha', 'wablas', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wa_message_status_type AS ENUM ('not_sent', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wa_log_status_type AS ENUM ('success', 'failed', 'fallback_opened');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wa_log_message_type AS ENUM ('setoran', 'broadcast', 'test', 'daily_report');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- 3.1 Tabel Halaqah & Pengaturan Musyrif
CREATE TABLE IF NOT EXISTS halaqah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    musyrif_name VARCHAR(255) NOT NULL,
    musyrif_phone VARCHAR(50),
    musyrif_email VARCHAR(255),
    standard_daily_target_lines INT NOT NULL DEFAULT 12,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Tabel Santri
CREATE TABLE IF NOT EXISTS santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    halaqah_id UUID REFERENCES halaqah(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    nis VARCHAR(50) UNIQUE NOT NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    juz_achieved NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    lines_completed_today INT NOT NULL DEFAULT 0,
    daily_target_lines INT NOT NULL DEFAULT 12,
    total_lines_memorized INT NOT NULL DEFAULT 0,
    total_lines_target INT NOT NULL DEFAULT 9060, -- Standar 30 Juz (604 hal * 15 baris)
    status santri_status_type NOT NULL DEFAULT 'belum_setor',
    last_surah VARCHAR(255) DEFAULT '-',
    avatar_initials VARCHAR(10) NOT NULL DEFAULT 'ST',
    last_daily_report_sent_date DATE,
    last_daily_report_sent_time VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Tabel Riwayat Setoran Mutaba'ah (Ziyadah & Muroja'ah)
CREATE TABLE IF NOT EXISTS setoran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    type setoran_type NOT NULL,
    juz INT NOT NULL CHECK (juz BETWEEN 1 AND 30),
    surah_name VARCHAR(100) NOT NULL,
    page_start INT NOT NULL CHECK (page_start >= 1),
    page_end INT NOT NULL CHECK (page_end >= page_start),
    line_start INT NOT NULL DEFAULT 1 CHECK (line_start BETWEEN 1 AND 15),
    line_end INT NOT NULL DEFAULT 15 CHECK (line_end BETWEEN 1 AND 15),
    total_lines INT NOT NULL CHECK (total_lines > 0),
    grade grade_type NOT NULL DEFAULT 'mumtaz',
    musyrif_name VARCHAR(255) NOT NULL,
    notes TEXT,
    wa_status wa_message_status_type NOT NULL DEFAULT 'not_sent',
    wa_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 Tabel Ujian Tasmi' / Kenaikan Juz
CREATE TABLE IF NOT EXISTS ujian_tasmi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    juz INT NOT NULL CHECK (juz BETWEEN 1 AND 30),
    penguji_name VARCHAR(255) NOT NULL,
    ketukan_ringan INT NOT NULL DEFAULT 0, -- Tawaqquf / Salah Ringan (-0.5 poin)
    salah_fatal INT NOT NULL DEFAULT 0,    -- Fath / Dibetulkan (-2.0 poin)
    tajwid_score NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    fashahah_score NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    penalty_score NUMERIC(5,2) GENERATED ALWAYS AS (ketukan_ringan * 0.5 + salah_fatal * 2.0) STORED,
    final_score NUMERIC(5,2) NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 Tabel Konfigurasi WhatsApp Gateway
CREATE TABLE IF NOT EXISTS wa_gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    halaqah_id UUID REFERENCES halaqah(id) ON DELETE CASCADE,
    provider wa_provider_type NOT NULL DEFAULT 'fonnte',
    endpoint_url TEXT NOT NULL DEFAULT 'https://api.fonnte.com/send',
    api_key TEXT DEFAULT '',
    sender_number VARCHAR(50) DEFAULT '6281234567890',
    auto_send_on_setoran BOOLEAN NOT NULL DEFAULT false,
    limit_one_message_per_day BOOLEAN NOT NULL DEFAULT true,
    template_daily_progress TEXT NOT NULL,
    template_ziyadah TEXT NOT NULL,
    template_murojaah TEXT NOT NULL,
    template_halaqah_digest TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.6 Tabel Log Pengiriman Pesan WhatsApp (Audit Trail)
CREATE TABLE IF NOT EXISTS wa_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID REFERENCES santri(id) ON DELETE SET NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    message_type wa_log_message_type NOT NULL DEFAULT 'daily_report',
    status wa_log_status_type NOT NULL DEFAULT 'success',
    status_text TEXT,
    message_snippet TEXT,
    payload_sent JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_santri_nis ON santri(nis);
CREATE INDEX IF NOT EXISTS idx_santri_halaqah_id ON santri(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_santri_name ON santri(name);
CREATE INDEX IF NOT EXISTS idx_setoran_santri_date ON setoran(santri_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_setoran_created_at ON setoran(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ujian_santri_id ON ujian_tasmi(santri_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_created_at ON wa_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_logs_santri_id ON wa_logs(santri_id);

-- ==============================================================================
-- 5. BUSINESS LOGIC: AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 5.1 Helper function update updated_at timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_halaqah_updated_at ON halaqah;
CREATE TRIGGER trg_halaqah_updated_at
BEFORE UPDATE ON halaqah
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_santri_updated_at ON santri;
CREATE TRIGGER trg_santri_updated_at
BEFORE UPDATE ON santri
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wa_config_updated_at ON wa_gateway_config;
CREATE TRIGGER trg_wa_config_updated_at
BEFORE UPDATE ON wa_gateway_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 Auto-Recalculate Mutaba'ah Santri saat Setoran Baru Masuk
CREATE OR REPLACE FUNCTION handle_new_setoran()
RETURNS TRIGGER AS $$
DECLARE
    v_today_date DATE := CURRENT_DATE;
    v_total_today INT;
    v_target INT;
    v_santri RECORD;
    v_new_total_memorized INT;
    v_new_juz_achieved NUMERIC(4, 2);
BEGIN
    SELECT * INTO v_santri FROM santri WHERE id = NEW.santri_id;
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    -- Hitung total baris yang disetor hari ini oleh santri
    SELECT COALESCE(SUM(total_lines), 0) INTO v_total_today
    FROM setoran
    WHERE santri_id = NEW.santri_id
      AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = v_today_date;

    v_target := v_santri.daily_target_lines;

    -- Update akumulasi hafalan jika tipe Ziyadah
    IF NEW.type = 'ziyadah' THEN
        v_new_total_memorized := v_santri.total_lines_memorized + NEW.total_lines;
        -- Standar Al-Quran: ~302 baris per 1 Juz (15 baris * 20.13 halaman)
        v_new_juz_achieved := ROUND((v_new_total_memorized::numeric / 302.0), 1);
        IF v_new_juz_achieved > 30.0 THEN
            v_new_juz_achieved := 30.0;
        END IF;
    ELSE
        v_new_total_memorized := v_santri.total_lines_memorized;
        v_new_juz_achieved := v_santri.juz_achieved;
    END IF;

    -- Update state tabel santri
    UPDATE santri
    SET 
        lines_completed_today = v_total_today,
        status = CASE 
            WHEN v_total_today >= v_target THEN 'tercapai'::santri_status_type
            WHEN v_total_today > 0 THEN 'tidak_tercapai'::santri_status_type
            ELSE 'belum_setor'::santri_status_type
        END,
        total_lines_memorized = v_new_total_memorized,
        juz_achieved = v_new_juz_achieved,
        last_surah = NEW.surah_name,
        updated_at = now()
    WHERE id = NEW.santri_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_setoran_insert ON setoran;
CREATE TRIGGER trg_after_setoran_insert
AFTER INSERT ON setoran
FOR EACH ROW EXECUTE FUNCTION handle_new_setoran();

-- 5.3 Stored Procedure: Catat Pengiriman Laporan Harian WA
CREATE OR REPLACE FUNCTION record_daily_report_sent(
    p_santri_id UUID,
    p_recipient_name TEXT,
    p_recipient_phone TEXT,
    p_snippet TEXT,
    p_status wa_log_status_type DEFAULT 'success'
)
RETURNS JSONB AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_time_str VARCHAR(50);
BEGIN
    v_time_str := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB';

    -- Update info pada santri
    UPDATE santri
    SET 
        last_daily_report_sent_date = v_today,
        last_daily_report_sent_time = v_time_str,
        updated_at = now()
    WHERE id = p_santri_id;

    -- Catat ke audit log
    INSERT INTO wa_logs (
        santri_id,
        recipient_name,
        recipient_phone,
        message_type,
        status,
        status_text,
        message_snippet
    ) VALUES (
        p_santri_id,
        p_recipient_name,
        p_recipient_phone,
        'daily_report',
        p_status,
        'Laporan mutabaah harian terkirim ke wali',
        p_snippet
    );

    RETURN jsonb_build_object(
        'success', true,
        'santri_id', p_santri_id,
        'date', v_today,
        'time', v_time_str
    );
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 6. VIEWS FOR DASHBOARD & REPORTING
-- ==============================================================================

-- 6.1 View Dashboard Santri & Status Laporan Hari Ini
CREATE OR REPLACE VIEW v_santri_dashboard AS
SELECT 
    s.id,
    s.name,
    s.nis,
    s.parent_name,
    s.parent_phone,
    s.juz_achieved,
    s.lines_completed_today,
    s.daily_target_lines,
    s.total_lines_memorized,
    s.total_lines_target,
    s.status,
    s.last_surah,
    s.avatar_initials,
    h.name AS halaqah_name,
    h.musyrif_name,
    s.last_daily_report_sent_date,
    s.last_daily_report_sent_time,
    CASE 
        WHEN s.last_daily_report_sent_date = CURRENT_DATE THEN true 
        ELSE false 
    END AS is_report_sent_today,
    s.is_active,
    s.created_at
FROM santri s
LEFT JOIN halaqah h ON s.halaqah_id = h.id
ORDER BY s.nis ASC;

-- 6.2 View Ringkasan Setoran Hari Ini
CREATE OR REPLACE VIEW v_setoran_hari_ini AS
SELECT 
    st.id,
    st.santri_id,
    s.name AS santri_name,
    s.nis,
    st.type,
    st.juz,
    st.surah_name,
    st.page_start,
    st.page_end,
    st.line_start,
    st.line_end,
    st.total_lines,
    st.grade,
    st.musyrif_name,
    st.notes,
    st.wa_status,
    st.wa_sent_at,
    st.created_at,
    to_char(st.created_at AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY, HH24:MI') || ' WIB' AS formatted_date
FROM setoran st
JOIN santri s ON st.santri_id = s.id
WHERE DATE(st.created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE
ORDER BY st.created_at DESC;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Catatan: RLS diaktifkan untuk keamanan masa depan.
-- Karena Authentication masih akan diintegrasikan nanti, kita buat kebijakan
-- terbuka penuh (Permissive) untuk role 'anon' dan 'authenticated'
-- agar frontend Supabase Client dapat langsung SELECT, INSERT, UPDATE, DELETE tanpa error 403.

ALTER TABLE halaqah ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;
ALTER TABLE ujian_tasmi ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_gateway_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access halaqah" ON halaqah FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access santri" ON santri FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access setoran" ON setoran FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access ujian_tasmi" ON ujian_tasmi FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access wa_gateway_config" ON wa_gateway_config FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access wa_logs" ON wa_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. INITIAL SEED DATA (DATA AWAL SIAP PAKAI)
-- ==============================================================================

-- 8.1 Halaqah Default
INSERT INTO halaqah (id, name, musyrif_name, musyrif_phone, standard_daily_target_lines)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Halaqoh Abu Bakar Ash-Shiddiq',
    'Ust. Abdullah',
    '081234567800',
    12
) ON CONFLICT (id) DO NOTHING;

-- 8.2 Konfigurasi WhatsApp Gateway Default
INSERT INTO wa_gateway_config (
    halaqah_id,
    provider,
    endpoint_url,
    api_key,
    sender_number,
    auto_send_on_setoran,
    limit_one_message_per_day,
    template_daily_progress,
    template_ziyadah,
    template_murojaah,
    template_halaqah_digest
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'fonnte',
    'https://api.fonnte.com/send',
    '',
    '6281234567890',
    false,
    true,
    E'*LAPORAN HARIAN MUTABA\'AH TAHFIDZ ITQAN*\n_Pesantren Tahfidz Terpadu_\n\nAssalamu\'alaikum Wr. Wb.\nYth. Wali dari *{nama}* (NIS: {nis}),\n\nBerikut ringkasan mutaba\'ah & kemajuan ananda hari *{tanggal}*:\n\n📊 *TARGET HARI INI:*\n• Target Harian: *{targetHarian} Baris*\n• Capaian Setoran: *{tercapaiHariIni} Baris* (~{halamanHariIni} Halaman)\n• Status Capaian: *{statusHarian}*\n\n📖 *RINCIAN SESI HARI INI:*\n{rincianSesi}\n\n📈 *AKUMULASI HAFALAN & KURIKULUM:*\n• Total Hafalan Saat Ini: *{totalHafalan}*\n• Sisa Target 30 Juz: *{sisaTarget} Baris*\n• Status Capaian Target: *{statusPacing}*\n\n{catatanMusyrif}\n\nJazakumullahu khairan atas doa dan bimbingan Ayah/Bunda untuk ananda di rumah.\n_Wassalamu\'alaikum Wr. Wb._\n_Musyrif: {musyrif} ({halaqoh})_',
    E'*LAPORAN SETORAN ZIYADAH - ITQAN*\n_Pesantren Tahfidz Terpadu_\n\nAssalamu\'alaikum Wr. Wb.\nYth. Wali dari *{nama}* (NIS: {nis}),\n\nAlhamdulillah, ananda baru saja menyelesaikan setoran hafalan baru (Ziyadah):\n📖 *Surah:* {surah} (Juz {juz})\n📄 *Posisi:* Hal. {halaman} (Baris {barisAwal}–{barisAkhir})\n📏 *Jumlah Setoran:* {baris} Baris\n⭐ *Kelancaran:* *{nilai}*\n📊 *Total Capaian:* {capaianJuz}\n🕒 *Waktu Setor:* {waktu} WIB\n👤 *Disimak oleh:* {musyrif}\n\n{catatan}\n\nJazakumullahu khairan atas doa dan bimbingan Ayah/Bunda di rumah.\n_Wassalamu\'alaikum Wr. Wb._',
    E'*LAPORAN SETORAN MUROJA\'AH - ITQAN*\n_Pesantren Tahfidz Terpadu_\n\nAssalamu\'alaikum Wr. Wb.\nYth. Wali dari *{nama}* (NIS: {nis}),\n\nAlhamdulillah, ananda baru saja menyelesaikan setoran pengulangan (Muroja\'ah):\n📖 *Surah:* {surah} (Juz {juz})\n📄 *Posisi:* Hal. {halaman}\n📏 *Volume:* {baris} Baris\n⭐ *Predikat Kelancaran:* *{nilai}*\n🕒 *Waktu Simak:* {waktu} WIB\n👤 *Musyrif Pembimbing:* {musyrif}\n\n{catatan}\n\nSemoga hafalan ananda semakin mutqin dan berkah.\n_Wassalamu\'alaikum Wr. Wb._',
    E'*REKAP HARIAN HALAQOH TAHFIDZ ITQAN*\n_Halaqoh: {halaqoh} | Musyrif: {musyrif}_\n_Tanggal: {tanggal}_\n\nAlhamdulillah, berikut rekap capaian mutaba\'ah santri hari ini:\n{rekapSantri}\n\nTotal Setoran Masuk: {totalSetoran} sesi.\nTetap semangat menjaga Al-Qur\'an!'
) ON CONFLICT DO NOTHING;

-- 8.3 Data 10 Santri Awal
INSERT INTO santri (
    id, halaqah_id, name, nis, parent_name, parent_phone, 
    juz_achieved, lines_completed_today, daily_target_lines, 
    total_lines_memorized, total_lines_target, status, last_surah, avatar_initials
) VALUES
('b1000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Muhammad Faiz', '2024001', 'H. Gunawan Prasetyo', '081234567801', 14.50, 15, 12, 2175, 9060, 'tercapai', 'An-Naba 1-40', 'MF'),
('b1000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Bilal Al-Habasyi', '2024004', 'Bpk. Ahmad Sofyan', '081234567802', 12.00, 12, 10, 1800, 9060, 'tercapai', 'At-Takwir 1-29', 'BA'),
('b1000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Zaid bin Tsabit', '2024005', 'H. Ruslan Abdullah', '081234567803', 18.20, 15, 15, 2730, 9060, 'tercapai', 'Yasin 1-45', 'ZT'),
('b1000001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Abdullah bin Mas''ud', '2024006', 'Bpk. Hendra Sasmita', '081234567804', 22.00, 16, 15, 3300, 9060, 'tercapai', 'Al-Kahf 1-50', 'AM'),
('b1000001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Ali bin Abi Thalib', '2024007', 'Bpk. Syarif Hidayat', '081234567805', 16.00, 14, 12, 2400, 9060, 'tercapai', 'Al-Mulk 1-30', 'AB'),
('b1000001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Utsman bin Affan', '2024008', 'H. Bambang Sulistyo', '081234567806', 25.00, 20, 15, 3750, 9060, 'tercapai', 'Al-Baqarah 1-100', 'UA'),
('b1000001-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Umar bin Khattab', '2024009', 'H. Wahyu Pratama', '081234567807', 10.50, 8, 12, 1575, 9060, 'tidak_tercapai', 'Al-Waqi''ah 1-30', 'UK'),
('b1000001-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Sa''ad bin Abi Waqqash', '2024010', 'Bpk. Dedi Supriyadi', '081234567808', 8.00, 0, 10, 1200, 9060, 'belum_setor', 'Ar-Rahman 1-35', 'SW'),
('b1000001-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Abdurrahman bin Auf', '2024011', 'H. Faisal Akbar', '081234567809', 14.00, 15, 12, 2100, 9060, 'tercapai', 'Maryam 1-40', 'AA'),
('b1000001-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Talhah bin Ubaidillah', '2024012', 'Bpk. Irfan Maulana', '081234567810', 9.50, 0, 12, 1425, 9060, 'belum_setor', 'Al-Insan 1-31', 'TU')
ON CONFLICT (id) DO NOTHING;

-- 8.4 Data Setoran Awal
INSERT INTO setoran (
    santri_id, type, juz, surah_name, page_start, page_end, 
    line_start, line_end, total_lines, grade, musyrif_name, notes, wa_status
) VALUES
('b1000001-0000-0000-0000-000000000001', 'ziyadah', 30, 'An-Naba 1-20', 582, 582, 1, 8, 8, 'mumtaz', 'Ust. Abdullah', 'Makhraj huruf shad dan dhad sangat rapi dan fasih.', 'sent'),
('b1000001-0000-0000-0000-000000000001', 'ziyadah', 30, 'An-Naba 21-40', 582, 582, 9, 15, 7, 'mumtaz', 'Ust. Abdullah', 'Menyelesaikan sisa surah An-Naba. Target harian 15 baris tuntas.', 'sent'),
('b1000001-0000-0000-0000-000000000001', 'murojaah', 29, 'Al-Mulk 1-30', 562, 564, 1, 15, 30, 'jayyid', 'Ust. Abdullah', 'Kelancaran stabil, perlu sedikit perhatian pada waqaf ayat 15.', 'not_sent'),
('b1000001-0000-0000-0000-000000000002', 'ziyadah', 30, 'At-Takwir 1-29', 586, 586, 1, 12, 12, 'mumtaz', 'Ust. Abdullah', 'Target harian 10 baris terlampaui (12 baris).', 'sent')
ON CONFLICT DO NOTHING;
