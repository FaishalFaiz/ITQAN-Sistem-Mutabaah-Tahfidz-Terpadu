-- ==============================================================================
-- ITQAN: Sistem Mutaba'ah & Evaluasi Tahfidz Terpadu untuk Pesantren Modern
-- Database Schema for Supabase (PostgreSQL 15+)
-- File: supabase/schema.sql
-- ==============================================================================
-- Pengguna: Musyrif / Guru Tahfidz
-- Otentikasi: Terintegrasi langsung dengan Supabase Auth (auth.users)
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
    CREATE TYPE wa_message_status_type AS ENUM ('not_sent', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITION (CLEAN - ZERO DUMMY DATA)
-- ==============================================================================

-- 3.1 Profil Musyrif (Terikat langsung ke auth.users Supabase)
CREATE TABLE IF NOT EXISTS musyrif_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Tabel Halaqah
CREATE TABLE IF NOT EXISTS halaqah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room VARCHAR(100),
    target_daily_lines INT NOT NULL DEFAULT 15,
    musyrif_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    musyrif_name VARCHAR(255) NOT NULL,
    musyrif_phone VARCHAR(50),
    standard_daily_target_lines INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Tabel Santri
CREATE TABLE IF NOT EXISTS santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    halaqah_id UUID REFERENCES halaqah(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    nis VARCHAR(50) NOT NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    juz_achieved NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    lines_completed_today INT NOT NULL DEFAULT 0,
    daily_target_lines INT NOT NULL DEFAULT 15,
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

-- 3.4 Tabel Riwayat Setoran Mutaba'ah (Ziyadah & Muroja'ah)
CREATE TABLE IF NOT EXISTS setoran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    type setoran_type NOT NULL,
    juz INT NOT NULL CHECK (juz BETWEEN 1 AND 30),
    surah_name VARCHAR(100) NOT NULL,
    page_start INT NOT NULL DEFAULT 1,
    page_end INT NOT NULL DEFAULT 1,
    line_start INT NOT NULL DEFAULT 1,
    line_end INT NOT NULL DEFAULT 15,
    total_lines INT NOT NULL CHECK (total_lines > 0),
    grade grade_type NOT NULL DEFAULT 'mumtaz',
    musyrif_name VARCHAR(255) NOT NULL,
    notes TEXT,
    wa_status wa_message_status_type NOT NULL DEFAULT 'not_sent',
    wa_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_halaqah_code ON halaqah(code);
CREATE INDEX IF NOT EXISTS idx_santri_nis ON santri(nis);
CREATE INDEX IF NOT EXISTS idx_santri_halaqah_id ON santri(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_santri_name ON santri(name);
CREATE INDEX IF NOT EXISTS idx_setoran_santri_date ON setoran(santri_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_setoran_created_at ON setoran(created_at DESC);

-- ==============================================================================
-- 5. TRIGGERS & PROCEDURES
-- ==============================================================================

-- 5.1 Update updated_at Timestamp Otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_musyrif_profiles_updated_at ON musyrif_profiles;
CREATE TRIGGER trg_musyrif_profiles_updated_at
BEFORE UPDATE ON musyrif_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_halaqah_updated_at ON halaqah;
CREATE TRIGGER trg_halaqah_updated_at
BEFORE UPDATE ON halaqah
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_santri_updated_at ON santri;
CREATE TRIGGER trg_santri_updated_at
BEFORE UPDATE ON santri
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 Auto Create Musyrif Profile saat Sign Up di Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_musyrif_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.musyrif_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_musyrif_signup();

-- 5.3 Auto-Recalculate Mutaba'ah Santri saat Setoran Baru Masuk
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
        v_new_juz_achieved := ROUND((v_new_total_memorized::numeric / 302.0), 1);
    ELSE
        v_new_total_memorized := v_santri.total_lines_memorized;
        v_new_juz_achieved := v_santri.juz_achieved;
    END IF;

    -- Update santri record
    UPDATE santri
    SET 
        lines_completed_today = v_total_today,
        status = CASE 
            WHEN v_total_today >= v_target THEN 'tercapai'::santri_status_type
            WHEN v_total_today > 0 AND v_total_today < v_target THEN 'tidak_tercapai'::santri_status_type
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

DROP TRIGGER IF EXISTS trg_on_setoran_inserted ON setoran;
CREATE TRIGGER trg_on_setoran_inserted
AFTER INSERT ON setoran
FOR EACH ROW EXECUTE FUNCTION handle_new_setoran();

-- ==============================================================================
-- 6. VIEWS UNTUK ANALITIK & REPORTING
-- ==============================================================================
CREATE OR REPLACE VIEW v_santri_halaqah AS
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
    h.id AS halaqah_id,
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

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE musyrif_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE halaqah ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;

-- Policy musyrif_profiles: Pengguna dapat membaca & memperbarui profilnya sendiri
DROP POLICY IF EXISTS "Musyrif can read and update profile" ON musyrif_profiles;
CREATE POLICY "Musyrif can read and update profile" ON musyrif_profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Akses operasional untuk pengguna terotentikasi (Musyrif)
DROP POLICY IF EXISTS "Authenticated musyrif access halaqah" ON halaqah;
CREATE POLICY "Authenticated musyrif access halaqah" ON halaqah FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated musyrif access santri" ON santri;
CREATE POLICY "Authenticated musyrif access santri" ON santri FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated musyrif access setoran" ON setoran;
CREATE POLICY "Authenticated musyrif access setoran" ON setoran FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Akses fallback anon (agar aplikasi tetap responsif)
DROP POLICY IF EXISTS "Anon read access halaqah" ON halaqah;
CREATE POLICY "Anon read access halaqah" ON halaqah FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon read access santri" ON santri;
CREATE POLICY "Anon read access santri" ON santri FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon read access setoran" ON setoran;
CREATE POLICY "Anon read access setoran" ON setoran FOR SELECT TO anon USING (true);
