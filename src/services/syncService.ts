import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Santri, SetoranRecord } from '../components/dashboard/types';
import { storageService, emitChange } from './storageService';
import { formatJuz } from '../lib/utils';

// Helper UUID v4 generator jika id santri/setoran lama bertipe string timestamp
export function ensureUUID(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  // Ubah non-UUID id menjadi deterministic UUID v4 format dengan 128-bit hash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < id.length; i++) {
    const ch = id.charCodeAt(i);
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

export interface SantriRow {
  id: string;
  name: string;
  nis: string | null;
  parent_name: string | null;
  parent_phone: string | null;
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

// Mapper: Supabase row -> Santri client model
export function mapRowToSantri(row: SantriRow): Santri {
  return {
    id: row.id,
    name: row.name,
    nis: row.nis || '',
    parentName: row.parent_name || '',
    parentPhone: row.parent_phone || '',
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

// Mapper: Santri client model -> Supabase row
export function mapSantriToRow(s: Santri): SantriRow {
  const juzNum = parseFloat(String(s.juzAchieved).replace(/[^0-9.]/g, '')) || 0;
  return {
    id: ensureUUID(s.id),
    name: s.name,
    nis: s.nis || `NIS-${Date.now()}`,
    parent_name: s.parentName || null,
    parent_phone: s.parentPhone || null,
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

// Mapper: Supabase row -> SetoranRecord client model
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
  const mappedWaStatus: 'not_sent' | 'sent' | 'failed' =
    row.wa_status === 'sent' || row.wa_status === 'failed' ? row.wa_status : 'not_sent';

  return {
    id: row.id,
    santriId: row.santri_id,
    santriName: '', // Dilengkapi saat hydration
    nis: '',
    type: mappedType,
    juz: row.juz,
    surahName: row.surah_name,
    pageStart: row.page_start,
    pageEnd: row.page_end,
    lineStart: row.line_start || 1,
    lineEnd: row.line_end || 15,
    totalLines: row.total_lines,
    grade: mappedGrade,
    musyrif: row.musyrif_name || 'Muhaffizh',
    createdAt: created,
    formattedDate: `${timeFormatted} WIB`,
    notes: row.notes || undefined,
    waStatus: mappedWaStatus,
    waSentAt: row.wa_sent_at || undefined,
  };
}

// Mapper: SetoranRecord client model -> Supabase row
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

export const syncService = {
  isSyncing: false,

  /**
   * Sinkronisasi data cloud Supabase ke local dan sebaliknya
   */
  async syncAll(): Promise<{ success: boolean; santriCount: number; setoranCount: number }> {
    if (!isSupabaseConfigured || this.isSyncing) {
      return { success: false, santriCount: 0, setoranCount: 0 };
    }

    try {
      this.isSyncing = true;

      // Pastikan ada sesi login aktif
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        this.isSyncing = false;
        return { success: false, santriCount: 0, setoranCount: 0 };
      }

      // 1. Ambil data santri dari Supabase
      const { data: cloudSantri, error: santriErr } = await supabase
        .from('santri')
        .select('*')
        .order('created_at', { ascending: false });

      if (santriErr) {
        console.error('Gagal mengambil santri dari cloud:', santriErr);
        this.isSyncing = false;
        return { success: false, santriCount: 0, setoranCount: 0 };
      }

      // 2. Ambil data setoran dari Supabase
      const { data: cloudSetoran, error: setoranErr } = await supabase
        .from('setoran')
        .select('*')
        .order('created_at', { ascending: false });

      if (setoranErr) {
        console.error('Gagal mengambil setoran dari cloud:', setoranErr);
      }

      const localSantri = storageService.getSantriList();
      const localSetoran = storageService.getSetoranRecords();

      // KASUS A: Cloud memiliki data -> Perbarui local cache dan unggah data lokal yang belum ada
      if (cloudSantri && cloudSantri.length > 0) {
        const mappedSantri = cloudSantri.map(mapRowToSantri);
        const mappedSetoran = (cloudSetoran || []).map((row) => {
          const s = mapRowToSetoran(row);
          const foundSantri = mappedSantri.find((item) => item.id === s.santriId);
          if (foundSantri) {
            s.santriName = foundSantri.name;
            s.nis = foundSantri.nis;
          }
          return s;
        });

        // Cek jika ada data lokal yang belum tersimpan di cloud (merge offline/unsynced items)
        const cloudSantriIds = new Set(mappedSantri.map((s) => s.id));
        const unsyncedSantri = localSantri.filter((s) => !cloudSantriIds.has(ensureUUID(s.id)));
        if (unsyncedSantri.length > 0) {
          const unsyncedRows = unsyncedSantri.map(mapSantriToRow);
          await supabase.from('santri').upsert(unsyncedRows, { onConflict: 'id' });
          for (const u of unsyncedSantri) {
            mappedSantri.push({ ...u, id: ensureUUID(u.id) });
          }
        }

        const cloudSetoranIds = new Set(mappedSetoran.map((r) => r.id));
        const unsyncedSetoran = localSetoran.filter((r) => !cloudSetoranIds.has(ensureUUID(r.id)));
        if (unsyncedSetoran.length > 0) {
          const unsyncedSetoranRows = unsyncedSetoran.map(mapSetoranToRow);
          await supabase.from('setoran').upsert(unsyncedSetoranRows, { onConflict: 'id' });
          for (const r of unsyncedSetoran) {
            mappedSetoran.push({
              ...r,
              id: ensureUUID(r.id),
              santriId: ensureUUID(r.santriId),
            });
          }
        }

        // Simpan ke local cache untuk user ini
        storageService.saveSantriList(mappedSantri);
        storageService.saveSetoranList(mappedSetoran);

        emitChange('cloud_synced_to_local');
        this.isSyncing = false;
        return {
          success: true,
          santriCount: mappedSantri.length,
          setoranCount: mappedSetoran.length,
        };
      }

      // KASUS B: Cloud kosong, tapi di browser ini ada data lokal -> Unggah ke cloud (Auto-Migrate)
      if (localSantri.length > 0) {
        // Upload santri
        const santriRows = localSantri.map(mapSantriToRow);
        const { error: uploadSantriErr } = await supabase
          .from('santri')
          .upsert(santriRows, { onConflict: 'id' });

        if (uploadSantriErr) {
          console.error('Gagal auto-upload santri ke cloud:', uploadSantriErr);
        }

        // Upload setoran
        if (localSetoran.length > 0) {
          const setoranRows = localSetoran.map(mapSetoranToRow);
          const { error: uploadSetoranErr } = await supabase
            .from('setoran')
            .upsert(setoranRows, { onConflict: 'id' });

          if (uploadSetoranErr) {
            console.error('Gagal auto-upload setoran ke cloud:', uploadSetoranErr);
          }
        }

        if (!uploadSantriErr) {
          const normalizedSantri = localSantri.map((s) => ({ ...s, id: ensureUUID(s.id) }));
          const normalizedSetoran = localSetoran.map((r) => ({
            ...r,
            id: ensureUUID(r.id),
            santriId: ensureUUID(r.santriId),
          }));
          storageService.saveSantriList(normalizedSantri);
          storageService.saveSetoranList(normalizedSetoran);
        }

        emitChange('local_migrated_to_cloud');
        this.isSyncing = false;
        return {
          success: true,
          santriCount: localSantri.length,
          setoranCount: localSetoran.length,
        };
      }

      this.isSyncing = false;
      return { success: true, santriCount: 0, setoranCount: 0 };
    } catch (err) {
      console.error('Error saat syncAll:', err);
      this.isSyncing = false;
      return { success: false, santriCount: 0, setoranCount: 0 };
    }
  },

  /**
   * Simpan atau update santri ke Supabase di background
   */
  async pushSantri(santri: Santri): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const row = mapSantriToRow(santri);
      await supabase.from('santri').upsert(row, { onConflict: 'id' });
    } catch (err) {
      console.error('Gagal push santri ke Supabase:', err);
    }
  },

  /**
   * Hapus santri dari Supabase di background
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
   * Simpan setoran baru ke Supabase di background
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
   * Hapus setoran dari Supabase di background
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
};
