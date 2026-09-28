import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface StatCardsProps {
  tercapaiCount?: number;
  tidakTercapaiCount?: number;
  belumSetorCount?: number;
  onFilterChange?: (status: 'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor') => void;
  activeFilter?: string;
}

export const StatCards: React.FC<StatCardsProps> = ({
  tercapaiCount = 10,
  tidakTercapaiCount = 1,
  belumSetorCount = 1,
  onFilterChange,
  activeFilter = 'all',
}) => {
  // Format to 2 digits as shown in wireframe (10, 01, 01)
  const formatNum = (num: number) => num < 10 ? `0${num}` : `${num}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: 10 Tercapai */}
      <button
        type="button"
        onClick={() => onFilterChange?.(activeFilter === 'tercapai' ? 'all' : 'tercapai')}
        className={`text-left bg-white border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden group ${
          activeFilter === 'tercapai' 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
            : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-sans">
              {formatNum(tercapaiCount)}
            </span>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">
                Tercapai
              </span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                Target hari ini terpenuhi
              </span>
            </div>
          </div>
          <div className="hidden xl:flex w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Card 2: 01 Tidak Tercapai */}
      <button
        type="button"
        onClick={() => onFilterChange?.(activeFilter === 'tidak_tercapai' ? 'all' : 'tidak_tercapai')}
        className={`text-left bg-white border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden group ${
          activeFilter === 'tidak_tercapai' 
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' 
            : 'border-slate-200 hover:border-red-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-sans">
              {formatNum(tidakTercapaiCount)}
            </span>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">
                Tidak Tercapai
              </span>
              <span className="text-xs text-red-700 font-medium flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 inline" />
                Di bawah target baris
              </span>
            </div>
          </div>
          <div className="hidden xl:flex w-10 h-10 rounded-lg bg-red-50 border border-red-200 items-center justify-center text-red-700">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Card 3: 01 Apa ya? (Belum Setor / Perlu Follow-up) */}
      <button
        type="button"
        onClick={() => onFilterChange?.(activeFilter === 'belum_setor' ? 'all' : 'belum_setor')}
        className={`text-left bg-white border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden group ${
          activeFilter === 'belum_setor' 
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' 
            : 'border-slate-200 hover:border-amber-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-sans">
              {formatNum(belumSetorCount)}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">
                  Belum Setor
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Apa ya?
                </span>
              </div>
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                Antrean sesi halaqoh
              </span>
            </div>
          </div>
          <div className="hidden xl:flex w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 items-center justify-center text-amber-700">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </button>
    </div>
  );
};
