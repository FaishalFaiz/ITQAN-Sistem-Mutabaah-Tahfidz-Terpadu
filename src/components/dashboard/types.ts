export interface Santri {
  id: string;
  name: string;
  nis: string;
  juzAchieved: string;
  linesCompletedToday: number;
  dailyTargetLines: number;
  totalLinesMemorized: number;
  totalLinesTarget: number;
  status: 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  lastSurah: string;
  avatarInitials: string;
}

export type NavItemKey = 
  | 'beranda' 
  | 'laporan' 
  | 'santri' 
  | 'pengaturan' 
  | 'setoran-ziyadah' 
  | 'setoran-murajaah' 
  | 'dll-pacing' 
  | 'dll-heatmap' 
  | 'dll-ujian';
