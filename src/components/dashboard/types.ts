export type SantriStatus = 'tercapai' | 'tidak_tercapai' | 'belum_setor';
export type SetoranType = 'ziyadah' | 'murojaah';
export type SetoranGrade = 'mumtaz' | 'jayyid' | 'iadah';
export type SetoranFilterType = 'all' | 'sudah_setor' | 'belum_setor' | 'tercapai' | 'tidak_tercapai';

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
  status: SantriStatus;
  lastSurah: string;
  avatarInitials: string;
  halaqahName?: string;
  halaqahId?: string;
  lastDailyReportSentDate?: string; // e.g. "2026-09-30"
  lastDailyReportSentTime?: string; // e.g. "17:30 WIB"
}

export interface SetoranRecord {
  id: string;
  santriId: string;
  santriName: string;
  nis: string;
  type: SetoranType;
  juz: number;
  surahName: string;
  pageStart: number;
  pageEnd: number;
  lineStart: number;
  lineEnd: number;
  totalLines: number;
  grade: SetoranGrade;
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

export interface HalaqahMember {
  id: string;
  name: string;
  email?: string;
  role: 'utama' | 'pendamping';
  joinedAt?: string;
}

export interface HalaqahGroup {
  id: string;
  code: string; // Unique Join Code (e.g. 'HLQ-ABU-01', 'HLQ-8K2N9P')
  name: string;
  description?: string;
  room?: string;
  targetDailyLines?: number;
  musyrifName?: string;
  creatorId?: string; // ID / scope musyrif pembuat room halaqoh
  memberIds?: string[]; // Daftar ID / scope musyrif yang bergabung
  members?: HalaqahMember[]; // Daftar rincian muhaffizh yang masuk ke halaqoh ini
  createdAt?: string;
}

export interface HalaqahSettings {
  halaqahName: string;
  musyrifName: string;
  standardDailyTargetLines: number;
  activeHalaqahId?: string;
}

export type NavItemKey = 
  | 'beranda' 
  | 'laporan' 
  | 'santri' 
  | 'halaqah' 
  | 'pengaturan';


