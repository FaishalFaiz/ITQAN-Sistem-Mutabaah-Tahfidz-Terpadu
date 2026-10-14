-- ==============================================================================
-- ITQAN: Script Seeding Halaqoh Preview & 20 Santri Mutaba'ah
-- Jalankan di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================
-- Fitur yang diisi:
-- 1. Ruang Halaqoh Preview: "Halaqoh Preview (Al-Fath)" (Kode: HLQ-PREV20)
-- 2. 20 Santri Acak Realistis: Variasi capaian Juz 1 s/d 30, target 15 baris/hari
-- 3. Riwayat Setoran Mutaba'ah (Hari ini & hari sebelumnya):
--    - 10 Santri Status Tercapai (15 baris hari ini)
--    - 3 Santri Status Defisit (5 - 10 baris hari ini)
--    - 7 Santri Status Belum Setor (0 baris hari ini)
--    - Rekam jejak nilai Mumtaz, Jayyid, dan I'adah untuk grafik laporan
-- ==============================================================================

DO $$
DECLARE
    v_musyrif_id UUID;
    v_musyrif_name VARCHAR(255);
    v_halaqah_id UUID := 'c1111111-1111-4000-8000-000000000001';
    v_halaqah_code VARCHAR(50) := 'HLQ-PREV20';
    v_halaqah_name VARCHAR(255) := 'Halaqoh Preview (Al-Fath)';
