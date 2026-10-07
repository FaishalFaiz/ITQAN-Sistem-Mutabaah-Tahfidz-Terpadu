import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import { storageService, EVENT_DATA_CHANGED } from '@/services/storageService';
import type { SetoranRecord } from './types';

interface BarDataPoint {
  label: string;
  fullLabel: string;
  ziyadah: number;   // baris hafalan baru
  murojaah: number;  // baris pengulangan
  target: number;    // target baris halaqoh
  date: string;
}

export const TrendChart: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'pekan' | 'bulan'>('pekan');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<SetoranRecord[]>(() => storageService.getSetoranRecords());
  const [santriList, setSantriList] = useState(() => storageService.getSantriList());

  useEffect(() => {
    const handleUpdate = () => {
      setRecords(storageService.getSetoranRecords());
      setSantriList(storageService.getSantriList());
    };
    window.addEventListener(EVENT_DATA_CHANGED, handleUpdate);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleUpdate);
  }, []);

  const totalSantri = santriList.length || 1;
  const targetHarianHalaqoh = santriList.reduce((sum, s) => sum + (s.dailyTargetLines || 20), 0) || (totalSantri * 20);

  // Kalkulasi data riil 7 hari terakhir (Pekan Ini)
  const pekanData = useMemo<BarDataPoint[]>(() => {
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const fullDayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const points: BarDataPoint[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayIdx = d.getDay();
      const isToday = i === 0;

      let ziyadah = 0;
      let murojaah = 0;

      records.forEach((r) => {
        if (!r.createdAt) return;
        if (r.createdAt.slice(0, 10) === dateKey) {
          const lines = Number(r.totalLines) || 0;
          if (r.type === 'ziyadah') ziyadah += lines;
          else murojaah += lines;
        }
      });

      const dayDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      points.push({
        label: dayNames[dayIdx],
        fullLabel: isToday ? `${fullDayNames[dayIdx]} (Hari Ini)` : fullDayNames[dayIdx],
        ziyadah,
        murojaah,
        target: targetHarianHalaqoh,
        date: dayDateStr,
      });
    }

    return points;
  }, [records, targetHarianHalaqoh]);

  // Kalkulasi data riil 4 pekan dalam bulan berjalan (Bulan Ini)
  const bulanData = useMemo<BarDataPoint[]>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleDateString('id-ID', { month: 'short' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();

    const weekRanges = [
      { label: 'Pekan 1', start: 1, end: 7 },
      { label: 'Pekan 2', start: 8, end: 14 },
      { label: 'Pekan 3', start: 15, end: 21 },
      { label: 'Pekan 4', start: 22, end: daysInMonth },
    ];

    const weeklyTarget = targetHarianHalaqoh * 6; // 6 hari halaqoh per pekan

    return weekRanges.map((w) => {
      let ziyadah = 0;
      let murojaah = 0;

      records.forEach((r) => {
        if (!r.createdAt) return;
        const d = new Date(r.createdAt);
        if (isNaN(d.getTime())) return;

        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (day >= w.start && day <= w.end) {
            const lines = Number(r.totalLines) || 0;
            if (r.type === 'ziyadah') ziyadah += lines;
            else murojaah += lines;
          }
        }
      });

      const isCurrentWeek = currentDay >= w.start && currentDay <= w.end;

      return {
        label: w.label,
        fullLabel: isCurrentWeek ? `${w.label} (Berjalan)` : w.label,
        ziyadah,
        murojaah,
        target: weeklyTarget,
        date: `${w.start}–${w.end} ${monthName}`,
      };
    });
  }, [records, targetHarianHalaqoh]);

  const currentData = activeRange === 'pekan' ? pekanData : bulanData;

  // Nilai maksimum skala dinamis dari data riil
  const maxScale = useMemo(() => {
    const maxVal = Math.max(
      ...currentData.map((d) => Math.max(d.ziyadah + d.murojaah, d.target))
    );
    if (activeRange === 'pekan') {
      return Math.max(100, Math.ceil((maxVal * 1.15) / 50) * 50);
    }
    return Math.max(500, Math.ceil((maxVal * 1.15) / 100) * 100);
  }, [currentData, activeRange]);

  const targetThreshold = activeRange === 'pekan' ? targetHarianHalaqoh : targetHarianHalaqoh * 6;
  const gridLine1 = Math.round(maxScale * 0.4);
  const gridLine2 = Math.round(maxScale * 0.8);

  const handleRangeChange = (range: 'pekan' | 'bulan') => {
    setActiveRange(range);
    setHoveredIdx(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const pillars = containerRef.current.querySelectorAll('.chart-bar-pillar');
    if (!pillars || pillars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        pillars,
        { scaleY: 0, transformOrigin: 'bottom' },
        {
          scaleY: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeRange]);

  const defaultIdx = currentData.length - 1;
  const safeIdx = hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < currentData.length
    ? hoveredIdx
    : defaultIdx;
  const activeItem = currentData[safeIdx] || currentData[defaultIdx];
  const activeTotal = activeItem.ziyadah + activeItem.murojaah;
  const isSurpassing = activeTotal >= activeItem.target && activeTotal > 0;
  const hasAnyActivity = currentData.some((d) => d.ziyadah + d.murojaah > 0);

  return (
    <div
      ref={containerRef}
      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs"
    >
      {/* Header Diagram Balok */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                Tren Capaian Setoran
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeRange === 'pekan'
                  ? 'Akumulasi setoran harian halaqoh dalam 7 hari terakhir (Data Riil)'
                  : 'Akumulasi setoran mingguan halaqoh dalam bulan berjalan (Data Riil)'}
              </p>
            </div>
          </div>
        </div>

        {/* Legend & Filter Switches */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Legenda Baris */}
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0070BA]"></span>
              Ziyadah
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
              Muroja'ah
            </span>
          </div>

          {/* Switcher Pekan / Bulan */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleRangeChange('pekan')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                activeRange === 'pekan'
                  ? 'bg-white text-[#0070BA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pekan Ini
            </button>
            <button
              type="button"
              onClick={() => handleRangeChange('bulan')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                activeRange === 'bulan'
                  ? 'bg-white text-[#0070BA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* Kolom Balok Diagram (3 Kolom) */}
        <div className="lg:col-span-3">
          {/* Chart Container dengan garis grid horizontal */}
          <div className="relative h-48 sm:h-52 w-full pt-6 pb-6 flex items-end">
            {/* Grid Line Target (Garis Putus-Putus) */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-slate-300 z-0 pointer-events-none"
              style={{ bottom: `${Math.min(98, (targetThreshold / maxScale) * 100)}%` }}
            />

            {/* Grid Line Atas */}
            <div
              className="absolute left-0 right-0 border-b border-slate-100 z-0 flex items-center justify-end pr-1 pointer-events-none"
              style={{ bottom: `${Math.min(95, (gridLine2 / maxScale) * 100)}%` }}
            >
              <span className="text-[9px] text-slate-300 bg-white px-1 -translate-y-1/2">
                {gridLine2}
              </span>
            </div>

            {/* Grid Line Bawah */}
            <div
              className="absolute left-0 right-0 border-b border-slate-100 z-0 flex items-center justify-end pr-1 pointer-events-none"
              style={{ bottom: `${Math.min(90, (gridLine1 / maxScale) * 100)}%` }}
            >
              <span className="text-[9px] text-slate-300 bg-white px-1 -translate-y-1/2">
                {gridLine1}
              </span>
            </div>

            {/* Tiang-tiang Balok (Columns) */}
            <div className="relative z-10 w-full h-full flex items-end justify-around gap-2 sm:gap-4 px-2">
              {currentData.map((item, idx) => {
                const total = item.ziyadah + item.murojaah;
                const totalHeightPercent = total > 0 ? Math.min(100, (total / maxScale) * 100) : 0;
                const ziyadahPercent = total > 0 ? (item.ziyadah / total) * 100 : 0;
                const murojaahPercent = total > 0 ? (item.murojaah / total) * 100 : 0;
                const isSelected = safeIdx === idx;
                const isCurrent = idx === currentData.length - 1;

                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Nilai Mengambang Saat Hover / Aktif */}
                    <div
                      className={`text-[10px] sm:text-xs font-bold transition-all mb-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'text-[#0070BA] scale-110 opacity-100'
                          : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {total.toLocaleString()} <span className="font-normal text-[9px] text-slate-400">b</span>
                    </div>

                    {/* Tiang Balok Bertumpuk (Stacked Bar) */}
                    <div
                      className={`chart-bar-pillar w-full ${
                        activeRange === 'pekan' ? 'max-w-[38px]' : 'max-w-[52px]'
                      } rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-200 shadow-2xs ${
                        isSelected
                          ? 'ring-2 ring-[#0070BA] ring-offset-2 shadow-sm'
                          : isCurrent
                          ? 'ring-1 ring-[#0070BA]/50'
                          : 'hover:brightness-95'
                      }`}
                      style={{ height: `${Math.max(total > 0 ? 4 : 0, totalHeightPercent)}%` }}
                    >
                      {/* Bagian Bawah: Ziyadah (Biru Solid ITQAN) */}
                      <div
                        style={{ height: `${ziyadahPercent}%` }}
                        className="w-full bg-[#0070BA] transition-colors"
                        title={`Ziyadah: ${item.ziyadah} Baris`}
                      />

                      {/* Bagian Atas: Muroja'ah (Sky Blue 400) */}
                      <div
                        style={{ height: `${murojaahPercent}%` }}
                        className="w-full bg-sky-400 transition-colors"
                        title={`Muroja'ah: ${item.murojaah} Baris`}
                      />
                    </div>

                    {/* Label Hari/Pekan di Sumbu X */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold block transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'text-[#0070BA]'
                            : isCurrent
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA] mx-auto mt-0.5 block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Summary Card Interaktif (1 Kolom) */}
        <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                {activeItem.fullLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {activeItem.date}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Setoran</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {activeTotal.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">baris</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Ziyadah</span>
                  <span className="text-xs font-bold text-[#0070BA]">{activeItem.ziyadah.toLocaleString()} baris</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Muroja'ah</span>
                  <span className="text-xs font-bold text-sky-700">{activeItem.murojaah.toLocaleString()} baris</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Target: {activeItem.target.toLocaleString()} Baris</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  !hasAnyActivity
                    ? 'text-slate-600 bg-slate-100 border border-slate-200'
                    : isSurpassing
                    ? 'text-emerald-700 bg-emerald-100/80 border border-emerald-200'
                    : activeTotal > 0
                    ? 'text-amber-700 bg-amber-100/80 border border-amber-200'
                    : 'text-slate-500 bg-slate-100 border border-slate-200'
                }`}
              >
                {!hasAnyActivity
                  ? 'Belum Ada Setoran'
                  : isSurpassing
                  ? 'Melampaui Target'
                  : activeTotal > 0
                  ? 'Di Bawah Target'
                  : 'Nir-Setoran'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
