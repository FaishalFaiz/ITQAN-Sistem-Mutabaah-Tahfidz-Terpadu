import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { Santri } from './types';
import { Button } from '../ui/Button';

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
  const getStatusBadge = () => {
    switch (santri.status) {
      case 'tercapai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Tercapai
          </span>
        );
      case 'tidak_tercapai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Kurang {santri.dailyTargetLines - santri.linesCompletedToday} Baris
          </span>
        );
      case 'belum_setor':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            Belum Setor
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all flex flex-col justify-between">
      {/* Upper Area: Avatar, Name, "Sekian Juz" as in wireframe */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar icon / silhouette */}
          <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
            {santri.avatarInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {santri.name}
              </h4>
            </div>
            
            {/* "Sekian Juz" Subtitle as drawn in wireframe */}
            <p className="text-xs font-semibold text-[#0070BA] mt-0.5">
              {santri.juzAchieved} <span className="text-slate-400 font-normal">/ 30 Juz</span>
            </p>
            
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              NIS: {santri.nis} • {santri.lastSurah}
            </p>
          </div>
        </div>

        {/* Progress Metric Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-4 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 font-medium">Hari ini:</span>
            <span className="font-bold text-slate-900">
              {santri.linesCompletedToday} / {santri.dailyTargetLines} Baris
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${
                santri.status === 'tercapai'
                  ? 'bg-emerald-600'
                  : santri.status === 'tidak_tercapai'
                  ? 'bg-red-500'
                  : 'bg-amber-400'
              }`}
              style={{
                width: `${Math.min(100, (santri.linesCompletedToday / santri.dailyTargetLines) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-end">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Two action buttons side-by-side as shown in wireframe */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onSetor(santri)}
          className="w-full font-semibold"
        >
          Setor
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetail(santri)}
          className="w-full"
        >
          Detail
        </Button>
      </div>
    </div>
  );
};
