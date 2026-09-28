import React from 'react';
import type { Santri } from './types';

interface SantriCardProps {
  santri: Santri;
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const SantriCard: React.FC<SantriCardProps> = ({
  santri,
  onSetor,
  onDetail,
}) => {
  const getStatusDot = () => {
    switch (santri.status) {
      case 'tercapai':
        return 'bg-emerald-500';
      case 'tidak_tercapai':
        return 'bg-red-500';
      case 'belum_setor':
        return 'bg-amber-400';
    }
  };

  const getProgressColor = () => {
    switch (santri.status) {
      case 'tercapai':
        return 'bg-emerald-500';
      case 'tidak_tercapai':
        return 'bg-red-500';
      case 'belum_setor':
        return 'bg-amber-400';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between">
      {/* Top section: Avatar, Name, "Sekian Juz" as in wireframe */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar with status indicator dot */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xs">
              {santri.avatarInitials}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getStatusDot()}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {santri.name}
            </h4>
            <p className="text-xs font-semibold text-[#0070BA] mt-0.5">
              {santri.juzAchieved} <span className="text-slate-400 font-normal">/ 30 Juz</span>
            </p>
          </div>
        </div>

        {/* Informative Progress Bar for Daily Setoran */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Hari ini</span>
            <span className="font-medium text-slate-700">
              {santri.linesCompletedToday} / {santri.dailyTargetLines} Baris
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${getProgressColor()}`}
              style={{
                width: `${Math.min(100, (santri.linesCompletedToday / santri.dailyTargetLines) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Two action buttons side-by-side: "Setor" and "Detail" */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSetor(santri)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] active:bg-[#004A7F] transition-colors shadow-2xs"
        >
          Setor
        </button>
        <button
          type="button"
          onClick={() => onDetail(santri)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:bg-slate-100 transition-colors"
        >
          Detail
        </button>
      </div>
    </div>
  );
};
