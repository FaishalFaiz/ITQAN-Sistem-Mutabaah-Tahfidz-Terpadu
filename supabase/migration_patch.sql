-- ==============================================================================
-- ITQAN: SQL Patch untuk Supabase Dashboard
-- Jalankan script ini di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Tambah kolom halaqah yang diperlukan
ALTER TABLE halaqah ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE halaqah ADD COLUMN IF NOT EXISTS room VARCHAR(100);
ALTER TABLE halaqah ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE halaqah ADD COLUMN IF NOT EXISTS target_daily_lines INT DEFAULT 15;

-- 2. Hapus kolom role dari profil musyrif (semua user adalah musyrif)
ALTER TABLE musyrif_profiles DROP COLUMN IF EXISTS role;

-- 3. Perbarui trigger pendaftaran akun
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

-- 4. Kebijakan Keamanan RLS: Akses penuh CRUD untuk pengguna yang login
ALTER TABLE halaqah ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated musyrif access halaqah" ON halaqah;
CREATE POLICY "Authenticated musyrif access halaqah" ON halaqah FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated musyrif access santri" ON santri;
CREATE POLICY "Authenticated musyrif access santri" ON santri FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated musyrif access setoran" ON setoran;
CREATE POLICY "Authenticated musyrif access setoran" ON setoran FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Izinkan anonim akses penuh untuk pengujian lancar
DROP POLICY IF EXISTS "Anon access halaqah" ON halaqah;
CREATE POLICY "Anon access halaqah" ON halaqah FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access santri" ON santri;
CREATE POLICY "Anon access santri" ON santri FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access setoran" ON setoran;
CREATE POLICY "Anon access setoran" ON setoran FOR ALL TO anon USING (true) WITH CHECK (true);
