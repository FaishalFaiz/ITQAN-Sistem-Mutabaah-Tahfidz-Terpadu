<div align="center">
  <img src="public/favicon.svg" alt="ITQAN Logo" width="80" height="80" />

  # ITQAN
  **Sistem Mutaba'ah & Evaluasi Tahfidz Terpadu untuk Pesantren Modern**

[![Version](https://img.shields.io/badge/version-1.0.0-0070BA.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-0070BA.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=flat&logo=greensock)](https://greensock.com/gsap/)

</div>

<br />

**ITQAN** adalah aplikasi web mutaba'ah tahfidz terpadu yang dirancang khusus untuk muhaffizh / muhaffizhah pesantren, madrasah, dan halaqoh Al-Qur'an modern. Dibangun dengan filosofi antarmuka **Clean Enterprise** (terinspirasi dari standar portal SIAP IDN) yang mengedepankan efisiensi pencatatan (*fast-logging* satu tangan), keterbacaan data metrik yang tinggi, dan integrasi pengiriman progres hafalan ke nomor WhatsApp wali santri.

---

## Daftar Isi

- [Konsep Produk & Filosofi (PRODUCT-CONCEPT.md)](PRODUCT-CONCEPT.md)
- [Spesifikasi Teknis (PRD.md)](PRD.md)
- [Fitur Utama](#-fitur-utama)
- [Teknologi & Arsitektur](#-teknologi--arsitektur)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Standar UI/UX & Desain Sistem](#-standar-uiux--desain-sistem)
- [Panduan Pengujian & Verifikasi](#-panduan-pengujian--verifikasi)
- [Lisensi](#-lisensi)

---

## Fitur Utama

- **Fast-Logging Setoran Halaqoh (< 15 Detik):** Form pencatatan cepat hafalan baru (*Ziyadah*) dan pengulangan (*Muroja'ah*) berbasis input nama/nomor surah (searchable combobox 114 surah), dropdown Juz 1–30, rentang ayat awal/akhir, dan input manual jumlah baris setoran (IDN style).
- **Otomatisasi Target Santri (Auto-Lock Modal):** Saat menekan tombol setor pada santri tertentu, popup modal otomatis mengunci identitas santri tanpa perlu memilih nama ulang secara manual.
- **Pacing Engine Kurikulum 3 Tahun (30 Juz):** Kalkulator otomatis yang menghitung sisa hari, akumulasi baris hafalan, dan rekomendasi target harian ideal agar santri khatam sesuai kurikulum 36 bulan.
- **Kustomisasi Target Halaqoh & Santri:** Pengaturan target hafalan fleksibel per halaqoh dan per santri, filter tampilan komprehensif, serta manajemen kurikulum.
- **Executive Santri Detail Page:** Halaman rapor santri yang bersih dan bebas duplikasi metrik, rute URL unik per santri (`/santri/:id`), riwayat setoran komprehensif, dan pintasan kontak wali santri.
- **Validasi Email Mendalam (Multi-Tier):** Pemeriksaan sintaksis RFC, deteksi disposable/burner, lookup DNS MX publik (DoH Cloudflare/Google), simulasi SMTP handshake, dan deteksi penyedia email institusi.
- **Integrasi Notifikasi WhatsApp Ramah Guru:** Pengiriman ringkasan setoran harian per santri ke nomor WhatsApp wali, template kustom halaqoh, serta opsi *Direct WA* (`wa.me`).
- **Otentikasi Terfokus Muhaffizh:** Akses portal khusus muhaffizh halaqoh tanpa kerumitan multi-role/atasan sehingga penggunaan lebih cepat dan intuitif.

---

## Teknologi & Arsitektur

ITQAN dibangun menggunakan arsitektur modern berkinerja tinggi:

- **Frontend Core:** [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) Single Page Application (SPA).
- **Bahasa Pemrograman:** [TypeScript 5.7 / 6.0](https://www.typescriptlang.org/) dengan *strict type contracts*.
- **Styling & Design System:** [Tailwind CSS v3.4](https://tailwindcss.com/) dengan palet solid institusional (Biru `#0070BA`, Emerald `#047857`, Slate `#0F172A`).
- **Komponen UI Primitif:** [Radix UI](https://www.radix-ui.com/) (Dialog, Progress, Separator, Tooltip).
- **Animasi & Transisi:** [GSAP (GreenSock)](https://greensock.com/gsap/) untuk *micro-transitions* tab dan kartu data.
- **Ikonografi:** [Lucide React](https://lucide.dev/) untuk ikon fungsional yang tajam dan konsisten.
- **Routing:** [React Router v7](https://reactrouter.com/) untuk navigasi halaman tanpa reload.

---

## Persyaratan Sistem

Pastikan lingkungan lokal Anda memenuhi spesifikasi berikut:

- [Node.js](https://nodejs.org/) v18.0.0 atau lebih tinggi (disarankan Node.js v20+)
- npm v9+ atau package manager alternatif ([pnpm](https://pnpm.io/) / [Bun](https://bun.sh/))

---

## Instalasi & Menjalankan Lokal

### 1. Clone Repository

```bash
git clone https://github.com/FaishalFaiz/ITQAN-Sistem-Mutabaah-Tahfidz-Terpadu.git ITQAN
cd ITQAN
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

### 4. Build untuk Lingkungan Produksi

```bash
npm run build
```

Hasil kompilasi bundle statis yang telah dioptimasi akan berada di folder `dist/`.

---

## Struktur Direktori Proyek

```text
ITQAN/
├── public/
│   ├── favicon.svg             # Favicon vektor kustom brand ITQAN
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── dashboard/          # Komponen dasbor & halaqoh
│   │   │   ├── AddSantriModal.tsx    # Modal tambah data santri baru
│   │   │   ├── DailyReportModal.tsx  # Modal kirim laporan harian massal
│   │   │   ├── EditWaliModal.tsx     # Modal edit kontak wali santri
│   │   │   ├── HalaqahQuickFocus.tsx # Banner fokus halaqoh aktif
│   │   │   ├── LaporanPage.tsx       # Halaman rekapitulasi mutaba'ah
│   │   │   ├── mockData.ts           # Data awal dan preferensi default
│   │   │   ├── NavbarSidebar.tsx     # Navigasi utama sidebar enterprise
│   │   │   ├── OtherViews.tsx        # View sekunder (Data Santri, Pengaturan)
│   │   │   ├── PengaturanView.tsx    # Pengaturan halaqoh & preferensi WhatsApp
│   │   │   ├── RaporPrintModal.tsx   # Modal cetak rapor resmi muhaffizh
│   │   │   ├── SantriCard.tsx        # Kartu santri ringkas dengan status badge
│   │   │   ├── SantriDetailPage.tsx  # Halaman detail santri & riwayat mutaba'ah
│   │   │   ├── SantriModal.tsx       # Dialog pembungkus setoran/detail
│   │   │   ├── StatCards.tsx         # Kartu rekapitulasi capaian target harian
│   │   │   ├── TrendChart.tsx        # Visualisasi grafik tren ziyadah & muroja'ah
│   │   │   └── types.ts              # Interface santri, status, & navigasi
│   │   ├── halaqah/
│   │   │   └── FastSetoranForm.tsx   # Form input cepat setoran (surah search, ayat, baris manual)
│   │   ├── ui/                 # Komponen dasar (Button, Card, Badge, Input, Dialog, Sonner)
│   │   └── visualization/
│   │       └── PacingCard.tsx        # Kartu visualisasi pacing engine 3 tahun
│   ├── data/
│   │   └── quranData.ts        # Master data 114 Surah, Juz, dan pemetaan ayat
│   ├── pages/
│   │   └── auth/
│   │       ├── LoginPage.tsx         # Halaman masuk portal muhaffizh
│   │       └── SignupPage.tsx        # Halaman pendaftaran akun muhaffizh
│   ├── services/
│   │   ├── authService.ts      # Layanan otentikasi muhaffizh (Supabase Auth)
│   │   ├── emailValidationService.ts # Layanan validasi email mendalam (syntax, MX DNS, disposable, SMTP test)
│   │   ├── storageService.ts   # Penyimpanan data lokal terisolasi per akun
│   │   ├── syncService.ts      # Sinkronisasi cloud dua arah (local-first)
│   │   └── whatsappService.ts  # Layanan pengiriman notifikasi WhatsApp Direct (wa.me)
│   ├── lib/
│   │   ├── supabase.ts         # Konfigurasi klien Supabase
│   │   └── utils.ts            # Helper utility Tailwind & class merger
│   ├── App.tsx                 # Shell navigasi & deklarasi router
│   ├── index.css               # Desain tokens, font Inter, & reset CSS
│   └── main.tsx                # Titik masuk React DOM
├── index.html                  # Dokumen HTML utama
├── package.json                # Daftar dependensi & script proyek
├── tailwind.config.js          # Konfigurasi token & warna semantik
├── tsconfig.json               # Konfigurasi compiler TypeScript
└── vite.config.ts              # Konfigurasi bundler Vite
```

---

## Standar UI/UX & Desain Sistem

ITQAN menerapkan prinsip **Balanced Clean & Clear UI**:

| Unsur Desain | Standar yang Diterapkan |
| :--- | :--- |
| **Palet Institusi** | Solid Blue (`#0070BA`, hover `#005C9E`, soft bg `#EBF5FB`) |
| **Status Sukses / Mumtaz** | Emerald (`#047857` / `#ECFDF5`) |
| **Status Defisit / I'adah** | Red (`#B91C1C` / `#FEF2F2`) |
| **Status Pending / Belum Setor** | Amber (`#B45309` / `#FFFBEB`) |
| **Tipografi** | Inter (`font-sans`), ukuran terstruktur dari 11px hingga 24px |
| **Batas Garis & Sudut** | Solid Border 1px (`#E2E8F0`), sudut `rounded-xl` tanpa bayangan buram |
| **Anti-Clutter Policy** | Nol dekorasi berlebih, nol gradien gelap, dan informasi tidak berulang |

---

## Panduan Pengujian & Verifikasi

Seluruh rute dan fitur utama dapat diakses langsung pada mode dev:

| Halaman / Fitur | Rute URL | Keterangan |
| :--- | :--- | :--- |
| **Beranda Halaqoh** | `/beranda` atau `/` | Ringkasan absensi, stat cards, dan daftar santri |
| **Detail Santri** | `/santri/:id` | Rapor komprehensif santri & riwayat mutaba'ah per id |
| **Pacing Engine & Target** | Tab Target & Pacing | Dasbor target khatam 30 Juz 3 tahun & filter halaqoh |
| **Laporan & Rapor** | Tab Laporan | Rekap mutaba'ah, cetak rapor resmi, & unduh CSV |
| **Pengaturan Halaqoh** | Tab Pengaturan | Manajemen halaqoh, format template WhatsApp, & diagnostik email |
| **Login Muhaffizh** | `/login` | Masuk ke portal halaqoh muhaffizh |
| **Registrasi Muhaffizh** | `/signup` | Pendaftaran akun muhaffizh baru |

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi **[MIT License](LICENSE)**.
Dapat digunakan, dipelajari, dan dikembangkan secara bebas untuk kemaslahatan pendidikan Al-Qur'an.
