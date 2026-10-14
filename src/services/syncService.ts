import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Santri, SetoranRecord, HalaqahGroup } from '../components/dashboard/types';
import { storageService, emitChange } from './storageService';
import { formatJuz } from '../lib/utils';

// Helper UUID v4 generator jika id bertipe string timestamp
export function ensureUUID(id: string): string {
  if (!id) return '00000000-0000-4000-8000-000000000001';
  const clean = id.trim().replace(/^u_/, '');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clean)) return clean;

  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const combined = (hex1 + hex2 + hex1 + hex2).slice(0, 32);
  return `${combined.slice(0, 8)}-${combined.slice(8, 12)}-4${combined.slice(13, 16)}-a${combined.slice(17, 20)}-${combined.slice(20, 32)}`;
}

// Helper mengambil room yang tersimpan di localStorage secara aman
function getStoredRooms(): HalaqahGroup[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('itqan_all_halaqah_rooms');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return [];
}

// ID & Nama Halaqoh bawaan yang wajib dibersihkan dari sistem
export const DEFAULT_HALAQAH_IDS = new Set([
  'halaqah-abu-bakar',
  'halaqah-umar',
  'halaqah-utsman',
  'halaqah-ali',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
]);

export const DEFAULT_HALAQAH_NAMES = new Set([
  'halaqoh abu bakar ash-shiddiq',
  'halaqoh umar bin khattab',
  'halaqoh utsman bin affan',
  'halaqoh ali bin abi thalib',
]);

export function resolveHalaqahUUID(nameOrId?: string | null, knownRooms?: HalaqahGroup[]): string {
  if (!nameOrId) return ensureUUID('hlq-empty');
  const clean = nameOrId.trim();

  // 1. Cek knownRooms jika dioper
  if (knownRooms && knownRooms.length > 0) {
    const found = knownRooms.find(
      (r) => r.id === clean || r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
    );
    if (found) return ensureUUID(found.id);
  }

  // 2. Cek rooms dari localStorage
  const storedRooms = getStoredRooms().filter(
    (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has(r.name.trim().toLowerCase())
  );
  if (storedRooms.length > 0) {
    const found = storedRooms.find(
      (r) => r.id === clean || r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
    );
    if (found) return ensureUUID(found.id);
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clean)) return clean;
  return ensureUUID(clean);
}

export function resolveHalaqahName(raw?: string | null, knownRooms?: HalaqahGroup[]): string {
  if (!raw) return '';
  const clean = raw.trim();

  // Jangan tampilkan halaqoh bawaan
  if (DEFAULT_HALAQAH_IDS.has(clean.toLowerCase()) || DEFAULT_HALAQAH_NAMES.has(clean.toLowerCase())) {
    try {
      const active = storageService?.getActiveHalaqah?.();
      if (active?.name && !DEFAULT_HALAQAH_NAMES.has(active.name.toLowerCase())) {
        return active.name;
      }
    } catch {
      /* ignore */
    }
    return '';
  }

  // 1. Cek knownRooms jika dioper
  if (knownRooms && knownRooms.length > 0) {
    const found = knownRooms.find(
      (r) => r.id === clean || r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
    );
    if (found) return found.name;
  }

  // 2. Cek rooms dari localStorage (tanpa room bawaan)
  const storedRooms = getStoredRooms().filter(
    (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has(r.name.trim().toLowerCase())
  );
  if (storedRooms.length > 0) {
    const found = storedRooms.find(
      (r) => r.id === clean || r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
    );
    if (found) return found.name;
  }

  // 3. Cek storageService jika tersedia
  try {
    if (storageService && typeof storageService.getAllHalaqahRooms === 'function') {
      const rooms = storageService.getAllHalaqahRooms().filter(
        (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has(r.name.trim().toLowerCase())
      );
      const found = rooms.find(
        (r) => r.id === clean || r.id.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
      );
      if (found) return found.name;
    }
  } catch {
    /* ignore */
  }

  // 4. Jika string berupa UUID dan tidak cocok di daftar room manapun, cegah cetak UUID mentah ke UI
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clean)) {
    try {
      const active = storageService?.getActiveHalaqah?.();
      if (active?.name && !DEFAULT_HALAQAH_NAMES.has(active.name.toLowerCase())) return active.name;
    } catch {
      /* ignore */
    }
    return '';
  }

  return clean;
}

