import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
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
  const formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {/* Box 1: Tercapai (Emerald) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.02, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'tercapai' ? 'all' : 'tercapai')}
        className={`stat-box text-center sm:text-left bg-emerald-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-colors flex flex-col justify-between cursor-pointer ${
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
      </motion.button>

      {/* Box 2: Tidak Tercapai (Red) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'tidak_tercapai' ? 'all' : 'tidak_tercapai')}
        className={`stat-box text-center sm:text-left bg-red-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-colors flex flex-col justify-between cursor-pointer ${
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
      </motion.button>

      {/* Box 3: Belum Setor (Amber) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'belum_setor' ? 'all' : 'belum_setor')}
        className={`stat-box text-center sm:text-left bg-amber-50/40 border rounded-xl p-3 sm:p-5 shadow-xs transition-colors flex flex-col justify-between cursor-pointer ${
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
      </motion.button>
    </div>
  );
};
