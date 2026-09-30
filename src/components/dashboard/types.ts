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

export type WAGatewayProvider = 'fonnte' | 'waha' | 'wablas' | 'custom';

export interface WAGatewayConfig {
  provider: WAGatewayProvider;
  endpointUrl: string;
  apiKey: string;
  senderNumber: string;
  autoSendOnSetoran: boolean;
  limitOneMessagePerDay: boolean;
  templateDailyProgress: string;
  templateZiyadah: string;
  templateMurojaah: string;
  templateHalaqahDigest: string;
}

export interface WALog {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientPhone: string;
  messageType: 'setoran' | 'broadcast' | 'test' | 'daily_report';
  status: 'success' | 'failed' | 'fallback_opened';
  statusText: string;
  snippet: string;
}

export interface HalaqahSettings {
  halaqahName: string;
  musyrifName: string;
  standardDailyTargetLines: number;
}

export type NavItemKey = 
  | 'beranda' 
  | 'laporan' 
  | 'santri' 
  | 'pengaturan' 
  | 'dll-pacing' 
  | 'dll-ujian';