export function resolveHalaqahId(nameOrId?: string | null, knownRooms?: HalaqahGroup[]): string {
  return resolveHalaqahUUID(nameOrId, knownRooms);
}

// ================= DTO INTERFACES =================

export interface HalaqahRow {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  room?: string | null;
  target_daily_lines?: number | null;
  musyrif_id?: string | null;
  musyrif_name: string;
  musyrif_phone?: string | null;
  standard_daily_target_lines?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SantriRow {
  id: string;
  name: string;
  nis: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  halaqah_id?: string | null;
  halaqah_name?: string | null;
  halaqah?: { id: string; name: string } | null;
  juz_achieved: number | null;
  lines_completed_today: number | null;
  daily_target_lines: number | null;
  total_lines_memorized: number | null;
  total_lines_target: number | null;
  status: 'tercapai' | 'tidak_tercapai' | 'belum_setor' | null;
  last_surah: string | null;
  avatar_initials: string | null;
  last_daily_report_sent_date?: string | null;
  last_daily_report_sent_time?: string | null;
  is_active?: boolean;
}

export interface SetoranRow {
  id: string;
  santri_id: string;
  type: string;
  juz: number;
  surah_name: string;
  page_start: number;
  page_end: number;
  line_start?: number | null;
  line_end?: number | null;
  total_lines: number;
  grade: string;
  musyrif_name: string | null;
  notes?: string | null;
  wa_status?: 'not_sent' | 'sent' | 'failed' | null;
  wa_sent_at?: string | null;
  created_at?: string | null;
}

// ================= MAPPERS =================

export function mapRowToHalaqah(row: HalaqahRow): HalaqahGroup {
  const creator = row.musyrif_id || 'system';
  return {
    id: row.id,
    code: row.code || `HLQ-${row.id.slice(0, 6).toUpperCase()}`,
    name: row.name,
    description: row.description || '',
    room: row.room || 'Ruangan Belum Diatur',
    targetDailyLines: row.target_daily_lines || row.standard_daily_target_lines || 15,
    musyrifName: row.musyrif_name,
    creatorId: creator,
    memberIds: row.musyrif_id ? [row.musyrif_id, `u_${row.musyrif_id}`] : ['system'],
    members: row.musyrif_id ? [
      {
        id: row.musyrif_id,
        name: row.musyrif_name,
        role: 'utama',
        joinedAt: row.created_at || new Date().toISOString(),
      }
    ] : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapHalaqahToRow(g: HalaqahGroup, musyrifId?: string): HalaqahRow {
  const resolvedMusyrifId = musyrifId || 
    (g.creatorId && g.creatorId !== 'system' && g.creatorId !== 'guest' && g.creatorId !== 'u_default'
      ? ensureUUID(g.creatorId)
      : null);

  return {
    id: ensureUUID(g.id),
    code: g.code || null,
    name: g.name,
    description: g.description || null,
    room: g.room || null,
    target_daily_lines: g.targetDailyLines || 15,
    standard_daily_target_lines: g.targetDailyLines || 15,
    musyrif_id: resolvedMusyrifId,
    musyrif_name: g.musyrifName || 'Muhaffizh Halaqoh',
  };
}

export function mapRowToSantri(row: SantriRow, rooms?: HalaqahGroup[]): Santri {
  const halaqahObj = row.halaqah || (row.halaqah_id && rooms ? rooms.find((r) => r.id === row.halaqah_id) : undefined);
  const rawHalaqah = halaqahObj?.name || row.halaqah_name || row.halaqah_id;
  const halaqahName = resolveHalaqahName(rawHalaqah, rooms);
  const halaqahId = row.halaqah_id || halaqahObj?.id || resolveHalaqahUUID(halaqahName, rooms);
  return {
    id: row.id,
    name: row.name,
    nis: row.nis || '',
    parentName: row.parent_name || '',
    parentPhone: row.parent_phone || '',
    halaqahName,
    halaqahId,
    juzAchieved: formatJuz(row.juz_achieved || 0),
    linesCompletedToday: row.lines_completed_today || 0,
    dailyTargetLines: row.daily_target_lines || 15,
    totalLinesMemorized: row.total_lines_memorized || 0,
    totalLinesTarget: row.total_lines_target || 9060,
    status: row.status || 'belum_setor',
    lastSurah: row.last_surah || '-',
    avatarInitials: row.avatar_initials || (row.name ? row.name.slice(0, 2).toUpperCase() : 'ST'),
    lastDailyReportSentDate: row.last_daily_report_sent_date || undefined,
    lastDailyReportSentTime: row.last_daily_report_sent_time || undefined,
  };
}

export function mapSantriToRow(s: Santri): SantriRow {
  const juzNum = parseFloat(String(s.juzAchieved).replace(/[^0-9.]/g, '')) || 0;
  const halaqahName = s.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq';
  const halaqahUUID = resolveHalaqahUUID(s.halaqahId || halaqahName);
  return {
    id: ensureUUID(s.id),
    name: s.name,
    nis: s.nis || `NIS-${Date.now()}`,
    parent_name: s.parentName || null,
    parent_phone: s.parentPhone || null,
    halaqah_id: halaqahUUID,
    juz_achieved: juzNum,
    lines_completed_today: s.linesCompletedToday || 0,
    daily_target_lines: s.dailyTargetLines || 15,
    total_lines_memorized: s.totalLinesMemorized || 0,
    total_lines_target: s.totalLinesTarget || 9060,
    status: s.status || 'belum_setor',
    last_surah: s.lastSurah || '-',
    avatar_initials: s.avatarInitials || (s.name ? s.name.slice(0, 2).toUpperCase() : 'ST'),
    last_daily_report_sent_date: s.lastDailyReportSentDate || null,
    last_daily_report_sent_time: s.lastDailyReportSentTime || null,
    is_active: true,
  };
}

export function mapRowToSetoran(row: SetoranRow): SetoranRecord {
  const created = row.created_at || new Date().toISOString();
  const dateObj = new Date(created);
  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);

  const mappedType: 'ziyadah' | 'murojaah' =
    row.type === 'ziyadah' ? 'ziyadah' : 'murojaah';
  const mappedGrade: 'mumtaz' | 'jayyid' | 'iadah' =
    row.grade === 'A' || row.grade === 'mumtaz'
      ? 'mumtaz'
      : row.grade === 'C' || row.grade === 'iadah'
      ? 'iadah'
      : 'jayyid';

  return {
    id: row.id,
    santriId: row.santri_id,
    santriName: '',
    nis: '',
    type: mappedType,
    juz: row.juz,
    surahName: row.surah_name,
    pageStart: row.page_start,
    pageEnd: row.page_end,
    lineStart: row.line_start ?? 1,
    lineEnd: row.line_end ?? row.total_lines,
    totalLines: row.total_lines,
    grade: mappedGrade,
    musyrif: row.musyrif_name || 'Muhaffizh Halaqoh',
    formattedDate: timeFormatted,
    notes: row.notes || undefined,
    waStatus: row.wa_status || 'not_sent',
    waSentAt: row.wa_sent_at || undefined,
    createdAt: created,
  };
}

export function mapSetoranToRow(r: SetoranRecord): SetoranRow {
  return {
    id: ensureUUID(r.id),
    santri_id: ensureUUID(r.santriId),
    type: r.type,
    juz: r.juz,
    surah_name: r.surahName,
    page_start: r.pageStart,
    page_end: r.pageEnd,
    line_start: r.lineStart,
    line_end: r.lineEnd,
    total_lines: r.totalLines,
    grade: r.grade,
    musyrif_name: r.musyrif,
    notes: r.notes || null,
    wa_status: r.waStatus || 'not_sent',
    wa_sent_at: r.waSentAt || null,
    created_at: r.createdAt || new Date().toISOString(),
  };
}

// ================= SYNC SERVICE =================

export const syncService = {
  isSyncing: false,

  /**
   * Push / update halaqah ke Supabase
   */
  async pushHalaqah(group: HalaqahGroup): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase tidak dikonfigurasi' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const row = mapHalaqahToRow(group, user?.id);
      let { error } = await supabase.from('halaqah').upsert(row, { onConflict: 'id' });
      // Fallback jika kolom baru belum dimigrasi di database Supabase user
      if (error && error.message.includes('column')) {
        const fallbackRow = {
          id: row.id,
          name: row.name,
          musyrif_name: row.musyrif_name,
          musyrif_id: row.musyrif_id,
          standard_daily_target_lines: row.standard_daily_target_lines,
        };
        const res = await supabase.from('halaqah').upsert(fallbackRow, { onConflict: 'id' });
        error = res.error;
      }
      if (error) {
        console.error('Gagal push halaqah ke Supabase:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error push halaqah';
      console.error(msg);
      return { success: false, error: msg };
    }
  },

  /**
   * Hapus seluruh data halaqoh bawaan dari Supabase jika pernah terdorong
   */
  async purgeDefaultHalaqahFromCloud(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const defaultUUIDs = [
        'a0000000-0000-4000-8000-000000000001',
        'a0000000-0000-4000-8000-000000000002',
        'a0000000-0000-4000-8000-000000000003',
        'a0000000-0000-4000-8000-000000000004',
      ];
      const defaultNames = [
        'Halaqoh Abu Bakar Ash-Shiddiq',
        'Halaqoh Umar bin Khattab',
        'Halaqoh Utsman bin Affan',
        'Halaqoh Ali bin Abi Thalib',
      ];
      await supabase.from('santri').delete().in('halaqah_id', defaultUUIDs);
      await supabase.from('halaqah').delete().in('id', defaultUUIDs);
      await supabase.from('halaqah').delete().in('name', defaultNames);
    } catch (err) {
      console.error('Gagal purge halaqah bawaan dari cloud:', err);
    }
  },

  /**
   * Hapus halaqah dari Supabase
   */
  async deleteHalaqah(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const uuid = ensureUUID(id);
      await supabase.from('halaqah').delete().eq('id', uuid);
    } catch (err) {
      console.error('Gagal delete halaqah di Supabase:', err);
    }
  },

