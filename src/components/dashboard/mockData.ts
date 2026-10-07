import type { WATemplateConfig, HalaqahSettings, HalaqahGroup, Santri } from './types';

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

export const DEFAULT_HALAQAH_LIST: HalaqahGroup[] = [
  { id: 'halaqah-abu-bakar', name: 'Halaqoh Abu Bakar Ash-Shiddiq', description: 'Talaqqi Ziyadah & Murojaah Lanjutan', room: 'Masjid Utama' },
  { id: 'halaqah-umar', name: 'Halaqoh Umar bin Khattab', description: 'Halaqoh Tahfidz Reguler Juz 1-5', room: 'Ruang A-101' },
  { id: 'halaqah-utsman', name: 'Halaqoh Utsman bin Affan', description: 'Halaqoh Mutqin 10 Juz', room: 'Ruang A-102' },
  { id: 'halaqah-ali', name: 'Halaqoh Ali bin Abi Thalib', description: 'Talaqqi I\'dad & Tahsin Dasar', room: 'Ruang B-201' },
];

export const INITIAL_MOCK_SANTRI: Santri[] = [
  // Santri Halaqoh Abu Bakar Ash-Shiddiq
  {
    id: 's-ab-1',
    name: 'Muhammad Fatih Robbani',
    nis: '20240101',
    parentName: 'Bpk. Ahmad Fauzi',
    parentPhone: '081234567801',
    juzAchieved: '5 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 15,
    totalLinesMemorized: 2250,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'An-Nisa 45-52',
    avatarInitials: 'MF',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: 's-ab-2',
    name: 'Abdullah Azzam Pratama',
    nis: '20240102',
    parentName: 'Bpk. Hendra Gunawan',
    parentPhone: '081234567802',
    juzAchieved: '3 Juz',
    linesCompletedToday: 10,
    dailyTargetLines: 15,
    totalLinesMemorized: 1350,
    totalLinesTarget: 9060,
    status: 'tidak_tercapai',
    lastSurah: 'Ali Imran 110-115',
    avatarInitials: 'AA',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: 's-ab-3',
    name: 'Rayhan Al-Ghifari',
    nis: '20240103',
    parentName: 'Ibu Ratna Dewi',
    parentPhone: '081234567803',
    juzAchieved: '4 Juz',
    linesCompletedToday: 0,
    dailyTargetLines: 15,
    totalLinesMemorized: 1800,
    totalLinesTarget: 9060,
    status: 'belum_setor',
    lastSurah: 'Al-Baqarah 250-255',
    avatarInitials: 'RA',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },

  // Santri Halaqoh Umar bin Khattab
  {
    id: 's-um-1',
    name: 'Salman Al-Farisi',
    nis: '20240201',
    parentName: 'Bpk. Ridwan Hakim',
    parentPhone: '081234567804',
    juzAchieved: '2 Juz',
    linesCompletedToday: 20,
    dailyTargetLines: 15,
    totalLinesMemorized: 900,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Baqarah 142-150',
    avatarInitials: 'SF',
    halaqahName: 'Halaqoh Umar bin Khattab',
  },
  {
    id: 's-um-2',
    name: 'Bilal Habasyi',
    nis: '20240202',
    parentName: 'Ibu Fatimah Az-Zahra',
    parentPhone: '081234567805',
    juzAchieved: '1 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 15,
    totalLinesMemorized: 450,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Baqarah 75-80',
    avatarInitials: 'BH',
    halaqahName: 'Halaqoh Umar bin Khattab',
  },
  {
    id: 's-um-3',
    name: 'Zaid bin Tsabit',
    nis: '20240203',
    parentName: 'Bpk. Syarifuddin',
    parentPhone: '081234567806',
    juzAchieved: '2 Juz',
    linesCompletedToday: 0,
    dailyTargetLines: 15,
    totalLinesMemorized: 900,
    totalLinesTarget: 9060,
    status: 'belum_setor',
    lastSurah: 'Al-Baqarah 180-185',
    avatarInitials: 'ZT',
    halaqahName: 'Halaqoh Umar bin Khattab',
  },

  // Santri Halaqoh Utsman bin Affan
  {
    id: 's-ut-1',
    name: 'Thariq bin Ziyad',
    nis: '20240301',
    parentName: 'Bpk. Mansyur Hidayat',
    parentPhone: '081234567807',
    juzAchieved: '8 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 15,
    totalLinesMemorized: 3600,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Anfal 20-25',
    avatarInitials: 'TZ',
    halaqahName: 'Halaqoh Utsman bin Affan',
  },
  {
    id: 's-ut-2',
    name: 'Usamah bin Zaid',
    nis: '20240302',
    parentName: 'Bpk. Dedi Suryadi',
    parentPhone: '081234567808',
    juzAchieved: '6 Juz',
    linesCompletedToday: 8,
    dailyTargetLines: 15,
    totalLinesMemorized: 2700,
    totalLinesTarget: 9060,
    status: 'tidak_tercapai',
    lastSurah: 'Al-A\'raf 150-155',
    avatarInitials: 'UZ',
    halaqahName: 'Halaqoh Utsman bin Affan',
  },

  // Santri Halaqoh Ali bin Abi Thalib
  {
    id: 's-al-1',
    name: 'Hamzah bin Abdul Muthalib',
    nis: '20240401',
    parentName: 'Bpk. Rustam Effendi',
    parentPhone: '081234567809',
    juzAchieved: '1 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 15,
    totalLinesMemorized: 300,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'An-Naba 1-40',
    avatarInitials: 'HA',
    halaqahName: 'Halaqoh Ali bin Abi Thalib',
  },
  {
    id: 's-al-2',
    name: 'Sa\'ad bin Abi Waqqas',
    nis: '20240402',
    parentName: 'Ibu Aminah Saleh',
    parentPhone: '081234567810',
    juzAchieved: '1 Juz',
    linesCompletedToday: 0,
    dailyTargetLines: 15,
    totalLinesMemorized: 200,
    totalLinesTarget: 9060,
    status: 'belum_setor',
    lastSurah: 'An-Nazi\'at 1-46',
    avatarInitials: 'SW',
    halaqahName: 'Halaqoh Ali bin Abi Thalib',
  },
];

export const DEFAULT_HALAQAH_SETTINGS: HalaqahSettings = {
  halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  musyrifName: 'Muhaffizh',
  standardDailyTargetLines: 15,
  activeHalaqahId: 'halaqah-abu-bakar',
};