BEGIN
    -- 1. Deteksi akun musyrif yang ada di auth.users (ambil akun pertama/terkini)
    SELECT id, COALESCE(raw_user_meta_data->>'full_name', email, 'Ustadz Pembimbing')
    INTO v_musyrif_id, v_musyrif_name
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_musyrif_name IS NULL THEN
        v_musyrif_name := 'Ustadz Pembimbing (Preview)';
    END IF;

    -- 2. Bersihkan data seeding preview lama jika pernah dijalankan
    DELETE FROM public.setoran 
    WHERE santri_id IN (SELECT id FROM public.santri WHERE halaqah_id = v_halaqah_id);

    DELETE FROM public.santri WHERE halaqah_id = v_halaqah_id;
    DELETE FROM public.halaqah WHERE id = v_halaqah_id OR code = v_halaqah_code;

    -- 3. Buat Ruang Halaqoh Preview
    INSERT INTO public.halaqah (
        id, code, name, description, room, target_daily_lines,
        musyrif_id, musyrif_name, musyrif_phone, standard_daily_target_lines, created_at
    ) VALUES (
        v_halaqah_id,
        v_halaqah_code,
        v_halaqah_name,
        'Halaqoh simulasi preview 20 santri mutaba''ah tahfidz',
        'Gedung Tahfidz Lt. 2',
        15,
        v_musyrif_id,
        v_musyrif_name,
        '081234567890',
        15,
        now()
    );

    -- 4. Insert 20 Santri Realistis
    INSERT INTO public.santri (
        id, halaqah_id, name, nis, parent_name, parent_phone,
        juz_achieved, lines_completed_today, daily_target_lines,
        total_lines_memorized, total_lines_target, status, last_surah, avatar_initials, is_active, created_at
    ) VALUES
    ('d1111111-1111-4000-8000-000000000001', v_halaqah_id, 'Ahmad Fatih Al-Habsyi', '202601', 'Bapak Fatih', '081234567801', 28.5, 15, 15, 8550, 9060, 'tercapai', 'Al-Baqarah : 142-160', 'AF', true, now() - INTERVAL '30 days'),
    ('d1111111-1111-4000-8000-000000000002', v_halaqah_id, 'Muhammad Zaidan Akbar', '202602', 'Ibu Rahmawati', '081234567802', 12.0, 0, 15, 3600, 9060, 'belum_setor', 'Yusuf : 1-20', 'MZ', true, now() - INTERVAL '30 days'),
    ('d1111111-1111-4000-8000-000000000003', v_halaqah_id, 'Rayhan Al-Ghifari', '202603', 'Bapak Ghifari', '081234567803', 5.2, 10, 15, 1560, 9060, 'tidak_tercapai', 'Al-Ma''idah : 1-15', 'RA', true, now() - INTERVAL '29 days'),
    ('d1111111-1111-4000-8000-000000000004', v_halaqah_id, 'Farhan Abdullah', '202604', 'Bapak Abdullah', '081234567804', 30.0, 15, 15, 9060, 9060, 'tercapai', 'An-Nas : 1-6', 'FA', true, now() - INTERVAL '28 days'),
    ('d1111111-1111-4000-8000-000000000005', v_halaqah_id, 'Bilal Ar-Rasyid', '202605', 'Ibu Maryam', '081234567805', 3.0, 0, 15, 900, 9060, 'belum_setor', 'Al-Baqarah : 253-260', 'BA', true, now() - INTERVAL '27 days'),
    ('d1111111-1111-4000-8000-000000000006', v_halaqah_id, 'Umar Al-Faruq', '202606', 'Bapak Faruq', '081234567806', 15.5, 15, 15, 4650, 9060, 'tercapai', 'Al-Kahfi : 1-16', 'UA', true, now() - INTERVAL '26 days'),
    ('d1111111-1111-4000-8000-000000000007', v_halaqah_id, 'Hamzah Asadullah', '202607', 'Bapak Hamzah', '081234567807', 8.0, 0, 15, 2400, 9060, 'belum_setor', 'Al-A''raf : 1-25', 'HA', true, now() - INTERVAL '25 days'),
    ('d1111111-1111-4000-8000-000000000008', v_halaqah_id, 'Ziyad Ibnu Tsabit', '202608', 'Ibu Fatimah', '081234567808', 20.2, 15, 15, 6060, 9060, 'tercapai', 'An-Naml : 1-14', 'ZT', true, now() - INTERVAL '24 days'),
    ('d1111111-1111-4000-8000-000000000009', v_halaqah_id, 'Salman Al-Farisi', '202609', 'Bapak Salman', '081234567809', 2.0, 8, 15, 608, 9060, 'tidak_tercapai', 'Al-Baqarah : 142-150', 'SF', true, now() - INTERVAL '23 days'),
    ('d1111111-1111-4000-8000-000000000010', v_halaqah_id, 'Zubair Al-Awwam', '202610', 'Bapak Zubair', '081234567810', 9.0, 15, 15, 2700, 9060, 'tercapai', 'At-Taubah : 1-12', 'ZA', true, now() - INTERVAL '22 days'),
    ('d1111111-1111-4000-8000-000000000011', v_halaqah_id, 'Sa''ad Ibnu Abi Waqqash', '202611', 'Ibu Khadijah', '081234567811', 18.0, 0, 15, 5400, 9060, 'belum_setor', 'Al-Mu''minun : 1-22', 'SW', true, now() - INTERVAL '21 days'),
    ('d1111111-1111-4000-8000-000000000012', v_halaqah_id, 'Thalhah Ibnu Ubaidillah', '202612', 'Bapak Thalhah', '081234567812', 6.5, 15, 15, 1950, 9060, 'tercapai', 'Al-An''am : 1-20', 'TU', true, now() - INTERVAL '20 days'),
    ('d1111111-1111-4000-8000-000000000013', v_halaqah_id, 'Khalid Ibnu Walid', '202613', 'Bapak Khalid', '081234567813', 25.0, 0, 15, 7500, 9060, 'belum_setor', 'Fushshilat : 1-18', 'KW', true, now() - INTERVAL '19 days'),
    ('d1111111-1111-4000-8000-000000000014', v_halaqah_id, 'Mu''adz Ibnu Jabal', '202614', 'Ibu Aisyah', '081234567814', 14.0, 15, 15, 4200, 9060, 'tercapai', 'Al-Hijr : 1-25', 'MJ', true, now() - INTERVAL '18 days'),
    ('d1111111-1111-4000-8000-000000000015', v_halaqah_id, 'Usamah Ibnu Zaid', '202615', 'Bapak Usamah', '081234567815', 4.0, 5, 15, 1205, 9060, 'tidak_tercapai', 'Ali ''Imran : 1-15', 'UZ', true, now() - INTERVAL '17 days'),
    ('d1111111-1111-4000-8000-000000000016', v_halaqah_id, 'Hudzaifah Al-Yamani', '202616', 'Ibu Zainab', '081234567816', 11.2, 15, 15, 3360, 9060, 'tercapai', 'Hud : 1-19', 'HY', true, now() - INTERVAL '16 days'),
    ('d1111111-1111-4000-8000-000000000017', v_halaqah_id, 'Ammar Ibnu Yasir', '202617', 'Bapak Yasir', '081234567817', 7.0, 0, 15, 2100, 9060, 'belum_setor', 'Al-A''raf : 142-155', 'AY', true, now() - INTERVAL '15 days'),
    ('d1111111-1111-4000-8000-000000000018', v_halaqah_id, 'Abdullah Ibnu Mas''ud', '202618', 'Bapak Mas''ud', '081234567818', 29.0, 15, 15, 8700, 9060, 'tercapai', 'Al-Mulk : 1-30', 'AM', true, now() - INTERVAL '14 days'),
    ('d1111111-1111-4000-8000-000000000019', v_halaqah_id, 'Abu Ubaidah Al-Jarrah', '202619', 'Ibu Hafshah', '081234567819', 16.5, 0, 15, 4950, 9060, 'belum_setor', 'Maryam : 1-25', 'AJ', true, now() - INTERVAL '13 days'),
    ('d1111111-1111-4000-8000-000000000020', v_halaqah_id, 'Ja''far Ibnu Abi Thalib', '202620', 'Bapak Ja''far', '081234567820', 22.0, 15, 15, 6600, 9060, 'tercapai', 'Al-Ahzab : 1-20', 'JT', true, now() - INTERVAL '12 days');

    -- 5. Insert Riwayat Setoran Mutaba'ah Hari Ini (Aktif di dashboard)
    INSERT INTO public.setoran (
        id, santri_id, type, juz, surah_name,
        page_start, page_end, line_start, line_end, total_lines,
        grade, musyrif_name, notes, wa_status, created_at
    ) VALUES
    -- s01: Ahmad Fatih (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000001', 'ziyadah', 2, 'Al-Baqarah : 142-160', 22, 22, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar, makhraj huruf sangat baik', 'sent', now() - INTERVAL '1 hour'),
    
    -- s03: Rayhan Al-Ghifari (10 baris hari ini, Jayyid)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000003', 'ziyadah', 6, 'Al-Ma''idah : 1-15', 106, 106, 1, 10, 10, 'jayyid', v_musyrif_name, 'Perhatikan panjang harakat mad thabi''i', 'sent', now() - INTERVAL '2 hours'),
    
    -- s04: Farhan Abdullah (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000004', 'murojaah', 30, 'An-Nas : 1-6', 604, 604, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Khatam 30 Juz, masyaAllah mutqin', 'sent', now() - INTERVAL '3 hours'),

    -- s06: Umar Al-Faruq (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000006', 'ziyadah', 15, 'Al-Kahfi : 1-16', 293, 293, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Alhamdulillah lancar dan tartil', 'sent', now() - INTERVAL '30 minutes'),

    -- s08: Ziyad Ibnu Tsabit (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000008', 'ziyadah', 20, 'An-Naml : 1-14', 377, 377, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Sangat lancar tanpa catatan', 'sent', now() - INTERVAL '4 hours'),

    -- s09: Salman Al-Farisi (8 baris hari ini, I'adah -> Titik Rawan Laporan)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000009', 'ziyadah', 2, 'Al-Baqarah : 142-150', 22, 22, 1, 8, 8, 'iadah', v_musyrif_name, 'Perlu diulang ba''da maghrib, hukum ikhfa belum pas', 'not_sent', now() - INTERVAL '45 minutes'),

    -- s10: Zubair Al-Awwam (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000010', 'murojaah', 10, 'At-Taubah : 1-12', 187, 187, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Pengulangan sangat kokoh', 'sent', now() - INTERVAL '5 hours'),

    -- s12: Thalhah Ibnu Ubaidillah (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000012', 'ziyadah', 7, 'Al-An''am : 1-20', 128, 128, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Tartil dan makhraj fasih', 'sent', now() - INTERVAL '15 minutes'),

    -- s14: Mu'adz Ibnu Jabal (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000014', 'ziyadah', 14, 'Al-Hijr : 1-25', 262, 262, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus dan konsisten', 'sent', now() - INTERVAL '2 hours'),

    -- s15: Usamah Ibnu Zaid (5 baris hari ini, Jayyid)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000015', 'ziyadah', 3, 'Ali ''Imran : 1-15', 50, 50, 1, 5, 5, 'jayyid', v_musyrif_name, 'Tingkatkan fokus saat menghafal', 'sent', now() - INTERVAL '3 hours'),

    -- s16: Hudzaifah Al-Yamani (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000016', 'ziyadah', 12, 'Hud : 1-19', 221, 221, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar target harian tercapai', 'sent', now() - INTERVAL '50 minutes'),

    -- s18: Abdullah Ibnu Mas'ud (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000018', 'murojaah', 29, 'Al-Mulk : 1-30', 562, 562, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Mutqin tanpa cela', 'sent', now() - INTERVAL '1 hour'),

    -- s20: Ja'far Ibnu Abi Thalib (15 baris hari ini, Mumtaz)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000020', 'ziyadah', 22, 'Al-Ahzab : 1-20', 418, 418, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus, terus pertahankan ritme', 'sent', now() - INTERVAL '4 hours'),

    -- 6. Insert Setoran Riwayat Kemarin & Pekan Lalu (untuk visualisasi grafik tren)
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000001', 'ziyadah', 2, 'Al-Baqarah : 120-141', 20, 21, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Sesi kemarin lancar', 'sent', now() - INTERVAL '1 day'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000002', 'murojaah', 12, 'Yusuf : 1-25', 235, 236, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Murojaah kemarin mantap', 'sent', now() - INTERVAL '1 day'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000003', 'ziyadah', 5, 'An-Nisa : 160-176', 104, 105, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar kemarin', 'sent', now() - INTERVAL '1 day'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000006', 'ziyadah', 15, 'Al-Isra : 90-111', 291, 292, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus', 'sent', now() - INTERVAL '2 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000007', 'ziyadah', 8, 'Al-Anfal : 1-20', 177, 178, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar', 'sent', now() - INTERVAL '2 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000010', 'ziyadah', 9, 'At-Taubah : 1-15', 187, 187, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus', 'sent', now() - INTERVAL '3 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000011', 'ziyadah', 18, 'Al-Mu''minun : 1-15', 342, 342, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar', 'sent', now() - INTERVAL '3 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000013', 'ziyadah', 25, 'Fushshilat : 1-20', 477, 477, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus', 'sent', now() - INTERVAL '4 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000017', 'ziyadah', 7, 'Al-A''raf : 120-141', 165, 166, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Lancar', 'sent', now() - INTERVAL '4 days'),
    (gen_random_uuid(), 'd1111111-1111-4000-8000-000000000019', 'ziyadah', 16, 'Maryam : 1-15', 305, 305, 1, 15, 15, 'mumtaz', v_musyrif_name, 'Bagus', 'sent', now() - INTERVAL '5 days');

    RAISE NOTICE 'Seeding Sukses! Halaqoh Preview "%" (Kode: %) dengan 20 Santri berhasil dibuat.', v_halaqah_name, v_halaqah_code;
END $$;
