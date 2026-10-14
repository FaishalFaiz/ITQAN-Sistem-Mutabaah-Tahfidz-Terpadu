<div align="center">
  <img src="public/favicon.svg" alt="ITQAN Logo" width="84" height="84" />

  # ITQAN
  ### Sistem Mutaba'ah & Evaluasi Tahfidz Terpadu untuk Pesantren Modern

  [![Version](https://img.shields.io/badge/version-1.0.0-0070BA.svg)](package.json)
  [![License: MIT](https://img.shields.io/badge/License-MIT-0070BA.svg)](LICENSE)
  [![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
  [![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Motion](https://img.shields.io/badge/Motion-14.1-F08080?style=flat&logo=framer)](https://motion.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

</div>

<br />

**ITQAN** (*الإتقan — kesempurnaan dan kemantapan*) adalah platform mutaba'ah tahfidz terpadu generasi baru yang dirancang khusus untuk memodernisasi tata kelola pembelajaran dan penjagaan Al-Qur'an pada pondok pesantren, madrasah, sekolah Islam terpadu, dan rumah tahfidz.

Dibangun dengan filosofi antarmuka **Clean Enterprise** (terinspirasi dari standar portal SIAP IDN), ITQAN mengedepankan efisiensi pencatatan setoran satu tangan (*fast-logging* < 15 detik), granularitas standar baris mushaf Madinah (15 baris per halaman), kalkulasi pacing kurikulum 3 tahun (30 Juz), manajemen multi-halaqoh terisolasi, serta keterbukaan informasi progres santri langsung ke nomor WhatsApp orang tua tanpa hambatan teknis.

---

## Daftar Isi

1. [Filosofi Produk & Latar Belakang](#-filosofi-produk--latar-belakang)
2. [Pilar Fitur Utama](#-pilar-fitur-utama)
3. [Standar Desain UI/UX (Clean Enterprise)](#-standar-desain-uiux-clean-enterprise)
4. [Peta Rute & Navigasi Aplikasi](#-peta-rute--navigasi-aplikasi)
5. [Teknologi & Dependensi](#-teknologi--dependensi)
6. [Persyaratan Sistem & Panduan Instalasi](#-persyaratan-sistem--panduan-instalasi)
7. [Konfigurasi Lingkungan & Database Supabase](#-konfigurasi-lingkungan--database-supabase)
8. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
9. [Dokumentasi Terkait & Lisensi](#-dokumentasi-terkait--lisensi)

---

## 📖 Filosofi Produk & Latar Belakang

Buku mutaba'ah fisik konvensional rentan rusak, tercecer, dan menyebabkan asimetri informasi di mana orang tua santri hanya menerima kabar hafalan 6 bulan sekali. Di sisi lain, sistem informasi pesantren (SIMP) umum sering kali gagal karena terlalu birokratis, sarat multi-role berbelit, dan menyita perhatian muhaffizh dengan puluhan isian form yang membingungkan.

**ITQAN hadir sebagai asisten hening bagi muhaffizh:**
- **Memuliakan Waktu Talaqqi:** Guru berfokus menyimak bacaan santri (*sima'an*), bukan disibukkan menatap layar ponsel.
- **Keadilan Satuan Baris Riil (9.060 Baris / 30 Juz):** Menghitung progres berbasis baris mushaf Madinah 15 baris/halaman secara adil, baik untuk setoran bertahap (3–5 baris) maupun hafalan penuh.
- **Sinergi Rumah & Asrama:** Memberikan ketenangan hati bagi wali santri melalui laporan harian otomatis yang sopan, rapi, dan terstruktur.

---

## ⚡ Pilar Fitur Utama

### 1. Pencatatan Setoran Kilat (*Fast Talaqqi Logging* < 15 Detik)
- **Auto-Lock Santri:** Menekan tombol setor pada kartu santri otomatis mengunci identitas santri tanpa perlu memilih ulang nama.
- **Searchable Combobox 114 Surah:** Pencarian instan surah Al-Qur'an lengkap dengan informasi Juz dan nomor ayat.
- **Pencatatan Ziyadah & Muroja'ah Terpadu:** Memisahkan penambahan hafalan ayat baru (*Ziyadah*) dengan pengulangan hafalan lama (*Muroja'ah*) agar santri tetap mutqin.
- **Standardisasi Mutu 3 Predikat:**
  - **Mumtaz:** Sempurna bertajwid dan lancar tanpa catatan.
  - **Jayyid:** Cukup baik dengan catatan koreksi ringan.
  - **I'adah:** Wajib mengulang perbaikan makhraj/tajwid sebelum menambah ayat baru.

### 2. Status Harian & Logika Rekomendasi Sesi Otomatis
Kalkulasi dinamis capaian target per hari:
- **Tercapai (`tercapai` - Emerald):** Santri sudah menyetor dan jumlah baris mencapai/melampaui target harian (misal: $\ge$ 15 baris).
- **Tidak Tercapai (`tidak_tercapai` - Merah):** Santri sudah menyetor hari ini, namun capaian baris masih di bawah kuota target harian (defisit) atau terkena catatan remedial I'adah.
- **Belum Setor (`belum_setor` - Amber):** Santri belum maju menyetorkan hafalan sama sekali pada sesi halaqoh hari ini.

### 3. Mesin Pacing Kurikulum 3 Tahun (30 Juz)
- Menghitung sisa hari, akumulasi baris hafalan, dan rekomendasi target harian ideal agar santri khatam sesuai kurikulum target 36 bulan (1.095 hari).
- Memberikan visibilitas langsung apakah santri berada pada jalur *On Track* atau memerlukan bimbingan khusus.

### 4. Manajemen Multi-Halaqoh Terisolasi
- **Halaqah Switcher:** Memungkinkan muhaffizh mengampu dan berpindah antar-ruang halaqoh dalam satu klik tanpa *page reload*.
- **Kode Akses Unik 6-Karakter (`HLQ-XXXX`):** Kolaborasi mudah untuk mengundang guru pendamping mengampu ruang kelas yang sama.
- **Isolasi Data Santri:** Data santri, riwayat mutaba'ah, dan metrik halaqoh terisolasi penuh antar-ruang.
- **Onboarding Wizard:** Alur interaktif pembuatan halaqoh pertama bagi guru yang baru mendaftar.

### 5. Notifikasi WhatsApp Wali Santri (Direct `wa.me`)
- Menghasilkan ringkasan laporan mutaba'ah harian resmi yang siap dikirim langsung ke WhatsApp orang tua tanpa perlu menyimpan nomor telepon ke kontak ponsel terlebih dahulu.
- Tiga format template pesan terstruktur:
  - *Laporan Ziyadah (Ayat Baru)*
  - *Laporan Muroja'ah (Pengulangan Mutqin)*
  - *Rekapitulasi Harian Terpadu*
- Indikator centang penanda kirim agar tidak ada orang tua santri yang terlewatkan.

### 6. Cetak Rapor Tahfidz Resmi (A4 / PDF)
- Generator rapor resmi muhaffizh berstandar cetak A4 dengan kop lembaga, rincian perolehan juz, grafik kelancaran talaqqi, catatan pembimbing, dan blok tanda tangan resmi.

### 7. Validasi Email Mendalam (*Multi-Tier Verification*)
- Memeriksa keabsahan email saat registrasi: pengecekan sintaksis standar RFC, pemblokiran domain sementara (*disposable/burner email*), verifikasi DNS MX publik (DoH Cloudflare & Google), serta simulasi handshake SMTP.

### 8. Arsitektur Local-First & Cloud Synchronization
- Penyimpanan data lokal di peramban untuk performa responsif instan, tersinkronisasi otomatis dua arah dengan database PostgreSQL Supabase saat jaringan internet aktif.

---

## 🎨 Standar Desain UI/UX (Clean Enterprise)

ITQAN menerapkan prinsip antarmuka **Balanced Clean & Clear UI** (terinspirasi dari standar portal SIAP IDN):

| Unsur Desain | Penerapan & Standar Nilai |
| :--- | :--- |
| **Identitas Institusi** | Solid Blue (`#0070BA`, hover `#005C9E`, latar lembut `#EBF5FB`) |
| **Status Sukses / Mumtaz** | Emerald (`#047857` / `#ECFDF5`) |
| **Status Defisit / I'adah** | Red (`#B91C1C` / `#FEF2F2`) |
| **Status Belum Setor / Pending** | Amber (`#B45309` / `#FFFBEB`) |
| **Netral & Teks** | Slate Palette (`#0F172A` teks utama, `#64748B` teks redup, `#E2E8F0` border) |
| **Tipografi** | Inter (`font-sans`), ukuran hierarkis terstruktur (10px–36px) |
| **Kontur & Sudut** | Solid Border 1px (`#E2E8F0`), sudut `rounded-xl`, bayangan halus (`shadow-2xs` / `shadow-xs`) |
| **Kebijakan Anti-Clutter** | Nol gradien gelap berlebihan, nol glassmorphism buram, dan bebas ornamen yang tidak esensial bagi halaqoh |

---

## 🗺️ Peta Rute & Navigasi Aplikasi

| Rute URL | Akses | Deskripsi & Fungsi |
| :--- | :--- | :--- |
| `/` | Publik | **Landing Page Resmi ITQAN** (Hero preview, fitur terpadu, demo talaqqi interaktif, multi-halaqoh, laporan WA, alur kerja, & FAQ) |
| `/login` | Publik | **Login Muhaffizh** (Masuk ke portal halaqoh via Supabase Auth) |
| `/signup` | Publik | **Registrasi Muhaffizh** (Pendaftaran akun baru dengan validasi email mendalam) |
| `/onboarding-halaqah` | Terotentikasi | **Inisialisasi Halaqoh** (Pembuatan ruang kelas pertama setelah pendaftaran) |
| `/pilih-halaqoh` | Terotentikasi | **Pemilihan Ruang Halaqoh Aktif** (Pintu masuk pemilihan kelas bagi ustadz pengampu multi-ruang) |
| `/beranda` | Terotentikasi | **Dasbor Utama Halaqoh** (StatCards capaian target, Today Progress, fast-setoran form, daftar santri, & switcher halaqoh) |
| `/santri/:id` | Terotentikasi | **Detail & Rekam Jejak Santri** (Riwayat mutaba'ah lengkap, tren baris harian, ekspor CSV, edit target, & edit kontak wali) |
| `/halaqah` | Terotentikasi | **Manajemen Ruang Halaqoh** (Pengaturan ruang, pembagian kode akses guru pendamping, dan pembuatan kelas baru) |

---

## 🛠️ Teknologi & Dependensi

- **Core Framework:** [React 19.2](https://react.dev/) + [Vite 8.3](https://vitejs.dev/)
- **Bahasa:** [TypeScript 6.0](https://www.typescriptlang.org/) dengan *strict type checks*
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) + `@tailwindcss/animate` + `clsx` + `tailwind-merge`
- **Animasi Antarmuka:** [Motion 14.1 (Framer Motion)](https://motion.dev/)
- **Komponen Primitif:** [Radix UI](https://www.radix-ui.com/) (Dialog, Progress, Slot)
- **Notifikasi Toast:** [Sonner](https://sonner.emilkowal.ski/)
- **Ikon:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Backend & Autentikasi:** [Supabase JS v2.109](https://supabase.com/) (PostgreSQL Database & Auth)

---

## 💻 Persyaratan Sistem & Panduan Instalasi

Pastikan komputer Anda telah terpasang:
- **Node.js:** Versi 18.0.0 atau lebih tinggi (disarankan Node.js v20 LTS / v22)
- **Package Manager:** npm (v9+), pnpm, atau Bun

### 1. Clone Repository
```bash
git clone https://github.com/FaishalFaiz/ITQAN-Sistem-Mutabaah-Tahfidz-Terpadu.git
cd ITQAN-Sistem-Mutabaah-Tahfidz-Terpadu
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka peramban pada alamat: `http://localhost:5173`.

### 4. Kompilasi Produksi (Build)
```bash
npm run build
```
Hasil kompilasi bundle statis siap saji akan dibuat di direktori `dist/`.

---

## 🗄️ Konfigurasi Lingkungan & Database Supabase

Aplikasi dapat dijalankan secara instan dengan penyimpanan lokal (*local-first storage*). Untuk mengaktifkan sinkronisasi cloud Supabase:

1. Buat file `.env` pada direktori *root* proyek:
```env
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=kunci-anon-publik-anda
```

2. Jalankan skrip migrasi dan skema tabel di Supabase SQL Editor:
   - Skema tabel utama: `supabase/schema.sql` (bila tersedia).
   - Skrip preview data halaqoh: [`supabase/seed_preview_halaqah.sql`](supabase/seed_preview_halaqah.sql).

---

## 📂 Struktur Direktori Proyek

```text
ITQAN/
├── public/
│   ├── favicon.svg             # Favicon brand ITQAN
│   ├── hero-preview.webp       # Visual preview antarmuka dasbor resolusi tinggi
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── common/             # ErrorBoundary & komponen umum
│   │   ├── dashboard/          # Modul dasbor & mutaba'ah
│   │   │   ├── AddSantriModal.tsx        # Modal pendaftaran santri baru
│   │   │   ├── DailyReportModal.tsx      # Modal pengiriman laporan harian
│   │   │   ├── EditSetoranModal.tsx      # Modal koreksi catatan setoran
│   │   │   ├── EditTargetModal.tsx       # Modal konfigurasi target harian santri
│   │   │   ├── EditWaliModal.tsx         # Modal pembaruan kontak wali santri
│   │   │   ├── HalaqahManagementPage.tsx # Halaman pengelolaan ruang halaqoh
│   │   │   ├── HalaqahSwitcher.tsx       # Dropdown peralihan halaqoh aktif
│   │   │   ├── LaporanPage.tsx           # Halaman rekapitulasi capaian hafalan
│   │   │   ├── NavbarSidebar.tsx         # Navigasi utama sidebar enterprise
│   │   │   ├── OtherViews.tsx            # View sekunder (Tab Data Santri, Pengaturan)
│   │   │   ├── PengaturanView.tsx        # Konfigurasi preferensi WhatsApp & profil
│   │   │   ├── RaporPrintModal.tsx       # Generator cetak rapor resmi tahfidz A4
│   │   │   ├── SantriCard.tsx            # Kartu santri ringkas dengan badge status
│   │   │   ├── SantriDetailPage.tsx      # Halaman profil santri & riwayat mutaba'ah
│   │   │   ├── SantriListSection.tsx     # Filter dan daftar santri di beranda
│   │   │   ├── StatCards.tsx             # 3 Kartu rekapitulasi (Tercapai/Tidak/Belum)
│   │   │   ├── TodayProgressCard.tsx     # Kartu progres ringkasan hari ini
│   │   │   ├── TrendChart.tsx            # Grafik perbandingan capaian mingguan
│   │   │   └── types.ts                  # Tipe data TypeScript (Santri, Status, Filter)
│   │   ├── halaqah/
│   │   │   └── FastSetoranForm.tsx       # Form input cepat talaqqi (< 15 detik)
│   │   ├── ui/                           # Komponen UI primitif (Button, Dialog, Badge, Input, Sonner)
│   │   └── visualization/
│   │       └── PacingCard.tsx            # Visualisasi pacing kurikulum 3 tahun
│   ├── data/
│   │   └── quranData.ts                  # Master data 114 Surah, Juz 1–30, dan total ayat
│   ├── lib/
│   │   ├── supabase.ts                   # Inisialisasi klien Supabase
│   │   └── utils.ts                      # Helper utility kelas Tailwind
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx             # Halaman login muhaffizh
│   │   │   └── SignupPage.tsx            # Halaman registrasi akun muhaffizh
│   │   ├── halaqah/
│   │   │   └── OnboardingHalaqahPage.tsx # Inisialisasi halaqoh pertama
│   │   ├── landing/
│   │   │   └── LandingPage.tsx           # Halaman muka (landing page) resmi ITQAN
│   │   └── NotFoundPage.tsx              # Halaman 404 (Route fallback)
│   ├── services/
│   │   ├── authService.ts                # Layanan otentikasi muhaffizh
│   │   ├── emailValidationService.ts     # Verifikasi email bertingkat (RFC, MX, SMTP)
│   │   ├── seedService.ts                # Inisialisasi data preview halaqoh
│   │   ├── storageService.ts             # Logika penyimpanan lokal terisolasi & status santri
│   │   ├── syncService.ts                # Sinkronisasi cloud dua arah (Supabase)
│   │   └── whatsappService.ts            # Rangkai pesan WhatsApp & generator tautan wa.me
│   ├── App.tsx                           # Router utama aplikasi & deklarasi rute
│   ├── index.css                         # Desain tokens, tipografi, & stylesheet dasar
│   └── main.tsx                          # Titik masuk React DOM
├── supabase/
│   ├── delete_default_halaqah.sql        # Skrip pembersihan data halaqoh bawaan
│   └── seed_preview_halaqah.sql          # Skrip penyemaian data pratinjau halaqoh
├── index.html                            # Dokumen HTML entri utama
├── package.json                          # Dependensi paket & skrip build
├── tailwind.config.js                    # Konfigurasi token & warna semantik
├── tsconfig.json                         # Konfigurasi compiler TypeScript
└── vite.config.ts                        # Konfigurasi bundler Vite
```

---

## 📚 Dokumentasi Terkait & Lisensi

- **Konsep Produk & Pedagogi:** Baca selengkapnya pada [PRODUCT-CONCEPT.md](PRODUCT-CONCEPT.md).
- **Aturan Pengembangan:** Lihat panduan arsitektur pada [AGENTS.md](AGENTS.md).
- **Lisensi:** Proyek ini didistribusikan di bawah lisensi terbuka **[MIT License](LICENSE)**. Bebas digunakan dan dikembangkan untuk kemaslahatan pendidikan Al-Qur'an.
