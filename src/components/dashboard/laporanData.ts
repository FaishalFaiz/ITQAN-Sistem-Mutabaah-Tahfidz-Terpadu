import type { Santri } from './types';

export interface SantriReportItem {
  id: string;
  name: string;
  nis: string;
  avatarInitials: string;
  juzAchieved: string;
  totalLinesMemorized: number;
  totalLinesTarget: number;
  dailyTargetLines: number;
  linesCompletedToday: number;
  status: 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  lastSurah: string;
  // Metrik Laporan Tambahan
  ziyadahLinesPeriod: number;
  ziyadahPagesPeriod: number;
  murojaahLinesPeriod: number;
  murojaahJuzPeriod: number;
  mumtazPercent: number;
  jayyidPercent: number;
  iadahPercent: number;
  attendancePercent: number;
  totalSessionsAttended: number;
  totalSessionsScheduled: number;
  pacingStatus: 'on_track' | 'behind' | 'accelerated';
  pacingDeficitLines: number; // 0 if on track
  lastExam: {
    juz: number;
    date: string;
    score: number;
    grade: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'I\'adah';
    passed: boolean;
    examiner: string;
  } | null;
  iadahWeakPoints: string[];
  daysSinceLastMurojaah: number;
}

export interface ExamRecord {
  id: string;
  santriId: string;
  santriName: string;
  nis: string;
  juzTarget: number;
  examDate: string;
  examinerName: string;
  ketukanCount: number;
  dibetulkanCount: number;
  tajwidScore: number;
  fashahahScore: number;
  kelancaranScore: number;
  finalScore: number;
  passed: boolean;
  certificateQr: string;
  notes: string;
}

export interface WeakPointSurah {
  surahNumber: number;
  surahName: string;
  juz: number;
  iadahCount: number;
  affectedSantriCount: number;
  severity: 'high' | 'medium' | 'low';
  commonMistakes: string;
}

export interface DayActivity {
  date: string;
  dayName: string;
  dayOfMonth: number;
  ziyadahLines: number;
  murojaahLines: number;
  totalLines: number;
  targetLines: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 1=low, 2=med, 3=high, 4=peak
}

// Data generator per-santri untuk laporan
export const generateSantriReports = (santriList: Santri[]): SantriReportItem[] => {
  return santriList.map((s, idx) => {
    // Generate realistic data anchored on their status & juz
    const juzNum = parseFloat(s.juzAchieved.replace(' Juz', '')) || 10;
    const isTop = s.status === 'tercapai';
    const isBehind = s.status === 'tidak_tercapai';

    const ziyadahLinesPeriod = isTop ? 380 + (idx * 25) % 120 : isBehind ? 180 : 0;
    const ziyadahPagesPeriod = +(ziyadahLinesPeriod / 15).toFixed(1);
    const murojaahLinesPeriod = 850 + (idx * 60) % 300;
    const murojaahJuzPeriod = +(murojaahLinesPeriod / 300).toFixed(1);

    const mumtazPercent = isTop ? 88 + (idx % 8) : isBehind ? 68 : 75;
    const iadahPercent = isTop ? 2 + (idx % 3) : isBehind ? 14 : 8;
    const jayyidPercent = 100 - mumtazPercent - iadahPercent;

    const pacingStatus: 'on_track' | 'behind' | 'accelerated' = 
      isTop && juzNum >= 14 ? (juzNum >= 20 ? 'accelerated' : 'on_track') : isBehind ? 'behind' : 'on_track';
    
    const pacingDeficitLines = pacingStatus === 'behind' ? 45 : 0;

    const weakPointsPool = [
      'Al-Muthaffifin 10–25 (Tawaqquf)',
      'At-Takwir 15–29 (Makhraj)',
      'An-Nazi\'at 27–40 (Ghunnah)',
      'Al-Buruj 1–12 (Qalqalah)',
      'Abasa 17–32 (Waqaf)',
      'Al-A\'la 1–19 (Kelancaran)',
      'Al-Insyiqaq 1–15 (Tajwid)'
    ];

    const iadahWeakPoints = iadahPercent > 5 ? [weakPointsPool[idx % weakPointsPool.length]] : [];

    const lastExam = juzNum >= 10 ? {
      juz: Math.floor(juzNum),
      date: `${10 + (idx % 18)} Sep 2026`,
      score: +(90 + (idx % 8) * 1.1).toFixed(1),
      grade: 'Mumtaz' as const,
      passed: true,
      examiner: 'Ust. Abdullah',
    } : null;

    return {
      id: s.id,
      name: s.name,
      nis: s.nis,
      avatarInitials: s.avatarInitials,
      juzAchieved: s.juzAchieved,
      totalLinesMemorized: s.totalLinesMemorized || Math.round(juzNum * 300),
      totalLinesTarget: s.totalLinesTarget || 9060,
      dailyTargetLines: s.dailyTargetLines,
      linesCompletedToday: s.linesCompletedToday,
      status: s.status,
      lastSurah: s.lastSurah,
      ziyadahLinesPeriod,
      ziyadahPagesPeriod,
      murojaahLinesPeriod,
      murojaahJuzPeriod,
      mumtazPercent,
      jayyidPercent,
      iadahPercent,
      attendancePercent: isTop ? 98 : isBehind ? 91 : 94,
      totalSessionsAttended: isTop ? 28 : isBehind ? 26 : 27,
      totalSessionsScheduled: 29,
      pacingStatus,
      pacingDeficitLines,
      lastExam,
      iadahWeakPoints,
      daysSinceLastMurojaah: (idx * 3) % 9,
    };
  });
};

