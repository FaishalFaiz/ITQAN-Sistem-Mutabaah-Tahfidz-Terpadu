import type { Santri, SetoranRecord, WAGatewayConfig, HalaqahSettings } from './types';

export const INITIAL_SANTRI_LIST: Santri[] = [
  {
    id: '1',
    name: 'Muhammad Faiz',
    nis: '2024001',
    parentName: 'H. Gunawan Prasetyo',
    parentPhone: '081234567801',
    juzAchieved: '14.5 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 12,
    totalLinesMemorized: 2175,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'An-Naba 1-40',
    avatarInitials: 'MF',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '2',
    name: 'Bilal Al-Habasyi',
    nis: '2024004',
    parentName: 'Bpk. Ahmad Sofyan',
    parentPhone: '081234567802',
    juzAchieved: '12.0 Juz',
    linesCompletedToday: 12,
    dailyTargetLines: 10,
    totalLinesMemorized: 1800,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'At-Takwir 1-29',
    avatarInitials: 'BA',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '3',
    name: 'Zaid bin Tsabit',
    nis: '2024005',
    parentName: 'H. Ruslan Abdullah',
    parentPhone: '081234567803',
    juzAchieved: '18.2 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 15,
    totalLinesMemorized: 2730,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Yasin 1-45',
    avatarInitials: 'ZT',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '4',
    name: "Abdullah bin Mas'ud",
    nis: '2024006',
    parentName: 'Bpk. Hendra Sasmita',
    parentPhone: '081234567804',
    juzAchieved: '22.0 Juz',
    linesCompletedToday: 16,
    dailyTargetLines: 15,
    totalLinesMemorized: 3300,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Kahf 1-50',
    avatarInitials: 'AM',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '5',
    name: 'Ali bin Abi Thalib',
    nis: '2024007',
    parentName: 'Bpk. Syarif Hidayat',
    parentPhone: '081234567805',
    juzAchieved: '16.0 Juz',
    linesCompletedToday: 14,
    dailyTargetLines: 12,
    totalLinesMemorized: 2400,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Mulk 1-30',
    avatarInitials: 'AB',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '6',
    name: 'Utsman bin Affan',
    nis: '2024008',
    parentName: 'H. Bambang Sulistyo',
    parentPhone: '081234567806',
    juzAchieved: '25.0 Juz',
    linesCompletedToday: 20,
    dailyTargetLines: 15,
    totalLinesMemorized: 3750,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Baqarah 1-100',
    avatarInitials: 'UA',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '7',
    name: 'Umar bin Khattab',
    nis: '2024009',
    parentName: 'Bpk. Ridwan Mansyur',
    parentPhone: '081234567807',
    juzAchieved: '19.5 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 14,
    totalLinesMemorized: 2925,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Ar-Rahman 1-78',
    avatarInitials: 'UK',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '8',
    name: "Sa'ad bin Abi Waqqas",
    nis: '2024010',
    parentName: 'Bpk. Fajar Ramli',
    parentPhone: '081234567808',
    juzAchieved: '11.0 Juz',
    linesCompletedToday: 12,
    dailyTargetLines: 12,
    totalLinesMemorized: 1650,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: "Al-Waqi'ah 1-50",
    avatarInitials: 'SW',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '9',
    name: 'Thalhah bin Ubaidillah',
    nis: '2024011',
    parentName: 'H. Danang Triyono',
    parentPhone: '081234567809',
    juzAchieved: '13.0 Juz',
    linesCompletedToday: 15,
    dailyTargetLines: 12,
    totalLinesMemorized: 1950,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Insan 1-31',
    avatarInitials: 'TU',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '10',
    name: 'Zubair bin Awwam',
    nis: '2024012',
    parentName: 'Bpk. Agus Santoso',
    parentPhone: '081234567810',
    juzAchieved: '10.5 Juz',
    linesCompletedToday: 13,
    dailyTargetLines: 12,
    totalLinesMemorized: 1575,
    totalLinesTarget: 9060,
    status: 'tercapai',
    lastSurah: 'Al-Qiyamah 1-40',
    avatarInitials: 'ZA',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '11',
    name: 'Ahmad Zaki',
    nis: '2024002',
    parentName: 'Bpk. Zainal Abidin',
    parentPhone: '081234567811',
    juzAchieved: '8.5 Juz',
    linesCompletedToday: 6,
    dailyTargetLines: 15,
    totalLinesMemorized: 1275,
    totalLinesTarget: 9060,
    status: 'tidak_tercapai',
    lastSurah: 'An-Naziat 1-20',
    avatarInitials: 'AZ',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
  {
    id: '12',
    name: 'Farhan Ramadhan',
    nis: '2024003',
    parentName: 'Ibu Maryam Hasan',
    parentPhone: '081234567812',
    juzAchieved: '5.2 Juz',
    linesCompletedToday: 0,
    dailyTargetLines: 15,
    totalLinesMemorized: 780,
    totalLinesTarget: 9060,
    status: 'belum_setor',
    lastSurah: 'Abasa 1-15 (Kemarin)',
    avatarInitials: 'FR',
    halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  },
];

export const INITIAL_SETORAN_RECORDS: SetoranRecord[] = [
  {
    id: 'setor-1',
    santriId: '1',
    santriName: 'Muhammad Faiz',
    nis: '2024001',
    type: 'ziyadah',
    juz: 30,
    surahName: 'An-Naba 1-40',
    pageStart: 582,
    pageEnd: 582,
    lineStart: 1,
    lineEnd: 15,
    totalLines: 15,
    grade: 'mumtaz',
    musyrif: 'Ust. Abdullah',
    createdAt: '2026-09-30T07:15:00.000Z',
    formattedDate: 'Hari ini, 07:15 WIB',
    notes: 'Tajwid dan makharijul huruf sangat fasih.',
    waStatus: 'sent',
    waSentAt: '2026-09-30T07:16:10.000Z',
  },
  {
    id: 'setor-2',
    santriId: '1',
    santriName: 'Muhammad Faiz',
    nis: '2024001',
    type: 'murojaah',
    juz: 30,
    surahName: 'An-Naziat 1-46',
    pageStart: 583,
    pageEnd: 584,
    lineStart: 1,
    lineEnd: 15,
    totalLines: 30,
    grade: 'mumtaz',
    musyrif: 'Ust. Abdullah',
    createdAt: '2026-09-29T16:30:00.000Z',
    formattedDate: 'Kemarin, 16:30 WIB',
    notes: 'Murojaah sore lancar tanpa jeda panjang.',
    waStatus: 'sent',
    waSentAt: '2026-09-29T16:31:00.000Z',
  },
  {
    id: 'setor-3',
    santriId: '1',
    santriName: 'Muhammad Faiz',
    nis: '2024001',
    type: 'ziyadah',
    juz: 30,
    surahName: 'Abasa 1-42',
    pageStart: 585,
    pageEnd: 585,
    lineStart: 1,
    lineEnd: 15,
    totalLines: 15,
    grade: 'jayyid',
    musyrif: 'Ust. Abdullah',
    createdAt: '2026-09-28T07:10:00.000Z',
    formattedDate: '28 Sep 2026, 07:10 WIB',
    notes: 'Perhatikan dengung (ghunnah) pada ayat 25-30.',
    waStatus: 'sent',
    waSentAt: '2026-09-28T07:12:00.000Z',
  },
  {
    id: 'setor-4',
    santriId: '11',
    santriName: 'Ahmad Zaki',
    nis: '2024002',
    type: 'ziyadah',
    juz: 30,
    surahName: 'An-Naziat 1-20',
    pageStart: 583,
    pageEnd: 583,
    lineStart: 1,
    lineEnd: 6,
    totalLines: 6,
    grade: 'iadah',
    musyrif: 'Ust. Abdullah',
    createdAt: '2026-09-30T07:45:00.000Z',
    formattedDate: 'Hari ini, 07:45 WIB',
    notes: 'Defisit 9 baris dari target 15 baris. Disarankan murojaah ba\'da maghrib.',
    waStatus: 'not_sent',
  },
  {
    id: 'setor-5',
    santriId: '2',
    santriName: 'Bilal Al-Habasyi',
    nis: '2024004',
    type: 'ziyadah',
    juz: 30,
    surahName: 'At-Takwir 1-29',
    pageStart: 586,
    pageEnd: 586,
    lineStart: 1,
    lineEnd: 12,
    totalLines: 12,
    grade: 'mumtaz',
    musyrif: 'Ust. Abdullah',
    createdAt: '2026-09-30T07:30:00.000Z',
    formattedDate: 'Hari ini, 07:30 WIB',
    notes: 'Target harian 10 baris terlampaui (12 baris).',
    waStatus: 'sent',
    waSentAt: '2026-09-30T07:31:00.000Z',
  },
];

export const DEFAULT_WA_CONFIG: WAGatewayConfig = {
  provider: 'fonnte',
  endpointUrl: 'https://api.fonnte.com/send',
  apiKey: '',
  senderNumber: '6281234567890',
  autoSendOnSetoran: false, // Default false agar fokus ke 1 pesan harian per wali
  limitOneMessagePerDay: true, // Safeguard 1 pesan harian per wali
  templateDailyProgress: `*LAPORAN HARIAN MUTABA'AH TAHFIDZ ITQAN*
_Pesantren Tahfidz Terpadu_

Assalamu'alaikum Wr. Wb.
Yth. Wali dari *{nama}* (NIS: {nis}),

Berikut ringkasan mutaba'ah & kemajuan ananda hari *{tanggal}*:

📊 *TARGET HARI INI:*
• Target Harian: *{targetHarian} Baris*
• Capaian Setoran: *{tercapaiHariIni} Baris* (~{halamanHariIni} Halaman)
• Status Capaian: *{statusHarian}*

📖 *RINCIAN SESI HARI INI:*
{rincianSesi}

📈 *AKUMULASI HAFALAN & KURIKULUM:*
• Total Hafalan Saat Ini: *{totalHafalan}*
• Sisa Target 30 Juz: *{sisaTarget} Baris*
• Status Capaian Target: *{statusPacing}*

{catatanMusyrif}

Jazakumullahu khairan atas doa dan bimbingan Ayah/Bunda untuk ananda di rumah.
_Wassalamu'alaikum Wr. Wb._
_Musyrif: {musyrif} ({halaqoh})_`,
  templateZiyadah: `*LAPORAN SETORAN ZIYADAH - ITQAN*
_Pesantren Tahfidz Terpadu_

Assalamu'alaikum Wr. Wb.
Yth. Wali dari *{nama}* (NIS: {nis}),

Alhamdulillah, ananda baru saja menyelesaikan setoran hafalan baru (Ziyadah):
📖 *Surah:* {surah} (Juz {juz})
📄 *Posisi:* Hal. {halaman} (Baris {barisAwal}–{barisAkhir})
📏 *Jumlah Setoran:* {baris} Baris
⭐ *Kelancaran:* *{nilai}*
📊 *Total Capaian:* {capaianJuz}
🕒 *Waktu Setor:* {waktu} WIB
👤 *Disimak oleh:* {musyrif}

{catatan}

Jazakumullahu khairan atas doa dan bimbingan Ayah/Bunda di rumah.
_Wassalamu'alaikum Wr. Wb._`,

  templateMurojaah: `*LAPORAN SETORAN MUROJA'AH - ITQAN*
_Pesantren Tahfidz Terpadu_

Assalamu'alaikum Wr. Wb.
Yth. Wali dari *{nama}* (NIS: {nis}),

Alhamdulillah, ananda telah menyetorkan pengulangan hafalan (Muroja'ah):
📖 *Surah:* {surah} (Juz {juz})
📄 *Rentang:* Hal. {halaman}
📏 *Jumlah Pengulangan:* {baris} Baris
⭐ *Predikat Kelancaran:* *{nilai}*
🕒 *Waktu Setor:* {waktu} WIB
👤 *Disimak oleh:* {musyrif}

{catatan}

Mari terus jaga kelancaran hafalan ananda.
_Wassalamu'alaikum Wr. Wb._`,

  templateHalaqahDigest: `*REKAPITULASI MUTABA'AH TAHFIDZ ITQAN*
*Halaqoh:* {halaqoh}
*Musyrif:* {musyrif}
*Tanggal:* {tanggal}
----------------------------------------
{ringkasan}
----------------------------------------
_Sistem Informasi Mutaba'ah ITQAN_`,
};

export const DEFAULT_HALAQAH_SETTINGS: HalaqahSettings = {
  halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
  musyrifName: 'Ust. Abdullah',
  standardDailyTargetLines: 15,
};
