import type { Santri, SetoranRecord, WAGatewayConfig, WALog, HalaqahSettings, ExamRecord } from '../components/dashboard/types';
import { 
  DEFAULT_WA_CONFIG, 
  DEFAULT_HALAQAH_SETTINGS 
} from '../components/dashboard/mockData';

// Base keys
const BASE_KEYS = {
  SANTRI: 'itqan_santri_list',
  SETORAN: 'itqan_setoran_records',
  WA_CONFIG: 'itqan_wa_gateway_config',
  WA_LOGS: 'itqan_wa_logs',
  SETTINGS: 'itqan_halaqah_settings',
  EXAMS: 'itqan_exam_records',
};

// Event for cross-component reactive updates
export const EVENT_DATA_CHANGED = 'itqan_store_changed';

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function emitChange(detail?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_CHANGED, { detail }));
  }
}

// Purge legacy global dummy data once so it never leaks across accounts
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('itqan_santri_list');
    localStorage.removeItem('itqan_setoran_records');
    localStorage.removeItem('itqan_exam_records');
    localStorage.removeItem('itqan_wa_logs');
  } catch {}
}

export const storageService = {
  // Mendapatkan identitas user musyrif aktif saat ini untuk isolasi data
  getActiveUserScope(): string {
    if (typeof window === 'undefined') return 'guest';
    try {
      // 1. Cek dari session musyrif lokal yang tersimpan
      const rawUser = localStorage.getItem('itqan_current_musyrif');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u?.id) return `u_${u.id}`;
        if (u?.email) return `u_${u.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      }

      // 2. Cek token Supabase Auth di localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            const user = parsed?.user;
            if (user?.id) {
              return `u_${user.id}`;
            }
          }
        }
      }
    } catch {}
    return 'u_default';
  },

  // Dapatkan key yang terisolasi khusus untuk akun musyrif yang sedang aktif
  getScopedKey(baseKey: string): string {
    const scope = this.getActiveUserScope();
    return `${baseKey}_${scope}`;
  },

  // ================= SANTRI (START DARI 0) =================
  getSantriList(): Santri[] {
    try {
      const key = this.getScopedKey(BASE_KEYS.SANTRI);
      const data = localStorage.getItem(key);
      if (!data) {
        // Setiap akun baru selalu mulai dari 0 santri
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getSantriById(id: string): Santri | undefined {
    const list = this.getSantriList();
    return list.find((s) => s.id === id);
  },

  saveSantriList(list: Santri[]): void {
    const key = this.getScopedKey(BASE_KEYS.SANTRI);
    localStorage.setItem(key, JSON.stringify(list));
    emitChange('santri_list_updated');
  },

  addSantri(newSantri: Santri): Santri[] {
    const list = this.getSantriList();
    const updated = [newSantri, ...list];
    this.saveSantriList(updated);
    return updated;
  },

  updateSantri(updatedSantri: Santri): Santri[] {
    const list = this.getSantriList();
    const updated = list.map((s) => (s.id === updatedSantri.id ? updatedSantri : s));
    this.saveSantriList(updated);
    return updated;
  },

  deleteSantri(id: string): Santri[] {
    const list = this.getSantriList();
    const updated = list.filter((s) => s.id !== id);
    this.saveSantriList(updated);
    return updated;
  },

  markDailyReportSent(santriId: string): Santri | null {
    const list = this.getSantriList();
    const today = getTodayDateKey();
    const timeFormatted = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()) + ' WIB';

    let updatedSantri: Santri | null = null;
    const updatedList = list.map((s) => {
      if (s.id === santriId) {
        updatedSantri = {
          ...s,
          lastDailyReportSentDate: today,
          lastDailyReportSentTime: timeFormatted,
        };
        return updatedSantri;
      }
      return s;
    });

    if (updatedSantri) {
      this.saveSantriList(updatedList);
    }
    return updatedSantri;
  },

  // ================= SETORAN (START DARI 0) =================
  getSetoranRecords(): SetoranRecord[] {
    try {
      const key = this.getScopedKey(BASE_KEYS.SETORAN);
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getSetoranBySantriId(santriId: string): SetoranRecord[] {
    const records = this.getSetoranRecords();
    return records.filter((r) => r.santriId === santriId);
  },

  getTodaySetoranForSantri(santriId: string): SetoranRecord[] {
    const today = getTodayDateKey();
    const records = this.getSetoranRecords();
    return records.filter(
      (r) => r.santriId === santriId && r.createdAt?.startsWith(today)
    );
  },

  getAllTodaySetoran(): SetoranRecord[] {
    const today = getTodayDateKey();
    const records = this.getSetoranRecords();
    return records.filter(
      (r) => r.createdAt?.startsWith(today)
    );
  },

  addSetoranRecord(
    input: Omit<SetoranRecord, 'id' | 'createdAt' | 'formattedDate'>
  ): { record: SetoranRecord; updatedSantri: Santri } {
    const now = new Date();
    const timeFormatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const record: SetoranRecord = {
      ...input,
      id: `setor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now.toISOString(),
      formattedDate: `${timeFormatted} WIB`,
    };

    // 1. Simpan record ke database lokal musyrif aktif
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    const records = this.getSetoranRecords();
    const updatedRecords = [record, ...records];
    localStorage.setItem(key, JSON.stringify(updatedRecords));

    // 2. Update status & metrik santri
    const santriList = this.getSantriList();
    let updatedSantriTarget: Santri | null = null;

    const updatedList = santriList.map((s) => {
      if (s.id !== input.santriId) return s;

      const newLinesToday = (s.linesCompletedToday || 0) + input.totalLines;
      const newTotalMemorized = (s.totalLinesMemorized || 0) + input.totalLines;
      const isTercapai = newLinesToday >= s.dailyTargetLines;
      const calculatedJuz = (newTotalMemorized / 300).toFixed(1) + ' Juz';

      updatedSantriTarget = {
        ...s,
        linesCompletedToday: newLinesToday,
        totalLinesMemorized: newTotalMemorized,
        juzAchieved: calculatedJuz,
        status: isTercapai ? 'tercapai' : 'tidak_tercapai',
        lastSurah: input.surahName,
      };

      return updatedSantriTarget;
    });

    if (updatedSantriTarget) {
      this.saveSantriList(updatedList);
    }

    emitChange('setoran_added');
    return {
      record,
      updatedSantri: updatedSantriTarget || santriList[0],
    };
  },

  updateSetoranWAStatus(recordId: string, waStatus: 'sent' | 'failed' | 'not_sent'): void {
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    const records = this.getSetoranRecords();
    const updated = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            waStatus,
            waSentAt: waStatus === 'sent' ? new Date().toISOString() : r.waSentAt,
          }
        : r
    );
    localStorage.setItem(key, JSON.stringify(updated));
    emitChange('setoran_wa_status_updated');
  },

  // ================= WA GATEWAY CONFIG =================
  getWAGatewayConfig(): WAGatewayConfig {
    try {
      const key = this.getScopedKey(BASE_KEYS.WA_CONFIG);
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(DEFAULT_WA_CONFIG));
        return DEFAULT_WA_CONFIG;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WA_CONFIG;
    }
  },

  saveWAGatewayConfig(config: WAGatewayConfig): void {
    const key = this.getScopedKey(BASE_KEYS.WA_CONFIG);
    localStorage.setItem(key, JSON.stringify(config));
    emitChange('wa_config_updated');
  },

  // ================= WA LOGS =================
  getWALogs(): WALog[] {
    try {
      const key = this.getScopedKey(BASE_KEYS.WA_LOGS);
      const data = localStorage.getItem(key);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  addWALog(input: Omit<WALog, 'id' | 'timestamp'>): WALog {
    const log: WALog = {
      ...input,
      id: `walog-${Date.now()}`,
      timestamp: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    };
    const key = this.getScopedKey(BASE_KEYS.WA_LOGS);
    const logs = this.getWALogs();
    const updated = [log, ...logs.slice(0, 49)];
    localStorage.setItem(key, JSON.stringify(updated));
    emitChange('wa_log_added');
    return log;
  },

  clearWALogs(): void {
    const key = this.getScopedKey(BASE_KEYS.WA_LOGS);
    localStorage.setItem(key, JSON.stringify([]));
    emitChange('wa_logs_cleared');
  },

  // ================= HALAQAH SETTINGS =================
  getHalaqahSettings(): HalaqahSettings {
    try {
      const key = this.getScopedKey(BASE_KEYS.SETTINGS);
      const data = localStorage.getItem(key);
      if (!data) {
        let customSettings = { ...DEFAULT_HALAQAH_SETTINGS };
        const rawUser = localStorage.getItem('itqan_current_musyrif');
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            if (u?.fullName) {
              customSettings.musyrifName = u.fullName;
              customSettings.halaqahName = `Halaqoh ${u.fullName}`;
            }
          } catch {}
        }
        localStorage.setItem(key, JSON.stringify(customSettings));
        return customSettings;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_HALAQAH_SETTINGS;
    }
  },

  saveHalaqahSettings(settings: HalaqahSettings): void {
    const key = this.getScopedKey(BASE_KEYS.SETTINGS);
    localStorage.setItem(key, JSON.stringify(settings));
    emitChange('halaqah_settings_updated');
  },

  // ================= UJIAN TASMI' =================
  getExamRecords(): ExamRecord[] {
    try {
      const key = this.getScopedKey(BASE_KEYS.EXAMS);
      const data = localStorage.getItem(key);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getExamsBySantriId(santriId: string): ExamRecord[] {
    const list = this.getExamRecords();
    return list.filter((e) => e.santriId === santriId);
  },

  addExamRecord(input: Omit<ExamRecord, 'id' | 'date'>): ExamRecord {
    const record: ExamRecord = {
      ...input,
      id: `exam-${Date.now()}`,
      date: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()) + ' WIB',
    };
    const key = this.getScopedKey(BASE_KEYS.EXAMS);
    const list = this.getExamRecords();
    const updated = [record, ...list];
    localStorage.setItem(key, JSON.stringify(updated));
    emitChange('exam_record_added');
    return record;
  },

  // ================= RESET / BERSIHKAN DATA AKUN INI =================
  resetDatabase(): void {
    const santriKey = this.getScopedKey(BASE_KEYS.SANTRI);
    const setoranKey = this.getScopedKey(BASE_KEYS.SETORAN);
    const logsKey = this.getScopedKey(BASE_KEYS.WA_LOGS);
    const examsKey = this.getScopedKey(BASE_KEYS.EXAMS);

    localStorage.setItem(santriKey, JSON.stringify([]));
    localStorage.setItem(setoranKey, JSON.stringify([]));
    localStorage.setItem(logsKey, JSON.stringify([]));
    localStorage.setItem(examsKey, JSON.stringify([]));
    emitChange('database_reset');
  },
};
