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

**ITQAN** adalah aplikasi web mutaba'ah tahfidz terpadu yang dirancang khusus untuk pesantren, madrasah, dan halaqoh Al-Qur'an modern. Dibangun dengan filosofi antarmuka **Clean Enterprise** (terinspirasi dari standar portal SIAP IDN) yang mengedepankan efisiensi pencatatan (*fast-logging* satu tangan), keterbacaan data metrik yang tinggi, dan transparansi progres santri ke wali santri secara real-time.

---

## Daftar Isi

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

- **Fast-Logging Setoran Halaqoh (< 15 Detik):** Form pencatatan cepat hafalan baru (*Ziyadah*) dan pengulangan (*Muroja'ah*) berbasis standar Mushaf Madinah 15 baris per halaman.
- **Otomatisasi Target Santri (Auto-Lock Modal):** Saat menekan tombol setor pada santri tertentu, popup modal otomatis mengunci identitas santri tanpa perlu memilih nama ulang secara manual.
- **Pacing Engine Kurikulum 3 Tahun (30 Juz):** Kalkulator otomatis yang menghitung sisa hari, akumulasi baris hafalan, dan rekomendasi target harian ideal agar santri khatam sesuai kurikulum 36 bulan.
- **Digital Tap Counter Ujian Tasmi':** Modul simulasi ujian sekali duduk dengan penghitung digital untuk ketukan tajwid (*Tawaqquf*) dan koreksi fatal lafadz (*Fath*) dengan grading instan (Mumtaz, Jayyid, I'adah).
- **Executive Santri Detail Page:** Halaman rapor santri yang bersih dan bebas duplikasi metrik, dilengkapi rekomendasi tindakan talaqqi adaptif untuk musyrif.
- **Generator Laporan WhatsApp (WA Digest):** Salin ringkasan mutaba'ah harian/pekanan siap kirim ke wali santri dalam 1-klik.
- **Otentikasi Multirole Enterprise:** Halaman Login & Sign Up terpisah dengan pemilihan peran cepat (*Musyrif*, *Koordinator/Admin*, dan *Wali Santri*).

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
│   │   │   ├── HalaqahQuickFocus.tsx # Banner fokus halaqoh aktif
│   │   │   ├── mockData.ts           # Data dummy awal santri & metrik
│   │   │   ├── NavbarSidebar.tsx     # Navigasi utama sidebar enterprise
│   │   │   ├── OtherViews.tsx        # View view sekunder (Ujian, Pacing, Pengaturan)
│   │   │   ├── SantriCard.tsx        # Kartu santri ringkas dengan status badge
│   │   │   ├── SantriDetailPage.tsx  # Halaman detail santri & rekomendasi musyrif
│   │   │   ├── SantriListSection.tsx # Tabel & daftar santri filterable
│   │   │   ├── SantriModal.tsx       # Dialog pembungkus setoran/detail
│   │   │   ├── StatCards.tsx         # Kartu rekapitulasi capaian target harian
│   │   │   ├── TrendChart.tsx        # Visualisasi grafik tren ziyadah & muroja'ah
│   │   │   └── types.ts              # Interface santri, status, & navigasi
│   │   ├── halaqah/
│   │   │   ├── FastSetoranForm.tsx   # Form input cepat setoran (auto-locked)
│   │   │   └── TapCounterExam.tsx    # Simulator digital tap counter ujian tasmi'
│   │   ├── ui/                 # Komponen dasar (Button, Card, Badge, Input, Dialog)
│   │   └── visualization/
│   │       └── PacingCard.tsx        # Kartu visualisasi pacing engine 3 tahun
│   ├── pages/
│   │   └── auth/
│   │       ├── LoginPage.tsx         # Halaman masuk sistem (Multi-role)
│   │       └── SignupPage.tsx        # Halaman pendaftaran akun baru
│   ├── lib/
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
| **Detail Santri** | `/santri/1` | Rapor komprehensif Zaid bin Tsabit |
| **Ujian Tasmi' Digital** | `/ujian-tasmi` | Tap counter simulasi penilaian ujian |
| **Pacing Engine** | `/pacing` | Dasbor target khatam 30 Juz 3 tahun |
| **Login Multi-Role** | `/login` | Masuk sebagai Musyrif, Koordinator, atau Wali Santri |
| **Registrasi Akun** | `/signup` | Pendaftaran akun guru dan wali santri |

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi **[MIT License](LICENSE)**.
Dapat digunakan, dipelajari, dan dikembangkan secara bebas untuk kemaslahatan pendidikan Al-Qur'an.
