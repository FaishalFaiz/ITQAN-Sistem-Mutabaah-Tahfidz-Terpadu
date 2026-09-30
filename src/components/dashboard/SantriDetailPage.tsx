import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  History, 
  Share2, 
  Sparkles, 
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserCheck,
  Send,
  Check,
  ExternalLink,
  X,
  MessageSquare
} from 'lucide-react';
import gsap from 'gsap';
import type { Santri, SetoranRecord } from './types';
import { PacingCard } from '../visualization/PacingCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storageService, EVENT_DATA_CHANGED, getTodayDateKey } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';

interface SantriDetailPageProps {
  santri: Santri;
  onBack: () => void;
  onSetor: (santri: Santri) => void;
}

export const SantriDetailPage: React.FC<SantriDetailPageProps> = ({
  santri,
  onBack,
  onSetor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'riwayat' | 'analisis'>('overview');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Real Setoran records state
  const [records, setRecords] = useState<SetoranRecord[]>(() => storageService.getSetoranBySantriId(santri.id));
  const [setoranFilter, setSetoranFilter] = useState<'all' | 'ziyadah' | 'murojaah'>('all');
  const [sendingWAId, setSendingWAId] = useState<string | null>(null);

  // WA Digest Modal State
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [isSendingGateway, setIsSendingGateway] = useState(false);
  const [waSendFeedback, setWaSendFeedback] = useState<string | null>(null);

  const loadRecords = useCallback(() => {
    setRecords(storageService.getSetoranBySantriId(santri.id));
  }, [santri.id]);

  useEffect(() => {
    const handleDataChanged = () => {
      loadRecords();
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleDataChanged);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleDataChanged);
  }, [loadRecords]);

  // Metrik kalkulasi
  const totalLines = santri.totalLinesMemorized || 1500;
  const totalTarget = 9060;
  const pagesCompleted = (totalLines / 15).toFixed(1);
  const remainingLines = Math.max(0, totalTarget - totalLines);
  const remainingDays = 650;
  const requiredDailyLines = Math.ceil(remainingLines / remainingDays);

  const detailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.detail-tab-pane',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }, detailContainerRef);

    return () => ctx.revert();
  }, [activeTab]);

  const today = getTodayDateKey();
  const isSentToday = santri.lastDailyReportSentDate === today;

  // WhatsApp Digest Generator (Laporan Harian Mutaba'ah)
  const waDigestMessage = useMemo(() => {
    return waGatewayService.buildDailyProgressMessage(santri);
  }, [santri, records]);

  const handleCopyWADigest = () => {
    navigator.clipboard.writeText(waDigestMessage);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleSendViaGateway = async (force = false) => {
    if (!santri.parentPhone) return;
    setIsSendingGateway(true);
    setWaSendFeedback(null);

    const res: SendResult = await waGatewayService.sendDailyReport(santri, force);

    setIsSendingGateway(false);
    if (res.success) {
      setWaSendFeedback('Alhamdulillah! Laporan harian berhasil terkirim ke wali santri via WhatsApp Gateway.');
    } else if (res.alreadySentToday) {
      setWaSendFeedback(`Laporan hari ini sudah terkirim (${santri.lastDailyReportSentTime || 'Hari ini'}). Anda dapat memilih Kirim Ulang bila diperlukan.`);
    } else if (res.fallbackUrl) {
      setWaSendFeedback(res.notConfigured ? 'Gateway belum diatur. Mengalihkan ke Direct WA...' : 'Koneksi gateway gagal. Mengalihkan ke Direct WA...');
      window.open(res.fallbackUrl, '_blank', 'noopener,noreferrer');
    } else {
      setWaSendFeedback(res.message || 'Gagal mengirim via WhatsApp Gateway.');
    }
  };

  // Kirim record setoran tunggal via WA
  const handleSendRecordWA = async (record: SetoranRecord) => {
    if (!santri.parentPhone) return;
    setSendingWAId(record.id);

    const messageText = waGatewayService.buildSetoranMessage(record, santri);
    const res: SendResult = await waGatewayService.sendMessage(
      santri.parentPhone,
      santri.parentName || `Wali ${santri.name}`,
      messageText,
      'setoran'
    );

    setSendingWAId(null);
    if (res.success) {
      storageService.updateSetoranWAStatus(record.id, 'sent');
      loadRecords();
    } else if (res.fallbackUrl) {
      storageService.updateSetoranWAStatus(record.id, 'failed');
      loadRecords();
      window.open(res.fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredRecords = useMemo(() => {
    if (setoranFilter === 'all') return records;
    return records.filter((r) => r.type === setoranFilter);
  }, [records, setoranFilter]);

  const statusConfig = {
    tercapai: {
      label: 'Target Tercapai',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      subText: 'Target harian terpenuhi'
    },
    tidak_tercapai: {
      label: 'Defisit Setoran',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      subText: `Kurang ${Math.max(0, santri.dailyTargetLines - santri.linesCompletedToday)} baris`
    },
    belum_setor: {
      label: 'Belum Setor',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      subText: 'Menunggu giliran talaqqi'
    }
  }[santri.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div ref={detailContainerRef} className="space-y-4">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#0070BA] transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#EBF5FB] flex items-center justify-center text-slate-600 group-hover:text-[#0070BA] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Kembali ke Daftar Santri</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Tombol Modal WA Digest */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsWAModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold h-8.5 px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            title="Kirim atau salin laporan progres ke Wali Santri via WA"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kirim Laporan WA</span>
          </Button>

          {/* Tombol Input Setoran */}
          <Button
            type="button"
            size="sm"
            onClick={() => onSetor(santri)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold h-8.5 px-3.5 bg-[#0070BA] hover:bg-[#005C9E] text-white shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Input Setoran</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Profile Banner */}
      <Card className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Kolom Kiri: Profil & Meta Halaqoh */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-2xs">
              {santri.avatarInitials}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {santri.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  NIS {santri.nis}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${statusConfig.badgeClass}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{statusConfig.label}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Halaqoh: <strong className="text-slate-800 font-semibold">{santri.halaqahName || 'Abu Bakar Ash-Shiddiq'}</strong></span>
                </span>
                <span className="text-slate-300">•</span>
                <span>Wali: <strong className="text-slate-800 font-semibold">{santri.parentName || 'Ayah/Bunda'}</strong> ({santri.parentPhone || 'No WA belum ada'})</span>
                <span className="text-slate-300">•</span>
                <span>Surah Terakhir: <strong className="text-[#0070BA] font-semibold">{santri.lastSurah}</strong></span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 3 Kartu Key Performance Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Total Capaian */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[105px] text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total Hafalan</span>
              <span className="text-lg font-bold text-[#0070BA] block mt-0.5">{santri.juzAchieved}</span>
              <span className="text-[10px] text-slate-500 block">~{pagesCompleted} Halaman</span>
            </div>

            {/* Target Harian */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[105px] text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Setoran Hari Ini</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">
                {santri.linesCompletedToday}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {santri.dailyTargetLines}</span>
              </span>
              <span className="text-[10px] text-slate-500 block">baris</span>
            </div>

            {/* Status & Kelancaran */}
            <div className={`border rounded-xl px-4 py-3 min-w-[110px] text-center ${
              santri.status === 'tercapai'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : santri.status === 'tidak_tercapai'
                ? 'bg-red-50/70 border-red-200 text-red-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}>
              <span className="text-[11px] font-medium opacity-80 block">Mutaba'ah</span>
              <span className="text-sm font-bold block mt-1">
                {santri.status === 'tercapai' && '92% Mumtaz'}
                {santri.status === 'tidak_tercapai' && 'Perlu I\'adah'}
                {santri.status === 'belum_setor' && 'Talaqqi'}
              </span>
              <span className="text-[10px] opacity-75 block truncate mt-0.5">
                {statusConfig.subText}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Tab Navigasi Detail */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2">
        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ringkasan &amp; Rekomendasi Pacing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'riwayat'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Setoran Halaqoh ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analisis')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analisis'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analisis Retensi &amp; Spaced Muroja'ah</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Overview & Rekomendasi Pacing */}
      {activeTab === 'overview' && (
        <div className="detail-tab-pane grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Kolom Kiri: Pacing Card & Actionable Guidance */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pacing Engine Card */}
            <PacingCard
              santriName={santri.name}
              nis={santri.nis}
              totalLinesMemorized={totalLines}
              totalLinesTarget={totalTarget}
              daysRemaining={remainingDays}
              dailyTargetLines={santri.dailyTargetLines}
              linesCompletedToday={santri.linesCompletedToday}
              status={santri.status === 'tercapai' ? 'on_track' : 'behind'}
              hideHeader={true}
            />

            {/* Rekomendasi Tindakan Musyrif */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Rekomendasi Tindakan Musyrif
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Rencana aksi talaqqi &amp; pengulangan berbasis evaluasi harian
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Action Card 1: Ziyadah */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-[#F4F9FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#0070BA] px-2 py-0.5 rounded">
                        Ziyadah
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">
                        {santri.status === 'tercapai' ? 'Lanjutkan Ayat Baru Besok Pagi' : 'Tuntaskan Target Sesi Sore'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {santri.status === 'tercapai'
                        ? `Target hari ini telah tuntas. Kunci hafalan ${santri.lastSurah} dengan tasmi' mandiri 2x sebelum berpindah ke surah berikutnya.`
                        : `Terdapat defisit ${Math.max(0, santri.dailyTargetLines - santri.linesCompletedToday)} baris. Berikan slot setoran khusus pada sesi halaqoh berikutnya.`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white shrink-0 h-8"
                  >
                    Setor Sekarang
                  </Button>
                </div>

                {/* Action Card 2: Spaced Repetition Muroja'ah */}
                <div className="p-3.5 rounded-xl border border-amber-100 bg-[#FFFDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Muroja'ah Rutin
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">
                        Ulangi Juz 29 (Hal. 562–564)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem mendeteksi rentang halaman ini terakhir dimuroja'ah beberapa hari lalu. Sangat krusial disimak ulang pekan ini.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center text-xs font-semibold border-amber-200 text-amber-800 hover:bg-amber-50 shrink-0 h-8"
                  >
                    Simak Muroja'ah
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rapor Ringkas & Kontak Wali Santri */}
          <div className="space-y-4">
            {/* Kartu Kontak Wali Santri & WhatsApp */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Kontak Wali Santri</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  WA Ready
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">Nama Wali / Orang Tua:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {santri.parentName || 'Belum diisi'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">Nomor WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {santri.parentPhone || 'Nomor WhatsApp belum terdaftar'}
                  </span>
                </div>
              </div>

              {santri.parentPhone && (
                <div className="pt-1 flex flex-col gap-2">
                  <a
                    href={waGatewayService.getDirectWALink(santri.parentPhone, `Assalamu'alaikum Warahmatullah Bpk/Ibu ${santri.parentName || ''}...`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Wali</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-75" />
                  </a>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWAModalOpen(true)}
                    className="w-full text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
                  >
                    Kirim Laporan Mutaba'ah
                  </Button>
                </div>
              )}
            </div>

            {/* Kartu Parameter Akademik */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Statistik Mutaba'ah
                </h3>
                <span className="text-[11px] font-medium text-slate-400">Target 30 Juz</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Sisa Target Hafalan</span>
                  <span className="font-bold text-slate-800">{remainingLines.toLocaleString()} Baris</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Est. Waktu Khatam</span>
                  <span className="font-bold text-[#0070BA]">~{remainingDays} Hari ({Math.round(remainingDays / 30)} Bulan)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Target Harian Ideal</span>
                  <span className="font-bold text-emerald-700">{requiredDailyLines} Baris / Hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Riwayat Setoran (Real Log Mutaba'ah) */}
      {activeTab === 'riwayat' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Log Catatan Mutaba'ah Halaqoh
              </h3>
              <p className="text-xs text-slate-500">
                Data real setoran hafalan baru (Ziyadah) dan pengulangan (Muroja'ah) tersimpan
              </p>
            </div>

            {/* Filter Jenis Setoran */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSetoranFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  setoranFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setSetoranFilter('ziyadah')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  setoranFilter === 'ziyadah'
                    ? 'bg-white text-[#0070BA] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ziyadah ({records.filter(r => r.type === 'ziyadah').length})
              </button>
              <button
                type="button"
                onClick={() => setSetoranFilter('murojaah')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  setoranFilter === 'murojaah'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Muroja'ah ({records.filter(r => r.type === 'murojaah').length})
              </button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Catatan Setoran</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Santri belum memiliki riwayat mutaba'ah untuk kategori ini. Klik tombol di bawah untuk memasukkan setoran perdana.
              </p>
              <Button
                size="sm"
                onClick={() => onSetor(santri)}
                className="bg-[#0070BA] text-white text-xs h-8"
              >
                Input Setoran Sekarang
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu Sesi</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Surah &amp; Ayat</th>
                    <th className="py-3 px-4">Posisi Halaman/Baris</th>
                    <th className="py-3 px-4">Jumlah Baris</th>
                    <th className="py-3 px-4">Kelancaran</th>
                    <th className="py-3 px-4">Status WA</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {r.formattedDate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.type === 'ziyadah' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-[#0070BA] border border-blue-200">
                            ZIYADAH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                            MUROJA'AH
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.surahName}
                        <span className="block text-[10px] font-normal text-slate-400">Juz {r.juz}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        Hal. {r.pageStart === r.pageEnd ? r.pageStart : `${r.pageStart}–${r.pageEnd}`} (B {r.lineStart}–{r.lineEnd})
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0070BA] whitespace-nowrap">
                        {r.totalLines} Baris
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.grade === 'mumtaz' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            MUMTAZ
                          </span>
                        )}
                        {r.grade === 'jayyid' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                            JAYYID
                          </span>
                        )}
                        {r.grade === 'iadah' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-50 text-red-700 border border-red-200">
                            I'ADAH
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.waStatus === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            <span>Terkirim</span>
                          </span>
                        ) : r.waStatus === 'failed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" />
                            <span>Gagal</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Belum Terkirim
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={sendingWAId === r.id || !santri.parentPhone}
                          onClick={() => handleSendRecordWA(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                          title="Kirim atau kirim ulang rincian setoran ke WhatsApp Wali Santri"
                        >
                          <Send className="w-3 h-3" />
                          <span>{sendingWAId === r.id ? 'Mengirim...' : 'Kirim WA'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Analisis Retensi & Spaced Repetition */}
      {activeTab === 'analisis' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Analisis Retensi Hafalan &amp; Spaced Repetition
            </h3>
            <p className="text-xs text-slate-500">
              Peta pengulangan hafalan untuk mencegah lupa (nisyan) berbasis interval kurva memori Ebbinghaus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Kekuatan Hafalan Rata-Rata</span>
              <div className="text-2xl font-extrabold text-emerald-700">88.4%</div>
              <p className="text-[11px] text-slate-500">Kategori Kuat (Retensi &gt; 30 Hari)</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Juz Perlu Refresh Segera</span>
              <div className="text-2xl font-extrabold text-amber-700">Juz 29</div>
              <p className="text-[11px] text-slate-500">Terakhir disimak &gt; 7 hari yang lalu</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Rasio Ziyadah : Muroja'ah</span>
              <div className="text-2xl font-extrabold text-[#0070BA]">1 : 3.5</div>
              <p className="text-[11px] text-slate-500">Memenuhi standar kurikulum pesantren</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Kirim Laporan WhatsApp Digest */}
      {isWAModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Format Laporan WhatsApp Wali Santri</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWAModalOpen(false);
                  setWaSendFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {waSendFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{waSendFeedback}</span>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Teks ringkasan progres santri siap kirim ke Wali ({santri.parentName || 'Wali Santri'} - {santri.parentPhone || 'No WA belum ada'}):
            </p>

            <textarea
              readOnly
              value={waDigestMessage}
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
            />

            {/* Info Status 1 Pesan / Hari */}
            {isSentToday && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Laporan hari ini sudah terkirim ke wali pada <strong>{santri.lastDailyReportSentTime || 'Hari ini'}</strong>.</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyWADigest}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                {copyFeedback ? 'Tersalin ke Clipboard!' : 'Salin Teks'}
              </button>

              <div className="flex items-center gap-2">
                {santri.parentPhone && (
                  <a
                    href={waGatewayService.getDirectWALink(santri.parentPhone, waDigestMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                  >
                    <span>Direct WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {isSentToday ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSendingGateway || !santri.parentPhone}
                    onClick={() => handleSendViaGateway(true)}
                    className="text-xs border-[#0070BA] text-[#0070BA] hover:bg-[#EBF5FB] flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingGateway ? 'Mengirim...' : 'Kirim Ulang'}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isSendingGateway || !santri.parentPhone}
                    onClick={() => handleSendViaGateway(false)}
                    className="text-xs bg-[#0070BA] hover:bg-[#005C9E] text-white flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingGateway ? 'Mengirim...' : 'Kirim Laporan Harian (Fonnte)'}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
