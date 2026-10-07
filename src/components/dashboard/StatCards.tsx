import React, { useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

import { type SetoranFilterType } from './SantriListSection';

interface StatCardsProps {
  tercapaiCount?: number;
  tidakTercapaiCount?: number;
  belumSetorCount?: number;
  activeFilter?: SetoranFilterType;
  onFilterChange?: (filter: SetoranFilterType) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  tercapaiCount = 0,
  tidakTercapaiCount = 0,
  belumSetorCount = 0,
  activeFilter = 'all',
  onFilterChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  useEffect(() => {
    if (!containerRef.current) return;
    const boxes = containerRef.current.querySelectorAll('.stat-box');
    if (!boxes || boxes.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        boxes,
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
    <div ref={containerRef} className="grid grid-cols-3 gap-2 sm:gap-4">
      {/* Box 1: Tercapai (Emerald) */}
      <button
        type="button"
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'tercapai' ? 'all' : 'tercapai')}
        className={`stat-box text-center sm:text-left bg-emerald-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${
          activeFilter === 'tercapai'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/80'
            : 'border-emerald-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-center sm:justify-between w-full mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wide truncate">
            Tercapai
          </span>
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-emerald-100/90 border border-emerald-300/60 items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline justify-center sm:justify-between w-full">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-emerald-700 tracking-tight font-sans">
              {formatNum(tercapaiCount)}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-emerald-800">Santri</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 hidden sm:flex items-center gap-0.5 group-hover:underline">
            <span>Filter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* Box 2: Tidak Tercapai (Red) */}
      <button
        type="button"
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'tidak_tercapai' ? 'all' : 'tidak_tercapai')}
        className={`stat-box text-center sm:text-left bg-red-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${
          activeFilter === 'tidak_tercapai'
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/80'
            : 'border-red-200 hover:border-red-300'
        }`}
      >
        <div className="flex items-center justify-center sm:justify-between w-full mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-red-800 uppercase tracking-wide truncate">
            Tidak Tercapai
          </span>
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-red-100/90 border border-red-300/60 items-center justify-center text-red-700 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline justify-center sm:justify-between w-full">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-red-700 tracking-tight font-sans">
              {formatNum(tidakTercapaiCount)}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-red-800">Santri</span>
          </div>
          <span className="text-[11px] font-semibold text-red-700 hidden sm:flex items-center gap-0.5">
            <span>Filter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* Box 3: Belum Setor (Amber) */}
      <button
        type="button"
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'belum_setor' ? 'all' : 'belum_setor')}
        className={`stat-box text-center sm:text-left bg-amber-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${
          activeFilter === 'belum_setor'
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/80'
            : 'border-amber-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-center sm:justify-between w-full mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase tracking-wide truncate">
            Belum Setor
          </span>
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-amber-100/90 border border-amber-300/60 items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline justify-center sm:justify-between w-full">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-amber-700 tracking-tight font-sans">
              {formatNum(belumSetorCount)}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-amber-800">Santri</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 hidden sm:flex items-center gap-0.5">
            <span>Filter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </div>
  );
};
