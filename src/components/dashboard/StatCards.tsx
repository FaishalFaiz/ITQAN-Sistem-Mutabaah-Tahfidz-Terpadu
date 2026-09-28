import React from 'react';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: 10 Tercapai */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center gap-4">
        <span className="text-4xl font-bold text-slate-900">
          {formatNum(tercapaiCount)}
        </span>
        <span className="text-base font-semibold text-slate-700">
          Tercapai
        </span>
      </div>

      {/* Card 2: 01 Tidak Tercapai */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center gap-4">
        <span className="text-4xl font-bold text-slate-900">
          {formatNum(tidakTercapaiCount)}
        </span>
        <span className="text-base font-semibold text-slate-700">
          Tidak Tercapai
        </span>
      </div>

      {/* Card 3: 01 Apa ya? */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center gap-4">
        <span className="text-4xl font-bold text-slate-900">
          {formatNum(belumSetorCount)}
        </span>
        <span className="text-base font-semibold text-slate-700">
          Apa ya?
        </span>
      </div>
    </div>
  );
};
