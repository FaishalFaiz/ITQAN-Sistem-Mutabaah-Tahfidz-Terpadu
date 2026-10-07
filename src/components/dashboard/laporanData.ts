import type { Santri, SetoranRecord } from './types';
import { ensureUUID } from '../../services/syncService';

export interface SantriReportItem {
  id: string;
  name: string;
  nis: string;
  avatarInitials: string;
  juzAchieved: string;
  totalLinesMemorized: number;
  totalLinesTarget: number;
  dailyTargetLines: number;
  linesCompletedToday: number;
  status: 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  lastSurah: string;
  halaqahName?: string;
  // Metrik Laporan Berdasarkan Setoran Riil
  ziyadahLinesPeriod: number;
  ziyadahPagesPeriod: number;
  murojaahLinesPeriod: number;
  murojaahJuzPeriod: number;
  mumtazPercent: number;
  jayyidPercent: number;
  iadahPercent: number;
  attendancePercent: number;
  totalSessionsAttended: number;
  totalSessionsScheduled: number;
  pacingStatus: 'on_track' | 'behind' | 'accelerated';
  pacingDeficitLines: number; // 0 jika on track / accelerated
  lastExam: {
    juz: number;
    date: string;
    score: number;
    grade: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'I\'adah';
    passed: boolean;
    examiner: string;
  } | null;
  iadahWeakPoints: string[];
  daysSinceLastMurojaah: number;
}

export interface WeakPointSurah {
  surahNumber: number;
  surahName: string;
  juz: number;
  iadahCount: number;
  affectedSantriCount: number;
  severity: 'high' | 'medium' | 'low';
  commonMistakes: string;
}

export interface DayActivity {
  date: string;
  dayName: string;
  dayOfMonth: number;
  ziyadahLines: number;
  murojaahLines: number;
  totalLines: number;
  targetLines: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 1=low, 2=med, 3=high, 4=peak
}

export interface WeeklyTrendItem {
  label: string;
  ziyadah: number;
  murojaah: number;
  target: number;
  mumtazRate: number;
}

export interface JuzDistributionItem {
  range: string;
  count: number;
  label: string;
  color: string;
}

/**
 * Filter setoran berdasarkan rentang periode kalender
 */
export function filterRecordsByPeriod(
  records: SetoranRecord[],
  period: 'bulan_ini' | 'pekan_ini' | 'bulan_lalu' | 'semester'
): SetoranRecord[] {
  if (!records || records.length === 0) return [];
  const now = new Date();

  return records.filter((r) => {
    if (!r.createdAt) return false;
    const recordDate = new Date(r.createdAt);
    if (isNaN(recordDate.getTime())) return false;

    if (period === 'pekan_ini') {
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - distanceToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    }

    if (period === 'bulan_ini') {
      return (
        recordDate.getFullYear() === now.getFullYear() &&
        recordDate.getMonth() === now.getMonth()
      );
    }

    if (period === 'bulan_lalu') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        recordDate.getFullYear() === prevMonth.getFullYear() &&
        recordDate.getMonth() === prevMonth.getMonth()
      );
    }

    if (period === 'semester') {
      // 6 bulan terakhir
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return recordDate >= sixMonthsAgo && recordDate <= now;
    }

    return true;
  });
}

/**
 * Generator Laporan Santri berbasis data santri & riwayat setoran riil
 */
