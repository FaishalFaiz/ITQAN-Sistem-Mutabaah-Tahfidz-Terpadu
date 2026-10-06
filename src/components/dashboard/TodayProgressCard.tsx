import React from 'react';
import { Target, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import type { Santri } from './types';
import { Progress } from '@/components/ui/progress';

interface TodayProgressCardProps {
  santriList: Santri[];
  activeFilter?: string;
  onFilterChange?: (filter: 'all' | 'sudah_setor' | 'belum_setor' | 'tercapai' | 'tidak_tercapai') => void;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  santriList,
  onFilterChange,
}) => {
  const totalSantri = santriList.length;
  const tercapaiCount = santriList.filter((s) => s.status === 'tercapai').length;
  const tidakTercapaiCount = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const belumSetorCount = santriList.filter((s) => s.status === 'belum_setor').length;
  const sudahSetorCount = tercapaiCount + tidakTercapaiCount;

  const totalLinesToday = santriList.reduce((acc, s) => acc + (s.linesCompletedToday || 0), 0);
  const totalTargetLines = santriList.reduce((acc, s) => acc + (s.dailyTargetLines || 15), 0);
  const progressPercent = totalTargetLines > 0 
    ? Math.min(100, Math.round((totalLinesToday / totalTargetLines) * 100)) 
    : 0;

  const avgLinesPerSantri = totalSantri > 0 ? (totalLinesToday / totalSantri).toFixed(1) : '0.0';

  if (totalSantri === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header: Title & Progress Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              Pencapaian Target Halaqoh Hari Ini
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akumulasi setoran hafalan seluruh santri pada sesi aktif hari ini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">Progres Target:</span>
          <span className="font-extrabold text-sm sm:text-base text-[#0070BA] font-mono">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar Total Baris */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Total Baris Terkumpul: <strong className="text-slate-900">{totalLinesToday.toLocaleString()}</strong> dari {totalTargetLines.toLocaleString()} Baris
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ~{(totalLinesToday / 15).toFixed(1)} Halaman
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-slate-100" />
      </div>

      {/* Grid 3 Metrik Evaluasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Metrik 1: Santri Sudah vs Belum Setor */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Partisipasi Setoran</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{sudahSetorCount}</span>
            <span className="text-xs text-slate-500 font-medium">dari {totalSantri} Santri</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
            <span className="text-emerald-700 font-semibold">Sudah: {sudahSetorCount}</span>
            <button
              type="button"
              onClick={() => onFilterChange && onFilterChange('belum_setor')}
              className="text-amber-700 hover:underline font-semibold cursor-pointer"
            >
              Belum: {belumSetorCount} &rarr;
            </button>
          </div>
        </div>

        {/* Metrik 2: Rata-Rata Capaian */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Rata-rata Baris</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{avgLinesPerSantri}</span>
            <span className="text-xs text-slate-500 font-medium">Baris / Santri</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 truncate">
            Standar kurikulum: 15 baris (1 halaman)
          </div>
        </div>

        {/* Metrik 3: Ketercapaian Target */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Status Target Harian</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-700">{tercapaiCount}</span>
            <span className="text-xs text-emerald-800 font-medium">Tercapai</span>
            {tidakTercapaiCount > 0 && (
              <span className="text-xs text-red-700 font-medium ml-1">• {tidakTercapaiCount} Defisit</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
            <button
              type="button"
              onClick={() => onFilterChange && onFilterChange('tercapai')}
              className="text-[#0070BA] hover:underline font-semibold cursor-pointer"
            >
              Lihat Tercapai
            </button>
            {tidakTercapaiCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange && onFilterChange('tidak_tercapai')}
                className="text-red-700 hover:underline font-semibold cursor-pointer"
              >
                Lihat Defisit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
