# Product Requirement Document (PRD)
# ITQAN — Sistem Mutabaah Tahfidz Terpadu

---

## 1. Ringkasan & Tujuan Produk

- **Nama Produk**: ITQAN (Sistem Mutabaah Tahfidz Terpadu)
- **Kategori Solusi**: Sistem Informasi Manajemen Pesantren (SIMP) Terapan
- **Tujuan Utama**: Menggantikan buku catatan mutaba'ah manual berbahan kertas dengan platform web modern berbasis *offline-first*. Sistem memfasilitasi:
  - Pencatatan setoran halaqoh cepat oleh musyrif (< 15 detik).
  - Pacing target harian adaptif menuju target 30 juz dalam 3 tahun.
  - Pencatatan ujian tasmi' berbasis ketukan/koreksi (digital tap counter).
  - Dasbor analitik capaian dan retensi hafalan per santri.
  - Transparansi progres santri bagi wali santri secara real-time.
  - Rekapitulasi riwayat pengajian kitab kuning/turats bersanad.
- **Prinsip Desain**: Enterprise-Minimalist UI bergaya clean institusi (merujuk portal SIAP IDN), tipografi Inter, palet solid Putih & Biru (tanpa gradien), serta alur pengisian cepat satu tangan (*one-hand mobile workflow*).

---

## 2. Tech Stack Architecture

