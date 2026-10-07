import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  History, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Send, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Edit2, 
  Clock, 
  Printer,
  Trash2,
  Calendar,
  ArrowRightLeft,
  UserX
} from 'lucide-react';
import gsap from 'gsap';
import type { Santri, SetoranRecord } from './types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storageService, EVENT_DATA_CHANGED, getTodayDateKey } from '../../services/storageService';
import { resolveHalaqahUUID } from '../../services/syncService';
import { waGatewayService } from '../../services/waGatewayService';
import { EditWaliModal } from './EditWaliModal';
import { RaporPrintModal } from './RaporPrintModal';
import { EditSetoranModal } from './EditSetoranModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { formatJuz } from '@/lib/utils';

type DateFilterRange = 'semua' | 'hari_ini' | 'pekan_ini' | 'bulan_ini' | 'custom';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'riwayat'>('overview');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Real Setoran records state
  const [records, setRecords] = useState<SetoranRecord[]>(() => storageService.getSetoranBySantriId(santri.id));
  const [setoranFilter, setSetoranFilter] = useState<'all' | 'ziyadah' | 'murojaah'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterRange>('semua');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Editing & Deleting record state
  const [editingRecord, setEditingRecord] = useState<SetoranRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SetoranRecord | null>(null);

  // WA Digest Modal State
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  // Edit Wali Contact Modal State
  const [currentSantri, setCurrentSantri] = useState<Santri>(santri);
  const [isEditWaliModalOpen, setIsEditWaliModalOpen] = useState(false);
  const [isRaporModalOpen, setIsRaporModalOpen] = useState(false);

  // Pindah Halaqoh & Hapus Santri Modal State
  const [isMoveHalaqahModalOpen, setIsMoveHalaqahModalOpen] = useState(false);
  const [isDeleteSantriModalOpen, setIsDeleteSantriModalOpen] = useState(false);
  const [selectedTargetHalaqah, setSelectedTargetHalaqah] = useState(santri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq');

  useEffect(() => {
    setCurrentSantri(santri);
    setSelectedTargetHalaqah(santri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq');
  }, [santri]);

  const handleConfirmMoveHalaqah = () => {
    if (!selectedTargetHalaqah) return;
    const targetUUID = resolveHalaqahUUID(selectedTargetHalaqah);
    const updated: Santri = {
      ...currentSantri,
      halaqahName: selectedTargetHalaqah,
      halaqahId: targetUUID,
    };
    storageService.updateSantri(updated);
    setCurrentSantri(updated);
    setIsMoveHalaqahModalOpen(false);
    toast.success('Halaqoh santri berhasil dipindahkan', {
      description: `${currentSantri.name} kini berada di ${selectedTargetHalaqah}.`,
    });
  };

  const handleConfirmDeleteSantri = () => {
    storageService.deleteSantri(currentSantri.id);
    setIsDeleteSantriModalOpen(false);
    toast.success('Data santri berhasil dihapus', {
      description: `${currentSantri.name} telah dihapus dari sistem.`,
    });
    onBack();
  };

  const loadRecords = useCallback(() => {
    setRecords(storageService.getSetoranBySantriId(santri.id));
  }, [santri.id]);

  useEffect(() => {
    const handleDataChanged = () => {
      loadRecords();
      const updated = storageService.getSantriById(santri.id);
      if (updated) {
        setCurrentSantri(updated);
      }
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleDataChanged);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleDataChanged);
  }, [loadRecords, santri.id]);

  // Metrik kalkulasi
  const totalLines = santri.totalLinesMemorized || 1500;
  const totalTarget = 9060;
  const pagesCompleted = (totalLines / 15).toFixed(1);
  const totalPagesTarget = (totalTarget / 15).toFixed(0);
  const percentage = Math.min(100, Math.round((totalLines / totalTarget) * 100));
  const remainingLines = Math.max(0, totalTarget - totalLines);
  const remainingDays = 650;
  const requiredDailyLines = Math.ceil(remainingLines / remainingDays);

  const detailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailContainerRef.current) return;
    const panes = detailContainerRef.current.querySelectorAll('.detail-tab-pane');
    if (!panes || panes.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panes,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }, detailContainerRef);

    return () => ctx.revert();
  }, [activeTab]);

  const today = getTodayDateKey();
  const isSentToday = currentSantri.lastDailyReportSentDate === today;

  // WhatsApp Digest Generator
  const waDigestMessage = useMemo(() => {
    return waGatewayService.buildDailyProgressMessage(currentSantri);
  }, [currentSantri]);

  const handleCopyWADigest = () => {
    navigator.clipboard.writeText(waDigestMessage);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleOpenWADigestDirect = () => {
    if (!currentSantri.parentPhone) return;
    storageService.markDailyReportSent(currentSantri.id);
    const updated = storageService.getSantriById(currentSantri.id);
    if (updated) setCurrentSantri(updated);
    waGatewayService.openDirectWA(currentSantri.parentPhone, waDigestMessage);
  };

  // Kirim record setoran tunggal via WhatsApp (wa.me)
  const handleSendRecordWA = (record: SetoranRecord) => {
    if (!currentSantri.parentPhone) return;
    const messageText = waGatewayService.buildSetoranMessage(record, currentSantri);
    storageService.updateSetoranWAStatus(record.id, 'sent');
    loadRecords();
    waGatewayService.openDirectWA(currentSantri.parentPhone, messageText);
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    const updated = storageService.deleteSetoranRecord(deletingRecord.id, currentSantri.id);
    if (updated) {
      setCurrentSantri(updated);
    }
    loadRecords();
    toast.success('Catatan setoran berhasil dihapus.');
    setDeletingRecord(null);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Filter jenis setoran
      if (setoranFilter !== 'all' && r.type !== setoranFilter) {
        return false;
      }

      // 2. Filter rentang tanggal
      if (dateFilter === 'semua') return true;

      const recordTime = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      if (!recordTime) return true;

      const now = new Date();
      if (dateFilter === 'hari_ini') {
        const todayKey = getTodayDateKey();
        return r.createdAt?.startsWith(todayKey);
      }
      if (dateFilter === 'pekan_ini') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
        return recordTime >= sevenDaysAgo && recordTime <= now.getTime();
      }
      if (dateFilter === 'bulan_ini') {
        const recDate = new Date(recordTime);
        return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'custom') {
        if (!customStartDate) return true;
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = customEndDate ? new Date(customEndDate) : new Date(now);
        end.setHours(23, 59, 59, 999);
        return recordTime >= start.getTime() && recordTime <= end.getTime();
      }

      return true;
    });
  }, [records, setoranFilter, dateFilter, customStartDate, customEndDate]);

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
      subText: 'Perlu tambahan setoran'
    },
    belum_setor: {
      label: 'Belum Setor',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      subText: 'Menunggu giliran talaqqi'
    }
  }[currentSantri.status || 'belum_setor'];

  const StatusIcon = statusConfig.icon;

  return (
    <div ref={detailContainerRef} className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white border border-slate-200 rounded-xl p-2.5 sm:px-4 sm:py-2.5 shadow-xs">
        {/* Tombol Kembali: Selalu Terlihat di Mobile & Desktop */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0070BA] transition-colors group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#EBF5FB] flex items-center justify-center text-slate-600 group-hover:text-[#0070BA] transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Kembali ke Daftar Santri</span>
          <span className="sm:hidden text-xs">Kembali</span>
        </button>

        {/* Action Buttons: Rapi dan Proporsional di Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Pindah Halaqoh */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedTargetHalaqah(currentSantri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq');
              setIsMoveHalaqahModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            title="Pindahkan Santri ke Halaqoh Lain"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">Pindah Halaqoh</span>
            <span className="sm:hidden">Pindah</span>
          </Button>

          {/* Cetak / Rapor PDF */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsRaporModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            title="Cetak Rapor Santri"
          >
            <Printer className="w-3.5 h-3.5 text-[#0070BA] shrink-0" />
            <span className="hidden sm:inline">Cetak PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          {/* Laporan WA */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsWAModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            title="Kirim Laporan WhatsApp ke Wali"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Laporan WA</span>
            <span className="sm:hidden">WA</span>
          </Button>

          {/* Input Setoran */}
          <Button
            type="button"
            onClick={() => onSetor(santri)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold h-8.5 sm:h-9 px-2.5 sm:px-3.5 bg-[#0070BA] hover:bg-[#005C9E] active:scale-[0.97] transition-all text-white rounded-lg shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Setor</span>
          </Button>

          {/* Hapus Santri */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteSantriModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold h-8.5 sm:h-9 px-2 sm:px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg cursor-pointer"
            title="Hapus Data Santri"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="hidden sm:inline">Hapus Santri</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Profile Banner - Clean Enterprise Layout */}
      <Card className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Info Utama Santri */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-2xs">
              {currentSantri.avatarInitials}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {currentSantri.name}
                </h1>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
                  NIS {currentSantri.nis}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${statusConfig.badgeClass}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusConfig.label}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <span>Halaqoh: <strong className="text-slate-700 font-semibold">{currentSantri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Wali: <strong className="text-slate-700 font-semibold">{currentSantri.parentName || 'Belum diisi'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Terakhir: <strong className="text-slate-700 font-semibold">{currentSantri.lastSurah || '-'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 sm:p-2.5 text-center min-w-0">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Total Capaian</span>
              <span className="text-xs sm:text-base font-bold text-[#0070BA] block mt-0.5 truncate">{formatJuz(currentSantri.juzAchieved)}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">~{pagesCompleted} Hal</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 sm:p-2.5 text-center min-w-0">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Hari Ini</span>
              <span className="text-xs sm:text-base font-bold text-slate-900 block mt-0.5 truncate">
                {santri.linesCompletedToday}
                <span className="text-[9px] sm:text-xs font-normal text-slate-400">/{santri.dailyTargetLines}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">baris</span>
            </div>

            <div className={`border rounded-lg p-2 sm:p-2.5 text-center min-w-0 ${
              santri.status === 'tercapai'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : santri.status === 'tidak_tercapai'
                ? 'bg-red-50/70 border-red-200 text-red-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}>
              <span className="text-[10px] sm:text-[11px] font-medium opacity-80 block truncate">Mutaba'ah</span>
              <span className="text-[11px] sm:text-xs font-bold block mt-0.5 truncate">
                {santri.status === 'tercapai' && '92% Mumtaz'}
                {santri.status === 'tidak_tercapai' && 'Perlu I\'adah'}
                {santri.status === 'belum_setor' && 'Belum Setor'}
              </span>
              <span className="hidden sm:block text-[9px] sm:text-[10px] opacity-75 truncate">
                {statusConfig.subText}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Sub-Navigation Tabs (Grid 2 Kolom Responsif Tanpa Scrollbar di Mobile) */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-1 sm:px-3 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 sm:px-3.5 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'overview'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Ringkasan &amp; Pacing</span>
            <span className="sm:hidden text-[11px] truncate">Ringkasan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 px-1 sm:px-3.5 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'riwayat'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Riwayat Setoran ({records.length})</span>
            <span className="sm:hidden text-[11px] truncate">Riwayat ({records.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Ringkasan & Pacing */}
      {activeTab === 'overview' && (
        <div className="detail-tab-pane space-y-4">
          {/* Card A: Progres Kurikulum 30 Juz */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Progres Target 30 Juz
                </h3>
                <p className="text-xs text-slate-500">
                  Akumulasi capaian terhadap kurikulum khatam pesantren
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusConfig.badgeClass}`}>
                {santri.status === 'tercapai' ? 'On Track' : 'Dalam Bimbingan'}
              </span>
            </div>

            {/* Progress Bar Baris */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>{totalLines.toLocaleString()} dari {totalTarget.toLocaleString()} Baris ({pagesCompleted} / {totalPagesTarget} Hal)</span>
                <span className="text-[#0070BA] font-bold">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#0070BA] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* 4 Metrik Pacing */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Sisa Target</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{remainingLines.toLocaleString()} Baris</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Target Harian</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{santri.dailyTargetLines} Baris</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Est. Waktu Khatam</span>
                <span className="text-sm font-bold text-[#0070BA] mt-0.5 block">~{remainingDays} Hari</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Kebutuhan Laju</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{requiredDailyLines} Baris/Hari</span>
              </div>
            </div>
          </div>

          {/* Section B: 2-Kolom Seimbang */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Kolom Kiri: Panduan & Rekomendasi Sesi */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="pb-2.5 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Rekomendasi Tindakan Sesi
                </h3>
                <p className="text-xs text-slate-500">
                  Fokus talaqqi dan pengulangan berikutnya
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Ziyadah Card */}
                <div className="p-3 rounded-lg border border-blue-100 bg-[#F4F9FD] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#0070BA] px-1.5 py-0.5 rounded">
                      Ziyadah
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">
                      {santri.status === 'tercapai' ? 'Lanjutkan Ayat Baru Besok Pagi' : 'Tuntaskan Target Sesi Sore'}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {santri.status === 'tercapai'
                        ? `Kunci hafalan ${santri.lastSurah} dengan tasmi' mandiri 2x.`
                        : `Defisit ${Math.max(0, santri.dailyTargetLines - santri.linesCompletedToday)} baris. Berikan slot sesi khusus.`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="w-full sm:w-auto text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white shrink-0 h-8 px-3 rounded-lg cursor-pointer"
                  >
                    Setor
                  </Button>
                </div>

                {/* Muroja'ah Card */}
                <div className="p-3 rounded-lg border border-amber-100 bg-[#FFFDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Muroja'ah
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">
                      Ulangi Juz 29 (Hal. 562–564)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Halaman ini perlu disimak ulang untuk menjaga kelancaran mutqin.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="w-full sm:w-auto text-xs font-semibold border-amber-200 text-amber-800 hover:bg-amber-50 shrink-0 h-8 px-3 rounded-lg cursor-pointer"
                  >
                    Simak
                  </Button>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Kontak Wali & Retensi */}
            <div className="space-y-4">
              {/* Kontak Wali Santri */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Kontak Wali Santri</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditWaliModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0070BA] hover:text-[#005C9E] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Kontak</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Nama Wali / Orang Tua:</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{currentSantri.parentName || 'Belum diisi'}</span>
                    </div>
                    <span className="self-start sm:self-auto font-mono text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentSantri.parentPhone || 'No WA belum ada'}
                    </span>
                  </div>

                  {isSentToday ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Laporan hari ini terkirim ({currentSantri.lastDailyReportSentTime || 'Hari ini'})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Laporan harian belum dikirimkan hari ini</span>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Kirim */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {currentSantri.parentPhone ? (
                    <a
                      href={waGatewayService.getDirectWALink(currentSantri.parentPhone, `Assalamu'alaikum Bpk/Ibu ${currentSantri.parentName || ''}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat WA</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Chat WA</span>
                    </button>
                  )}

                  <Button
                    type="button"
                    onClick={() => setIsWAModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isSentToday ? 'Kirim Ulang' : 'Kirim Laporan WA'}</span>
                  </Button>
                </div>
              </div>

              {/* Retensi Hafalan */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">
                    Kualitas Retensi Hafalan
                  </h3>
                  <span className="text-[11px] text-slate-400">Analisis Muroja'ah</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Kekuatan Retensi</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">88.4%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Perlu Refresh</span>
                    <span className="text-sm font-bold text-amber-700 mt-0.5 block">Juz 29</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Rasio Z : M</span>
                    <span className="text-sm font-bold text-[#0070BA] mt-0.5 block">1 : 3.5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Riwayat Setoran */}
      {activeTab === 'riwayat' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Log Riwayat Setoran
              </h3>
              <p className="text-xs text-slate-500">
                Daftar rekaman talaqqi harian santri
              </p>
            </div>

            {/* Filter Jenis Setoran */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSetoranFilter('all')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  setoranFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setSetoranFilter('ziyadah')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  setoranFilter === 'ziyadah'
                    ? 'bg-white text-[#0070BA] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ziyadah ({records.filter(r => r.type === 'ziyadah').length})
              </button>
              <button
                type="button"
                onClick={() => setSetoranFilter('murojaah')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  setoranFilter === 'murojaah'
                    ? 'bg-white text-amber-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Muroja'ah ({records.filter(r => r.type === 'murojaah').length})
              </button>
            </div>
          </div>

          {/* Sub Toolbar: Filter Rentang Tanggal */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-600 inline-flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Periode:
              </span>
              {(
                [
                  { id: 'semua', label: 'Semua Waktu' },
                  { id: 'hari_ini', label: 'Hari Ini' },
                  { id: 'pekan_ini', label: '7 Hari Terakhir' },
                  { id: 'bulan_ini', label: 'Bulan Ini' },
                  { id: 'custom', label: 'Kustom' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDateFilter(preset.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    dateFilter === preset.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-1.5 pt-1 lg:pt-0">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-7 px-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-7 px-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
                />
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-medium">
              Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{records.length}</strong> sesi
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Riwayat Setoran</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Santri belum memiliki catatan setoran pada filter yang dipilih.
              </p>
              <Button
                onClick={() => onSetor(santri)}
                className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs cursor-pointer"
              >
                Input Setoran Sekarang
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Waktu Sesi</th>
                      <th className="py-2.5 px-3">Jenis</th>
                      <th className="py-2.5 px-3">Surah &amp; Posisi</th>
                      <th className="py-2.5 px-3">Jumlah Baris</th>
                      <th className="py-2.5 px-3">Mutu Kelancaran</th>
                      <th className="py-2.5 px-3">Status WA</th>
                      <th className="py-2.5 px-3 text-right">Aksi &amp; Koreksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                          {r.formattedDate}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
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
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{r.surahName}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Juz {r.juz} • Hal. {r.pageStart === r.pageEnd ? r.pageStart : `${r.pageStart}–${r.pageEnd}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0070BA] whitespace-nowrap">
                          {r.totalLines} Baris
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {r.grade === 'mumtaz' && (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              MUMTAZ
                            </span>
                          )}
                          {r.grade === 'jayyid' && (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              JAYYID
                            </span>
                          )}
                          {r.grade === 'iadah' && (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              I'ADAH
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {r.waStatus === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" />
                              <span>Terkirim</span>
                            </span>
                          ) : r.waStatus === 'failed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              <XCircle className="w-3 h-3" />
                              <span>Gagal</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Belum Terkirim
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Koreksi / Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingRecord(r)}
                              className="p-1 rounded text-slate-500 hover:text-[#0070BA] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Koreksi / Edit catatan setoran"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => setDeletingRecord(r)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus rekaman setoran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Kirim WA */}
                            <button
                              type="button"
                              disabled={!currentSantri.parentPhone}
                              onClick={() => handleSendRecordWA(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Kirim catatan setoran via WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-2.5">
                {filteredRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {r.type === 'ziyadah' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-[#0070BA] border border-blue-200">
                            ZIYADAH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                            MUROJA'AH
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{r.formattedDate}</span>
                      </div>
                      <span className="font-bold text-xs text-[#0070BA]">{r.totalLines} Baris</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{r.surahName}</span>
                        <span className="text-[10px] text-slate-400">Juz {r.juz} • Hal. {r.pageStart === r.pageEnd ? r.pageStart : `${r.pageStart}–${r.pageEnd}`}</span>
                      </div>
                      <div>
                        {r.grade === 'mumtaz' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            MUMTAZ
                          </span>
                        )}
                        {r.grade === 'jayyid' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            JAYYID
                          </span>
                        )}
                        {r.grade === 'iadah' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            I'ADAH
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
                      <div>
                        {r.waStatus === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>WA Terkirim</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">WA Belum Terkirim</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRecord(r)}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:text-[#0070BA] transition-colors"
                          title="Edit setoran"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRecord(r)}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus setoran"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={!currentSantri.parentPhone}
                          onClick={() => handleSendRecordWA(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Kirim catatan setoran via WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}



      {/* 7. MODAL: Kirim Laporan WhatsApp Digest */}
      <Dialog open={isWAModalOpen} onOpenChange={setIsWAModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-5 rounded-xl sm:rounded-2xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Format Laporan WhatsApp Wali Santri</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 text-left pt-1">
              Teks ringkasan progres santri siap kirim ke Wali ({currentSantri.parentName || 'Wali Santri'} - {currentSantri.parentPhone || 'No WA belum diisi'}):
            </DialogDescription>
          </DialogHeader>

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
                <span>Laporan hari ini sudah ditandai terkirim ({currentSantri.lastDailyReportSentTime || 'Hari ini'}).</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopyWADigest}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer text-center"
            >
              {copyFeedback ? 'Tersalin ke Clipboard!' : 'Salin Teks'}
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              {currentSantri.parentPhone ? (
                <Button
                  type="button"
                  onClick={handleOpenWADigestDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <span>Buka WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsWAModalOpen(false);
                    setIsEditWaliModalOpen(true);
                  }}
                  className="w-full sm:w-auto text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Atur No. HP Wali Dulu
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 8. MODAL: Edit Kontak Wali Santri */}
      <EditWaliModal
        isOpen={isEditWaliModalOpen}
        onClose={() => setIsEditWaliModalOpen(false)}
        santri={currentSantri}
        onSuccess={(updated) => setCurrentSantri(updated)}
      />

      {/* 9. MODAL: Rapor Resmi Santri (Siap Cetak / Ekspor PDF Langsung) */}
      <RaporPrintModal
        isOpen={isRaporModalOpen}
        onClose={() => setIsRaporModalOpen(false)}
        santri={currentSantri}
        records={records}
        periodLabel="Bulan Berjalan"
      />

      {/* 10. MODAL: Koreksi / Edit Catatan Setoran */}
      <EditSetoranModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        santriName={currentSantri.name}
        onSuccess={(updated) => {
          setCurrentSantri(updated);
          loadRecords();
        }}
      />

      {/* 11. MODAL: Konfirmasi Hapus Catatan Setoran */}
      <Dialog open={Boolean(deletingRecord)} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left pb-2">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
                <Trash2 className="w-4 h-4" />
              </span>
              <span>Hapus Catatan Setoran?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              <p>
                Anda akan menghapus rekaman setoran berikut:
              </p>
              {deletingRecord && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Waktu Sesi:</span>
                    <span className="font-semibold">{deletingRecord.formattedDate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Materi:</span>
                    <span className="font-bold text-[#0070BA]">{deletingRecord.surahName} (Juz {deletingRecord.juz})</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Capaian:</span>
                    <span>{deletingRecord.totalLines} Baris ({deletingRecord.type.toUpperCase()})</span>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                ⚠️ Akumulasi total hafalan dan capaian harian santri akan otomatis dihitung ulang secara akurat.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingRecord(null)}
              className="text-xs h-9 px-4 border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="text-xs h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
            >
              Ya, Hapus Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 12. MODAL: Pindahkan Santri ke Halaqoh Lain */}
      <Dialog open={isMoveHalaqahModalOpen} onOpenChange={setIsMoveHalaqahModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left pb-2">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EBF5FB] text-[#0070BA]">
                <ArrowRightLeft className="w-4 h-4" />
              </span>
              <span>Pindahkan Santri ke Halaqoh Lain</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              <p>
                Pindahkan data santri <strong className="text-slate-800">{currentSantri.name}</strong> (NIS: {currentSantri.nis}) ke kelompok halaqoh lain.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="text-slate-500 block">Halaqoh Saat Ini:</span>
                <span className="font-bold text-[#0070BA] block">{currentSantri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq'}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Pilih Halaqoh Tujuan:
            </label>
            <select
              value={selectedTargetHalaqah}
              onChange={(e) => setSelectedTargetHalaqah(e.target.value)}
              className="w-full h-9.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 shadow-xs hover:border-slate-400 focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 cursor-pointer transition-all"
            >
              {storageService.getHalaqahList().map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name} {h.room ? `(${h.room})` : ''}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMoveHalaqahModalOpen(false)}
              className="text-xs h-9 px-4 border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmMoveHalaqah}
              className="text-xs h-9 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold shadow-xs"
            >
              Pindahkan Santri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 13. MODAL: Konfirmasi Hapus Data Santri */}
      <Dialog open={isDeleteSantriModalOpen} onOpenChange={setIsDeleteSantriModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left pb-2">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
                <UserX className="w-4 h-4" />
              </span>
              <span>Hapus Data Santri Ini?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus santri <strong className="text-slate-900">{currentSantri.name}</strong> (NIS: {currentSantri.nis})?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs space-y-1">
                <p className="font-bold">Peringatan Tindakan Permanen:</p>
                <p>Seluruh riwayat setoran hafalan dan data mutaba'ah santri ini akan dihapus dari sistem.</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteSantriModalOpen(false)}
              className="text-xs h-9 px-4 border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeleteSantri}
              className="text-xs h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
            >
              Ya, Hapus Santri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