export const generateSantriReports = (
  santriList: Santri[],
  setoranRecords: SetoranRecord[] = []
): SantriReportItem[] => {
  const now = new Date();

  return santriList.map((s) => {
    const santriSetoran = setoranRecords.filter(
      (r) => r.santriId === s.id || ensureUUID(r.santriId) === ensureUUID(s.id)
    );
    const ziyadahRecords = santriSetoran.filter((r) => r.type === 'ziyadah');
    const murojaahRecords = santriSetoran.filter((r) => r.type === 'murojaah');

    const ziyadahLinesPeriod = ziyadahRecords.reduce((sum, r) => sum + (Number(r.totalLines) || 0), 0);
    const ziyadahPagesPeriod = +(ziyadahLinesPeriod / 15).toFixed(1);

    const murojaahLinesPeriod = murojaahRecords.reduce((sum, r) => sum + (Number(r.totalLines) || 0), 0);
    const murojaahJuzPeriod = +(murojaahLinesPeriod / 300).toFixed(1);

    // Kualitas talaqqi
    const totalSetoranCount = santriSetoran.length;
    let mumtazPercent: number;
    let jayyidPercent: number;
    let iadahPercent: number;

    if (totalSetoranCount > 0) {
      const mumtazCount = santriSetoran.filter((r) => r.grade === 'mumtaz').length;
      const jayyidCount = santriSetoran.filter((r) => r.grade === 'jayyid').length;
      const iadahCount = santriSetoran.filter((r) => r.grade === 'iadah').length;

      mumtazPercent = Math.round((mumtazCount / totalSetoranCount) * 100);
      iadahPercent = Math.round((iadahCount / totalSetoranCount) * 100);
      jayyidPercent = Math.max(0, Math.min(100, Math.round((jayyidCount / totalSetoranCount) * 100)));
    } else {
      // Default jika belum ada setoran sama sekali di periode
      mumtazPercent = 100;
      jayyidPercent = 0;
      iadahPercent = 0;
    }

    // Hari sejak murojaah terakhir
    let daysSinceLastMurojaah = 0;
    if (murojaahRecords.length > 0) {
      const sortedMurojaah = [...murojaahRecords].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      const lastMurojaahDate = new Date(sortedMurojaah[0].createdAt);
      if (!isNaN(lastMurojaahDate.getTime())) {
        const diffMs = now.getTime() - lastMurojaahDate.getTime();
        daysSinceLastMurojaah = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
    } else if (totalSetoranCount > 0) {
      // Ada setoran ziyadah tapi belum murojaah
      daysSinceLastMurojaah = 7;
    }

    // Status Pacing berdasarkan status harian & capaian
    const juzNum = parseFloat(s.juzAchieved.replace(/[^0-9.]/g, '')) || 0;
    let pacingStatus: 'on_track' | 'behind' | 'accelerated';
    let pacingDeficitLines: number;

    if (s.status === 'tidak_tercapai') {
      pacingStatus = 'behind';
      pacingDeficitLines = Math.max(15, (s.dailyTargetLines || 20) - (s.linesCompletedToday || 0));
    } else if (s.status === 'tercapai' && (s.linesCompletedToday > (s.dailyTargetLines || 20) || juzNum >= 15)) {
      pacingStatus = 'accelerated';
      pacingDeficitLines = 0;
    } else {
      pacingStatus = 'on_track';
      pacingDeficitLines = 0;
    }

    // Titik rawan i'adah santri ini dari riwayat setoran riil bertipe grade 'iadah'
    const iadahRecords = santriSetoran.filter((r) => r.grade === 'iadah');
    const iadahWeakPoints: string[] = Array.from(
      new Set(
        iadahRecords.map(
          (r) => `${r.surahName || 'Surah'} (Juz ${r.juz || 30})`
        )
      )
    );

    // Kehadiran berdasarkan hari aktif menyetor
    const distinctDates = new Set(
      santriSetoran
        .map((r) => r.createdAt?.slice(0, 10))
        .filter(Boolean)
    );
    const totalSessionsAttended = distinctDates.size;
    const totalSessionsScheduled = Math.max(totalSessionsAttended, 26);
    const attendancePercent =
      totalSessionsScheduled > 0
        ? Math.min(100, Math.round((totalSessionsAttended / totalSessionsScheduled) * 100))
        : 100;

    return {
      id: s.id,
      name: s.name,
      nis: s.nis,
      avatarInitials: s.avatarInitials,
      juzAchieved: s.juzAchieved,
      totalLinesMemorized: s.totalLinesMemorized || Math.round(juzNum * 300),
      totalLinesTarget: s.totalLinesTarget || 9060,
      dailyTargetLines: s.dailyTargetLines,
      linesCompletedToday: s.linesCompletedToday,
      status: s.status,
      lastSurah: s.lastSurah,
      halaqahName: s.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
      ziyadahLinesPeriod,
      ziyadahPagesPeriod,
      murojaahLinesPeriod,
      murojaahJuzPeriod,
      mumtazPercent,
      jayyidPercent,
      iadahPercent,
      attendancePercent,
      totalSessionsAttended,
      totalSessionsScheduled,
      pacingStatus,
      pacingDeficitLines,
      lastExam: null,
      iadahWeakPoints,
      daysSinceLastMurojaah,
    };
  });
};

/**
 * Sebaran Capaian Hafalan berdasarkan data riil santriList
 */
export const getJuzDistribution = (santriList: Santri[]): JuzDistributionItem[] => {
  const buckets: { range: string; min: number; max: number; label: string; color: string }[] = [
    { range: '1 - 5 Juz', min: 0, max: 5, label: 'Tahap Awal', color: '#94A3B8' },
    { range: '6 - 10 Juz', min: 5.01, max: 10, label: 'Pondasi', color: '#38BDF8' },
    { range: '11 - 15 Juz', min: 10.01, max: 15, label: 'Menengah', color: '#0070BA' },
    { range: '16 - 20 Juz', min: 15.01, max: 20, label: 'Lanjutan', color: '#047857' },
    { range: '21 - 30 Juz', min: 20.01, max: 30, label: 'Jelang Khatam', color: '#B45309' },
  ];

  return buckets.map((b) => {
    const count = santriList.filter((s) => {
      const val = parseFloat(s.juzAchieved.replace(/[^0-9.]/g, '')) || 0;
      return val >= b.min && val <= b.max;
    }).length;

    return {
      range: b.range,
      count,
      label: b.label,
      color: b.color,
    };
  });
};

/**
 * Matriks Aktivitas Halaqoh 30 Hari berbasis data setoran riil
 */
export const generateMonthActivity = (setoranRecords: SetoranRecord[] = []): DayActivity[] => {
  const days: DayActivity[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Kelompokkan setoran berdasarkan tanggal (YYYY-MM-DD)
  const lineMap: Record<string, { ziyadah: number; murojaah: number }> = {};
  setoranRecords.forEach((r) => {
    if (!r.createdAt) return;
    const dateKey = r.createdAt.slice(0, 10);
    if (!lineMap[dateKey]) {
      lineMap[dateKey] = { ziyadah: 0, murojaah: 0 };
    }
    const lines = Number(r.totalLines) || 0;
    if (r.type === 'ziyadah') {
      lineMap[dateKey].ziyadah += lines;
    } else {
      lineMap[dateKey].murojaah += lines;
    }
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dayOfWeek = currentDate.getDay();
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const setoranData = lineMap[dateKey] || { ziyadah: 0, murojaah: 0 };
    const totalLines = setoranData.ziyadah + setoranData.murojaah;
    const targetLines = dayOfWeek === 5 ? 100 : 250; // Jumat halaqoh ringan

    let intensity: 0 | 1 | 2 | 3 | 4;
    if (totalLines > 350) intensity = 4;
    else if (totalLines > 200) intensity = 3;
    else if (totalLines > 100) intensity = 2;
    else if (totalLines > 0) intensity = 1;
    else intensity = 0;

    days.push({
      date: dateKey,
      dayName: dayNames[dayOfWeek],
      dayOfMonth: d,
      ziyadahLines: setoranData.ziyadah,
      murojaahLines: setoranData.murojaah,
      totalLines,
      targetLines,
      intensity,
    });
  }

  return days;
};

/**
 * Tren Setoran Mingguan (4 Pekan) berbasis data setoran riil
 */
export const getWeeklyTrendData = (
  setoranRecords: SetoranRecord[] = [],
  santriCount: number = 1
): WeeklyTrendItem[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 4 rentang pekan dalam bulan berjalan
  const weeks = [
    { label: 'Pekan 1 (1–7)', start: 1, end: 7 },
    { label: 'Pekan 2 (8–14)', start: 8, end: 14 },
    { label: 'Pekan 3 (15–21)', start: 15, end: 21 },
    { label: 'Pekan 4 (22–31)', start: 22, end: 31 },
  ];

  const standardTargetPerWeek = Math.max(100, santriCount * 20 * 6); // target baris 6 hari talaqqi

  return weeks.map((w) => {
    let ziyadah = 0;
    let murojaah = 0;
    let mumtazCount = 0;
    let totalRecordsInWeek = 0;

    setoranRecords.forEach((r) => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      if (isNaN(d.getTime())) return;

      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayOfMonth = d.getDate();
        if (dayOfMonth >= w.start && dayOfMonth <= w.end) {
          totalRecordsInWeek++;
          const lines = Number(r.totalLines) || 0;
          if (r.type === 'ziyadah') {
            ziyadah += lines;
          } else {
            murojaah += lines;
          }
          if (r.grade === 'mumtaz') {
            mumtazCount++;
          }
        }
      }
    });

    const mumtazRate = totalRecordsInWeek > 0 ? Math.round((mumtazCount / totalRecordsInWeek) * 100) : 100;

    return {
      label: w.label,
      ziyadah,
      murojaah,
      target: standardTargetPerWeek,
      mumtazRate,
    };
  });
};

/**
 * Titik Rawan Lupa / I'adah diekstrak dari setoran riil yang berstatus 'iadah'
 */
export const getWeakPointsFromRecords = (setoranRecords: SetoranRecord[]): WeakPointSurah[] => {
  const iadahRecords = setoranRecords.filter((r) => r.grade === 'iadah');
  if (iadahRecords.length === 0) return [];

  const map: Record<string, { surahName: string; juz: number; count: number; santriIds: Set<string> }> = {};

  iadahRecords.forEach((r) => {
    const key = `${r.surahName || 'Surah'}_${r.juz || 30}`;
    if (!map[key]) {
      map[key] = {
        surahName: r.surahName || 'Surah',
        juz: r.juz || 30,
        count: 0,
        santriIds: new Set<string>(),
      };
    }
    map[key].count += 1;
    if (r.santriId) {
      map[key].santriIds.add(r.santriId);
    }
  });

  const list = Object.values(map).map((item, idx) => {
    const affected = item.santriIds.size || 1;
    const severity: 'high' | 'medium' | 'low' =
      item.count >= 5 ? 'high' : item.count >= 2 ? 'medium' : 'low';

    return {
      surahNumber: idx + 1,
      surahName: item.surahName,
      juz: item.juz,
      iadahCount: item.count,
      affectedSantriCount: affected,
      severity,
      commonMistakes: `Terdapat ${item.count}x koreksi/i'adah pada talaqqi juz ${item.juz}. Perlu pemantapan tajwid & kelancaran lafadz.`,
    };
  });

  // Urutkan dari frekuensi koreksi terbanyak
  return list.sort((a, b) => b.iadahCount - a.iadahCount);
};
