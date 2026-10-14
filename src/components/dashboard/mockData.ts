import type { WATemplateConfig, HalaqahSettings, HalaqahGroup, Santri, SetoranRecord } from './types';

export const DEFAULT_WA_TEMPLATE_CONFIG: WATemplateConfig = {
  templateDailyProgress: `*LAPORAN TAHFIDZ HARIAN - ITQAN*
{tanggal}

Assalamu'alaikum Wr. Wb.
Yth. Wali dari ananda *{nama}*,

Berikut laporan mutaba'ah hari ini:
• *Hafalan Hari Ini:* {tercapaiHariIni} dari {targetHarian} Baris ({statusHarian})
• *Total Hafalan Saat Ini:* {totalHafalan}

*Rincian Setoran:*
{rincianSesi}
{catatanMusyrif}

Terima kasih atas doa dan pendampingan di rumah.
_Muhaffizh: {musyrif}_`,

  templateZiyadah: `*SETORAN HAFALAN BARU (ZIYADAH)*

Assalamu'alaikum Wr. Wb.
Yth. Wali dari ananda *{nama}*,

Alhamdulillah telah setor hafalan baru:
• *Surah:* {surah} (Juz {juz})
• *Halaman:* {halaman} ({baris} baris)
• *Nilai:* *{nilai}*
• *Total Hafalan:* {capaianJuz}
{catatan}

Waktu: {waktu} WIB | Muhaffizh: {musyrif}`,

  templateMurojaah: `*SETORAN PENGULANGAN (MUROJA'AH)*

Assalamu'alaikum Wr. Wb.
Yth. Wali dari ananda *{nama}*,

Alhamdulillah telah mengulang hafalan:
• *Surah:* {surah} (Juz {juz})
• *Halaman:* {halaman} ({baris} baris)
• *Nilai:* *{nilai}*
{catatan}

Waktu: {waktu} WIB | Muhaffizh: {musyrif}`,

  templateHalaqahDigest: `*REKAP MUTABA'AH HALAQOH*
Halaqoh: {halaqoh} | {tanggal}

{ringkasan}

_ITQAN - Tahfidz Terpadu_`,
};

// Seluruh halaqoh bawaan dikosongkan — room dibuat murni oleh musyrif / disinkronkan dari Supabase
export const DEFAULT_HALAQAH_LIST: HalaqahGroup[] = [];

export const DEFAULT_HALAQAH_SETTINGS: HalaqahSettings = {
  halaqahName: '',
  musyrifName: '',
  standardDailyTargetLines: 15,
  activeHalaqahId: undefined,
};

export const INITIAL_MOCK_SANTRI: Santri[] = [];

export const INITIAL_MOCK_SETORAN: SetoranRecord[] = [];
