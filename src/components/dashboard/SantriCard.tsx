import React from 'react';
import { User } from 'lucide-react';
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
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
      {/* Top section: Avatar, Name, "Sekian Juz" as in wireframe */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-slate-900 truncate">
            {santri.name}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {santri.juzAchieved}
          </p>
        </div>
      </div>

      {/* Two action buttons side-by-side: "Setor" and secondary button */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSetor(santri)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors"
        >
          Setor
        </button>
        <button
          type="button"
          onClick={() => onDetail(santri)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors"
        >
          Detail
        </button>
      </div>
    </div>
  );
};
