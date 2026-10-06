# Panduan Sistem Desain: ITQAN

Dokumen ini merupakan panduan antarmuka (*User Interface*) dan sistem desain resmi untuk **ITQAN — Sistem Mutabaah Tahfidz Terpadu**. 

Konsep utama mengusung **Clean & Clear UI** bergaya portal institusi modern (merujuk pada gaya SIAP IDN), berbasis palet solid Putih & Biru, tanpa gradien (*no gradient*), dengan struktur tata letak datar (*flat*), pembatas tegas, dan tipografi tunggal **Inter**.

---

## 1. Filosofi Desain: Clean & Clear UI

- **Zero Gradient**: Menghindari segala bentuk gradien warna, bayangan tebal (*heavy drop shadow*), efek kaca (*glassmorphism*), atau animasi berlebih. Seluruh elemen mengutamakan warna solid (*flat color*).
- **Fokus Fungsional (Data-First)**: Konten, angka capaian, dan form input menjadi prioritas utama pandangan mata tanpa gangguan ornamen dekoratif.
- **Kejelasan Hierarki Visual**: Kontras tegas antara teks gelap dan latar terang, ukuran font terstruktur rapi, serta batas antar-elemen yang mudah dibedakan.
- **Pengoperasian Cepat Satu Tangan**: Area klik tombol (*touch target*) dibuat lega (minimal 44px) untuk mempermudah musyrif mengisi data langsung saat halaqoh.

---

## 2. Palet Warna Solid (Color Tokens)

Semua kode warna menggunakan format solid tanpa efek transisi/gradien:

### 2.1. Brand & Warna Dasar
- **Latar Belakang Halaman (`bg-page`)**: `#F8FAFC` (Slate 50) — Latar terang netral untuk membedakan kontainer putih.
- **Kontainer / Kartu (`bg-card`)**: `#FFFFFF` (Solid White) — Latar utama kartu, form, dan tabel data.
- **Warna Aksi Utama (`brand-primary`)**: `#0070BA` (Classic Blue Institusi) — Tombol aksi utama, tab aktif, dan status terpilih.
- **Hover Aksi Utama (`brand-hover`)**: `#005C9E`
- **Latar Aksen Lembut (`brand-subtle`)**: `#EBF5FB` — Latar badge aktif dan baris tabel terpilih.

### 2.2. Teks & Pembatas
- **Teks Utama (`text-main`)**: `#0F172A` (Slate 900) — Judul, label penting, isi formulir.
- **Teks Sekunder (`text-muted`)**: `#64748B` (Slate 500) — Subtitle, teks bantuan, placeholder.
- **Garis Pembatas Utama (`border-default`)**: `#CBD5E1` (Slate 300) — Garis tepi input field dan kartu login.
- **Garis Pembatas Halus (`border-subtle`)**: `#E2E8F0` (Slate 200) — Pembatas baris tabel dan pemisah seksi.

### 2.3. Indikator Status & Hasil Evaluasi
- **Mutqin / Mumtaz (Lancar Sekali)**:
  - Latar: `#ECFDF5` (Emerald 50)
  - Garis/Teks: `#047857` (Emerald 700)
- **Jayyid / Peringatan (Cukup Lancar)**:
  - Latar: `#FFFBEB` (Amber 50)
  - Garis/Teks: `#B45309` (Amber 700)
- **I'adah / Dha'if / Ketukan (Kurang Lancar)**:
  - Latar: `#FEF2F2` (Red 50)
  - Garis/Teks: `#B91C1C` (Red 700)

---

## 3. Tipografi & Sistem Font / Typography & Font System

Sistem tipografi ITQAN menggunakan dua font utama dari Google Fonts: **Inter** untuk antarmuka umum dan **JetBrains Mono** untuk data teknis, kode, badge, dan status angka/ID.

*The ITQAN typography system utilizes two primary Google Fonts: **Inter** for general UI and **JetBrains Mono** for technical data, code, badges, and numeric metrics/IDs.*

---

### 3.1. Pemuatan Font Google (HTML Entry) / Google Fonts Import (`index.html`)

Font diimpor secara global melalui `index.html` dengan spesifikasi ketebalan (*weight*) berikut:
*Fonts are loaded globally via `index.html` with the following weight specifications:*

- **Inter** (Weight: 400, 500, 600, 700, 800) – Digunakan sebagai font sans-serif & serif global antarmuka pengguna. (*Used as the primary sans-serif & serif font for the global UI.*)
- **JetBrains Mono** (Weight: 400, 500) – Digunakan sebagai font monospace untuk kode, label teknis, badge, dan angka/ID. (*Used as the monospace font for code, technical labels, badges, and status numbers/IDs.*)

```html
<!-- Google Fonts Import (/index.html) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

### 3.2. Konfigurasi Tailwind CSS / Tailwind CSS Configuration (`tailwind.config.js`)

Konfigurasi keluarga font (*font family*) diatur pada `tailwind.config.js` untuk memastikan semua rujukan kelas Tailwind mengarah ke font yang sesuai:
*The font family rules are configured in `tailwind.config.js` to ensure all Tailwind utility classes map accurately:*

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
}
```

---

### 3.3. Penataan CSS Dasar Global / Global Base CSS Styling (`src/index.css`)

Perataan font dan *anti-aliasing* diatur secara langsung pada file CSS utama (`src/index.css`):
*Font rendering smoothers and base font assignments are defined in the main CSS file (`src/index.css`):*

