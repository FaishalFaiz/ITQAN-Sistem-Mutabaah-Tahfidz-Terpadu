import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  MessageSquare, 
  ExternalLink, 
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { PacingCard } from '../visualization/PacingCard';
import { LaporanPage } from './LaporanPage';
import { PengaturanView } from './PengaturanView';
import { EditWaliModal } from './EditWaliModal';
import { waGatewayService } from '../../services/waGatewayService';
import type { NavItemKey, Santri } from './types';

interface OtherViewProps {
  currentView: NavItemKey;
  onBackToBeranda: () => void;
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
  onOpenAddModal: () => void;
}

export const OtherView: React.FC<OtherViewProps> = ({
  currentView,
  onBackToBeranda,
  santriList,
  onSetor,
  onDetail,
  onOpenAddModal,
}) => {
  const [santriSearch, setSantriSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor'>('all');
  const [editingWaliSantri, setEditingWaliSantri] = useState<Santri | null>(null);

  const countTercapai = santriList.filter((s) => s.status === 'tercapai').length;
  const countTidak = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const countBelum = santriList.filter((s) => s.status === 'belum_setor').length;

  const filteredSantri = santriList.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(santriSearch.toLowerCase()) ||
      s.nis.includes(santriSearch) ||
      s.lastSurah.toLowerCase().includes(santriSearch.toLowerCase()) ||
      (s.parentName && s.parentName.toLowerCase().includes(santriSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <button
          onClick={onBackToBeranda}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#0070BA] transition-colors group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#EBF5FB] flex items-center justify-center text-slate-600 group-hover:text-[#0070BA] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      {currentView === 'laporan' && (
        <LaporanPage
          santriList={santriList}
          onSetor={onSetor}
          onDetail={onDetail}
        />
      )}

      {currentView === 'santri' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-6 shadow-xs space-y-4">
          {/* Header Title & Add Button */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Data Santri &amp; Kontak Wali</h3>
              <p className="text-xs text-slate-500">
                Total {santriList.length} santri tercatat dalam rombel halaqoh
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] text-xs font-semibold transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Santri</span>
            </button>
          </div>

          {/* Status Filter Chips (Persis seperti referensi) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Semua <span className="ml-1 opacity-75 font-mono text-[11px]">{santriList.length}</span>
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

          {filteredSantri.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
              <p className="text-sm font-semibold text-slate-700">Tidak ada santri yang cocok</p>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau ubah tab filter status.</p>
            </div>
          ) : (
            <>
              {/* TAMPILAN MOBILE: Box / Kartu per Santri (Sesuai Referensi Gambar, Tanpa Scroll Horizontal) */}
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
                      {/* 1. Header Box: NIS Badge, Status Badge, Capaian */}
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
                          {santri.juzAchieved}
                        </span>
                      </div>

                      {/* 2. Body Box (Kotak Abu-Abu Lembut): Info Santri & Kontak */}
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

                      {/* 3. Section Total Setoran Hari Ini */}
                      <div className="space-y-1">
                        <span className="font-bold tracking-wider text-slate-400 uppercase text-[10px] block">
                          TOTAL SETORAN HARI INI
                        </span>
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
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isTercapai ? 'bg-emerald-500' : isTidakTercapai ? 'bg-red-500' : 'bg-[#0070BA]'
                            }`}
                            style={{ width: `${progressRatio}%` }}
                          />
                        </div>
                      </div>

                      {/* 4. Footer 2 Tombol Aksi Lebar */}
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

              {/* TAMPILAN DESKTOP: Tabel Lengkap Rapi (Hidden di Mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Nama Santri</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4">Kontak Wali (WA)</th>
                      <th className="py-3 px-4">Capaian Juz</th>
                      <th className="py-3 px-4">Target Hari Ini</th>
                      <th className="py-3 px-4">Terakhir Setor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSantri.map((santri) => (
                      <tr key={santri.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-[#EBF5FB] text-[#0070BA] font-bold text-[11px] flex items-center justify-center shrink-0">
                            {santri.avatarInitials}
                          </span>
                          <span>{santri.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{santri.nis}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {santri.parentPhone ? (
                              <a
                                href={waGatewayService.getDirectWALink(santri.parentPhone, `Assalamu'alaikum Bpk/Ibu ${santri.parentName || ''}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium group"
                                title="Chat WhatsApp Wali"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{santri.parentName}</span>
                                <span className="text-slate-400 font-mono text-[10px]">({santri.parentPhone})</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Belum diisi</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingWaliSantri(santri)}
                              className="p-1 rounded text-slate-400 hover:text-[#0070BA] hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                              title="Edit Kontak Wali Santri"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0070BA]">{santri.juzAchieved}</td>
                        <td className="py-3 px-4">
                          {santri.linesCompletedToday} / {santri.dailyTargetLines} Baris
                        </td>
                        <td className="py-3 px-4 text-slate-600">{santri.lastSurah}</td>
                        <td className="py-3 px-4">
                          {santri.status === 'tercapai' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Tercapai
                            </span>
                          )}
                          {santri.status === 'tidak_tercapai' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                              Tidak Tercapai
                            </span>
                          )}
                          {santri.status === 'belum_setor' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Belum Setor
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onSetor(santri)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-[#0070BA] text-white hover:bg-[#005C9E] cursor-pointer shadow-2xs"
                          >
                            Setor
                          </button>
                          <button
                            type="button"
                            onClick={() => onDetail(santri)}
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                          >
                            Kelola
                          </button>
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

      {currentView === 'pengaturan' && (
        <PengaturanView />
      )}

      {currentView === 'pacing' && (
        santriList.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs bg-white rounded-xl border border-dashed border-slate-200 space-y-3">
            <p className="font-bold text-slate-800 text-sm">Belum Ada Data Target Hafalan Santri</p>
            <p className="max-w-md mx-auto text-slate-500">
              Belum ada santri terdaftar di halaqoh Anda. Tambahkan santri baru untuk mulai memantau laju hafalan (pacing) santri menuju target 30 juz.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0070BA] text-white text-xs font-semibold hover:bg-[#005C9E] cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Santri Baru</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {santriList.map((s) => (
              <PacingCard
                key={s.id}
                santriName={s.name}
                nis={s.nis}
                totalLinesMemorized={s.totalLinesMemorized || 0}
                totalLinesTarget={s.totalLinesTarget || 9060}
                daysRemaining={650}
                dailyTargetLines={s.dailyTargetLines || 15}
                linesCompletedToday={s.linesCompletedToday || 0}
                status={s.status === 'tercapai' ? 'on_track' : 'behind'}
              />
            ))}
          </div>
        )
      )}

      {/* Modal Edit Kontak Wali Santri */}
      <EditWaliModal
        isOpen={Boolean(editingWaliSantri)}
        onClose={() => setEditingWaliSantri(null)}
        santri={editingWaliSantri}
      />
    </div>
  );
};
