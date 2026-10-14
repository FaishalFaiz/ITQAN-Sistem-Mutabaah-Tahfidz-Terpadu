import type { Santri, SantriStatus, SetoranRecord, WATemplateConfig, HalaqahSettings, HalaqahGroup, HalaqahMember } from '../components/dashboard/types';
import { 
  DEFAULT_WA_TEMPLATE_CONFIG, 
  DEFAULT_HALAQAH_SETTINGS,
} from '../components/dashboard/mockData';
import { formatJuz } from '../lib/utils';
import { syncService, ensureUUID, resolveHalaqahName, resolveHalaqahUUID, DEFAULT_HALAQAH_IDS, DEFAULT_HALAQAH_NAMES } from './syncService';

// Base keys
const BASE_KEYS = {
  SANTRI: 'itqan_santri_list',
  SETORAN: 'itqan_setoran_records',
  WA_TEMPLATES: 'itqan_wa_template_config',
  SETTINGS: 'itqan_halaqah_settings',
  HALAQAH_LIST: 'itqan_halaqah_list',
  ALL_ROOMS: 'itqan_all_halaqah_rooms',
  USER_ROOMS: 'itqan_user_room_ids',
};

// Generator kode join halaqoh unik (misal: HLQ-8K2N9P)
export function generateHalaqahCode(prefix = 'HLQ'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}

