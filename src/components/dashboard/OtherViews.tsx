import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Search } from 'lucide-react';
import { TapCounterExam } from '../halaqah/TapCounterExam';
import { PacingCard } from '../visualization/PacingCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LaporanPage } from './LaporanPage';
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

  const filteredSantri = santriList.filter((s) =>
    s.name.toLowerCase().includes(santriSearch.toLowerCase()) ||
    s.nis.includes(santriSearch) ||
    s.lastSurah.toLowerCase().includes(santriSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Return button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onBackToBeranda}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0070BA] hover:text-[#005C9E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Data Santri Halaqoh</h3>
              <p className="text-xs text-slate-500">Total {santriList.length} santri terdaftar aktif</p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={santriSearch}
                  onChange={(e) => setSantriSearch(e.target.value)}
                  placeholder="Cari santri / NIS..."
                  className="w-48 sm:w-56 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
                />
              </div>

              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] text-xs font-semibold transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Santri</span>
              </button>
            </div>
          </div>

          {/* Santri Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Santri</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Capaian Juz</th>
                  <th className="py-3 px-4">Target / Hari</th>
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
                    <td className="py-3 px-4 font-bold text-[#0070BA]">{santri.juzAchieved}</td>
                    <td className="py-3 px-4">{santri.dailyTargetLines} Baris</td>
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
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#0070BA] text-white hover:bg-[#005C9E]"
                      >
                        Setor
                      </button>
                      <button
                        type="button"
                        onClick={() => onDetail(santri)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
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

      {currentView === 'pengaturan' && (
        <Card title="Pengaturan Halaqoh & Kurikulum" subtitle="Konfigurasi target baris, jadwal, dan standar penilaian">
          <div className="space-y-4 text-xs text-slate-700 max-w-xl">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Target Harian Standar (Baris / Hari)</label>
              <input type="number" defaultValue={15} className="w-full rounded-lg border border-slate-300 p-2.5 bg-white" />
            </div>
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Nama Kelompok Halaqoh</label>
              <input type="text" defaultValue="Halaqoh Abu Bakar Ash-Shiddiq" className="w-full rounded-lg border border-slate-300 p-2.5 bg-white" />
            </div>
            <div>
              <Button size="sm">Simpan Pengaturan</Button>
            </div>
          </div>
        </Card>
      )}

      {currentView === 'dll-ujian' && (
        <div className="max-w-2xl mx-auto">
          <TapCounterExam />
        </div>
      )}

      {currentView === 'dll-pacing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PacingCard
            santriName="Muhammad Faiz"
            nis="2024001"
            totalLinesMemorized={1420}
            totalLinesTarget={9060}
            daysRemaining={650}
            dailyTargetLines={12}
            linesCompletedToday={15}
            status="on_track"
          />
          <PacingCard
            santriName="Ahmad Zaki"
            nis="2024002"
            totalLinesMemorized={780}
            totalLinesTarget={9060}
            daysRemaining={650}
            dailyTargetLines={15}
            linesCompletedToday={8}
            status="behind"
          />
        </div>
      )}
    </div>
  );
};
