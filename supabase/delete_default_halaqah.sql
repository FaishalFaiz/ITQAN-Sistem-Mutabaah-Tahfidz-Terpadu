-- ==============================================================================
-- ITQAN: Script Pembersihan Halaqoh & Santri Bawaan
-- Jalankan di SQL Editor Supabase untuk membersihkan data demo/bawaan (Abu Bakar, Umar, Utsman, Ali)
-- ==============================================================================

-- 1. Hapus setoran yang terkait dengan santri pada halaqoh bawaan
DELETE FROM public.setoran 
WHERE santri_id IN (
    SELECT id FROM public.santri 
    WHERE halaqah_id IN (
        'a0000000-0000-4000-8000-000000000001',
        'a0000000-0000-4000-8000-000000000002',
        'a0000000-0000-4000-8000-000000000003',
        'a0000000-0000-4000-8000-000000000004'
    )
    OR halaqah_id IN (
        SELECT id FROM public.halaqah 
        WHERE LOWER(name) IN (
            'halaqoh abu bakar ash-shiddiq',
            'halaqoh umar bin khattab',
            'halaqoh utsman bin affan',
            'halaqoh ali bin abi thalib'
        )
    )
);

-- 2. Hapus santri bawaan yang terdaftar di halaqoh bawaan
DELETE FROM public.santri 
WHERE halaqah_id IN (
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000004'
)
OR halaqah_id IN (
    SELECT id FROM public.halaqah 
    WHERE LOWER(name) IN (
        'halaqoh abu bakar ash-shiddiq',
        'halaqoh umar bin khattab',
        'halaqoh utsman bin affan',
        'halaqoh ali bin abi thalib'
    )
);

-- 3. Hapus 4 ruang halaqoh bawaan
DELETE FROM public.halaqah 
WHERE id IN (
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000004'
)
OR LOWER(name) IN (
    'halaqoh abu bakar ash-shiddiq',
    'halaqoh umar bin khattab',
    'halaqoh utsman bin affan',
    'halaqoh ali bin abi thalib'
);