// Data riwayat ujian tasmi' resmi
export const MOCK_EXAM_RECORDS: ExamRecord[] = [
  {
    id: 'ex-001',
    santriId: '6',
    santriName: 'Utsman bin Affan',
    nis: '2024008',
    juzTarget: 25,
    examDate: '26 Sep 2026',
    examinerName: 'Ust. Hamzah Al-Hafidz',
    ketukanCount: 1,
    dibetulkanCount: 0,
    tajwidScore: 97.0,
    fashahahScore: 98.0,
    kelancaranScore: 98.5,
    finalScore: 97.8,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-001-UTSMAN',
    notes: 'Makhraj huruf sempurna, nafas panjang, dan tawaqquf hanya 1x minor di Surah Fussilat.',
  },
  {
    id: 'ex-002',
    santriId: '4',
    santriName: 'Abdullah bin Mas\'ud',
    nis: '2024006',
    juzTarget: 22,
    examDate: '24 Sep 2026',
    examinerName: 'Ust. Abdullah',
    ketukanCount: 2,
    dibetulkanCount: 0,
    tajwidScore: 96.0,
    fashahahScore: 95.5,
    kelancaranScore: 96.0,
    finalScore: 95.8,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-002-ABDULLAH',
    notes: 'Kelancaran stabil, nada murottal konsisten standar Hijaz.',
  },
  {
    id: 'ex-003',
    santriId: '7',
    santriName: 'Umar bin Khattab',
    nis: '2024009',
    juzTarget: 19,
    examDate: '22 Sep 2026',
    examinerName: 'Ust. Hamzah Al-Hafidz',
    ketukanCount: 2,
    dibetulkanCount: 1,
    tajwidScore: 93.0,
    fashahahScore: 94.0,
    kelancaranScore: 92.5,
    finalScore: 93.2,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-003-UMAR',
    notes: 'Ada 1 fath di awal surah Maryam, selebihnya mutqin.',
  },
  {
    id: 'ex-004',
    santriId: '3',
    santriName: 'Zaid bin Tsabit',
    nis: '2024005',
    juzTarget: 18,
    examDate: '20 Sep 2026',
    examinerName: 'Ust. Abdullah',
    ketukanCount: 3,
    dibetulkanCount: 0,
    tajwidScore: 94.5,
    fashahahScore: 94.0,
    kelancaranScore: 93.0,
    finalScore: 93.8,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-004-ZAID',
    notes: 'Lancar sekali, bacaan tertata rapi.',
  },
  {
    id: 'ex-005',
    santriId: '5',
    santriName: 'Ali bin Abi Thalib',
    nis: '2024007',
    juzTarget: 16,
    examDate: '18 Sep 2026',
    examinerName: 'Ust. Mansyur Al-Baqir',
    ketukanCount: 1,
    dibetulkanCount: 0,
    tajwidScore: 98.0,
    fashahahScore: 97.0,
    kelancaranScore: 96.5,
    finalScore: 97.2,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-005-ALI',
    notes: 'Mumtaz Murtan. Sangat mutqin tanpa keraguan.',
  },
  {
    id: 'ex-006',
    santriId: '1',
    santriName: 'Muhammad Faiz',
    nis: '2024001',
    juzTarget: 14,
    examDate: '15 Sep 2026',
    examinerName: 'Ust. Abdullah',
    ketukanCount: 4,
    dibetulkanCount: 1,
    tajwidScore: 91.0,
    fashahahScore: 92.0,
    kelancaranScore: 90.0,
    finalScore: 91.0,
    passed: true,
    certificateQr: 'ITQAN-CERT-2026-09-006-FAIZ',
    notes: 'Lulus tasmi\' 1 juz sekali duduk. Perlu pemantapan waqaf di pertengahan ayat panjang.',
  },
  {
    id: 'ex-007',
    santriId: '11',
    santriName: 'Ahmad Zaki',
    nis: '2024002',
    juzTarget: 8,
    examDate: '10 Sep 2026',
    examinerName: 'Ust. Mansyur Al-Baqir',
    ketukanCount: 9,
    dibetulkanCount: 4,
    tajwidScore: 78.0,
    fashahahScore: 80.0,
    kelancaranScore: 72.0,
    finalScore: 76.6,
    passed: false,
    certificateQr: '',
    notes: 'Belum lulus. Terlalu banyak tawaqquf di halaman 155-158. Jadwalkan ujian remidi 2 pekan lagi.',
  },
];

