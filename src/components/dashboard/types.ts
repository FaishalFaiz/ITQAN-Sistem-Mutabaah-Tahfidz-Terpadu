export interface Santri {
  id: string;
  name: string;
  nis: string;
  parentName: string;
  parentPhone: string;
  juzAchieved: string;
  linesCompletedToday: number;
  dailyTargetLines: number;
  totalLinesMemorized: number;
  totalLinesTarget: number;
  status: 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  lastSurah: string;
  avatarInitials: string;
  halaqahName?: string;
  lastDailyReportSentDate?: string; // e.g. "2026-09-30"
  lastDailyReportSentTime?: string; // e.g. "17:30 WIB"
}

export interface SetoranRecord {
  id: string;
  santriId: string;
  santriName: string;
  nis: string;
  type: 'ziyadah' | 'murojaah';
  juz: number;
  surahName: string;
  pageStart: number;
  pageEnd: number;
  lineStart: number;
  lineEnd: number;
  totalLines: number;
  grade: 'mumtaz' | 'jayyid' | 'iadah';
  musyrif: string;
  createdAt: string; // ISO string
  formattedDate: string; // "30 Sep 2026, 07:15 WIB"
  notes?: string;
  waStatus: 'not_sent' | 'sent' | 'failed';
  waSentAt?: string;
}

export interface WATemplateConfig {
  templateDailyProgress: string;
  templateZiyadah: string;
  templateMurojaah: string;
  templateHalaqahDigest: string;
}

export interface HalaqahSettings {
  halaqahName: string;
  musyrifName: string;
  standardDailyTargetLines: number;
}

export interface ExamRecord {
  id: string;
  santriId: string;
  santriName: string;
  nis: string;
  juz: number;
  ketukan: number;
  dibetulkan: number;
  tajwidScore: number;
  fashahahScore: number;
  penalty: number;
  finalScore: number;
  isPassed: boolean;
  date: string;
  musyrif: string;
  notes?: string;
}

export type NavItemKey = 
  | 'beranda' 
  | 'laporan' 
  | 'santri' 
  | 'pengaturan' 
  | 'pacing';

