import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Info } from 'lucide-react';
import gsap from 'gsap';

interface BarDataPoint {
  day: string;
  fullDay: string;
  ziyadah: number;   // baris hafalan baru
  murojaah: number;  // baris pengulangan
  target: number;    // target baris halaqoh hari itu
  date: string;
}

const PEKAN_DATA: BarDataPoint[] = [
  { day: 'Sen', fullDay: 'Senin', ziyadah: 95, murojaah: 40, target: 140, date: '22 Sep' },
  { day: 'Sel', fullDay: 'Selasa', ziyadah: 115, murojaah: 65, target: 140, date: '23 Sep' },
  { day: 'Rab', fullDay: 'Rabu', ziyadah: 80, murojaah: 40, target: 140, date: '24 Sep' },
  { day: 'Kam', fullDay: 'Kamis', ziyadah: 130, murojaah: 80, target: 140, date: '25 Sep' },
  { day: 'Jum', fullDay: 'Jumat', ziyadah: 100, murojaah: 55, target: 140, date: '26 Sep' },
  { day: 'Sab', fullDay: 'Sabtu', ziyadah: 110, murojaah: 65, target: 140, date: '27 Sep' },
  { day: 'Ahd', fullDay: 'Ahad (Hari ini)', ziyadah: 145, murojaah: 80, target: 140, date: '28 Sep' },
];

export const TrendChart: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'pekan' | 'bulan'>('pekan');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6); // Default highlight hari ini
  const containerRef = useRef<HTMLDivElement>(null);

  const maxScale = 250; // Skala maksimal baris untuk tinggi 100%

  const totalLinesWeek = PEKAN_DATA.reduce((acc, curr) => acc + curr.ziyadah + curr.murojaah, 0);
  const avgLinesPerDay = Math.round(totalLinesWeek / PEKAN_DATA.length);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animasi bar balok naik bertingkat
      gsap.fromTo(
        '.chart-bar-pillar',
        { scaleY: 0, transformOrigin: 'bottom' },
        {
          scaleY: 1,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.1,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeRange]);

  const activeItem = hoveredIdx !== null ? PEKAN_DATA[hoveredIdx] : PEKAN_DATA[6];
  const activeTotal = activeItem.ziyadah + activeItem.murojaah;
  const isSurpassing = activeTotal >= activeItem.target;

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
                Tren Capaian Mutabaah
              </h3>
              <p className="text-[11px] text-slate-500">
                Akumulasi setoran baris halaqoh per hari (Ziyadah &amp; Muroja'ah)
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
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-300"></span>
              Muroja'ah
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400"></span>
              Target ({PEKAN_DATA[0].target})
            </span>
          </div>

          {/* Switcher Pekan / Bulan */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveRange('pekan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeRange === 'pekan'
                  ? 'bg-white text-[#0070BA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pekan Ini
            </button>
            <button
              type="button"
              onClick={() => setActiveRange('bulan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
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
              className="absolute left-0 right-0 border-b border-dashed border-slate-300 z-0 flex items-center justify-end pr-1 pointer-events-none"
              style={{ bottom: `${(140 / maxScale) * 100}%` }}
            >
              <span className="text-[10px] font-semibold text-slate-400 bg-white px-1 -translate-y-1/2">
                Target Halaqoh: 140 Baris
              </span>
            </div>

            {/* Grid Line 200 */}
            <div
              className="absolute left-0 right-0 border-b border-slate-100 z-0"
              style={{ bottom: `${(200 / maxScale) * 100}%` }}
            />

            {/* Grid Line 100 */}
            <div
              className="absolute left-0 right-0 border-b border-slate-100 z-0"
              style={{ bottom: `${(100 / maxScale) * 100}%` }}
            />

            {/* Tiang-tiang Balok (Columns) */}
            <div className="relative z-10 w-full h-full flex items-end justify-between gap-1.5 sm:gap-4 px-1">
              {PEKAN_DATA.map((item, idx) => {
                const total = item.ziyadah + item.murojaah;
                const totalHeightPercent = Math.min(100, (total / maxScale) * 100);
                const ziyadahPercent = (item.ziyadah / total) * 100;
                const murojaahPercent = (item.murojaah / total) * 100;
                const isSelected = hoveredIdx === idx;
                const isToday = idx === 6;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Nilai Mengambang Saat Hover / Aktif */}
                    <div
                      className={`text-[10px] sm:text-xs font-bold transition-all mb-1.5 ${
                        isSelected
                          ? 'text-[#0070BA] scale-110 opacity-100'
                          : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {total}
                    </div>

                    {/* Tiang Balok Bertumpuk (Stacked Bar) */}
                    <div
                      className={`chart-bar-pillar w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-[#0070BA] ring-offset-2 shadow-sm'
                          : isToday
                          ? 'ring-1 ring-[#0070BA]/40'
                          : 'hover:brightness-95'
                      }`}
                      style={{ height: `${totalHeightPercent}%` }}
                    >
                      {/* Bagian Bawah: Ziyadah (Biru Solid ITQAN) */}
                      <div
                        style={{ height: `${ziyadahPercent}%` }}
                        className="w-full bg-[#0070BA] transition-colors"
                        title={`Ziyadah: ${item.ziyadah} Baris`}
                      />

                      {/* Bagian Atas: Muroja'ah (Sky Soft Blue) */}
                      <div
                        style={{ height: `${murojaahPercent}%` }}
                        className="w-full bg-sky-300 transition-colors"
                        title={`Muroja'ah: ${item.murojaah} Baris`}
                      />
                    </div>

                    {/* Label Hari di Sumbu X */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold block transition-colors ${
                          isSelected
                            ? 'text-[#0070BA]'
                            : isToday
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.day}
                      </span>
                      {isToday && (
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
                {activeItem.fullDay}
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
                    {activeTotal}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">baris</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Ziyadah</span>
                  <span className="text-xs font-bold text-[#0070BA]">{activeItem.ziyadah} baris</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Muroja'ah</span>
                  <span className="text-xs font-bold text-sky-700">{activeItem.murojaah} baris</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Target ({activeItem.target} b):</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  isSurpassing
                    ? 'text-emerald-700 bg-emerald-100/70'
                    : 'text-amber-700 bg-amber-100/70'
                }`}
              >
                {isSurpassing ? 'Melampaui Target' : 'Di Bawah Target'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