  /**
   * Simpan atau update santri ke Supabase
   */
  async pushSantri(santri: Santri): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase tidak dikonfigurasi' };
    try {
      const row = mapSantriToRow(santri);
      const { error } = await supabase.from('santri').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error('Gagal push santri ke Supabase:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error push santri';
      console.error(msg);
      return { success: false, error: msg };
    }
  },

  /**
   * Hapus santri dari Supabase
   */
  async deleteSantri(santriId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const uuid = ensureUUID(santriId);
      await supabase.from('santri').delete().eq('id', uuid);
    } catch (err) {
      console.error('Gagal delete santri di Supabase:', err);
    }
  },

  /**
   * Simpan setoran baru ke Supabase
   */
  async pushSetoran(record: SetoranRecord, updatedSantri?: Santri): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const row = mapSetoranToRow(record);
      await supabase.from('setoran').upsert(row, { onConflict: 'id' });
      if (updatedSantri) {
        await this.pushSantri(updatedSantri);
      }
    } catch (err) {
      console.error('Gagal push setoran ke Supabase:', err);
    }
  },

  /**
   * Hapus setoran dari Supabase
   */
  async deleteSetoran(recordId: string, _santriId?: string, updatedSantri?: Santri | null): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const uuid = ensureUUID(recordId);
      await supabase.from('setoran').delete().eq('id', uuid);
      if (updatedSantri) {
        await this.pushSantri(updatedSantri);
      }
    } catch (err) {
      console.error('Gagal delete setoran di Supabase:', err);
    }
  },

  /**
   * Sinkronisasi data cloud Supabase ke local dan sebaliknya
   */
  async syncAll(): Promise<{ success: boolean; halaqahCount: number; santriCount: number; setoranCount: number }> {
    if (!isSupabaseConfigured || this.isSyncing) {
      return { success: false, halaqahCount: 0, santriCount: 0, setoranCount: 0 };
    }

    try {
      this.isSyncing = true;

      // 1. Pastikan session auth aktif
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        this.isSyncing = false;
        return { success: false, halaqahCount: 0, santriCount: 0, setoranCount: 0 };
      }

      // 2. SINKRONKAN HALAQAH TERLEBIH DAHULU (Pondasi Foreign Key)
      await this.purgeDefaultHalaqahFromCloud();

      let { data: rawCloudHalaqah } = await supabase
        .from('halaqah')
        .select('*')
        .order('created_at', { ascending: true });

      let cloudHalaqah = (rawCloudHalaqah || []).filter(
        (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has((r.name || '').trim().toLowerCase())
      );

      const localRooms = storageService.getAllHalaqahRooms().filter(
        (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has((r.name || '').trim().toLowerCase())
      );

      // Pastikan room lokal yang belum ada di Supabase diunggah
      const cloudRoomIds = new Set(cloudHalaqah.map((r) => r.id));
      for (const room of localRooms) {
        if (!cloudRoomIds.has(room.id) && !cloudRoomIds.has(ensureUUID(room.id))) {
          await this.pushHalaqah(room);
        }
      }

      // Re-fetch jika ada yang baru diunggah
      if (localRooms.some((r) => !cloudRoomIds.has(r.id) && !cloudRoomIds.has(ensureUUID(r.id)))) {
        const refetch = await supabase.from('halaqah').select('*').order('created_at', { ascending: true });
        cloudHalaqah = (refetch.data || []).filter(
          (r) => !DEFAULT_HALAQAH_IDS.has(r.id) && !DEFAULT_HALAQAH_NAMES.has((r.name || '').trim().toLowerCase())
        );
      }

      let mappedRooms = cloudHalaqah.map(mapRowToHalaqah);
      for (const lr of localRooms) {
        if (!mappedRooms.some((m) => m.id === lr.id || ensureUUID(m.id) === ensureUUID(lr.id))) {
          mappedRooms.push(lr);
        }
      }

      // Simpan semua halaqah ke repositori global (agar kode join berfungsi antar musyrif)
      storageService.saveAllHalaqahRooms(mappedRooms);

      // Saring halaqah yang HANYA milik / diikuti akun musyrif ini:
      // 1. Dibuat oleh musyrif ini (creatorId/musyrif_id sesuai id akun)
      // 2. Terdaftar sebagai member
      // 3. Masuk melalui kode join yang tersimpan
      const currentUserId = session.user.id;
      const currentScope = storageService.getActiveUserScope();
      const joinedCodesKey = storageService.getScopedKey('itqan_joined_halaqah_ids');
      let explicitlyJoinedIds: Set<string> = new Set();
      try {
        const rawJoined = localStorage.getItem(joinedCodesKey);
        if (rawJoined) explicitlyJoinedIds = new Set(JSON.parse(rawJoined));
      } catch {
        /* ignore */
      }

      const userHalaqahs = mappedRooms.filter((r) => {
        const rawCreator = (r.creatorId || '').replace(/^u_/, '');
        const isOwner = rawCreator === currentUserId || 
                        r.creatorId === currentUserId || 
                        r.creatorId === currentScope || 
                        r.creatorId === `u_${currentUserId}`;
        const isMember = (r.memberIds && (
          r.memberIds.includes(currentUserId) || 
          r.memberIds.includes(currentScope) || 
          r.memberIds.includes(`u_${currentUserId}`) ||
          r.memberIds.some((m) => m.replace(/^u_/, '') === currentUserId)
        )) || (r.members && r.members.some((m) => 
          m.id === currentUserId || 
          m.id === currentScope || 
          m.id?.replace(/^u_/, '') === currentUserId
        ));
        const isJoined = explicitlyJoinedIds.has(r.id) || explicitlyJoinedIds.has(ensureUUID(r.id));

        return isOwner || isMember || isJoined;
      });

      const userHalaqahIds = userHalaqahs.map((r) => r.id);
      storageService.saveUserHalaqahIds(userHalaqahIds);

      // Pastikan active halaqah terpilih dengan benar dari daftar halaqah milik user
      const currentActive = storageService.getActiveHalaqah();
      if (!currentActive && userHalaqahs.length > 0) {
        storageService.setActiveHalaqah(userHalaqahs[0].id);
      }

      // 3. SINKRONKAN SANTRI
      let cloudSantri: SantriRow[] | null = null;
      const resWithJoin = await supabase
        .from('santri')
        .select('*, halaqah:halaqah_id(id, name)')
        .order('created_at', { ascending: false });

      if (resWithJoin.error) {
        const plainRes = await supabase
          .from('santri')
          .select('*')
          .order('created_at', { ascending: false });
        cloudSantri = plainRes.data as SantriRow[] | null;
      } else {
        cloudSantri = resWithJoin.data as unknown as SantriRow[] | null;
      }

      const localSantri = storageService.getSantriList();

      // Unggah santri lokal yang belum tercatat di Supabase
      const cloudSantriIds = new Set((cloudSantri || []).map((s) => s.id));
      for (const ls of localSantri) {
        if (!cloudSantriIds.has(ls.id) && !cloudSantriIds.has(ensureUUID(ls.id))) {
          await this.pushSantri(ls);
        }
      }

      // Re-fetch jika ada santri yang diunggah
      if (localSantri.some((ls) => !cloudSantriIds.has(ls.id) && !cloudSantriIds.has(ensureUUID(ls.id)))) {
        const refetch = await supabase
          .from('santri')
          .select('*, halaqah:halaqah_id(id, name)')
          .order('created_at', { ascending: false });
        if (!refetch.error && refetch.data) {
          cloudSantri = refetch.data as unknown as SantriRow[];
        }
      }

      if (cloudSantri && cloudSantri.length > 0) {
        const mappedSantri = cloudSantri.map((r) => mapRowToSantri(r, mappedRooms));
        // Pertahankan santri lokal yang belum sinkron
        for (const ls of localSantri) {
          if (!mappedSantri.some((m) => m.id === ls.id || ensureUUID(m.id) === ensureUUID(ls.id))) {
            mappedSantri.push(ls);
          }
        }
        storageService.saveSantriList(mappedSantri);
      }

      // 4. SINKRONKAN SETORAN
      const { data: cloudSetoran } = await supabase
        .from('setoran')
        .select('*')
        .order('created_at', { ascending: false });

      const localSetoran = storageService.getSetoranRecords();
      const cloudSetoranIds = new Set((cloudSetoran || []).map((r) => r.id));

      for (const lRec of localSetoran) {
        if (!cloudSetoranIds.has(lRec.id) && !cloudSetoranIds.has(ensureUUID(lRec.id))) {
          await this.pushSetoran(lRec);
        }
      }

      if (cloudSetoran && cloudSetoran.length > 0) {
        const mappedSetoran = cloudSetoran.map(mapRowToSetoran);
        for (const lRec of localSetoran) {
          if (!mappedSetoran.some((m) => m.id === lRec.id || ensureUUID(m.id) === ensureUUID(lRec.id))) {
            mappedSetoran.push(lRec);
          }
        }
        storageService.saveSetoranList(mappedSetoran);
      }

      emitChange('cloud_synced_to_local');
      this.isSyncing = false;
      return {
        success: true,
        halaqahCount: userHalaqahs.length,
        santriCount: cloudSantri?.length || localSantri.length,
        setoranCount: cloudSetoran?.length || localSetoran.length,
      };
    } catch (err) {
      console.error('Error saat syncAll:', err);
      this.isSyncing = false;
      return { success: false, halaqahCount: 0, santriCount: 0, setoranCount: 0 };
    }
  },
};
