import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-emerald-300 transition-all flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-sans">
            {formatNum(tercapaiCount)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            Tercapai
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: 01 Tidak Tercapai */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-red-300 transition-all flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-sans">
            {formatNum(tidakTercapaiCount)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            Tidak Tercapai
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: 01 Belum Setor ('Apa ya?' completely removed, single clear label) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-amber-300 transition-all flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-sans">
            {formatNum(belumSetorCount)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            Belum Setor
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