// Titik rawan i'adah di halaqoh
export const MOCK_WEAK_POINTS: WeakPointSurah[] = [
  {
    surahNumber: 83,
    surahName: 'Al-Muthaffifin',
    juz: 30,
    iadahCount: 14,
    affectedSantriCount: 5,
    severity: 'high',
    commonMistakes: 'Ayat 10-25 sering terbalik susunan lafadz dan tawaqquf pada mad wajib.',
  },
  {
    surahNumber: 81,
    surahName: 'At-Takwir',
    juz: 30,
    iadahCount: 9,
    affectedSantriCount: 4,
    severity: 'medium',
    commonMistakes: 'Peralihan idgham bighunnah dan makhraj ta marbuthah pada waqaf.',
  },
  {
    surahNumber: 79,
    surahName: 'An-Nazi\'at',
    juz: 30,
    iadahCount: 8,
    affectedSantriCount: 3,
    severity: 'medium',
    commonMistakes: 'Rangkaian ayat kisah Nabi Musa (ayat 15-26) sering terlewat urutannya.',
  },
  {
    surahNumber: 85,
    surahName: 'Al-Buruj',
    juz: 30,
    iadahCount: 6,
    affectedSantriCount: 3,
    severity: 'low',
    commonMistakes: 'Qalqalah kubra pada akhir ayat sering kurang memantul tegas.',
  },
];

// 30-day activity matrix untuk heatmap
export const generateMonthActivity = (): DayActivity[] => {
  const days: DayActivity[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  for (let i = 1; i <= 30; i++) {
    const dayOfWeek = (i + 1) % 7;
    const isJumat = dayOfWeek === 5;
    
    // Jumat halaqoh libur / ringan
    const ziyadah = isJumat ? 30 : 120 + ((i * 17) % 55);
    const murojaah = isJumat ? 80 : 250 + ((i * 23) % 90);
    const total = ziyadah + murojaah;
    const target = isJumat ? 100 : 380;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (total > 450) intensity = 4;
    else if (total > 380) intensity = 3;
    else if (total > 260) intensity = 2;
    else if (total > 100) intensity = 1;
    else intensity = 0;

    days.push({
      date: `2026-09-${i < 10 ? '0' + i : i}`,
      dayName: dayNames[dayOfWeek],
      dayOfMonth: i,
      ziyadahLines: ziyadah,
      murojaahLines: murojaah,
      totalLines: total,
      targetLines: target,
      intensity,
    });
  }
  return days;
};

// Trend mingguan untuk chart perbandingan
export const WEEKLY_TREND_DATA = [
  { label: 'Pekan 1 (1-7 Sep)', ziyadah: 980, murojaah: 2650, target: 3500, mumtazRate: 86 },
  { label: 'Pekan 2 (8-14 Sep)', ziyadah: 1040, murojaah: 2890, target: 3500, mumtazRate: 88 },
  { label: 'Pekan 3 (15-21 Sep)', ziyadah: 1120, murojaah: 3010, target: 3500, mumtazRate: 91 },
  { label: 'Pekan 4 (22-28 Sep)', ziyadah: 1180, murojaah: 3220, target: 3500, mumtazRate: 89 },
];

export const JUZ_DISTRIBUTION_DATA = [
  { range: '1 - 5 Juz', count: 1, label: 'Tahap Awal', color: '#94A3B8' },
  { range: '6 - 10 Juz', count: 2, label: 'Pondasi', color: '#38BDF8' },
  { range: '11 - 15 Juz', count: 4, label: 'Menengah', color: '#0070BA' },
  { range: '16 - 20 Juz', count: 3, label: 'Lanjutan', color: '#047857' },
  { range: '21 - 30 Juz', count: 2, label: 'Jelang Khatam', color: '#B45309' },
];
