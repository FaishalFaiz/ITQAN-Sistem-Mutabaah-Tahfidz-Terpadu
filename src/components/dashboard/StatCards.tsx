import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface StatCardsProps {
  tercapaiCount?: number;
  tidakTercapaiCount?: number;
  belumSetorCount?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  tercapaiCount = 10,
  tidakTercapaiCount = 1,
  belumSetorCount = 1,
}) => {
  const formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Card 1: 10 Tercapai */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-emerald-300 transition-all flex items-center justify-between">
        <div className="flex items-baseline gap-3.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {formatNum(tercapaiCount)}
          </span>
          <div>
            <span className="text-base font-bold text-slate-900 block leading-tight">
              Tercapai
            </span>
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Target terpenuhi
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: 01 Tidak Tercapai */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-red-300 transition-all flex items-center justify-between">
        <div className="flex items-baseline gap-3.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {formatNum(tidakTercapaiCount)}
          </span>
          <div>
            <span className="text-base font-bold text-slate-900 block leading-tight">
              Tidak Tercapai
            </span>
            <span className="text-xs font-medium text-red-700 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Di bawah target
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: 01 Apa ya? */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-amber-300 transition-all flex items-center justify-between">
        <div className="flex items-baseline gap-3.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {formatNum(belumSetorCount)}
          </span>
          <div>
            <span className="text-base font-bold text-slate-900 block leading-tight">
              Apa ya?
            </span>
            <span className="text-xs font-medium text-amber-700 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Belum setor hari ini
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
