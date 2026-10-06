import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Printer,
  Search,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  ChevronDown,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { Santri, SetoranRecord } from './types';
import { storageService, EVENT_DATA_CHANGED } from '../../services/storageService';
import { waGatewayService } from '../../services/waGatewayService';
import {
  generateSantriReports,
  getJuzDistribution,
  getWeeklyTrendData,
  getWeakPointsFromRecords,
  filterRecordsByPeriod,
  MOCK_WEAK_POINTS,
  type SantriReportItem,
} from './laporanData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RaporPrintModal } from './RaporPrintModal';
import { TrendChart } from './TrendChart';
import { toast } from '@/components/ui/sonner';

interface LaporanPageProps {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const LaporanPage: React.FC<LaporanPageProps> = ({
  santriList,
  onSetor,
  onDetail,
}) => {
  // Tab states: ringkasan | santri | retensi
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'santri' | 'retensi'>('ringkasan');

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<'bulan_ini' | 'pekan_ini' | 'bulan_lalu' | 'semester'>('bulan_ini');
  const [selectedHalaqoh, setSelectedHalaqoh] = useState<string>('abu_bakar');

  // Search & Filter in Santri Table
  const [searchQuery, setSearchQuery] = useState('');
  const [pacingFilter, setPacingFilter] = useState<'all' | 'on_track' | 'behind' | 'accelerated'>('all');
  const [sortBy, setSortBy] = useState<'capaian' | 'ziyadah' | 'kelancaran' | 'nama'>('capaian');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Real Setoran records state from storageService
  const [allSetoranRecords, setAllSetoranRecords] = useState<SetoranRecord[]>(() =>
    storageService.getSetoranRecords()
  );

  // Reactive listener on storage changes
  useEffect(() => {
    const handleStoreChange = () => {
      setAllSetoranRecords(storageService.getSetoranRecords());
    };
    window.addEventListener(EVENT_DATA_CHANGED, handleStoreChange);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleStoreChange);
  }, []);

  // Filter setoran by selected period
  const periodFilteredRecords = useMemo(() => {
    return filterRecordsByPeriod(allSetoranRecords, selectedPeriod);
  }, [allSetoranRecords, selectedPeriod]);

  // Modals
  const [selectedRaporSantri, setSelectedRaporSantri] = useState<SantriReportItem | null>(null);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('081234567801');

  // Dynamic Weekly Trend data from real records
  const weeklyTrendData = useMemo(
    () => getWeeklyTrendData(allSetoranRecords, Math.max(1, santriList.length)),
    [allSetoranRecords, santriList.length]
  );

  // Dynamic Sebaran Capaian Hafalan from real santriList
  const juzDistributionData = useMemo(
    () => getJuzDistribution(santriList),
    [santriList]
  );

  // Titik rawan i'adah riil
  const realWeakPoints = useMemo(() => {
    const fromRecords = getWeakPointsFromRecords(allSetoranRecords);
    return fromRecords.length > 0 ? fromRecords : MOCK_WEAK_POINTS;
  }, [allSetoranRecords]);

  // Generate enriched santri reports using real santriList and real filtered setoran
  const santriReports = useMemo(
    () => generateSantriReports(santriList, periodFilteredRecords),
    [santriList, periodFilteredRecords]
  );

  // Aggregate stats calculations from real data
  const totalSantri = santriReports.length;
  const totalZiyadahLines = santriReports.reduce((acc, s) => acc + s.ziyadahLinesPeriod, 0);
  const totalZiyadahPages = +(totalZiyadahLines / 15).toFixed(1);
  const totalMurojaahLines = santriReports.reduce((acc, s) => acc + s.murojaahLinesPeriod, 0);
  const totalMurojaahJuz = +(totalMurojaahLines / 300).toFixed(1);

