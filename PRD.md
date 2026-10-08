# Product Requirement Document (PRD)
# ITQAN — Sistem Mutabaah Tahfidz Terpadu

---

## 1. Ringkasan & Tujuan Produk

- **Nama Produk**: ITQAN (Sistem Mutabaah Tahfidz Terpadu)
- **Kategori Solusi**: Sistem Informasi Manajemen Pesantren (SIMP) Terapan
- **Tujuan Utama**: Menggantikan buku catatan mutaba'ah manual berbahan kertas dengan platform web modern berbasis *offline-first*. Sistem memfasilitasi:
  - Pencatatan setoran halaqoh cepat oleh muhaffizh (< 15 detik).
  - Pacing target harian adaptif menuju target 30 juz dalam 3 tahun.
  - Pencatatan simulasi ujian tasmi' berbasis ketukan/koreksi (digital tap counter).
  - Dasbor analitik capaian hafalan santri di halaqoh.
  - Pengiriman notifikasi progres mutaba'ah langsung ke WhatsApp wali santri (WA Gateway & Direct WA).
- **Prinsip Desain**: Enterprise-Minimalist UI bergaya clean institusi (merujuk portal SIAP IDN), tipografi Inter, palet solid Putih & Biru (`#0070BA`, tanpa gradien), serta alur pengisian cepat satu tangan (*one-hand mobile workflow*).

---

## 2. Tech Stack Architecture

- **Frontend**: React 19 (Vite) — Single Page Application (SPA)
- **Styling & Icons**: Tailwind CSS v3.4, Lucide React
- **Font Utama**: Inter (`font-sans`)
- **Backend & Database**: Supabase (PostgreSQL + Supabase Auth)
- **Penyimpanan Klien (Offline-First)**: LocalStorage terisolasi per akun muhaffizh
- **Ekspor Dokumen**: Cetak Rapor Mutaba'ah Resmi & Ekspor CSV
- **Integrasi WhatsApp**: WhatsApp Gateway Service dengan mode ramah muhaffizh (otomatis & fallback wa.me)

---

## 3. Hak Akses & Peran Pengguna

### Muhaffizh (Peran Tunggal & Terfokus)
Aplikasi didesain khusus untuk digunakan oleh **Muhaffizh / Muhaffizhah / Guru Tahfidz** tanpa hambatan hierarki jabatan:
- Tidak ada pembagian multi-role yang membingungkan pengguna non-teknis (tidak ada role terpisah untuk Walsan atau Atasan/Koordinator).
- Menginput setoran Ziyadah dan Muroja'ah santri binaan secara cepat.
- Mengatur target harian dan memantau status santri (Tercapai / Belum Setor / Defisit).
- Mengirim rekapitulasi setoran langsung ke nomor WhatsApp wali santri.
- Mencetak Rapor Mutaba'ah resmi dengan tanda tangan tunggal muhaffizh halaqoh.
- Mengelola data santri halaqoh dan kontak wali secara mandiri.

---

## 4. Spesifikasi Fitur Utama

### 4.1. Fast-Logging Halaqoh (Input Setoran Ramah Muhaffizh)
- **Pemilihan Surah & Juz Cepat**:
  - **Searchable Combobox Surah**: Muhaffizh dapat mengetik nama surah atau nomor surah (1–114) dan memilih dari daftar dropdown otomatis.
  - **Juz Dropdown**: Pilihan Juz 1–30. Memilih nomor juz otomatis memfilter dan mengarahkan surah ke bagian awal juz tersebut.
- **Rentang Ayat & Input Manual Baris Setoran (IDN Style)**:
  - Input `Ayat Awal` s/d `Ayat Akhir` sesuai surah yang dipilih.
  - Input manual `Jumlah Baris` setoran yang didengar muhaffizh (misal: 5, 10, 15 baris), dilengkapi tombol pintasan cepat (`5b`, `10b`, `15b = 1 halaman`, `30b`).
