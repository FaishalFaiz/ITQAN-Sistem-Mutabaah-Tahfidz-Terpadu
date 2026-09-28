import React, { useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import gsap from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-box',
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Box 1: Tercapai (Emerald) */}
      <div className="stat-box bg-emerald-50/40 border border-emerald-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl font-bold text-emerald-700 tracking-tight font-sans">
            {formatNum(tercapaiCount)}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-emerald-900">
            Tercapai
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Box 2: Tidak Tercapai (Red) */}
      <div className="stat-box bg-red-50/40 border border-red-200 rounded-xl p-6 shadow-xs hover:border-red-300 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl font-bold text-red-700 tracking-tight font-sans">
            {formatNum(tidakTercapaiCount)}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-red-900">
            Tidak Tercapai
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-100/80 border border-red-300/60 flex items-center justify-center text-red-700 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Box 3: Belum Setor (Amber) */}
      <div className="stat-box bg-amber-50/40 border border-amber-200 rounded-xl p-6 shadow-xs hover:border-amber-300 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl font-bold text-amber-700 tracking-tight font-sans">
            {formatNum(belumSetorCount)}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-amber-900">
            Belum Setor
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-100/80 border border-amber-300/60 flex items-center justify-center text-amber-700 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
