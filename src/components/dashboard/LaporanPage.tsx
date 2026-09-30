import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Share2,
  Printer,
  Search,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  ChevronDown,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';
import type { Santri } from './types';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';
import {
  generateSantriReports,
  MOCK_EXAM_RECORDS,
  MOCK_WEAK_POINTS,
  generateMonthActivity,
  WEEKLY_TREND_DATA,
  JUZ_DISTRIBUTION_DATA,
  type SantriReportItem,
  type ExamRecord,
} from './laporanData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  // Tab states: ringkasan | santri | retensi | tasmi
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'santri' | 'retensi' | 'tasmi'>('ringkasan');

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<'bulan_ini' | 'pekan_ini' | 'bulan_lalu' | 'semester'>('bulan_ini');
  const [selectedHalaqoh, setSelectedHalaqoh] = useState<string>('abu_bakar');
  const [selectedSetoranType, setSelectedSetoranType] = useState<'all' | 'ziyadah' | 'murojaah'>('all');

  // Search & Filter in Santri Table
  const [searchQuery, setSearchQuery] = useState('');
  const [pacingFilter, setPacingFilter] = useState<'all' | 'on_track' | 'behind' | 'accelerated'>('all');
  const [sortBy, setSortBy] = useState<'capaian' | 'ziyadah' | 'kelancaran' | 'nama'>('capaian');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [selectedRaporSantri, setSelectedRaporSantri] = useState<SantriReportItem | null>(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState<ExamRecord | null>(null);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('081234567801');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Month activity heatmap data
  const monthActivity = useMemo(() => generateMonthActivity(), []);

  // Generate enriched santri reports
  const santriReports = useMemo(() => generateSantriReports(santriList), [santriList]);

  // Aggregate stats calculations
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

        return matchesSearch && matchesPacing;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'capaian') {
          const juzA = parseFloat(a.juzAchieved.replace(' Juz', '')) || 0;
          const juzB = parseFloat(b.juzAchieved.replace(' Juz', '')) || 0;
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
  }, [santriReports, searchQuery, pacingFilter, sortBy, sortOrder]);

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
  };

  // WhatsApp Digest generator
  const waDigestMessage = useMemo(() => {
    return (
      `*REKAP MUTABA'AH HALAQOH - ITQAN*\n` +
      `Periode: September 2026 | Halaqoh: Abu Bakar\n\n` +
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

  const handleSendBroadcastGateway = async () => {
    if (!broadcastTarget.trim()) return;
    setIsBroadcasting(true);
    setBroadcastFeedback(null);

    const res: SendResult = await waGatewayService.sendMessage(
      broadcastTarget,
      'Grup Wali / Halaqoh',
      waDigestMessage,
      'broadcast'
    );

    setIsBroadcasting(false);
    if (res.success) {
      setBroadcastFeedback('Berhasil dikirim melalui WhatsApp Gateway!');
    } else if (res.fallbackUrl) {
      setBroadcastFeedback(res.notConfigured ? 'Gateway belum diatur. Mengalihkan ke Direct WA...' : 'Koneksi gateway gagal. Mengalihkan ke Direct WA...');
      window.open(res.fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Clean Header & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Laporan &amp; Analitik Mutaba'ah
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EBF5FB] text-[#0070BA] border border-[#D6EAF8]">
                September 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi capaian hafalan dan mutu kelancaran santri
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWAModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold h-9 px-3 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Broadcast WA</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold h-9 px-3 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0070BA]" />
              <span>Ekspor CSV</span>
            </Button>

            <Button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold h-9 px-3.5 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ekspor PDF / Cetak</span>
            </Button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 focus:border-[#0070BA] focus:outline-none cursor-pointer"
            >
              <option value="bulan_ini">Bulan Ini (Sep 2026)</option>
              <option value="pekan_ini">Pekan Ini (22-28 Sep)</option>
              <option value="bulan_lalu">Bulan Lalu (Agu 2026)</option>
              <option value="semester">Semester Ganjil 2026/2027</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedHalaqoh}
              onChange={(e) => setSelectedHalaqoh(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 focus:border-[#0070BA] focus:outline-none cursor-pointer"
            >
              <option value="abu_bakar">Halaqoh Abu Bakar</option>
              <option value="umar">Halaqoh Umar bin Khattab</option>
              <option value="utsman">Halaqoh Utsman bin Affan</option>
              <option value="ali">Halaqoh Ali bin Abi Thalib</option>
              <option value="all">Semua Halaqoh</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedSetoranType}
              onChange={(e) => setSelectedSetoranType(e.target.value as any)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 focus:border-[#0070BA] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Setoran</option>
              <option value="ziyadah">Khusus Ziyadah</option>
              <option value="murojaah">Khusus Muroja'ah</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Focused 4-Card Executive KPI Summary (Crisp & Balanced) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Ziyadah */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Ziyadah</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#0070BA]">
              {totalZiyadahLines.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">baris</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>~{totalZiyadahPages} Halaman</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">+14.2%</span>
          </div>
        </div>

        {/* KPI 2: Muroja'ah */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Muroja'ah</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              {totalMurojaahLines.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">baris</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>~{totalMurojaahJuz} Juz Diulang</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">+8.5%</span>
          </div>
        </div>

        {/* KPI 3: Mutu Kelancaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Mutu Kelancaran</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-emerald-700">{avgMumtaz}%</span>
            <span className="text-xs text-slate-500 font-medium">Mumtaz</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-medium">Jayyid {avgJayyid}%</span>
              <span>•</span>
              <span className="text-red-700 font-medium">I'adah {avgIadah}%</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pacing Target */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Kepatuhan Target</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#0070BA]">{onTrackPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">On Track</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{onTrackCount} dari {totalSantri} Santri</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium text-[11px]">Hadir {avgAttendance}%</span>
          </div>
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
            <span>Analisis Retensi ({MOCK_WEAK_POINTS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasmi')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tasmi'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Ujian Tasmi' ({MOCK_EXAM_RECORDS.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Ringkasan Tren */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-4">
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
                {WEEKLY_TREND_DATA.map((week, idx) => {
                  const total = week.ziyadah + week.murojaah;
                  const ziyadahPercent = (week.ziyadah / 4500) * 100;
                  const murojaahPercent = (week.murojaah / 4500) * 100;
                  const isAboveTarget = total >= week.target;

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
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                          style={{ left: `${(week.target / 4500) * 100}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10"
                          title="Garis target: 3.500 baris"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Rata-rata pertumbuhan: <strong className="text-slate-700">+6.8% per pekan</strong></span>
                <span className="text-emerald-700 font-medium">Tren stabil melampaui target</span>
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

          {/* Row 2: Sebaran Capaian Juz & Heatmap Aktivitas 30 Hari */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sebaran Capaian Juz */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Sebaran Capaian Hafalan
                </h3>
                <p className="text-xs text-slate-500">
                  Distribusi hafalan {totalSantri} santri saat ini
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {JUZ_DISTRIBUTION_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800">{item.range}</span>
                      <span className="text-[11px] text-slate-400">({item.label})</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.count} Santri</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matriks Aktivitas Halaqoh 30 Hari (Heatmap Keaktifan) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Aktivitas Halaqoh 30 Hari
                  </h3>
                  <p className="text-xs text-slate-500">
                    Intensitas setoran baris per hari selama bulan berjalan
                  </p>
                </div>
                {/* Legenda Intensitas */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Rendah</span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-200"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-200"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0070BA]"></span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#004A7F]"></span>
                  <span>Tinggi</span>
                </div>
              </div>

              {/* Grid 30 Hari */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 pt-1">
                {monthActivity.map((day) => {
                  const bgClass =
                    day.intensity === 4
                      ? 'bg-[#004A7F] text-white'
                      : day.intensity === 3
                      ? 'bg-[#0070BA] text-white'
                      : day.intensity === 2
                      ? 'bg-sky-200 text-slate-800'
                      : day.intensity === 1
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-50 text-slate-400 border border-slate-100';

                  return (
                    <div
                      key={day.dayOfMonth}
                      className={`p-1.5 rounded-md text-center text-xs transition-colors cursor-pointer ${bgClass}`}
                      title={`${day.date}: ${day.totalLines} Baris (Z: ${day.ziyadahLines}, M: ${day.murojaahLines})`}
                    >
                      <span className="text-[10px] font-bold block">{day.dayOfMonth}</span>
                      <span className="text-[9px] block opacity-80 leading-tight">{day.dayName}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Puncak setoran: <strong>26 Sep (510 baris)</strong></span>
                <span className="text-slate-400">26 hari aktif halaqoh</span>
              </div>
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
                  <th className="py-2.5 px-3">Total Hafalan</th>
                  <th className="py-2.5 px-3">Ziyadah</th>
                  <th className="py-2.5 px-3">Muroja'ah</th>
                  <th className="py-2.5 px-3">Mutu</th>
                  <th className="py-2.5 px-3">Pacing 3 Thn</th>
                  <th className="py-2.5 px-3">Kehadiran</th>
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
                          <span className="font-mono text-[10px] text-slate-400">
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
                        ~{s.murojaahJuzPeriod} Juz
                      </span>
                    </td>

                    {/* Mutu Kelancaran */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        <span className="font-semibold text-slate-800">{s.mumtazPercent}%</span>
                      </div>
                      {s.iadahPercent > 0 && (
                        <span className="text-[10px] text-red-600 block">
                          I'adah: {s.iadahPercent}%
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

                    {/* Kehadiran */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{s.attendancePercent}%</span>
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
              {MOCK_WEAK_POINTS.map((wp) => (
                <div
                  key={wp.surahNumber}
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

      {/* 7. Tab 4: Rekap Ujian Tasmi' */}
      {activeTab === 'tasmi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Log Rekapitulasi Ujian Tasmi' Kenaikan Juz
              </h3>
              <p className="text-xs text-slate-500">
                Pengujian tasmi' 1 juz sekali duduk
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {MOCK_EXAM_RECORDS.filter((e) => e.passed).length} Lulus Tasmi'
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-800 border border-red-200">
                {MOCK_EXAM_RECORDS.filter((e) => !e.passed).length} Remidi
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Santri</th>
                  <th className="py-2.5 px-3">Juz Diuji</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Penguji</th>
                  <th className="py-2.5 px-3 text-center">Ketukan</th>
                  <th className="py-2.5 px-3 text-center">Dibetulkan</th>
                  <th className="py-2.5 px-3">Nilai</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_EXAM_RECORDS.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {exam.santriName}
                      <span className="font-mono text-[10px] text-slate-400 block font-normal">
                        NIS {exam.nis}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0070BA]">
                      Juz {exam.juzTarget}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{exam.examDate}</td>
                    <td className="py-2.5 px-3 text-slate-800">{exam.examinerName}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      {exam.ketukanCount}x
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      {exam.dibetulkanCount}x
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {exam.finalScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3">
                      {exam.passed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          LULUS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          REMIDI
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {exam.passed ? (
                        <button
                          type="button"
                          onClick={() => setSelectedExamDetail(exam)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-[#0070BA] text-[#0070BA] hover:bg-[#EBF5FB] transition-colors cursor-pointer"
                        >
                          Lihat QR
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum Terbit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. MODAL: Rapor Resmi Santri (Siap Cetak / Ekspor PDF) */}
      {selectedRaporSantri &&
        createPortal(
          <div className="print-modal-backdrop fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="print-modal-container bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full my-6 overflow-hidden">
              {/* Modal Actions Bar (Sembunyi saat dicetak) */}
              <div className="print-modal-header flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 no-print">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0070BA]" />
                  Format Cetak / Ekspor PDF Rapor Resmi
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="h-8 px-3 text-xs bg-[#0070BA] hover:bg-[#005C9E] text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ekspor ke PDF / Cetak</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSelectedRaporSantri(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Official Report Document Body */}
              <div className="print-page p-6 sm:p-8 space-y-5 text-slate-900 text-xs bg-white">
                {/* Kop Pesantren */}
                <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1 avoid-break">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#0070BA] text-white font-extrabold text-base mb-1">
                    IT
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900">
                    PESANTREN TAHFIDZ TERPADU ITQAN
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Lembaga Pembinaan Al-Qur'an &amp; Mutaba'ah Berkelanjutan • Terakreditasi Kemenag
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Jl. Pesantren No. 101, Kompleks Masjid Jami' • Telp: (021) 8876-5432
                  </p>
                  <div className="pt-2 font-bold text-sm tracking-wide text-[#0070BA] uppercase">
                    LEMBAR MUTABA'AH BULANAN SANTRI
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Periode: September 2026 • Tahun Akademik 2026/2027
                  </div>
                </div>

                {/* Data Santri */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 avoid-break">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-24 text-slate-500">Nama Santri</span>
                      <span className="font-bold text-slate-900">: {selectedRaporSantri.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-slate-500">NIS</span>
                      <span className="font-mono font-semibold text-slate-800">: {selectedRaporSantri.nis}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-slate-500">Halaqoh</span>
                      <span className="text-slate-800 font-medium">: Abu Bakar Ash-Shiddiq</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-24 text-slate-500">Musyrif</span>
                      <span className="text-slate-800 font-medium">: Ust. Abdullah</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-slate-500">Target Program</span>
                      <span className="text-slate-800 font-medium">: 30 Juz</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-slate-500">Status Pacing</span>
                      <span className="font-bold text-[#0070BA]">: {selectedRaporSantri.pacingStatus.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Rekap Capaian Tabel */}
                <div className="space-y-2 avoid-break">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    I. Capaian Hafalan Al-Qur'an
                  </h5>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2 border-b border-slate-200">Parameter Evaluasi</th>
                        <th className="p-2 border-b border-slate-200 text-right">Target</th>
                        <th className="p-2 border-b border-slate-200 text-right">Realisasi</th>
                        <th className="p-2 border-b border-slate-200 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      <tr>
                        <td className="p-2 font-medium">Total Akumulasi Hafalan</td>
                        <td className="p-2 text-right">9.060 Baris</td>
                        <td className="p-2 text-right font-bold text-[#0070BA]">{selectedRaporSantri.juzAchieved} ({selectedRaporSantri.totalLinesMemorized} B)</td>
                        <td className="p-2 text-center text-emerald-700 font-semibold">Aktif</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Ziyadah Bulan Ini</td>
                        <td className="p-2 text-right">360 Baris</td>
                        <td className="p-2 text-right font-bold">{selectedRaporSantri.ziyadahLinesPeriod} Baris (~{selectedRaporSantri.ziyadahPagesPeriod} Hal)</td>
                        <td className="p-2 text-center text-emerald-700 font-semibold">Tercapai</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Muroja'ah Bulan Ini</td>
                        <td className="p-2 text-right">750 Baris</td>
                        <td className="p-2 text-right font-bold">{selectedRaporSantri.murojaahLinesPeriod} Baris (~{selectedRaporSantri.murojaahJuzPeriod} Juz)</td>
                        <td className="p-2 text-center text-emerald-700 font-semibold">Mutqin</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Tingkat Kehadiran Talaqqi</td>
                        <td className="p-2 text-right">100%</td>
                        <td className="p-2 text-right font-bold">{selectedRaporSantri.attendancePercent}%</td>
                        <td className="p-2 text-center font-semibold">Disiplin</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Penilaian Mutu Kelancaran */}
                <div className="space-y-2 avoid-break">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    II. Mutu &amp; Kualitas Bacaan
                  </h5>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50">
                      <span className="text-[10px] text-emerald-700 block">Mumtaz (Lancar)</span>
                      <span className="text-base font-bold text-emerald-800">{selectedRaporSantri.mumtazPercent}%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50">
                      <span className="text-[10px] text-amber-700 block">Jayyid (Cukup)</span>
                      <span className="text-base font-bold text-amber-800">{selectedRaporSantri.jayyidPercent}%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-red-200 bg-red-50">
                      <span className="text-[10px] text-red-700 block">I'adah (Diulang)</span>
                      <span className="text-base font-bold text-red-800">{selectedRaporSantri.iadahPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Catatan Musyrif */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 avoid-break">
                  <span className="font-bold text-slate-900 block">Catatan &amp; Arahan Musyrif:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Alhamdulillah, ananda menunjukkan disiplin tinggi dalam talaqqi harian. Pertahankan kelancaran makhraj huruf dan tingkatkan muroja'ah mandiri sebelum shalat fardhu.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="grid grid-cols-2 gap-8 pt-4 text-center avoid-break">
                  <div className="space-y-12">
                    <span className="text-slate-600 block">Koordinator Tahfidz,</span>
                    <span className="font-bold text-slate-900 block border-t border-slate-300 pt-1">
                      Ust. Hamzah Al-Hafidz, Lc.
                    </span>
                  </div>
                  <div className="space-y-12">
                    <span className="text-slate-600 block">Musyrif Halaqoh,</span>
                    <span className="font-bold text-slate-900 block border-t border-slate-300 pt-1">
                      Ust. Abdullah
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
                  onClick={() => {
                    setIsWAModalOpen(false);
                    setBroadcastFeedback(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {broadcastFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{broadcastFeedback}</span>
                </div>
              )}

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
                  {copySuccess ? 'Berhasil disalin!' : 'Siap dikirimkan'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyWA}
                    className="text-xs font-semibold h-9 px-3 border-slate-200 rounded-lg cursor-pointer"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 mr-1" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                    <span>Salin Teks</span>
                  </Button>

                  {broadcastTarget && (
                    <a
                      href={waGatewayService.getDirectWALink(broadcastTarget, waDigestMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold h-9"
                    >
                      <span>Direct WA</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <Button
                    disabled={isBroadcasting || !broadcastTarget}
                    onClick={handleSendBroadcastGateway}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 h-9 px-3.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBroadcasting ? 'Mengirim...' : 'Kirim via Gateway'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 10. MODAL: Sertifikat Ujian Tasmi' ber-QR Code */}
      {selectedExamDetail &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden p-6 space-y-4 text-center">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedExamDetail(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Sertifikat Kenaikan Juz {selectedExamDetail.juzTarget}
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen Resmi Kelulusan Tasmi' 1 Juz Sekali Duduk
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Santri:</span>
                  <span className="font-bold text-slate-900">{selectedExamDetail.santriName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nilai Akhir:</span>
                  <span className="font-bold text-emerald-700">{selectedExamDetail.finalScore} (Mumtaz)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penguji:</span>
                  <span className="font-semibold text-slate-800">{selectedExamDetail.examinerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Lulus:</span>
                  <span className="text-slate-800">{selectedExamDetail.examDate}</span>
                </div>
              </div>

              {/* QR Code Validation Box */}
              <div className="p-4 border-2 border-dashed border-[#0070BA] bg-[#EBF5FB]/50 rounded-xl space-y-2">
                <div className="w-28 h-28 mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs">
                  <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-slate-900 rounded-sm">
                    <div className="bg-white col-span-2 row-span-2"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white col-span-2 row-span-2"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-600 block">
                  Kode Verifikasi: <strong>{selectedExamDetail.certificateQr}</strong>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  Tersinkronisasi &amp; Terverifikasi Resmi di Portal Santri
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setSelectedExamDetail(null)}
                className="w-full text-xs font-semibold bg-[#0070BA] text-white hover:bg-[#005C9E] cursor-pointer"
              >
                Tutup Pratinjau
              </Button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
