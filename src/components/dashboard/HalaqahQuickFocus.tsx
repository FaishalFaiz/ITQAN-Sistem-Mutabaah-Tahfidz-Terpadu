import React from 'react';
import { Target, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import type { Santri } from './types';

interface HalaqahQuickFocusProps {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const HalaqahQuickFocus: React.FC<HalaqahQuickFocusProps> = ({
  santriList,
  onSetor,
  onDetail,
}) => {
  // Santri yang butuh perhatian prioritas (tidak tercapai atau belum setor)
  const priorityList = santriList.filter(
    (s) => s.status === 'tidak_tercapai' || s.status === 'belum_setor'
  );

  // Total lines accomplished today across all santri
  const totalLinesToday = santriList.reduce((acc, s) => acc + s.linesCompletedToday, 0);
  const totalTargetLines = santriList.reduce((acc, s) => acc + s.dailyTargetLines, 0);
  const progressPercent = Math.min(100, Math.round((totalLinesToday / (totalTargetLines || 1)) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Antrean & Prioritas Setoran Halaqoh Hari Ini */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Fokus Halaqoh: Antrean Perlu Setoran
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {priorityList.length} Santri Tertunda
            </span>
          </div>

          <div className="space-y-2">
            {priorityList.length === 0 ? (
              <div className="py-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-lg">
                MasyaAllah! Seluruh santri telah menuntaskan target setoran hari ini.
              </div>
            ) : (
              priorityList.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0">
                      {s.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{s.name}</span>
                        {s.status === 'tidak_tercapai' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 shrink-0">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            Kurang {s.dailyTargetLines - s.linesCompletedToday} baris
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Belum Setor
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {s.juzAchieved} • Terakhir: {s.lastSurah}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onDetail(s)}
                      className="flex-1 sm:flex-none text-center px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      Lihat Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetor(s)}
                      className="flex-1 sm:flex-none text-center px-3 py-1.5 text-xs font-semibold rounded bg-[#0070BA] text-white hover:bg-[#005C9E] transition-colors shadow-2xs"
                    >
                      Simak Setor
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Prioritas bimbingan musyrif sesi aktif ini</span>
          <span className="font-semibold text-slate-700">Total Rombel: {santriList.length} Santri</span>
        </div>
      </div>

      {/* 2. Target Baris Halaqoh Hari Ini (Ringkasan Kemajuan Kelompok) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Pencapaian Halaqoh Hari Ini
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">{progressPercent}%</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Total Baris Terkumpul</span>
                <span className="font-bold text-slate-900">{totalLinesToday} / {totalTargetLines} Baris</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0070BA] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Rata-rata Baris / Santri:</span>
                <b className="text-slate-900">{(totalLinesToday / (santriList.length || 1)).toFixed(1)} Baris</b>
              </div>
              <div className="flex justify-between">
                <span>Kesesuaian Target:</span>
                <b className="text-emerald-700">On-Track Kurikulum 3 Tahun</b>
              </div>
              <div className="flex justify-between">
                <span>Santri Selesai:</span>
                <b className="text-slate-900">{santriList.length - priorityList.length} dari {santriList.length} Santri</b>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
          Target harian otomatis beradaptasi dengan kecepatan halaqoh
        </div>
      </div>
    </div>
  );
};