- **Prinsip Kelancaran Tanpa Grading Rumit**:
  - Nilai kelancaran opsional (Mumtaz/Jayyid/I'adah) ditiadakan dari form input.
  - Jika setoran belum lancar/tidak layak dihitung, muhaffizh cukup tidak mencatat datanya atau memberikan catatan pembinaan di kolom catatan talaqqi.
- **Otomatisasi Notifikasi WhatsApp**:
  - Tombol toggle kirim WA ke nomor wali santri langsung dari form setoran.

### 4.2. Target Kurikulum 30 Juz 3 Tahun & Line-Based Daily Pacing Engine
- **Baseline Target Berbasis Baris (Line Granularity)**:
  - Standar Mushaf Madinah: 604 halaman $\times$ 15 baris/halaman = **9.060 baris total** (30 Juz).
  - Target durasi program: 3 tahun (36 bulan = 6 semester efektif).
  - Fleksibilitas pencatatan: santri menyetor dalam satuan baris riil.
- **Kalkulator Daily Target Adaptif**:
  - Setiap santri memiliki metrik sisa baris, hari tersisa, dan target baris harian.
- **Indikator Status Harian**:
  - **Tercapai** (Hijau): Akumulasi baris setoran hari ini $\ge$ target harian.
  - **Defisit / Tidak Tercapai** (Merah): Santri menyetor kurang dari target hariannya.
  - **Belum Setor** (Kuning/Amber): Santri belum menyetor pada hari aktif.

### 4.3. Manajemen Halaqoh & Kustomisasi Target
- Konfigurasi nama halaqoh, muhaffizh pembimbing, ruangan, dan target baris default per halaqoh.
- Penyesuaian target baris harian spesifik per santri (fleksibel sesuai kemampuan individu).
- Filter halaqoh terpadu pada tab Pacing & Target Hafalan serta Laporan.

### 4.4. Validasi Email Terpadu (Multi-Tier Diagnostic)
- Validasi sintaksis standar RFC 5322.
- Deteksi domain disposable / temporary burner email.
- Pemeriksaan DNS MX record riil via DoH (Cloudflare / Google Public DNS).
- Simulasi SMTP handshake & identifikasi provider institusi.
- Panel diagnostik pengujian interaktif pada menu Pengaturan.

### 4.5. Integrasi WhatsApp Sederhana (Fokus Muhaffizh)
- **Desain Ramah Pengguna**:
  - Format pesan template halaqoh kustom yang tersimpan rapi.
  - Opsi *Direct WA* (`wa.me`) untuk mengirimkan ringkasan setoran harian dan rapor santri ke nomor wali tanpa server pihak ketiga.

### 4.6. Dokumen Rapor & Laporan Mutaba'ah
- **Cetak Rapor Santri**:
  - Format standar cetak/PDF bersih tanpa elemen tidak perlu.
  - Tanda tangan resmi tunggal oleh Muhaffizh Halaqoh.
- **Ekspor CSV**: Unduh data mutaba'ah untuk arsip spreadsheet sekolah.

---

## 5. Skema Database PostgreSQL (Supabase DDL)

```sql
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type setoran_type as enum ('ziyadah', 'murojaah');

-- 2. TABEL PROFIL MUSYRIF
create table public.musyrif_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role varchar(50) not null default 'musyrif',
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABEL DATA SANTRI
create table public.santri (
  id uuid default uuid_generate_v4() primary key,
  musyrif_id uuid references public.musyrif_profiles(id) on delete cascade not null,
  nis text not null,
  name text not null,
  parent_name text,
  parent_phone text,
  halaqah_name text default 'Halaqoh Tahfidz',
  target_juz int default 30,
  daily_target_lines int default 15 not null,
  total_lines_memorized int default 0 not null,
  juz_achieved text default '0 Juz',
  last_surah text,
  status text default 'belum_setor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABEL LOG SETORAN
create table public.setoran_records (
  id uuid default uuid_generate_v4() primary key,
  santri_id uuid references public.santri(id) on delete cascade not null,
  musyrif_id uuid references public.musyrif_profiles(id) on delete set null not null,
  type setoran_type not null,
  juz int not null check (juz between 1 and 30),
  surah_name text not null,
  ayat_start int,
  ayat_end int,
  total_lines int not null check (total_lines > 0),
  musyrif text not null,
  notes text,
  wa_status text default 'not_sent',
  wa_sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PENGAKTIFAN ROW LEVEL SECURITY (RLS)
alter table public.musyrif_profiles enable row level security;
alter table public.santri enable row level security;
alter table public.setoran_records enable row level security;

-- ATURAN KEAMANAN (RLS POLICIES)
create policy "Musyrif owns their profile" on public.musyrif_profiles
  for all using (id = auth.uid());

create policy "Musyrif manages their halaqah santri" on public.santri
  for all using (musyrif_id = auth.uid());

create policy "Musyrif manages their setoran records" on public.setoran_records
  for all using (musyrif_id = auth.uid());

create policy "Musyrif manages exams" on public.exams
  for all using (musyrif_id = auth.uid());
```

---

## 6. Struktur Direktori Proyek (React + Vite)

```plaintext
itqan-app/
├── public/
│   ├── favicon.svg
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/               # Button, Input, Card, Badge, Modal, Sonner
│   │   ├── dashboard/        # SantriCard, SantriDetailPage, LaporanPage, PengaturanView, RaporPrintModal
│   │   ├── halaqah/          # FastSetoranForm
│   │   ├── visualization/    # PacingCard, TrendChart, StatCards
│   │   └── shared/           # NavbarSidebar
│   ├── data/
│   │   └── quranData.ts      # Master data 114 Surah, Juz, dan pemetaan ayat
│   ├── lib/
│   │   ├── supabase.ts       # Klien Supabase & status koneksi
│   │   └── utils.ts          # Helper classnames & formatters
│   ├── pages/
│   │   └── auth/
│   │       ├── LoginPage.tsx # Portal masuk khusus muhaffizh
│   │       └── SignupPage.tsx # Pendaftaran akun muhaffizh
│   ├── services/
│   │   ├── authService.ts    # Otentikasi Supabase Auth muhaffizh
│   │   ├── storageService.ts # LocalStorage terisolasi per muhaffizh aktif
│   │   └── waGatewayService.ts # Integrasi WhatsApp otomatis & Direct WA
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```