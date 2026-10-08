import type { Santri, SetoranRecord, WATemplateConfig, HalaqahSettings, HalaqahGroup } from '../components/dashboard/types';
import { 
  DEFAULT_WA_TEMPLATE_CONFIG, 
  DEFAULT_HALAQAH_SETTINGS,
  DEFAULT_HALAQAH_LIST,
  INITIAL_MOCK_SANTRI,
  INITIAL_MOCK_SETORAN,
} from '../components/dashboard/mockData';
import { formatJuz } from '../lib/utils';
import { syncService, ensureUUID } from './syncService';

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

      // Ambil daftar ID santri yang sengaja dihapus oleh musyrif
      let deletedIds = new Set<string>();
      try {
        const delKey = this.getScopedKey('itqan_deleted_santri_ids');
        const rawDel = localStorage.getItem(delKey);
        if (rawDel) {
          const arr: string[] = JSON.parse(rawDel);
          deletedIds = new Set(arr);
        }
      } catch {
        /* ignore */
      }

      // Bersihkan santri mock format lama jika masih tersimpan (s-ab-1, s-um-1, dll)
      const hasLegacyMock = list.some((s) => s.id.startsWith('s-ab-') || s.id.startsWith('s-um-') || s.id.startsWith('s-ut-') || s.id.startsWith('s-al-'));
      if (hasLegacyMock) {
        list = list.filter((s) => !s.id.startsWith('s-ab-') && !s.id.startsWith('s-um-') && !s.id.startsWith('s-ut-') && !s.id.startsWith('s-al-'));
      }

      // Pastikan mock santri selalu ada untuk setiap halaqoh jika belum pernah dihapus secara sengaja
      const existingIds = new Set(list.map((s) => s.id));
      const existingUUIDs = new Set(list.map((s) => ensureUUID(s.id)));
      let addedMock = false;

      for (const mock of INITIAL_MOCK_SANTRI) {
        const uuid = ensureUUID(mock.id);
        if (!deletedIds.has(mock.id) && !deletedIds.has(uuid)) {
          if (!existingIds.has(mock.id) && !existingUUIDs.has(uuid)) {
            list.push({
              ...mock,
              id: uuid,
              halaqahName: mock.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
              juzAchieved: formatJuz(mock.juzAchieved),
            });
            addedMock = true;
          }
        }
      }

      // Normalisasi format juzAchieved dan pastikan halaqahName terisi
      const normalized = list.map((s) => ({
        ...s,
        id: ensureUUID(s.id),
        halaqahName: s.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
        juzAchieved: formatJuz(s.juzAchieved),
      }));

      if (addedMock || !data || data === '[]') {
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
    const formatted: Santri = {
      ...newSantri,
      id: ensureUUID(newSantri.id),
      halaqahName: newSantri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
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
    const formatted: Santri = {
      ...updatedSantri,
      id: targetId,
      halaqahName: updatedSantri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
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
      let data = localStorage.getItem(key);
      if (!data || data === '[]') {
        const fallback = localStorage.getItem(`${BASE_KEYS.SETORAN}_u_default`);
        if (fallback && fallback !== '[]') {
          data = fallback;
          localStorage.setItem(key, fallback);
        }
      }
      if (!data || data === '[]') {
        localStorage.setItem(key, JSON.stringify(INITIAL_MOCK_SETORAN));
        return INITIAL_MOCK_SETORAN;
      }
      const records: SetoranRecord[] = JSON.parse(data);
      if (!records || records.length === 0) {
        localStorage.setItem(key, JSON.stringify(INITIAL_MOCK_SETORAN));
        return INITIAL_MOCK_SETORAN;
      }
      return records.map((r) => ({
        ...r,
        id: ensureUUID(r.id),
        santriId: ensureUUID(r.santriId),
      }));
    } catch {
      return INITIAL_MOCK_SETORAN;
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

    // 2. Update status & metrik santri
    const santriList = this.getSantriList();
    let updatedSantriTarget: Santri | null = null;

    const updatedList = santriList.map((s) => {
      if (s.id !== input.santriId) return s;

      const newLinesToday = (s.linesCompletedToday || 0) + input.totalLines;
      const newTotalMemorized = (s.totalLinesMemorized || 0) + input.totalLines;
      const isTercapai = newLinesToday >= s.dailyTargetLines;
      const calculatedJuz = formatJuz(newTotalMemorized / 300);

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

    // Push ke Supabase di background
    syncService.pushSetoran(record, updatedSantriTarget || undefined);

    emitChange('setoran_added');
    return {
      record,
      updatedSantri: updatedSantriTarget || santriList[0],
    };
  },

  recalculateSantriMetrics(santriId: string): Santri | null {
    const today = getTodayDateKey();
    const allRecords = this.getSetoranRecords();
    const santriRecords = allRecords.filter((r) => r.santriId === santriId);
    
    // Urutkan dari yang terbaru
    santriRecords.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const todayRecords = santriRecords.filter((r) => r.createdAt?.startsWith(today));
    const linesToday = todayRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);
    const totalLinesMemorized = santriRecords.reduce((sum, r) => sum + (r.totalLines || 0), 0);
    const lastSurah = santriRecords.length > 0 ? santriRecords[0].surahName : '-';

    const santriList = this.getSantriList();
    let updatedSantri: Santri | null = null;

    const updatedList = santriList.map((s) => {
      if (s.id !== santriId) return s;

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
      if (!data) {
        localStorage.setItem(BASE_KEYS.ALL_ROOMS, JSON.stringify(DEFAULT_HALAQAH_LIST));
        return DEFAULT_HALAQAH_LIST;
      }
      const list: HalaqahGroup[] = JSON.parse(data);
      let needsSave = false;

      // Pastikan setiap room memiliki kode join unik dan member array
      const normalized = list.map((item, idx) => {
        const defaultMatch = DEFAULT_HALAQAH_LIST.find(
          (d) => d.id === item.id || d.name.toLowerCase() === item.name.toLowerCase()
        );
        let code = item.code || defaultMatch?.code;
        if (!code) {
          code = generateHalaqahCode(`HLQ-${String(idx + 1).padStart(2, '0')}`);
          needsSave = true;
        }
        return {
          ...item,
          code,
          targetDailyLines: item.targetDailyLines || defaultMatch?.targetDailyLines || 15,
          musyrifName: item.musyrifName || defaultMatch?.musyrifName || 'Pembimbing Halaqoh',
          creatorId: item.creatorId || defaultMatch?.creatorId || 'system',
          memberIds: item.memberIds || defaultMatch?.memberIds || ['u_default'],
          createdAt: item.createdAt || defaultMatch?.createdAt || '2026-01-01T00:00:00Z',
        };
      });

      if (needsSave) {
        localStorage.setItem(BASE_KEYS.ALL_ROOMS, JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      return DEFAULT_HALAQAH_LIST;
    }
  },

  saveAllHalaqahRooms(rooms: HalaqahGroup[]): void {
    localStorage.setItem(BASE_KEYS.ALL_ROOMS, JSON.stringify(rooms));
    emitChange('all_halaqah_rooms_updated');
  },

  // Ambil ID halaqoh yang diikuti / dimiliki oleh akun musyrif yang aktif saat ini
  getUserHalaqahIds(): string[] {
    const scope = this.getActiveUserScope();
    const key = this.getScopedKey(BASE_KEYS.USER_ROOMS);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      // Akun guest/demo default memiliki akses ke 4 halaqoh bawaan
      if (scope === 'u_default' || scope === 'guest') {
        const defaultIds = DEFAULT_HALAQAH_LIST.map((h) => h.id);
        localStorage.setItem(key, JSON.stringify(defaultIds));
        return defaultIds;
      }
      // Akun musyrif baru yang belum bergabung ke room apapun
      return [];
    } catch {
      return scope === 'u_default' ? DEFAULT_HALAQAH_LIST.map((h) => h.id) : [];
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
    const scope = this.getActiveUserScope();

    const filtered = allRooms.filter((r) => 
      userIds.has(r.id) || 
      r.creatorId === scope || 
      (r.memberIds && r.memberIds.includes(scope))
    );

    return filtered;
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
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u?.fullName) authorName = u.fullName;
      } catch {
        /* ignore */
      }
    }

    const newCode = group.code ? group.code.trim().toUpperCase() : generateHalaqahCode();
    const newId = `hlq-${Date.now()}`;
    const newRoom: HalaqahGroup = {
      ...group,
      id: newId,
      code: newCode,
      targetDailyLines: group.targetDailyLines || 15,
      musyrifName: group.musyrifName || authorName,
      creatorId: scope,
      memberIds: [scope],
      createdAt: new Date().toISOString(),
    };

    // 1. Simpan ke repositori room global
    const all = this.getAllHalaqahRooms();
    this.saveAllHalaqahRooms([...all, newRoom]);

    // 2. Tambahkan ke daftar room milik user ini
    const userIds = this.getUserHalaqahIds();
    if (!userIds.includes(newId)) {
      this.saveUserHalaqahIds([...userIds, newId]);
    }

    // 3. Setel room baru ini sebagai halaqoh aktif
    this.setActiveHalaqah(newId);

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
    const userIds = this.getUserHalaqahIds();

    // Tambahkan ke ID room user jika belum ada
    if (!userIds.includes(foundRoom.id)) {
      this.saveUserHalaqahIds([...userIds, foundRoom.id]);
    }

    // Tambahkan user scope ke memberIds room
    if (!foundRoom.memberIds?.includes(scope)) {
      foundRoom.memberIds = [...(foundRoom.memberIds || []), scope];
      this.saveAllHalaqahRooms(allRooms);
    }

    // Setel sebagai halaqoh aktif
    this.setActiveHalaqah(foundRoom.id);

    emitChange('halaqah_joined');
    return { success: true, halaqah: foundRoom };
  },

  // Keluar dari Room Halaqoh
  leaveHalaqahRoom(halaqahId: string): { success: boolean; error?: string } {
    const scope = this.getActiveUserScope();
    const userIds = this.getUserHalaqahIds().filter((id) => id !== halaqahId);
    this.saveUserHalaqahIds(userIds);

    const allRooms = this.getAllHalaqahRooms();
    const room = allRooms.find((r) => r.id === halaqahId);
    if (room && room.memberIds) {
      room.memberIds = room.memberIds.filter((m) => m !== scope);
      this.saveAllHalaqahRooms(allRooms);
    }

    // Alihkan active halaqah ke room lain jika room ini sedang aktif
    const userRooms = this.getUserHalaqahList();
    if (userRooms.length > 0) {
      this.setActiveHalaqah(userRooms[0].id);
    } else {
      const settings = this.getHalaqahSettings();
      settings.activeHalaqahId = undefined;
      this.saveHalaqahSettings(settings);
    }

    emitChange('halaqah_left');
    return { success: true };
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
    if (userRooms.length === 0) return null;

    const settings = this.getHalaqahSettings();
    if (settings.activeHalaqahId) {
      const found = userRooms.find((h) => h.id === settings.activeHalaqahId);
      if (found) return found;
    }
    // Cocokkan berdasarkan nama halaqoh jika ada
    if (settings.halaqahName) {
      const foundByName = userRooms.find((h) => h.name.toLowerCase() === settings.halaqahName.toLowerCase());
      if (foundByName) return foundByName;
    }
    return userRooms[0] || null;
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
