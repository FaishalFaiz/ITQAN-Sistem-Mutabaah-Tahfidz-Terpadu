import type { Santri, SetoranRecord, WAGatewayConfig, HalaqahSettings } from './types';

// DATA AWAL KOSONG (ZERO DUMMY DATA)
export const INITIAL_SANTRI_LIST: Santri[] = [];

export const INITIAL_SETORAN_RECORDS: SetoranRecord[] = [];

export const DEFAULT_WA_CONFIG: WAGatewayConfig = {
  provider: 'fonnte',
  endpointUrl: 'https://api.fonnte.com/send',
  apiKey: '',
  senderNumber: '',
  autoSendOnSetoran: false,
  limitOneMessagePerDay: true,
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

export const DEFAULT_HALAQAH_SETTINGS: HalaqahSettings = {
  halaqahName: 'Halaqoh Tahfidz',
  musyrifName: 'Muhaffizh',
  standardDailyTargetLines: 15,
};
