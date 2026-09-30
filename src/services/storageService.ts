import type { Santri, SetoranRecord, WAGatewayConfig, WALog, HalaqahSettings } from '../components/dashboard/types';
import { 
  INITIAL_SANTRI_LIST, 
  INITIAL_SETORAN_RECORDS, 
  DEFAULT_WA_CONFIG, 
  DEFAULT_HALAQAH_SETTINGS 
} from '../components/dashboard/mockData';

const KEYS = {
  SANTRI: 'itqan_santri_list',
  SETORAN: 'itqan_setoran_records',
  WA_CONFIG: 'itqan_wa_gateway_config',
  WA_LOGS: 'itqan_wa_logs',
  SETTINGS: 'itqan_halaqah_settings',
};

// Event for cross-component reactive updates
export const EVENT_DATA_CHANGED = 'itqan_store_changed';

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emitChange(detail?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_CHANGED, { detail }));
  }
}

export const storageService = {
  // ================= SANTRI =================
  getSantriList(): Santri[] {
    try {
      const data = localStorage.getItem(KEYS.SANTRI);
      if (!data) {
        localStorage.setItem(KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI_LIST));
        return INITIAL_SANTRI_LIST;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SANTRI_LIST;
    }
  },

  getSantriById(id: string): Santri | undefined {
    const list = this.getSantriList();
    return list.find((s) => s.id === id);
  },

  saveSantriList(list: Santri[]): void {
    localStorage.setItem(KEYS.SANTRI, JSON.stringify(list));
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

  // ================= SETORAN =================
  getSetoranRecords(): SetoranRecord[] {
    try {
      const data = localStorage.getItem(KEYS.SETORAN);
      if (!data) {
        localStorage.setItem(KEYS.SETORAN, JSON.stringify(INITIAL_SETORAN_RECORDS));
        return INITIAL_SETORAN_RECORDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SETORAN_RECORDS;
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
      (r) => r.santriId === santriId && (r.createdAt?.startsWith(today) || r.formattedDate?.includes('30 Sep 2026'))
    );
  },

  getAllTodaySetoran(): SetoranRecord[] {
    const today = getTodayDateKey();
    const records = this.getSetoranRecords();
    return records.filter(
      (r) => (r.createdAt?.startsWith(today) || r.formattedDate?.includes('30 Sep 2026'))
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

    // 1. Simpan record
    const records = this.getSetoranRecords();
    const updatedRecords = [record, ...records];
    localStorage.setItem(KEYS.SETORAN, JSON.stringify(updatedRecords));

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
    localStorage.setItem(KEYS.SETORAN, JSON.stringify(updated));
    emitChange('setoran_wa_status_updated');
  },

  // ================= WA GATEWAY CONFIG =================
  getWAGatewayConfig(): WAGatewayConfig {
    try {
      const data = localStorage.getItem(KEYS.WA_CONFIG);
      if (!data) {
        localStorage.setItem(KEYS.WA_CONFIG, JSON.stringify(DEFAULT_WA_CONFIG));
        return DEFAULT_WA_CONFIG;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WA_CONFIG;
    }
  },

  saveWAGatewayConfig(config: WAGatewayConfig): void {
    localStorage.setItem(KEYS.WA_CONFIG, JSON.stringify(config));
    emitChange('wa_config_updated');
  },

  // ================= WA LOGS =================
  getWALogs(): WALog[] {
    try {
      const data = localStorage.getItem(KEYS.WA_LOGS);
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
    const logs = this.getWALogs();
    const updated = [log, ...logs.slice(0, 49)]; // Simpan 50 log terakhir
    localStorage.setItem(KEYS.WA_LOGS, JSON.stringify(updated));
    emitChange('wa_log_added');
    return log;
  },

  clearWALogs(): void {
    localStorage.setItem(KEYS.WA_LOGS, JSON.stringify([]));
    emitChange('wa_logs_cleared');
  },

  // ================= HALAQAH SETTINGS =================
  getHalaqahSettings(): HalaqahSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_HALAQAH_SETTINGS));
        return DEFAULT_HALAQAH_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_HALAQAH_SETTINGS;
    }
  },

  saveHalaqahSettings(settings: HalaqahSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    emitChange('halaqah_settings_updated');
  },

  // ================= RESET SEED =================
  resetDatabase(): void {
    localStorage.setItem(KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI_LIST));
    localStorage.setItem(KEYS.SETORAN, JSON.stringify(INITIAL_SETORAN_RECORDS));
    localStorage.setItem(KEYS.WA_CONFIG, JSON.stringify(DEFAULT_WA_CONFIG));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_HALAQAH_SETTINGS));
    localStorage.setItem(KEYS.WA_LOGS, JSON.stringify([]));
    emitChange('database_reset');
  },
};
