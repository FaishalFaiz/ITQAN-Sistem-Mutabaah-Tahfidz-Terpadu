import React from 'react';
import { Target, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PacingCardProps {
  santriName: string;
  nis: string;
  totalLinesMemorized: number; // Max 9060
  totalLinesTarget?: number;
  programDurationYears?: number;
  daysRemaining: number;
  dailyTargetLines: number;
  linesCompletedToday: number;
  status?: 'on_track' | 'behind' | 'ahead';
}

export const PacingCard: React.FC<PacingCardProps> = ({
  santriName,
  nis,
  totalLinesMemorized = 1420,
  totalLinesTarget = 9060,
  daysRemaining = 650,
  dailyTargetLines = 12,
  linesCompletedToday = 15,
  status = 'on_track',
}) => {
  const percentage = Math.min(100, Math.round((totalLinesMemorized / totalLinesTarget) * 100));
  const pagesEquivalent = (totalLinesMemorized / 15).toFixed(1);
  const totalPagesTarget = (totalLinesTarget / 15).toFixed(0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-base">{santriName}</h3>
            <span className="text-xs text-slate-500 font-mono">({nis})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Target Kurikulum 30 Juz / 3 Tahun</p>
        </div>
        <Badge variant={status === 'on_track' ? 'mumtaz' : 'iadah'}>
          {status === 'on_track' ? 'Sesuai Target (On Track)' : 'Tertinggal (Behind)'}
        </Badge>
      </div>

      {/* Progress Bar Baris */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
          <span>{totalLinesMemorized.toLocaleString()} / {totalLinesTarget.toLocaleString()} Baris ({pagesEquivalent} / {totalPagesTarget} Hal)</span>
          <span className="text-[#0070BA] font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#0070BA] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Grid Metrik Harian */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Target className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Target Hari Ini</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {dailyTargetLines} <span className="text-xs font-normal text-slate-500">baris</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Setor Hari Ini</span>
          </div>
          <div className="text-base font-bold text-emerald-700">
            {linesCompletedToday} <span className="text-xs font-normal text-slate-500">baris</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Sisa Waktu</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {daysRemaining} <span className="text-xs font-normal text-slate-500">hari</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Muroja'ah Recom.</span>
          </div>
          <div className="text-xs font-semibold text-amber-700 truncate" title="Juz 29 (Hal 562-564)">
            Juz 29 (Hal 562)
          </div>
        </div>
      </div>
    </div>
  );
};