  const avgMumtaz = Math.round(
    santriReports.reduce((acc, s) => acc + s.mumtazPercent, 0) / (totalSantri || 1)
  );
  const avgJayyid = Math.round(
    santriReports.reduce((acc, s) => acc + s.jayyidPercent, 0) / (totalSantri || 1)
  );
  const avgIadah = Math.round(
    santriReports.reduce((acc, s) => acc + s.iadahPercent, 0) / (totalSantri || 1)
  );

  const onTrackCount = santriReports.filter((s) => s.pacingStatus !== 'behind').length;
  const onTrackPercentage = Math.round((onTrackCount / (totalSantri || 1)) * 100);

  const avgAttendance = (
    santriReports.reduce((acc, s) => acc + s.attendancePercent, 0) / (totalSantri || 1)
  ).toFixed(1);

  // Filtered & sorted table data
  const filteredSantri = useMemo(() => {
    return santriReports
      .filter((s) => {
        const matchesHalaqoh =
          selectedHalaqoh === 'all'
            ? true
            : selectedHalaqoh === 'abu_bakar'
            ? !s.halaqahName || s.halaqahName.toLowerCase().includes('abu bakar')
            : s.halaqahName?.toLowerCase().includes(selectedHalaqoh.replace('_', ' '));

        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.includes(searchQuery) ||
          s.lastSurah.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPacing =
          pacingFilter === 'all'
            ? true
            : pacingFilter === 'on_track'
            ? s.pacingStatus === 'on_track' || s.pacingStatus === 'accelerated'
            : s.pacingStatus === pacingFilter;

        return matchesHalaqoh && matchesSearch && matchesPacing;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'capaian') {
          const juzA = parseFloat(a.juzAchieved.replace(/[^0-9.]/g, '')) || 0;
          const juzB = parseFloat(b.juzAchieved.replace(/[^0-9.]/g, '')) || 0;
          comparison = juzA - juzB;
        } else if (sortBy === 'ziyadah') {
          comparison = a.ziyadahLinesPeriod - b.ziyadahLinesPeriod;
        } else if (sortBy === 'kelancaran') {
          comparison = a.mumtazPercent - b.mumtazPercent;
        } else if (sortBy === 'nama') {
          comparison = a.name.localeCompare(b.name);
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [santriReports, selectedHalaqoh, searchQuery, pacingFilter, sortBy, sortOrder]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Santri',
      'NIS',
      'Total Capaian',
      'Total Baris',
      'Ziyadah Periode (Baris)',
      'Ziyadah (Halaman)',
      'Murojaah Periode (Baris)',
      'Murojaah (Juz)',
      'Kelancaran Mumtaz (%)',
      'Kelancaran Jayyid (%)',
      'Kelancaran Iadah (%)',
      'Status Pacing',
      'Kehadiran (%)',
    ];

    const rows = filteredSantri.map((s, index) => [
      index + 1,
      `"${s.name}"`,
      s.nis,
      s.juzAchieved,
      s.totalLinesMemorized,
      s.ziyadahLinesPeriod,
      s.ziyadahPagesPeriod,
      s.murojaahLinesPeriod,
      s.murojaahJuzPeriod,
      s.mumtazPercent,
      s.jayyidPercent,
      s.iadahPercent,
      s.pacingStatus,
      `${s.attendancePercent}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Mutabaah_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Laporan CSV berhasil diunduh!', {
      description: `Periode: ${periodLabel} • ${filteredSantri.length} santri`,
    });
  };

  // Helper label periode dinamis
  const periodLabel = useMemo(() => {
    const now = new Date();
    const monthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    if (selectedPeriod === 'bulan_ini') return monthName;
    if (selectedPeriod === 'pekan_ini') return 'Pekan Berjalan';
    if (selectedPeriod === 'bulan_lalu') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return prev.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    }
    return 'Semester Ganjil';
  }, [selectedPeriod]);

  // WhatsApp Digest generator
  const waDigestMessage = useMemo(() => {
    return (
      `*REKAP MUTABA'AH HALAQOH - ITQAN*\n` +
      `Periode: ${periodLabel} | Total Santri: ${totalSantri}\n\n` +
      `📊 *Ringkasan Hafalan:*\n` +
      `• Ziyadah Baru: *${totalZiyadahLines.toLocaleString()} baris* (~${totalZiyadahPages} Hal)\n` +
      `• Muroja'ah: *${totalMurojaahLines.toLocaleString()} baris* (~${totalMurojaahJuz} Juz)\n` +
      `• Kelancaran: *${avgMumtaz}% Lancar (Mumtaz)*\n` +
      `• Target Pacing: *${onTrackCount} dari ${totalSantri} Santri On Track*\n\n` +
      `🏅 *Santri Paling Aktif Pekan Ini:*\n` +
      santriReports
        .slice(0, 3)
        .map((s, i) => `${i + 1}. *${s.name}* (${s.juzAchieved})`)
        .join('\n') +
      `\n\n` +
      `Mohon Ayah/Bunda terus mendampingi muroja'ah di rumah.\n` +
      `_Ust. Abdullah - ITQAN Tahfidz_`
    );
  }, [
    periodLabel,
    totalZiyadahLines,
    totalZiyadahPages,
    totalMurojaahLines,
    totalMurojaahJuz,
    avgMumtaz,
    avgJayyid,
    avgIadah,
    onTrackCount,
    totalSantri,
    onTrackPercentage,
    avgAttendance,
    santriReports,
  ]);

  const handleCopyWA = () => {
    navigator.clipboard.writeText(waDigestMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleOpenWABroadcast = () => {
    if (!broadcastTarget.trim()) return;
    waGatewayService.openDirectWA(broadcastTarget, waDigestMessage);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Ringkas & Terpadu */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
              Laporan Mutaba'ah
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Rekapitulasi setoran &amp; kelancaran hafalan santri
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
            {/* Filter Dropdowns (2 kolom di mobile) */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-2.5 pr-7 py-2 focus:border-[#0070BA] focus:outline-none cursor-pointer"
                >
                  <option value="bulan_ini">Bulan Ini</option>
                  <option value="pekan_ini">Pekan Ini</option>
                  <option value="bulan_lalu">Bulan Lalu</option>
                  <option value="semester">Semester Ini</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedHalaqoh}
                  onChange={(e) => setSelectedHalaqoh(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-2.5 pr-7 py-2 focus:border-[#0070BA] focus:outline-none cursor-pointer"
                >
                  <option value="abu_bakar">Halaqoh Abu Bakar</option>
                  <option value="umar">Halaqoh Umar</option>
                  <option value="utsman">Halaqoh Utsman</option>
                  <option value="ali">Halaqoh Ali</option>
                  <option value="all">Semua Halaqoh</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons (3 kolom simetris di mobile) */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWAModalOpen(true)}
                className="text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-3 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer justify-center"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 sm:mr-1.5" />
                <span className="hidden sm:inline">Kirim WA</span>
                <span className="sm:hidden">WA</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-3 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer justify-center"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#0070BA] sm:mr-1.5" />
                <span className="hidden sm:inline">Unduh CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>

              <Button
                type="button"
                onClick={() => window.print()}
                className="text-xs font-semibold h-8.5 sm:h-9 px-2.5 sm:px-3.5 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-xs cursor-pointer justify-center"
              >
                <Printer className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Cetak / PDF</span>
                <span className="sm:hidden">Cetak</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ringkasan Utama (Clean & Focused) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Ziyadah */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Ziyadah</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-[#0070BA]">
              {totalZiyadahLines.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">baris</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ~{totalZiyadahPages} halaman
          </span>
        </div>

        {/* KPI 2: Muroja'ah */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Muroja'ah</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {totalMurojaahLines.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">baris</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ~{totalMurojaahJuz} juz diulang
          </span>
        </div>

        {/* KPI 3: Mutu Kelancaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Tingkat Lancar</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700">{avgMumtaz}%</span>
            <span className="text-xs text-slate-500">Mumtaz</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {avgJayyid}% Jayyid • {avgIadah}% I'adah
          </span>
        </div>

        {/* KPI 4: Target Pacing */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Sesuai Target</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-[#0070BA]">{onTrackPercentage}%</span>
            <span className="text-xs text-slate-500">On Track</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {onTrackCount} dari {totalSantri} santri
          </span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2">
        <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ringkasan'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ringkasan Tren</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('santri')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'santri'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Daftar Santri ({santriReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retensi')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'retensi'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Analisis Retensi ({realWeakPoints.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Ringkasan Tren */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-4">
          {/* Tren Capaian Setoran Harian (Pekan / Bulan) */}
          <TrendChart />

          {/* Row 1: Weekly Comparison Chart + Kelancaran Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart Balok Mingguan */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tren Setoran Mingguan (4 Pekan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume Ziyadah vs Muroja'ah terhadap target halaqoh
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#0070BA]"></span>
                    Ziyadah
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-300"></span>
                    Muroja'ah
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400"></span>
                    Target
                  </span>
                </div>
              </div>

              {/* Bar Columns Container */}
              <div className="space-y-3.5 pt-1">
                {weeklyTrendData.map((week, idx) => {
                  const total = week.ziyadah + week.murojaah;
                  const maxWeeklyScale = Math.max(100, ...weeklyTrendData.map((w) => Math.max(w.ziyadah + w.murojaah, w.target)));
                  const ziyadahPercent = (week.ziyadah / maxWeeklyScale) * 100;
                  const murojaahPercent = (week.murojaah / maxWeeklyScale) * 100;
                  const isAboveTarget = total >= week.target && total > 0;

                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-semibold">{week.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">
                            {total.toLocaleString()} Baris
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isAboveTarget
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {week.mumtazRate}% Mumtaz
                          </span>
                        </div>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="relative w-full h-3.5 bg-slate-100 rounded-md overflow-hidden flex">
                        <div
                          style={{ width: `${ziyadahPercent}%` }}
                          className="bg-[#0070BA] h-full"
                          title={`Ziyadah: ${week.ziyadah} baris`}
                        />
                        <div
                          style={{ width: `${murojaahPercent}%` }}
                          className="bg-sky-300 h-full"
                          title={`Muroja'ah: ${week.murojaah} baris`}
                        />
                        <div
                          style={{ left: `${Math.min(100, (week.target / maxWeeklyScale) * 100)}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10"
                          title={`Garis target: ${week.target} baris`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Total Setoran Periode: <strong className="text-slate-700">{(totalZiyadahLines + totalMurojaahLines).toLocaleString()} baris</strong></span>
                <span className="text-emerald-700 font-medium">
                  {totalZiyadahLines + totalMurojaahLines > 0 ? 'Data tersinkron otomatis' : 'Belum ada data setoran'}
                </span>
              </div>
            </div>

            {/* Mutu Kelancaran Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">
                    Mutu Kelancaran Halaqoh
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribusi hasil talaqqi santri
                  </p>
                </div>

                <div className="space-y-4 mt-4 text-xs">
                  {/* Mumtaz */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                        Mumtaz (Lancar)
                      </span>
                      <span className="font-bold text-slate-900">{avgMumtaz}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${avgMumtaz}%` }}
                        className="bg-[#047857] h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* Jayyid */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
                        Jayyid (Cukup)
                      </span>
                      <span className="font-bold text-slate-900">{avgJayyid}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${avgJayyid}%` }}
                        className="bg-[#B45309] h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* I'adah */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                        I'adah (Diulang)
                      </span>
                      <span className="font-bold text-slate-900">{avgIadah}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${avgIadah}%` }}
                        className="bg-[#B91C1C] h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Pacing Indicator Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">Kepatuhan Target:</span>
                  <span className="text-[#0070BA] font-bold">{onTrackPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${onTrackPercentage}%` }}
                    className="bg-[#0070BA] h-full rounded-full"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {onTrackCount} santri on-track, {totalSantri - onTrackCount} santri dalam bimbingan
                </span>
              </div>
            </div>
          </div>

          {/* Baris 2: Sebaran Capaian Hafalan & Rekap Keaktifan Halaqoh (Clean & Calm) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Sebaran Capaian Hafalan Santri
                </h3>
                <p className="text-xs text-slate-500">
                  Distribusi tingkatan juz santri pada halaqoh saat ini
                </p>
              </div>
              <span className="text-xs font-semibold text-[#0070BA] bg-[#EBF5FB] px-2.5 py-1 rounded-md">
                {totalSantri} Santri Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {juzDistributionData.map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800 text-xs">{item.range}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Status Pantau Santri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Performers */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Santri Paling Konsisten Pekan Ini
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {santriReports.slice(0, 3).map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#EBF5FB] text-[#0070BA] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {s.juzAchieved} • {s.lastSurah}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#0070BA] block">
                        +{s.ziyadahLinesPeriod} Baris
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {s.mumtazPercent}% Mumtaz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention / Behind Schedule */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Perlu Pendampingan Khusus
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {santriReports
                  .filter((s) => s.pacingStatus === 'behind' || s.status === 'belum_setor')
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 border border-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">{s.name}</span>
                          <span className="text-[11px] text-slate-500">
                            Capaian: {s.juzAchieved}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-red-700">
                          Defisit {s.pacingDeficitLines || 15} Baris
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetor(s as any)}
                          className="px-2 py-1 rounded bg-[#0070BA] text-white hover:bg-[#005C9E] font-semibold text-[11px]"
                        >
                          Bimbing
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Rekap Santri (Streamlined & Clean Table) */}
      {activeTab === 'santri' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Rekapitulasi Capaian Individual Santri
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredSantri.length} santri
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari santri / NIS..."
                  className="w-40 sm:w-48 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none"
                />
              </div>

              <select
                value={pacingFilter}
                onChange={(e) => setPacingFilter(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#0070BA] focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="on_track">On Track Saja</option>
                <option value="behind">Defisit Saja</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#0070BA] focus:outline-none cursor-pointer"
              >
                <option value="capaian">Urut Capaian Juz</option>
                <option value="ziyadah">Urut Ziyadah</option>
                <option value="kelancaran">Urut Kelancaran</option>
                <option value="nama">Urut Nama (A-Z)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title={`Urutan: ${sortOrder === 'desc' ? 'Tinggi ke Rendah' : 'Rendah ke Tinggi'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Santri Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Santri</th>
                  <th className="py-2.5 px-3">Total Capaian</th>
                  <th className="py-2.5 px-3">Ziyadah</th>
                  <th className="py-2.5 px-3">Muroja'ah</th>
                  <th className="py-2.5 px-3">Mutu Kelancaran</th>
                  <th className="py-2.5 px-3">Status Target</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSantri.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Santri Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#EBF5FB] text-[#0070BA] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {s.avatarInitials}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            NIS {s.nis}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Capaian Total */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#0070BA] block">
                        {s.juzAchieved}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {s.totalLinesMemorized.toLocaleString()} baris
                      </span>
                    </td>

                    {/* Ziyadah Periode Ini */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 block">
                        +{s.ziyadahLinesPeriod} baris
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ~{s.ziyadahPagesPeriod} hal
                      </span>
                    </td>

                    {/* Muroja'ah Periode Ini */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 block">
                        {s.murojaahLinesPeriod} baris
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ~{s.murojaahJuzPeriod} juz
                      </span>
                    </td>

                    {/* Mutu Kelancaran */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{s.mumtazPercent}% Mumtaz</span>
                      {s.iadahPercent > 0 && (
                        <span className="text-[10px] text-red-600 block">
                          {s.iadahPercent}% I'adah
                        </span>
                      )}
                    </td>

                    {/* Pacing Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {s.pacingStatus === 'accelerated' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Melebihi</span>
                        </span>
                      )}
                      {s.pacingStatus === 'on_track' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBF5FB] text-[#0070BA] border border-[#D6EAF8]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>On Track</span>
                        </span>
                      )}
                      {s.pacingStatus === 'behind' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Defisit ({s.pacingDeficitLines} B)</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRaporSantri(s)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#0070BA] text-white hover:bg-[#005C9E] transition-colors cursor-pointer"
                      >
                        Rapor
                      </button>

                      <button
                        type="button"
                        onClick={() => onDetail(s as any)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Analisis Mutu & Retensi */}
      {activeTab === 'retensi' && (
        <div className="space-y-4">
          {/* Section 1: Titik Rawan I'adah */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Titik Rawan Lupa &amp; Koreksi
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar Surah &amp; Ayat dengan frekuensi I'adah terbanyak
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {realWeakPoints.map((wp) => (
                <div
                  key={`${wp.surahNumber}-${wp.surahName}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#EBF5FB] text-[#0070BA] font-bold text-xs flex items-center justify-center">
                        {wp.surahNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        Surah {wp.surahName} (Juz {wp.juz})
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        wp.severity === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : wp.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {wp.iadahCount}x I'adah ({wp.affectedSantriCount} santri)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Catatan:</strong> {wp.commonMistakes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Santri yang Jeda Muroja'ah > 7 Hari */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="pb-2.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Peringatan Jeda Muroja'ah &gt; 7 Hari
              </h3>
              <p className="text-xs text-slate-500">
                Santri yang belum menyetor muroja'ah juz tertentu
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {santriReports
                .filter((s) => s.daysSinceLastMurojaah >= 6)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-amber-50/60 border border-amber-200 gap-2.5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">Terakhir: <strong>{s.daysSinceLastMurojaah} hari lalu</strong></span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Hafalan yang perlu disegarkan: <strong>Juz {Math.max(1, Math.floor(parseFloat(s.juzAchieved)) - 1)}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSetor(s as any)}
                      className="px-3 py-1.5 rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] font-semibold text-xs shrink-0 self-start sm:self-center cursor-pointer"
                    >
                      Jadwalkan Simak
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}



      {/* 8. MODAL: Rapor Resmi Santri (Menggunakan Komponen Mandiri) */}
      <RaporPrintModal
        isOpen={Boolean(selectedRaporSantri)}
        onClose={() => setSelectedRaporSantri(null)}
        santri={selectedRaporSantri}
        periodLabel={periodLabel}
      />

      {/* 9. MODAL: Broadcast WhatsApp Digest */}
      {isWAModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Format Teks WhatsApp Halaqoh</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWAModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Salin atau kirimkan ringkasan laporan ini langsung ke grup WhatsApp wali santri atau nomor pembina:
              </p>

              {/* Target Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  placeholder="Nomor WA Tujuan / Grup"
                  className="text-xs h-9 bg-slate-50 flex-1"
                />
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Target WA</span>
              </div>

              <textarea
                readOnly
                value={waDigestMessage}
                rows={8}
                className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {copySuccess ? 'Berhasil disalin!' : 'Siap dikirimkan secara manual'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyWA}
                    className="text-xs font-semibold h-9 px-3 border-slate-200 rounded-lg cursor-pointer"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 mr-1" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                    <span>Salin Teks</span>
                  </Button>

                  {broadcastTarget ? (
                    <Button
                      type="button"
                      onClick={handleOpenWABroadcast}
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 h-9 px-3.5 rounded-lg shadow-xs cursor-pointer"
                    >
                      <span>Buka WhatsApp (wa.me)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      className="text-xs font-semibold bg-slate-200 text-slate-400 h-9 px-3.5 rounded-lg"
                    >
                      Masukkan Nomor Tujuan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
};