- **Default Body**: Menggunakan font family Inter dengan `-webkit-font-smoothing: antialiased` agar teks terlihat tajam dan mulus di semua browser. (*Uses Inter with `-webkit-font-smoothing: antialiased` for crisp rendering across all browsers.*)
- **Headings (`h1`, `h2`, `h3`, `.font-display`)**: Diarahkan secara konsisten ke font Inter untuk keseragaman hirarki visual. (*Consistently mapped to Inter for uniform visual hierarchy.*)

```css
/* src/index.css */
@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, .font-display {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

---

### 3.4. Prinsip Penggunaan Font dalam UI / Font Usage Rules

1. **Sans-Serif (`font-sans`)**: Digunakan untuk hampir semua elemen UI utama, judul, badan teks, tombol, dan navigasi. (*Used for almost all main UI elements, headings, body text, buttons, and navigation.*)
2. **Serif (`font-serif`)**: Mengarah secara konsisten ke font Inter untuk menjaga keselarasan visual. (*Consistently mapped to Inter for visual harmony.*)
3. **Monospace (`font-mono`)**: Digunakan khusus untuk label teknis/eyebrow, kode sistem, prefix URL (seperti `tautan.site/`), serta status angka/ID. (*Dedicated for technical/eyebrow labels, system code, URL prefixes like `tautan.site/`, and status metrics/IDs.*)

---

### 3.5. Panduan Ukuran & Ketebalan / Size & Weight Scale

| Tingkatan / Level | Tailwind Class | Weight | Penggunaan (ID) | Usage (EN) |
|:---|:---|:---|:---|:---|
| **Judul Halaman / Page Title** | `text-2xl` (24px) | `font-bold` (700) | Judul portal, nama aplikasi | Portal title, main app heading |
| **Sub-Judul / Section Header** | `text-lg` (18px) | `font-semibold` (600) | Judul seksi, nama halaqoh | Section headers, halaqah group names |
| **Label Form / Input Label** | `text-sm` (14px) | `font-medium` (500) | Label input NIS, password | Form labels, input headers |
| **Isi Teks / Body & Table** | `text-sm` (14px) | `font-normal` (400) | Data tabel, riwayat setoran | Table cells, deposit history, notes |
| **Bantuan / Hint Text** | `text-xs` (12px) | `font-normal` (400) | Petunjuk input, timestamp | Form hints, sub-captions, timestamps |
| **Data Teknis / Technical Metric** | `text-xs / sm` | `font-mono` | NIS, Kode Unik, Tautan/URL | Student ID/NIS, system codes, URLs |

---

## 4. Standar Komponen UI

### 4.1. Input Field (Clean Style)
- Latar putih solid (`bg-white`), garis tepi 1px (`border border-slate-300`), sudut tumpul halus (`rounded-lg`), tinggi input nyaman (`py-2.5 px-3.5`).
- Saat aktif (*focus*): Garis tepi berubah ke biru solid `#0070BA` dengan garis luar tipis (`ring-1 ring-[#0070BA]`), tanpa efek bayangan berpendar.
- Placeholder berwarna abu-abu terang dengan contoh konkret teks asli.

```html
<!-- Format Input Field Bersih -->
<div class="space-y-1.5">
  <label class="block text-sm font-medium text-slate-900">Nomor Induk Santri (NIS)</label>
  <input 
    type="text" 
    placeholder="Contoh : 85775745484" 
    class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]" 
  />
</div>
```

### 4.2. Tombol Aksi (Solid Buttons)
- **Primary Button**: Latar biru solid `#0070BA`, teks putih, `rounded-lg`, tinggi mantap (`py-2.5`), tulisan tegas `font-semibold`. Hover menjadi solid `#005C9E`.
- **Secondary / Outline Button**: Latar transparan/putih, garis tepi solid `#CBD5E1`, teks warna Slate-900, hover ke `#F1F5F9`.
- **Tap Counter Button (Ujian Tasmi')**: Tombol kotak besar minimal tinggi 72px, angka terlihat jelas di tengah, memberikan respons visual klik langsung (`active:scale-95`).

```html
<!-- Format Tombol Utama -->
<button class="w-full rounded-lg bg-[#0070BA] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#005C9E] active:bg-[#004A7F]">
  Masuk
</button>
```

### 4.3. Kartu & Kotak Data (Containers)
- Latar putih bersih (`bg-white`), dibatasi garis tepi solid 1px (`border border-slate-200`), sudut `rounded-xl`.
- Tidak menggunakan bayangan buram. Jika diperlukan elevasi, gunakan bayangan tipis datar: `shadow-[0_1px_2px_rgba(0,0,0,0.05)]`.

---

## 5. Konfigurasi Tailwind CSS (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#EBF5FB',
          100: '#D6EAF8',
          DEFAULT: '#0070BA', // Biru solid utama SIAP IDN
          hover: '#005C9E',
          active: '#004A7F',
        },
        page: '#F8FAFC',
        surface: '#FFFFFF',
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      }
    },
  },
  plugins: [],
}
```

---

## 6. Aturan Tata Letak & Alur Pengguna

### 6.1. Tampilan Ponsel Musyrif (Saat Halaqoh Berlangsung)
- Antarmuka satu kolom vertikal.
- Tombol simpan setoran dan selektor status kelancaran berada di bagian bawah yang mudah dijangkau ibu jari tanpa perlu menggeser (*scroll*) layar berulang kali.

### 6.2. Tampilan Dasbor Admin & Portal Walsan (Desktop/Tablet)
- Bilah menu navigasi samping (*sidebar*) tetap dengan latar putih solid dan pembatas kanan tegas `border-r border-slate-200`.
- Ruang kerja utama berlatar Slate-50 dengan penyusunan kartu ringkasan berbasis kisi (*grid system*) 2 atau 3 kolom.