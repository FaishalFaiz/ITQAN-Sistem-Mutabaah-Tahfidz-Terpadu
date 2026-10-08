import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { 
  UserPlus, 
  Search, 
  MessageSquare, 
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  SlidersHorizontal,
  BookOpen,
  Target,
  Users,
} from 'lucide-react';
import { PacingCard } from '../visualization/PacingCard';
import { LaporanPage } from './LaporanPage';
import { PengaturanView } from './PengaturanView';
import { EditWaliModal } from './EditWaliModal';
import { EditTargetModal } from './EditTargetModal';
import { whatsappService } from '../../services/whatsappService';
import { storageService } from '../../services/storageService';
import { formatJuz } from '@/lib/utils';
import type { NavItemKey, Santri } from './types';
import { HalaqahManagementPage } from './HalaqahManagementPage';

interface OtherViewProps {
  currentView: NavItemKey;
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
  onOpenAddModal: () => void;
}

export const OtherView: React.FC<OtherViewProps> = ({
  currentView,
  santriList,
  onSetor,
  onDetail,
  onOpenAddModal,
}) => {
  const [santriSearch, setSantriSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor'>('all');
  const [halaqahFilter, setHalaqahFilter] = useState<string>('all');
  const [editingWaliSantri, setEditingWaliSantri] = useState<Santri | null>(null);
  const [editingTargetSantri, setEditingTargetSantri] = useState<Santri | null>(null);
  const [santriSubTab, setSantriSubTab] = useState<'kontak' | 'target'>('kontak');

  // Smooth Tab Transition Animation
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, scale: 0.975, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }
  }, [santriSubTab]);

  // Ambil daftar halaqoh yang boleh diakses akun musyrif ini
  const myHalaqahs = storageService.getUserHalaqahList();
  const myHalaqahNames = new Set(myHalaqahs.map((h) => h.name.toLowerCase()));
  const myHalaqahIds = new Set(myHalaqahs.map((h) => h.id));

  // Filter santri: HANYA santri di halaqoh yang diikuti oleh musyrif ini
  const accessibleSantri = santriList.filter((s) => {
    if (s.halaqahId && myHalaqahIds.has(s.halaqahId)) return true;
    if (s.halaqahName && myHalaqahNames.has(s.halaqahName.toLowerCase())) return true;
    return false;
  });

  const halaqahSantri = halaqahFilter === 'all'
    ? accessibleSantri
    : accessibleSantri.filter((s) => {
        const sH = (s.halaqahName || '').toLowerCase();
        return sH === halaqahFilter.toLowerCase() || s.halaqahId === halaqahFilter;
      });

  const countTercapai = halaqahSantri.filter((s) => s.status === 'tercapai').length;
  const countTidak = halaqahSantri.filter((s) => s.status === 'tidak_tercapai').length;
  const countBelum = halaqahSantri.filter((s) => s.status === 'belum_setor').length;

  const filteredSantri = halaqahSantri.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(santriSearch.toLowerCase()) ||
      s.nis.includes(santriSearch) ||
      s.lastSurah.toLowerCase().includes(santriSearch.toLowerCase()) ||
      (s.halaqahName && s.halaqahName.toLowerCase().includes(santriSearch.toLowerCase())) ||
      (s.parentName && s.parentName.toLowerCase().includes(santriSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {currentView === 'halaqah' && (
        <HalaqahManagementPage />
      )}

      {currentView === 'laporan' && (
        <LaporanPage
          santriList={accessibleSantri}
          onSetor={onSetor}
          onDetail={onDetail}
        />
      )}

      {currentView === 'santri' && (
        <div className="space-y-4">
          {/* Header Card: Title, Switcher Tabs, & Tambah Santri */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-snug">
                  Manajemen Santri &amp; Target Hafalan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola data santri, kontak wali, dan pengaturan target hafalan kurikulum halaqoh
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] active:scale-[0.98] text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Tambah Santri</span>
              </button>
            </div>

            {/* Sub-tab Switcher: Informasi & Kontak vs Target Hafalan */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto sm:inline-flex">
              <button
                type="button"
                onClick={() => setSantriSubTab('kontak')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  santriSubTab === 'kontak'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Informasi &amp; Kontak Santri</span>
              </button>
              <button
                type="button"
                onClick={() => setSantriSubTab('target')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  santriSubTab === 'target'
                    ? 'bg-white text-[#0070BA] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-4 h-4 text-[#0070BA]" />
                <span>Target Hafalan &amp; Pacing ({halaqahSantri.length})</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={santriSearch}
                onChange={(e) => setSantriSearch(e.target.value)}
                placeholder="Cari santri, wali, nomor WA, atau NIS..."
                className="w-full text-xs pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 transition-all"
              />
            </div>
          </div>

          {/* Sub-tab Content with Smooth Extend & Shrink Animation */}
          <div ref={tabContentRef} className="space-y-4">
            {/* TAB 1: INFORMASI & KONTAK WALI */}
            {santriSubTab === 'kontak' && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-6 shadow-xs space-y-4">
              {/* Status & Halaqoh Filter Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    Semua <span className="ml-1 opacity-75 font-mono text-[11px]">{halaqahSantri.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('tercapai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'tercapai'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Tercapai <span className="ml-1 opacity-75 font-mono text-[11px]">{countTercapai}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('tidak_tercapai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'tidak_tercapai'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 border border-red-200 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    Defisit <span className="ml-1 opacity-75 font-mono text-[11px]">{countTidak}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('belum_setor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'belum_setor'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Belum Setor <span className="ml-1 opacity-75 font-mono text-[11px]">{countBelum}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 whitespace-nowrap">Filter Halaqoh:</span>
                  <select
                    value={halaqahFilter}
                    onChange={(e) => setHalaqahFilter(e.target.value)}
                    className="h-9 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 shadow-xs hover:border-slate-400 cursor-pointer focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 transition-all"
                  >
                    <option value="all">Semua Halaqoh</option>
                    {storageService.getHalaqahList().map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {santriList.length === 0 ? (
                <div className="text-center py-14 px-4 text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center mx-auto shadow-2xs">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Belum Ada Santri Terdaftar</p>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto text-xs leading-relaxed">
                      Mulai kelola halaqoh Anda dengan mendaftarkan santri pertama. Anda dapat mengelola kontak wali, nomor WhatsApp, serta target hafalan harian.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs rounded-lg cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Santri Pertama</span>
                  </button>
                </div>
              ) : filteredSantri.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-700">Tidak ada santri yang cocok</p>
                  <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau ubah tab filter status.</p>
                </div>
              ) : (
                <>
                  {/* TAMPILAN MOBILE: Box / Kartu per Santri */}
                  <div className="space-y-3 md:hidden">
                    {filteredSantri.map((santri) => {
                      const isTercapai = santri.status === 'tercapai';
                      const isTidakTercapai = santri.status === 'tidak_tercapai';
                      const progressRatio = Math.min(100, Math.round((santri.linesCompletedToday / santri.dailyTargetLines) * 100));

                      return (
                        <div
                          key={santri.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                                #{santri.nis}
                              </span>
                              {isTercapai && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Tercapai</span>
                                </span>
                              )}
                              {isTidakTercapai && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>Defisit</span>
                                </span>
                              )}
                              {!isTercapai && !isTidakTercapai && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Belum Setor</span>
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-bold text-[#0070BA] shrink-0 font-mono">
                              {formatJuz(santri.juzAchieved)}
                            </span>
                          </div>

                          <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                                  {santri.name}
                                </h4>
                                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                  Terakhir: <strong className="text-slate-700">{santri.lastSurah}</strong>
                                </span>
                              </div>
                              <span className="font-mono text-xs font-semibold text-slate-600 shrink-0">
                                {santri.parentPhone || 'No WA Kosong'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                              <span className="truncate">Wali: <strong className="text-slate-700">{santri.parentName || 'Wali Santri'}</strong></span>
                              <button
                                type="button"
                                onClick={() => setEditingWaliSantri(santri)}
                                className="inline-flex items-center gap-1 text-[#0070BA] font-semibold hover:underline shrink-0 ml-2"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold tracking-wider text-slate-400 uppercase text-[10px] block">
                                TOTAL SETORAN HARI INI
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingTargetSantri(santri)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] hover:underline cursor-pointer"
                                title="Atur Target Hafalan Santri"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Atur Target</span>
                              </button>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="font-extrabold text-base text-slate-900">
                                  {santri.linesCompletedToday}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  / {santri.dailyTargetLines} Baris
                                </span>
                              </div>
                              <span className={`text-[11px] font-semibold ${
                                isTercapai ? 'text-emerald-600' : isTidakTercapai ? 'text-red-600' : 'text-slate-500'
                              }`}>
                                {isTercapai ? 'Target Terpenuhi' : `Kurang ${Math.max(0, santri.dailyTargetLines - santri.linesCompletedToday)} baris`}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isTercapai ? 'bg-emerald-500' : isTidakTercapai ? 'bg-red-500' : 'bg-[#0070BA]'
                                }`}
                                style={{ width: `${progressRatio}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => onSetor(santri)}
                              className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
                            >
                              <BookOpen className="w-4 h-4 shrink-0" />
                              <span>Setor</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onDetail(santri)}
                              className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
                            >
                              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                              <span>Kelola</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TAMPILAN DESKTOP: Tabel Lengkap Rapi & Terstruktur */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-700 border-collapse">
                      <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 whitespace-nowrap">Nama Santri</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Halaqoh</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">NIS</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Kontak Wali</th>
                          <th className="py-2.5 px-3 whitespace-nowrap text-center">Capaian</th>
                          <th className="py-2.5 px-3 whitespace-nowrap text-center">Target Hari Ini</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Terakhir</th>
                          <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                          <th className="py-2.5 px-3 whitespace-nowrap text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSantri.map((santri) => (
                          <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Nama Santri */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] font-bold text-[10px] flex items-center justify-center shrink-0 select-none shadow-2xs">
                                  {santri.avatarInitials}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onDetail(santri)}
                                  className="font-bold text-xs text-slate-900 hover:text-[#0070BA] transition-colors cursor-pointer text-left"
                                >
                                  {santri.name}
                                </button>
                              </div>
                            </td>

                            {/* Halaqoh (Anti-Wrap Pill) */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 whitespace-nowrap">
                                {santri.halaqahName?.replace('Halaqoh ', '') || 'Abu Bakar'}
                              </span>
                            </td>

                            {/* NIS */}
                            <td className="py-2.5 px-3 font-mono text-xs font-medium text-slate-600 whitespace-nowrap">
                              {santri.nis}
                            </td>

                            {/* Kontak Wali (WA) */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {santri.parentPhone ? (
                                  <a
                                    href={whatsappService.getDirectWALink(
                                      santri.parentPhone,
                                      `Assalamu'alaikum Bpk/Ibu ${santri.parentName || ''}`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold group hover:underline max-w-[140px] truncate"
                                    title={`Kirim WA ke ${santri.parentName || 'Wali'} (${santri.parentPhone})`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{santri.parentName || 'Wali'}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">Belum diisi</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingWaliSantri(santri)}
                                  className="p-1 rounded text-slate-400 hover:text-[#0070BA] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                                  title="Ubah Kontak Wali"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Capaian Juz */}
                            <td className="py-2.5 px-3 font-bold text-xs text-[#0070BA] whitespace-nowrap text-center font-mono">
                              {formatJuz(santri.juzAchieved)}
                            </td>

                            {/* Target Hari Ini */}
                            <td className="py-2.5 px-3 whitespace-nowrap text-center">
                              <div className="inline-flex items-center justify-center gap-1">
                                <div>
                                  <span className="font-bold text-xs text-slate-900 font-mono">
                                    {santri.linesCompletedToday} / {santri.dailyTargetLines}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium ml-0.5">Baris</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingTargetSantri(santri)}
                                  className="p-0.5 rounded text-slate-400 hover:text-[#0070BA] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                                  title="Ubah Target Hafalan Santri"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Terakhir Setor */}
                            <td className="py-2.5 px-3 text-xs text-slate-700 font-medium whitespace-nowrap max-w-[140px] truncate" title={santri.lastSurah || '-'}>
                              {santri.lastSurah || '-'}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 whitespace-nowrap text-center">
                              {santri.status === 'tercapai' && (
                                <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Tercapai</span>
                                </span>
                              )}
                              {santri.status === 'tidak_tercapai' && (
                                <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>Defisit</span>
                                </span>
                              )}
                              {santri.status === 'belum_setor' && (
                                <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Belum Setor</span>
                                </span>
                              )}
                            </td>

                            {/* Aksi */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onSetor(santri)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white cursor-pointer shadow-2xs transition-colors active:scale-[0.98]"
                                >
                                  Setor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDetail(santri)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs transition-colors active:scale-[0.98]"
                                >
                                  Kelola
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: TARGET HAFALAN & PACING CARDS */}
          {santriSubTab === 'target' && (
            <div className="space-y-4">
              {/* Filter Bar: Status Pacing & Filter Halaqoh */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    Semua Target <span className="ml-1 opacity-75 font-mono text-[11px]">{halaqahSantri.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('tercapai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'tercapai'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    On Track <span className="ml-1 opacity-75 font-mono text-[11px]">{countTercapai}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('tidak_tercapai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'tidak_tercapai'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 border border-red-200 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    Defisit <span className="ml-1 opacity-75 font-mono text-[11px]">{countTidak}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('belum_setor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === 'belum_setor'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Belum Setor <span className="ml-1 opacity-75 font-mono text-[11px]">{countBelum}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Filter Halaqoh:</span>
                  <select
                    value={halaqahFilter}
                    onChange={(e) => setHalaqahFilter(e.target.value)}
                    className="h-9 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 shadow-xs hover:border-slate-400 cursor-pointer focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 transition-all"
                  >
                    <option value="all">Semua Halaqoh</option>
                    {storageService.getHalaqahList().map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informative Banner when specific halaqoh filtered */}
              {halaqahFilter !== 'all' && (
                <div className="bg-[#EBF5FB] border border-[#0070BA]/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-bold text-[#0070BA]">{halaqahFilter}</span>
                    <span className="text-slate-400">•</span>
                    <span>Menampilkan <strong>{filteredSantri.length}</strong> santri pada tab target &amp; pacing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHalaqahFilter('all')}
                    className="text-[11px] font-semibold text-[#0070BA] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua Halaqoh
                  </button>
                </div>
              )}

              {santriList.length === 0 ? (
                <div className="text-center py-14 px-4 text-slate-500 text-xs bg-white rounded-xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center mx-auto shadow-2xs">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Target Pacing Belum Tersedia</p>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto text-xs leading-relaxed">
                      Setelah santri didaftarkan, Anda dapat memantau kalkulasi kurikulum 30 juz dan target capaian harian santri di sini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs rounded-lg cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftarkan Santri Sekarang</span>
                  </button>
                </div>
              ) : filteredSantri.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 text-xs bg-white rounded-xl border border-dashed border-slate-200 space-y-3">
                  <p className="font-bold text-slate-800 text-sm">Tidak Ada Santri yang Cocok</p>
                  <p className="max-w-md mx-auto text-slate-500">
                    {halaqahFilter !== 'all'
                      ? `Tidak ada santri di ${halaqahFilter} yang sesuai dengan filter atau kata kunci saat ini.`
                      : 'Coba sesuaikan kata kunci pencarian Anda untuk melihat target hafalan santri.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredSantri.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#0070BA]/40 transition-all"
                    >
                      {/* Kartu Pacing Kurikulum */}
                      <PacingCard
                        santriName={s.name}
                        nis={s.nis}
                        halaqahName={s.halaqahName}
                        totalLinesMemorized={s.totalLinesMemorized || 0}
                        totalLinesTarget={s.totalLinesTarget || 9060}
                        daysRemaining={650}
                        dailyTargetLines={s.dailyTargetLines || 15}
                        linesCompletedToday={s.linesCompletedToday || 0}
                        status={s.status === 'tercapai' ? 'on_track' : 'behind'}
                      />

                      {/* Tombol Aksi Target & Setoran */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditingTargetSantri(s)}
                          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5 text-[#0070BA]" />
                          <span>Atur Target</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onDetail(s)}
                            className="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition-colors cursor-pointer"
                          >
                            Rapor
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetor(s)}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Setor</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {currentView === 'pengaturan' && (
        <PengaturanView />
      )}

      {/* Modal Edit Kontak Wali Santri */}
      <EditWaliModal
        isOpen={Boolean(editingWaliSantri)}
        onClose={() => setEditingWaliSantri(null)}
        santri={editingWaliSantri}
      />

      {/* Modal Atur Target Hafalan Santri */}
      <EditTargetModal
        isOpen={Boolean(editingTargetSantri)}
        onClose={() => setEditingTargetSantri(null)}
        santri={editingTargetSantri}
      />
    </div>
  );
};