// Event for cross-component reactive updates
export const EVENT_DATA_CHANGED = 'itqan_store_changed';

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(dateStrOrObj?: string | Date | null, targetDate = new Date()): boolean {
  if (!dateStrOrObj) return false;
  try {
    const d = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return false;
    return getTodayDateKey(d) === getTodayDateKey(targetDate);
  } catch {
    return false;
  }
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
  } catch {
    /* ignore purge error */
  }
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
    } catch {
      /* fallback to default */
    }
    return 'u_default';
  },

  // Dapatkan key yang terisolasi khusus untuk akun musyrif yang sedang aktif
  getScopedKey(baseKey: string): string {
    const scope = this.getActiveUserScope();
    return `${baseKey}_${scope}`;
  },

  // ================= SANTRI =================
  getSantriList(): Santri[] {
    try {
      const key = this.getScopedKey(BASE_KEYS.SANTRI);
      let data = localStorage.getItem(key);
      if (!data || data === '[]') {
        // Fallback: cek jika ada data di scope default di browser ini
        const fallback = localStorage.getItem(`${BASE_KEYS.SANTRI}_u_default`);
        if (fallback && fallback !== '[]') {
          data = fallback;
          localStorage.setItem(key, fallback);
        }
      }

      let list: Santri[] = [];
      if (data && data !== '[]') {
        try {
          list = JSON.parse(data);
        } catch {
          list = [];
        }
      }

      try {
        const delKey = this.getScopedKey('itqan_deleted_santri_ids');
        const rawDel = localStorage.getItem(delKey);
        if (rawDel) {
          const arr: string[] = JSON.parse(rawDel);
          const deletedIds = new Set(arr);
          if (deletedIds.size > 0) {
            list = list.filter((s) => !deletedIds.has(s.id) && !deletedIds.has(ensureUUID(s.id)));
          }
        }
      } catch {
        /* ignore */
      }

      // Bersihkan santri mock format lama dan santri yang terikat pada halaqoh bawaan
      const isDefaultHalaqah = (idOrName?: string | null) => {
        if (!idOrName) return false;
        const clean = idOrName.trim().toLowerCase();
        return DEFAULT_HALAQAH_IDS.has(clean) || DEFAULT_HALAQAH_NAMES.has(clean);
      };

      const hasLegacyMock = list.some(
        (s) =>
          s.id.startsWith('s-ab-') ||
          s.id.startsWith('s-um-') ||
          s.id.startsWith('s-ut-') ||
          s.id.startsWith('s-al-') ||
          s.id.startsWith('b0000000-0000-4000-8000-') ||
          isDefaultHalaqah(s.halaqahId) ||
          isDefaultHalaqah(s.halaqahName)
      );

      if (hasLegacyMock) {
        list = list.filter(
          (s) =>
            !s.id.startsWith('s-ab-') &&
            !s.id.startsWith('s-um-') &&
            !s.id.startsWith('s-ut-') &&
            !s.id.startsWith('s-al-') &&
            !s.id.startsWith('b0000000-0000-4000-8000-') &&
            !isDefaultHalaqah(s.halaqahId) &&
            !isDefaultHalaqah(s.halaqahName)
        );
      }

      // Hitung metrik hari ini secara dinamis berdasarkan catatan setoran hari ini (otomatis 0 jika tanggal baru)
      const allRecords = this.getSetoranRecords();
      const todayRecords = allRecords.filter((r) => isSameDay(r.createdAt));

      const todayLinesMap = new Map<string, number>();
      for (const r of todayRecords) {
        const sid = r.santriId;
        const suuid = ensureUUID(r.santriId);
        const curr = todayLinesMap.get(sid) || todayLinesMap.get(suuid) || 0;
        todayLinesMap.set(sid, curr + (r.totalLines || 0));
        todayLinesMap.set(suuid, curr + (r.totalLines || 0));
      }

      // Normalisasi format juzAchieved dan pastikan halaqahName terisi serta ter-resolve (cegah UUID mentah)
      let hasFix = false;
      const normalized = list.map((s) => {
        const resolvedName = resolveHalaqahName(s.halaqahName || s.halaqahId);
        const resolvedId = s.halaqahId ? ensureUUID(s.halaqahId) : resolveHalaqahUUID(resolvedName);
        const sUUID = ensureUUID(s.id);
        const linesToday = todayLinesMap.get(s.id) ?? todayLinesMap.get(sUUID) ?? 0;
        const target = s.dailyTargetLines || 15;

        let status: SantriStatus = 'belum_setor';
        if (linesToday > 0) {
          status = linesToday >= target ? 'tercapai' : 'tidak_tercapai';
        }

        if (
          s.halaqahName !== resolvedName ||
          s.halaqahId !== resolvedId ||
          s.linesCompletedToday !== linesToday ||
          s.status !== status
        ) {
          hasFix = true;
        }

        return {
          ...s,
          id: sUUID,
          halaqahName: resolvedName,
          halaqahId: resolvedId,
          juzAchieved: formatJuz(s.juzAchieved),
          linesCompletedToday: linesToday,
          status,
        };
      });

      if (hasLegacyMock || hasFix || !data || data === '[]') {
        localStorage.setItem(key, JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      return [];
    }
  },

  getSantriById(id: string): Santri | undefined {
    const list = this.getSantriList();
    return list.find((s) => s.id === id || ensureUUID(s.id) === ensureUUID(id));
  },

  saveSantriList(list: Santri[]): void {
    const key = this.getScopedKey(BASE_KEYS.SANTRI);
    localStorage.setItem(key, JSON.stringify(list));
    emitChange('santri_list_updated');
  },

  addSantri(newSantri: Santri): Santri[] {
    const list = this.getSantriList();
    const resolvedName = resolveHalaqahName(newSantri.halaqahName || newSantri.halaqahId);
    const resolvedId = newSantri.halaqahId ? ensureUUID(newSantri.halaqahId) : resolveHalaqahUUID(resolvedName);
    const formatted: Santri = {
      ...newSantri,
      id: ensureUUID(newSantri.id),
      halaqahName: resolvedName,
      halaqahId: resolvedId,
      juzAchieved: formatJuz(newSantri.juzAchieved),
    };
    const updated = [formatted, ...list];
    this.saveSantriList(updated);
    // Push ke Supabase di background
    syncService.pushSantri(formatted);
    return updated;
  },

  updateSantri(updatedSantri: Santri): Santri[] {
    const list = this.getSantriList();
    const targetId = ensureUUID(updatedSantri.id);
    const resolvedName = resolveHalaqahName(updatedSantri.halaqahName || updatedSantri.halaqahId);
    const resolvedId = updatedSantri.halaqahId ? ensureUUID(updatedSantri.halaqahId) : resolveHalaqahUUID(resolvedName);
    const formatted: Santri = {
      ...updatedSantri,
      id: targetId,
      halaqahName: resolvedName,
      halaqahId: resolvedId,
      juzAchieved: formatJuz(updatedSantri.juzAchieved),
    };
    const updated = list.map((s) => {
      if (s.id === targetId || ensureUUID(s.id) === targetId || s.id === updatedSantri.id) {
        return formatted;
      }
      return s;
    });
    this.saveSantriList(updated);
    // Push ke Supabase di background
    syncService.pushSantri(formatted);
    return updated;
  },

  deleteSantri(id: string): Santri[] {
    const list = this.getSantriList();
    const targetId = ensureUUID(id);
    const updated = list.filter((s) => s.id !== targetId && ensureUUID(s.id) !== targetId && s.id !== id);
    this.saveSantriList(updated);

    // Rekam ID yang dihapus agar mock tidak memulihkannya kembali
    try {
      const delKey = this.getScopedKey('itqan_deleted_santri_ids');
      const rawDel = localStorage.getItem(delKey);
      const arr: string[] = rawDel ? JSON.parse(rawDel) : [];
      if (!arr.includes(targetId)) arr.push(targetId);
      if (!arr.includes(id)) arr.push(id);
      localStorage.setItem(delKey, JSON.stringify(arr));
    } catch {
      /* ignore */
    }

    // Push ke Supabase di background
    syncService.deleteSantri(targetId);
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
      if (!data || data === '[]') {
        return [];
      }
      const records: SetoranRecord[] = JSON.parse(data);
      if (!records || records.length === 0) {
        return [];
      }
      // Singkirkan setoran mock bawaan jika ada
      const filtered = records.filter((r) => !r.id.startsWith('c0000000-0000-4000-8000-'));
      if (filtered.length !== records.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
      }
      return filtered.map((r) => ({
        ...r,
        id: ensureUUID(r.id),
        santriId: ensureUUID(r.santriId),
      }));
    } catch {
      return [];
    }
  },

  saveSetoranList(list: SetoranRecord[]): void {
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    localStorage.setItem(key, JSON.stringify(list));
    emitChange('setoran_list_updated');
  },

  getSetoranBySantriId(santriId: string): SetoranRecord[] {
    const records = this.getSetoranRecords();
    return records.filter((r) => r.santriId === santriId);
  },

  getTodaySetoranForSantri(santriId: string): SetoranRecord[] {
    const records = this.getSetoranRecords();
    const targetId = ensureUUID(santriId);
    return records.filter(
      (r) => (r.santriId === santriId || ensureUUID(r.santriId) === targetId) && isSameDay(r.createdAt)
    );
  },

  getAllTodaySetoran(): SetoranRecord[] {
    const records = this.getSetoranRecords();
    return records.filter((r) => isSameDay(r.createdAt));
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

    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : ensureUUID(`setor-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

    const record: SetoranRecord = {
      ...input,
      id: generatedId,
      santriId: ensureUUID(input.santriId),
      createdAt: now.toISOString(),
      formattedDate: `${timeFormatted} WIB`,
    };

    // 1. Simpan record ke database lokal musyrif aktif
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    const records = this.getSetoranRecords();
    const updatedRecords = [record, ...records];
    localStorage.setItem(key, JSON.stringify(updatedRecords));

    // 2. Hitung metrik santri berdasarkan seluruh riwayat yang terupdate
    const targetSantriId = ensureUUID(input.santriId);
    const santriRecords = updatedRecords.filter(
      (r) => r.santriId === input.santriId || ensureUUID(r.santriId) === targetSantriId
    );

    const todayRecords = santriRecords.filter((r) => isSameDay(r.createdAt));
    const linesToday = todayRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);
    const totalLinesMemorized = santriRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);

    const santriList = this.getSantriList();
    let updatedSantriTarget: Santri | null = null;

    const updatedList = santriList.map((s) => {
      if (s.id !== input.santriId && ensureUUID(s.id) !== targetSantriId) return s;

      const isTercapai = linesToday >= s.dailyTargetLines;
      const calculatedJuz = formatJuz(totalLinesMemorized / 300);

      updatedSantriTarget = {
        ...s,
        linesCompletedToday: linesToday,
        totalLinesMemorized: totalLinesMemorized,
        juzAchieved: calculatedJuz,
        status: isTercapai ? 'tercapai' : 'tidak_tercapai',
        lastSurah: input.surahName,
      };

      return updatedSantriTarget;
    });

    if (updatedSantriTarget) {
      this.saveSantriList(updatedList);
    }

    // Push ke Supabase di background
    syncService.pushSetoran(record, updatedSantriTarget || undefined);

    emitChange('setoran_added');
    return {
      record,
      updatedSantri: updatedSantriTarget || santriList[0],
    };
  },

  recalculateSantriMetrics(santriId: string): Santri | null {
    const allRecords = this.getSetoranRecords();
    const targetId = ensureUUID(santriId);
    const santriRecords = allRecords.filter((r) => r.santriId === santriId || ensureUUID(r.santriId) === targetId);
    
    // Urutkan dari yang terbaru
    santriRecords.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const todayRecords = santriRecords.filter((r) => isSameDay(r.createdAt));
    const linesToday = todayRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);
    const totalLinesMemorized = santriRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);
    const lastSurah = santriRecords.length > 0 ? santriRecords[0].surahName : '-';

    const santriList = this.getSantriList();
    let updatedSantri: Santri | null = null;

    const updatedList = santriList.map((s) => {
      if (s.id !== santriId && ensureUUID(s.id) !== targetId) return s;

      const isTercapai = linesToday >= s.dailyTargetLines;
      const calculatedJuz = formatJuz(totalLinesMemorized / 300);
      
      let status: 'tercapai' | 'tidak_tercapai' | 'belum_setor' = 'belum_setor';
      if (todayRecords.length > 0) {
        status = isTercapai ? 'tercapai' : 'tidak_tercapai';
      }

      updatedSantri = {
        ...s,
        linesCompletedToday: linesToday,
        totalLinesMemorized: totalLinesMemorized,
        juzAchieved: calculatedJuz,
        status,
        lastSurah,
      };
      return updatedSantri;
    });

    if (updatedSantri) {
      this.saveSantriList(updatedList);
    }
    return updatedSantri;
  },

  updateSetoranRecord(updatedRecord: SetoranRecord): Santri | null {
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    const records = this.getSetoranRecords();
    const index = records.findIndex((r) => r.id === updatedRecord.id);
    if (index === -1) return null;

    records[index] = updatedRecord;
    localStorage.setItem(key, JSON.stringify(records));

    const updatedSantri = this.recalculateSantriMetrics(updatedRecord.santriId);
    // Push update ke Supabase di background
    syncService.pushSetoran(updatedRecord, updatedSantri || undefined);
    emitChange('setoran_updated');
    return updatedSantri;
  },

  deleteSetoranRecord(recordId: string, santriId: string): Santri | null {
    const key = this.getScopedKey(BASE_KEYS.SETORAN);
    const records = this.getSetoranRecords();
    const updatedRecords = records.filter((r) => r.id !== recordId);
    localStorage.setItem(key, JSON.stringify(updatedRecords));

    const updatedSantri = this.recalculateSantriMetrics(santriId);
    // Delete dari Supabase di background
    syncService.deleteSetoran(recordId, santriId, updatedSantri);
    emitChange('setoran_deleted');
    return updatedSantri;
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

  // ================= WA TEMPLATE CONFIG =================
  getWATemplateConfig(): WATemplateConfig {
    try {
      const key = this.getScopedKey(BASE_KEYS.WA_TEMPLATES);
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(DEFAULT_WA_TEMPLATE_CONFIG));
        return DEFAULT_WA_TEMPLATE_CONFIG;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WA_TEMPLATE_CONFIG;
    }
  },

  saveWATemplateConfig(config: WATemplateConfig): void {
    const key = this.getScopedKey(BASE_KEYS.WA_TEMPLATES);
    localStorage.setItem(key, JSON.stringify(config));
    emitChange('wa_template_updated');
  },

  // ================= HALAQAH SETTINGS =================
  getHalaqahSettings(): HalaqahSettings {
    try {
      const key = this.getScopedKey(BASE_KEYS.SETTINGS);
      const data = localStorage.getItem(key);
      if (!data) {
        const customSettings = { ...DEFAULT_HALAQAH_SETTINGS };
        const rawUser = localStorage.getItem('itqan_current_musyrif');
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            if (u?.fullName) {
              customSettings.musyrifName = u.fullName;
              customSettings.halaqahName = `Halaqoh ${u.fullName}`;
            }
          } catch {
            /* ignore parse error */
          }
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

  // ================= ROOM HALAQAH SYSTEM & JOIN CODE =================

  // Ambil semua room halaqoh yang terdaftar di sistem (global repository)
  getAllHalaqahRooms(): HalaqahGroup[] {
    try {
      const data = localStorage.getItem(BASE_KEYS.ALL_ROOMS);
      if (!data || data === '[]') {
        return [];
      }
      const list: HalaqahGroup[] = JSON.parse(data);
      let needsSave = false;

      // Bersihkan seluruh halaqoh bawaan jika masih ada di storage
      const isDefault = (r: HalaqahGroup) =>
        DEFAULT_HALAQAH_IDS.has(r.id) || DEFAULT_HALAQAH_NAMES.has((r.name || '').trim().toLowerCase());

      const filteredList = list.filter((r) => !isDefault(r));
      if (filteredList.length !== list.length) {
        needsSave = true;
      }

      // Pastikan setiap room memiliki kode join unik dan member array
      const normalized = filteredList.map((item, idx) => {
        let code = item.code;
        if (!code) {
          code = generateHalaqahCode(`HLQ-${String(idx + 1).padStart(2, '0')}`);
          needsSave = true;
        }

        let members: HalaqahMember[] = item.members || [];
        if (members.length === 0) {
          const mainName = item.musyrifName || 'Pembimbing Halaqoh';
          members = [
            {
              id: item.creatorId || 'u_default',
              name: mainName,
              role: 'utama',
              joinedAt: item.createdAt || new Date().toISOString(),
            },
          ];
          needsSave = true;
        }

        return {
          ...item,
          code,
          targetDailyLines: item.targetDailyLines || 15,
          musyrifName: item.musyrifName || 'Pembimbing Halaqoh',
          creatorId: item.creatorId || 'system',
          memberIds: item.memberIds || ['u_default'],
          members,
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });

      if (needsSave) {
        localStorage.setItem(BASE_KEYS.ALL_ROOMS, JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      return [];
    }
  },

  saveAllHalaqahRooms(rooms: HalaqahGroup[]): void {
    localStorage.setItem(BASE_KEYS.ALL_ROOMS, JSON.stringify(rooms));
    emitChange('all_halaqah_rooms_updated');
  },

  // Ambil ID halaqoh yang diikuti / dimiliki oleh akun musyrif yang aktif saat ini
  getUserHalaqahIds(): string[] {
    const key = this.getScopedKey(BASE_KEYS.USER_ROOMS);
    const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
    let leftIds = new Set<string>();
    try {
      const rawLeft = localStorage.getItem(leftKey);
      if (rawLeft) leftIds = new Set(JSON.parse(rawLeft));
    } catch {
      /* ignore */
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        const clean = parsed.filter(
          (id) => !DEFAULT_HALAQAH_IDS.has(id) && !leftIds.has(id) && !leftIds.has(ensureUUID(id))
        );
        if (clean.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(clean));
        }
        return clean;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveUserHalaqahIds(ids: string[]): void {
    const key = this.getScopedKey(BASE_KEYS.USER_ROOMS);
    localStorage.setItem(key, JSON.stringify(ids));
    emitChange('user_rooms_updated');
  },

  // Daftar room halaqoh yang HANYA bisa diakses oleh akun aktif saat ini
  getUserHalaqahList(): HalaqahGroup[] {
    const allRooms = this.getAllHalaqahRooms();
    const userIds = new Set(this.getUserHalaqahIds());
    const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
    let leftIds = new Set<string>();
    try {
      const rawLeft = localStorage.getItem(leftKey);
      if (rawLeft) leftIds = new Set(JSON.parse(rawLeft));
    } catch {
      /* ignore */
    }

    return allRooms.filter(
      (r) =>
        !leftIds.has(r.id) &&
        !leftIds.has(ensureUUID(r.id)) &&
        (userIds.has(r.id) || userIds.has(ensureUUID(r.id)))
    );
  },

  // Dapatkan daftar muhaffizh yang terdaftar di halaqoh tertentu
  getHalaqahMembers(halaqahId: string): HalaqahMember[] {
    const allRooms = this.getAllHalaqahRooms();
    const room = allRooms.find((r) => r.id === halaqahId);
    if (!room) return [];
    if (room.members && room.members.length > 0) return room.members;
    return [
      {
        id: room.creatorId || 'u_default',
        name: room.musyrifName || 'Pembimbing Utama',
        role: 'utama',
        joinedAt: room.createdAt || '2026-01-01T00:00:00Z',
      },
    ];
  },

  // Kompatibilitas mundur: getHalaqahList mengembalikan room yang dapat diakses user
  getHalaqahList(): HalaqahGroup[] {
    return this.getUserHalaqahList();
  },

  saveHalaqahList(list: HalaqahGroup[]): void {
    // Sinkronkan ke daftar global
    const all = this.getAllHalaqahRooms();
    const updatedAll = all.map((item) => {
      const match = list.find((l) => l.id === item.id);
      return match ? { ...item, ...match } : item;
    });
    this.saveAllHalaqahRooms(updatedAll);
    emitChange('halaqah_list_updated');
  },

  // Buat Room Halaqoh baru (menghasilkan kode join otomatis)
  createHalaqahRoom(group: Omit<HalaqahGroup, 'id' | 'code'> & { code?: string }): HalaqahGroup {
    const scope = this.getActiveUserScope();
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('itqan_current_musyrif') : null;
    let authorName = 'Pembimbing Halaqoh';
    let authorEmail: string | undefined = undefined;
    let rawUserId = scope.replace(/^u_/, '');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u?.id) rawUserId = u.id;
        if (u?.fullName) authorName = u.fullName;
        if (u?.email) authorEmail = u.email;
      } catch {
        /* ignore */
      }
    }

    const newCode = group.code ? group.code.trim().toUpperCase() : generateHalaqahCode();
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ensureUUID(`hlq-${Date.now()}`);
    const mainMusyrif = group.musyrifName || authorName;

    const newRoom: HalaqahGroup = {
      ...group,
      id: newId,
      code: newCode,
      targetDailyLines: group.targetDailyLines || 15,
      musyrifName: mainMusyrif,
      creatorId: rawUserId,
      memberIds: [scope, rawUserId],
      members: [
        {
          id: rawUserId,
          name: mainMusyrif,
          email: authorEmail,
          role: 'utama',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // 1. Simpan ke repositori room global
    const all = this.getAllHalaqahRooms();
    this.saveAllHalaqahRooms([...all, newRoom]);

    // 2. Tambahkan ke daftar room milik user ini & pastikan bersih dari left halaqah
    const targetUUID = ensureUUID(newId);
    try {
      const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
      const rawLeft = localStorage.getItem(leftKey);
      if (rawLeft) {
        const leftArr: string[] = JSON.parse(rawLeft);
        const filtered = leftArr.filter((id) => id !== newId && ensureUUID(id) !== targetUUID);
        localStorage.setItem(leftKey, JSON.stringify(filtered));
      }
    } catch {
      /* ignore */
    }

    const userIds = this.getUserHalaqahIds();
    if (!userIds.includes(newId)) {
      this.saveUserHalaqahIds([...userIds, newId]);
    }

    // 3. Setel room baru ini sebagai halaqoh aktif
    this.setActiveHalaqah(newId);

    // 4. Langsung dorong ke Supabase cloud
    syncService.pushHalaqah(newRoom);

    emitChange('halaqah_created');
    return newRoom;
  },

  // Alias untuk kompatibilitas
  addHalaqah(group: Omit<HalaqahGroup, 'id' | 'code'>): HalaqahGroup {
    return this.createHalaqahRoom(group);
  },

  // Masuk / Bergabung ke Room Halaqoh Lain menggunakan Kode Join
  joinHalaqahByCode(code: string): { success: boolean; halaqah?: HalaqahGroup; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Silakan masukkan kode halaqoh.' };
    }

    const allRooms = this.getAllHalaqahRooms();
    const foundRoom = allRooms.find((r) => r.code?.toUpperCase() === cleanCode);

    if (!foundRoom) {
      return { 
        success: false, 
        error: `Kode halaqoh "${cleanCode}" tidak ditemukan. Pastikan huruf dan angka sesuai.` 
      };
    }

    const scope = this.getActiveUserScope();
    const targetUUID = ensureUUID(foundRoom.id);

    // Bersihkan dari daftar left halaqah jika sebelumnya pernah keluar
    try {
      const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
      const rawLeft = localStorage.getItem(leftKey);
      if (rawLeft) {
        const leftArr: string[] = JSON.parse(rawLeft);
        const filtered = leftArr.filter((id) => id !== foundRoom.id && ensureUUID(id) !== targetUUID);
        localStorage.setItem(leftKey, JSON.stringify(filtered));
      }
    } catch {
      /* ignore */
    }

    const userIds = this.getUserHalaqahIds();

    // Tambahkan ke ID room user jika belum ada
    if (!userIds.includes(foundRoom.id)) {
      this.saveUserHalaqahIds([...userIds, foundRoom.id]);
    }

    // Rekam bahwa room ini dimasuki via kode join
    try {
      const joinedKey = this.getScopedKey('itqan_joined_halaqah_ids');
      const raw = localStorage.getItem(joinedKey);
      const joinedArr: string[] = raw ? JSON.parse(raw) : [];
      if (!joinedArr.includes(foundRoom.id)) {
        joinedArr.push(foundRoom.id);
        localStorage.setItem(joinedKey, JSON.stringify(joinedArr));
      }
    } catch {
      /* ignore */
    }

    // Tambahkan user scope ke memberIds room
    if (!foundRoom.memberIds?.includes(scope)) {
      foundRoom.memberIds = [...(foundRoom.memberIds || []), scope];
    }

    // Tambahkan rincian profil musyrif ke daftar members room
    const currentMembers: HalaqahMember[] = foundRoom.members && foundRoom.members.length > 0
      ? [...foundRoom.members]
      : [
          {
            id: foundRoom.creatorId || 'u_default',
            name: foundRoom.musyrifName || 'Pembimbing Utama',
            role: 'utama',
            joinedAt: foundRoom.createdAt || '2026-01-01T00:00:00Z',
          },
        ];

    if (!currentMembers.some((m) => m.id === scope)) {
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('itqan_current_musyrif') : null;
      let joinerName = 'Muhaffizh';
      let joinerEmail: string | undefined = undefined;
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          if (u?.fullName) joinerName = u.fullName;
          if (u?.email) joinerEmail = u.email;
        } catch {
          /* ignore */
        }
      }
      currentMembers.push({
        id: scope,
        name: joinerName,
        email: joinerEmail,
        role: 'pendamping',
        joinedAt: new Date().toISOString(),
      });
      foundRoom.members = currentMembers;
    }

    this.saveAllHalaqahRooms(allRooms);

    // Setel sebagai halaqoh aktif
    this.setActiveHalaqah(foundRoom.id);

    emitChange('halaqah_joined');
    return { success: true, halaqah: foundRoom };
  },

  // Keluar dari Room Halaqoh (User unassign diri dari halaqoh ini)
  leaveHalaqahRoom(halaqahId: string): { success: boolean; remainingCount: number; error?: string } {
    const scope = this.getActiveUserScope();
    const rawUserId = scope.replace(/^u_/, '');
    const targetUUID = ensureUUID(halaqahId);

    // 1. Rekam bahwa user ini secara eksplisit telah keluar dari halaqoh ini
    try {
      const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
      const raw = localStorage.getItem(leftKey);
      const leftArr: string[] = raw ? JSON.parse(raw) : [];
      if (!leftArr.includes(halaqahId)) leftArr.push(halaqahId);
      if (!leftArr.includes(targetUUID)) leftArr.push(targetUUID);
      localStorage.setItem(leftKey, JSON.stringify(leftArr));
    } catch {
      /* ignore */
    }

    // 2. Hapus dari riwayat kode join
    try {
      const joinedKey = this.getScopedKey('itqan_joined_halaqah_ids');
      const rawJoined = localStorage.getItem(joinedKey);
      if (rawJoined) {
        const joinedArr: string[] = JSON.parse(rawJoined);
        const filtered = joinedArr.filter((id) => id !== halaqahId && ensureUUID(id) !== targetUUID);
        localStorage.setItem(joinedKey, JSON.stringify(filtered));
      }
    } catch {
      /* ignore */
    }

    // 3. Hapus dari userHalaqahIds
    const userIds = this.getUserHalaqahIds().filter((id) => id !== halaqahId && ensureUUID(id) !== targetUUID);
    this.saveUserHalaqahIds(userIds);

    // 4. Update daftar members di allRooms
    const allRooms = this.getAllHalaqahRooms();
    const room = allRooms.find((r) => r.id === halaqahId || ensureUUID(r.id) === targetUUID);
    if (room) {
      if (room.memberIds) {
        room.memberIds = room.memberIds.filter(
          (m) => m !== scope && m !== rawUserId && m !== `u_${rawUserId}`
        );
      }
      if (room.members) {
        room.members = room.members.filter(
          (m) => m.id !== scope && m.id !== rawUserId && m.id !== `u_${rawUserId}`
        );
      }
      this.saveAllHalaqahRooms(allRooms);
    }

    // 5. Beri tahu cloud bahwa user keluar dari halaqoh ini
    syncService.leaveHalaqah(halaqahId);

    // 6. Alihkan active halaqah ke room lain jika room ini sedang aktif
    const userRooms = this.getUserHalaqahList();
    if (userRooms.length > 0) {
      this.setActiveHalaqah(userRooms[0].id);
    } else {
      const settings = this.getHalaqahSettings();
      settings.activeHalaqahId = undefined;
      settings.halaqahName = '';
      this.saveHalaqahSettings(settings);
    }

    emitChange('halaqah_left');
    return { success: true, remainingCount: userRooms.length };
  },

  // Hapus Ruang Halaqoh secara Permanen dari sistem
  deleteHalaqahRoom(halaqahId: string): { success: boolean; remainingCount: number; error?: string } {
    const targetUUID = ensureUUID(halaqahId);
    const allRooms = this.getAllHalaqahRooms();
    const targetRoom = allRooms.find((r) => r.id === halaqahId || ensureUUID(r.id) === targetUUID);
    const updatedRooms = allRooms.filter((r) => r.id !== halaqahId && ensureUUID(r.id) !== targetUUID);
    this.saveAllHalaqahRooms(updatedRooms);

    // Hapus dari left dan joined keys jika ada
    try {
      const leftKey = this.getScopedKey('itqan_left_halaqah_ids');
      const rawLeft = localStorage.getItem(leftKey);
      if (rawLeft) {
        const leftArr: string[] = JSON.parse(rawLeft);
        localStorage.setItem(
          leftKey,
          JSON.stringify(leftArr.filter((id) => id !== halaqahId && ensureUUID(id) !== targetUUID))
        );
      }
      const joinedKey = this.getScopedKey('itqan_joined_halaqah_ids');
      const rawJoined = localStorage.getItem(joinedKey);
      if (rawJoined) {
        const joinedArr: string[] = JSON.parse(rawJoined);
        localStorage.setItem(
          joinedKey,
          JSON.stringify(joinedArr.filter((id) => id !== halaqahId && ensureUUID(id) !== targetUUID))
        );
      }
    } catch {
      /* ignore */
    }

    // Hapus dari ID room user
    const userIds = this.getUserHalaqahIds().filter((id) => id !== halaqahId && ensureUUID(id) !== targetUUID);
    this.saveUserHalaqahIds(userIds);

    // Hapus dari Supabase cloud
    syncService.deleteHalaqah(halaqahId);

    // Bersihkan santri yang terdaftar di halaqoh yang dihapus ini
    if (targetRoom) {
      const santriList = this.getSantriList();
      const remainingSantri = santriList.filter(
        (s) =>
          s.halaqahId !== halaqahId &&
          ensureUUID(s.halaqahId || '') !== targetUUID &&
          s.halaqahName?.toLowerCase() !== targetRoom.name.toLowerCase()
      );
      this.saveSantriList(remainingSantri);
    }

    // Alihkan active halaqah ke room lain jika room ini sedang aktif
    const userRooms = this.getUserHalaqahList();
    if (userRooms.length > 0) {
      this.setActiveHalaqah(userRooms[0].id);
    } else {
      const settings = this.getHalaqahSettings();
      settings.activeHalaqahId = undefined;
      settings.halaqahName = '';
      this.saveHalaqahSettings(settings);
    }

    emitChange('halaqah_deleted');
    return { success: true, remainingCount: userRooms.length };
  },

  updateHalaqah(
    id: string,
    updates: Partial<HalaqahGroup>,
    syncSantriTarget: boolean = false
  ): HalaqahGroup | null {
    const all = this.getAllHalaqahRooms();
    const index = all.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const oldHalaqah = all[index];
    const updatedHalaqah: HalaqahGroup = {
      ...oldHalaqah,
      ...updates,
      id: oldHalaqah.id,
      code: oldHalaqah.code, // Kode room permanen
    };

    all[index] = updatedHalaqah;
    this.saveAllHalaqahRooms(all);

    // Dorong perubahan ke Supabase cloud
    syncService.pushHalaqah(updatedHalaqah);

    // Jika halaqoh yang diedit adalah halaqoh aktif saat ini, perbarui juga HalaqahSettings
    const active = this.getActiveHalaqah();
    if (active && active.id === id) {
      const currentSettings = this.getHalaqahSettings();
      this.saveHalaqahSettings({
        ...currentSettings,
        halaqahName: updatedHalaqah.name,
        musyrifName: updatedHalaqah.musyrifName || currentSettings.musyrifName,
        standardDailyTargetLines:
          updatedHalaqah.targetDailyLines || currentSettings.standardDailyTargetLines,
      });
    }

    // Jika nama berubah atau opsi syncSantriTarget dicentang, update data santri di halaqoh ini
    const nameChanged = oldHalaqah.name !== updatedHalaqah.name;
    if (nameChanged || syncSantriTarget) {
      const santriList = this.getSantriList();
      let hasChanges = false;
      const updatedSantriList = santriList.map((s) => {
        const isInHalaqah =
          s.halaqahId === id ||
          (s.halaqahName && s.halaqahName.toLowerCase() === oldHalaqah.name.toLowerCase());
        if (!isInHalaqah) return s;

        hasChanges = true;
        return {
          ...s,
          halaqahName: updatedHalaqah.name,
          halaqahId: id,
          dailyTargetLines:
            syncSantriTarget && updatedHalaqah.targetDailyLines
              ? updatedHalaqah.targetDailyLines
              : s.dailyTargetLines,
        };
      });

      if (hasChanges) {
        this.saveSantriList(updatedSantriList);
      }
    }

    emitChange('halaqah_updated');
    return updatedHalaqah;
  },

  getActiveHalaqah(): HalaqahGroup | null {
    const userRooms = this.getUserHalaqahList();
    if (userRooms.length === 0) {
      const settings = this.getHalaqahSettings();
      if (settings.activeHalaqahId || settings.halaqahName) {
        settings.activeHalaqahId = undefined;
        settings.halaqahName = '';
        this.saveHalaqahSettings(settings);
      }
      return null;
    }

    const settings = this.getHalaqahSettings();
    if (settings.activeHalaqahId && !DEFAULT_HALAQAH_IDS.has(settings.activeHalaqahId)) {
      const found = userRooms.find(
        (h) => h.id === settings.activeHalaqahId || ensureUUID(h.id) === ensureUUID(settings.activeHalaqahId!)
      );
      if (found) return found;
    }
    // Cocokkan berdasarkan nama halaqoh jika ada
    if (settings.halaqahName && !DEFAULT_HALAQAH_NAMES.has(settings.halaqahName.trim().toLowerCase())) {
      const foundByName = userRooms.find((h) => h.name.toLowerCase() === settings.halaqahName.toLowerCase());
      if (foundByName) {
        settings.activeHalaqahId = foundByName.id;
        this.saveHalaqahSettings(settings);
        return foundByName;
      }
    }
    const defaultRoom = userRooms[0];
    if (defaultRoom) {
      settings.activeHalaqahId = defaultRoom.id;
      settings.halaqahName = defaultRoom.name;
      this.saveHalaqahSettings(settings);
    }
    return defaultRoom || null;
  },

  setActiveHalaqah(halaqahId: string): void {
    const all = this.getAllHalaqahRooms();
    const found = all.find((h) => h.id === halaqahId);
    if (!found) return;

    const current = this.getHalaqahSettings();
    const updated: HalaqahSettings = {
      ...current,
      activeHalaqahId: found.id,
      halaqahName: found.name,
      musyrifName: found.musyrifName || current.musyrifName,
      standardDailyTargetLines: found.targetDailyLines || current.standardDailyTargetLines,
    };
    this.saveHalaqahSettings(updated);
    emitChange('active_halaqah_switched');
  },

  // ================= RESET / BERSIHKAN DATA AKUN INI =================
  resetDatabase(): void {
    const santriKey = this.getScopedKey(BASE_KEYS.SANTRI);
    const setoranKey = this.getScopedKey(BASE_KEYS.SETORAN);

    localStorage.setItem(santriKey, JSON.stringify([]));
    localStorage.setItem(setoranKey, JSON.stringify([]));
    emitChange('database_reset');
  },
};