- **Frontend**: React (Vite) — Single Page Application (SPA)
- **Styling & Icons**: Tailwind CSS, Lucide React
- **Font Utama**: Inter (`font-sans`)
- **Backend & Database**: Supabase (PostgreSQL + Supabase Auth)
- **Keamanan Data**: PostgreSQL Row Level Security (RLS)
- **Penyimpanan Klien (Offline Mode)**: IndexedDB / LocalStorage (penyimpanan setoran lokal saat tanpa sinyal di asrama/masjid, tersinkronisasi otomatis saat online)
- **Ekspor Dokumen**: `jspdf` & `html2canvas` (Rapor Mutaba'ah Bulanan & Sertifikat Kenaikan Juz ber-QR Code)

---

## 3. Hak Akses & Peran Pengguna (RBAC)

### 3.1. Musyrif (Guru Halaqoh)
- Menginput log setoran Ziyadah dan Muroja'ah santri binaan secara cepat (di bawah 15 detik).
- Memantau pemenuhan target harian santri di halaqohnya.
- Menjalankan modul ujian tasmi' / kenaikan juz (hanya jika tiket ujian telah disetujui koordinator).
- Menggunakan aplikasi dalam mode offline di ruang asrama atau masjid.

### 3.2. Admin / Koordinator Tahfidz
- Mengelola master data: data santri, akun musyrif, rombel kelompok halaqoh, dan daftar kitab.
- Menentukan konfigurasi kurikulum dan target pacing (misal: 30 juz / 3 tahun).
- Memberikan persetujuan (*approval*) jadwal ujian tasmi' / kenaikan juz santri.
- Memantau rekap analitik capaian hafalan dan kepatuhan target seluruh angkatan.

### 3.3. Wali Santri (Walsan)
- Masuk melalui portal khusus santri.
- Mode Read-Only: memantau progres harian vs target harian, riwayat muroja'ah, status kelancaran, melihat peta heatmap mushaf, serta mengunduh rapor dan sertifikat resmi.

---

## 4. Spesifikasi Fitur Utama

### 4.1. Fast-Logging Halaqoh (Tampilan Musyrif)
- **Alur Input Cepat**: Pilih nama santri $\rightarrow$ pilih jenis setoran (Ziyadah atau Muroja'ah) $\rightarrow$ pilih nomor Juz.
- **Auto-Fetch Data Mushaf**:
  - Memilih nomor juz otomatis memuat daftar surah di dalamnya, rentang halaman standar Mushaf Madinah (15 baris, total 604 halaman), serta nomor ayat awal dan akhir.
  - Input rentang: Dari Halaman / Ayat hingga Halaman / Ayat.
- **Tingkat Kelancaran**:
  - `MUMTAZ`: Lancar sekali, makhraj dan tajwid tepat.
  - `JAYYID`: Cukup lancar, terdapat teguran minor 1–2 kali.
  - `I'ADAH`: Kurang lancar, wajib diulang pada halaqoh berikutnya.

### 4.2. Target Kurikulum 30 Juz 3 Tahun & Daily Pacing Engine
- **Baseline Target**:
  - Standar Mushaf Madinah: 604 halaman (30 Juz).
  - Target durasi program: 3 tahun (36 bulan = 6 semester efektif).
  - Hari aktif setoran efektif: ~5–6 hari per pekan (estimasi ~250–280 hari aktif per tahun, atau ~800 hari efektif setoran ziyadah dalam 3 tahun).
  - **Kebutuhan Minimum Ziyadah Rata-rata**: ~0.75 – 1 halaman per hari aktif (~1 lembar / 2 halaman per 2 hari).
- **Kalkulator Daily Target Adaptif**:
  - Setiap santri memiliki metrik:
    - `target_completion_date`: Tanggal target khatam (3 tahun sejak tanggal masuk/mulai).
    - `remaining_pages`: Sisa halaman dari 604 halaman yang belum berstatus Mumtaz/Mutqin.
    - `days_remaining`: Jumlah hari efektif tersisa hingga target kelulusan.
    - `daily_target_pages`: $\frac{\text{remaining\_pages}}{\text{days\_remaining}}$ (ditampilkan dinamis dalam pecahan halaman/baris per hari).
- **Indikator Status Pacing**:
  - **On Track** (Hijau): Akumulasi setoran $\ge$ target kumulatif hari ini.
  - **Behind Schedule** (Kuning/Merah): Santri tertinggal $n$ halaman dari garis tren target 3 tahun; sistem menghitung penyesuaian target kompensasi harian baru.
- **Daily Checklist Halaqoh**:
  - Menampilkan badge langsung di samping nama santri saat absensi/setoran halaqoh:
    - Contoh: `Target Hari Ini: 1 Halaman (Hal. 452)`
    - Status: `Belum Setor` | `Tercapai` | `Melebihi Target`.

### 4.3. Spaced Retention Recommendation Engine
- Sistem membaca riwayat data setoran santri:
  - Menandai halaman yang berstatus `I'ADAH`.
  - Menandai rentang halaman yang belum dimuroja'ah lebih dari 7 hari.
  - Menampilkan kartu peringatan otomatis di profil santri dan dasbor musyrif:
    > *"Rekomendasi Muroja'ah Hari Ini: Juz 29 (Hal. 562–564)"*

### 4.4. Modul Ujian Tasmi' & Kenaikan Juz
- **Gerbang Izin Ujian**: Form ujian berstatus terkunci secara default. Form hanya dapat dibuka jika Admin/Koordinator telah mengubah status menjadi `APPROVED_FOR_EXAM`.
- **Digital Tap Counter**:
  - Tombol tap besar untuk mencatat Ketukan / Tawaqquf (Salah Ringan).
  - Tombol tap besar untuk mencatat Dibetulkan / Fath (Salah Fatal Lafadz).
  - Form penilaian tajwid, fashahah, serta kalkulasi otomatis skor akhir dan penentuan status lulus/tidak lulus.

### 4.5. Heatmap 604 Halaman Mushaf
- Peta matriks interaktif 604 kotak (merepresentasikan 604 halaman mushaf):
  - **Abu-abu Solid** (`#E2E8F0`): Belum pernah disetorkan.
  - **Oranye Solid** (`#F59E0B`): Sudah disetorkan / proses pemantapan muroja'ah.
  - **Hijau Solid** (`#059669`): Lulus ujian tasmi' (Mutqin).
- Interaksi klik/hover memunculkan informasi nomor halaman, nama surah, dan tanggal terakhir disimak.

### 4.6. Turats Ledger (Sanad & Pengajian Kitab)
- Pencatatan riwayat pengajian kitab matan (seperti Tuhfatul Athfal, Al-Jazariyah, atau Safinatun Najah).
- Rekap bab yang telah diselesaikan santri, tanggal khatam, serta nama ustadz pengampu beserta silsilah sanad keilmuannya.

### 4.7. Pelaporan & Komunikasi
- **Ekspor PDF Otomatis**:
  - Rapor Mutaba'ah Berkala: ringkasan halaman ziyadah, rasio kelancaran, status pacing 3 tahun, rekap absensi halaqoh.
  - Sertifikat Kelulusan Kenaikan Juz / Tasmi' lengkap dengan QR Code validasi keaslian dokumen.
- **WhatsApp Digest Generator**: Tombol salin teks ringkasan progres hafalan pekanan dan status target untuk dikirim ke nomor WhatsApp wali santri.

---

## 5. Skema Database PostgreSQL (Supabase DDL)

```sql
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('admin', 'musyrif', 'wali_santri');
create type setoran_type as enum ('ziyadah', 'murojaah');
create type kelancaran_grade as enum ('mumtaz', 'jayyid', 'iadah');
create type exam_status as enum ('pending', 'approved', 'completed', 'rejected');

-- 2. TABEL PROFIL PENGGUNA
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role user_role not null default 'musyrif',
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABEL DATA SANTRI
create table public.santri (
  id uuid default uuid_generate_v4() primary key,
  nis text unique not null,
  full_name text not null,
  gender text check (gender in ('L', 'P')),
  class_name text not null,
  target_juz int default 30,
  program_duration_years int default 3,
  start_date date default current_date not null,
  target_end_date date default (current_date + interval '3 years')::date not null,
  daily_target_pages numeric(3,2) default 1.00 not null,
  walsan_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABEL KELOMPOK HALAQOH
create table public.halaqah_groups (
  id uuid default uuid_generate_v4() primary key,
  group_name text not null,
  musyrif_id uuid references public.profiles(id) on delete set null,
  period text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.halaqah_members (
  id uuid default uuid_generate_v4() primary key,
  halaqah_id uuid references public.halaqah_groups(id) on delete cascade,
  santri_id uuid references public.santri(id) on delete cascade,
  unique (halaqah_id, santri_id)
);

-- 5. TABEL LOG SETORAN
create table public.setoran_logs (
  id uuid default uuid_generate_v4() primary key,
  santri_id uuid references public.santri(id) on delete cascade not null,
  musyrif_id uuid references public.profiles(id) on delete set null not null,
  type setoran_type not null,
  juz int not null check (juz between 1 and 30),
  surah_number int not null,
  surah_name text not null,
  page_start int not null check (page_start between 1 and 604),
  page_end int not null check (page_end between 1 and 604),
  ayah_start int,
  ayah_end int,
  grade kelancaran_grade not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABEL UJIAN & TASMI'
create table public.exams (
  id uuid default uuid_generate_v4() primary key,
  santri_id uuid references public.santri(id) on delete cascade not null,
  examiner_id uuid references public.profiles(id) on delete set null,
  juz_target int not null check (juz_target between 1 and 30),
  status exam_status default 'pending' not null,
  ketukan_count int default 0,
  dibetulkan_count int default 0,
  tajwid_score numeric(5,2),
  fashahah_score numeric(5,2),
  final_score numeric(5,2),
  passed boolean default false,
  verified_qr_code text,
  exam_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TABEL TURATS / KITAB
create table public.turats_records (
  id uuid default uuid_generate_v4() primary key,
  santri_id uuid references public.santri(id) on delete cascade not null,
  kitab_name text not null,
  pengampu_name text not null,
  sanad_lineage text,
  current_chapter text,
  is_khatam boolean default false,
  khatam_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PENGAKTIFAN ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.santri enable row level security;
alter table public.halaqah_groups enable row level security;
alter table public.halaqah_members enable row level security;
alter table public.setoran_logs enable row level security;
alter table public.exams enable row level security;
alter table public.turats_records enable row level security;

-- ATURAN KEAMANAN (RLS POLICIES)
create policy "Authenticated read profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Musyrif and Admin manage setoran" on public.setoran_logs
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'musyrif')
    )
  );

create policy "Walsan view children setoran" on public.setoran_logs
  for select using (
    santri_id in (
      select id from public.santri where walsan_user_id = auth.uid()
    )
  );
```

---

## 6. Struktur Direktori Proyek (React + Vite)

```plaintext
itqan-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/               # Button, Input, Card, Badge, Modal (Solid Clean UI)
│   │   ├── halaqah/          # SetoranForm, QuranSelector, TapCounter, DailyPacingBadge
│   │   ├── visualization/    # MushafHeatmap, PacingCard, TargetPacingChart
│   │   └── shared/           # Navbar, Sidebar, OfflineIndicator
│   ├── data/
│   │   └── quranMeta.ts      # Mapping statis data Juz, Surah, rentang Halaman & Ayat
│   ├── hooks/
│   │   ├── useAuth.ts        # Session Supabase & role checking
│   │   └── useOfflineSync.ts # Sinkronisasi IndexedDB saat online
│   ├── layouts/
│   │   ├── AppLayout.tsx     # Shell dasbor dengan font Inter
│   │   └── AuthLayout.tsx    # Layout form login minimalis
│   ├── lib/
│   │   ├── supabaseClient.ts # Klien inisialisasi Supabase
│   │   ├── pacingEngine.ts   # Kalkulator target harian adaptif (30 juz / 3 tahun)
│   │   └── exportPdf.ts      # Template cetak Rapor & Sertifikat
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.tsx     # Form login bersih gaya SIAP IDN
│   │   ├── musyrif/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InputSetoran.tsx
│   │   │   └── UjianTasmi.tsx
│   │   ├── admin/
│   │   │   ├── MasterSantri.tsx
│   │   │   └── ApprovalUjian.tsx
│   │   └── santri/
│   │       └── DetailSantri.tsx # Dasbor profil, riwayat, heatmap, & progress pacing 3 thn
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces untuk database & form
│   ├── App.tsx
│   ├── index.css             # Konfigurasi font Inter & utility Tailwind
│   └── main.tsx
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```