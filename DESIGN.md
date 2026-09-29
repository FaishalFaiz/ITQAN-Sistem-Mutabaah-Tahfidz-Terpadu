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

## 3. Tipografi: Inter

Menggunakan jenis huruf **Inter** di seluruh antarmuka untuk memastikan angka dan teks terbaca jelas dalam berbagai ukuran:

| Tingkatan | Ukuran (Tailwind) | Ketebalan (Weight) | Penggunaan |
|:---|:---|:---|:---|
| **Judul Halaman** | `text-2xl` (24px) | `font-bold` (700) | Judul portal, nama aplikasi |
| **Sub-Judul / Header** | `text-lg` (18px) | `font-semibold` (600) | Judul seksi, nama kelompok halaqoh |
| **Label Formulir** | `text-sm` (14px) | `font-medium` (500) | Label input NIS, password, pilihan surah |
| **Isi Teks / Tabel** | `text-sm` (14px) | `font-normal` (400) | Data tabel, riwayat setoran, catatan |
| **Teks Bantuan / Hint** | `text-xs` (12px) | `font-normal` (400) | Petunjuk form, jam setoran |
| **Angka Counter Ujian** | `text-3xl` (30px) | `font-bold` (700) | Angka hitungan ketukan dan salah bacaan |

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