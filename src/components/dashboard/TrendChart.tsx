import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';

interface DataPoint {
  day: string;
  date: string;
  totalBaris: number;
  santriHadir: number;
  targetBaris: number;
}

const WEEK_DATA: DataPoint[] = [
  { day: 'Sen', date: '22 Sep', totalBaris: 135, santriHadir: 11, targetBaris: 140 },
  { day: 'Sel', date: '23 Sep', totalBaris: 180, santriHadir: 12, targetBaris: 140 },
  { day: 'Rab', date: '24 Sep', totalBaris: 120, santriHadir: 10, targetBaris: 140 },
  { day: 'Kam', date: '25 Sep', totalBaris: 210, santriHadir: 12, targetBaris: 140 },
  { day: 'Jum', date: '26 Sep', totalBaris: 155, santriHadir: 12, targetBaris: 140 },
  { day: 'Sab', date: '27 Sep', totalBaris: 175, santriHadir: 12, targetBaris: 140 },
  { day: 'Ahd', date: '28 Sep (Hari Ini)', totalBaris: 225, santriHadir: 12, targetBaris: 140 },
];

export const TrendChart: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'pekan' | 'bulan'>('pekan');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 45;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 250;
  const minVal = 50;

  // Calculate points for the line
  const points = WEEK_DATA.map((d, i) => {
    const x = paddingLeft + (i / (WEEK_DATA.length - 1)) * chartWidth;
    const y = paddingTop + (1 - (d.totalBaris - minVal) / (maxVal - minVal)) * chartHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Last point & vector for the upward trend arrow
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  
  // Extend vector slightly for the arrowhead
  const dx = lastPoint.x - secondLastPoint.x;
  const dy = lastPoint.y - secondLastPoint.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const arrowEndX = lastPoint.x + (dx / len) * 20;
  const arrowEndY = lastPoint.y + (dy / len) * 20;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Tren Capaian Mutabaah Halaqoh
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              +18.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik total baris setoran ziyadah & muroja'ah per hari
          </p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveRange('pekan')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeRange === 'pekan'
                ? 'bg-white text-[#0070BA] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pekan Ini
          </button>
          <button
            type="button"
            onClick={() => setActiveRange('bulan')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeRange === 'bulan'
                ? 'bg-white text-[#0070BA] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-500 block">Total Pekan Ini</span>
          <span className="text-sm font-bold text-slate-900">1.200 Baris</span>
          <span className="text-[11px] text-slate-500 block">~80 Halaman</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-500 block">Rata-rata Harian</span>
          <span className="text-sm font-bold text-slate-900">171.4 Baris</span>
          <span className="text-[11px] text-emerald-600 font-medium block">&gt; Target 140/hari</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-500 block">Hari Ini (Puncak)</span>
          <span className="text-sm font-bold text-[#0070BA]">225 Baris</span>
          <span className="text-[11px] text-slate-500 block">10 dari 12 Tercapai</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-500 block">Target Halaqoh</span>
          <span className="text-sm font-bold text-slate-900">140 Baris / Sesi</span>
          <span className="text-[11px] text-slate-500 block">12 Santri Aktif</span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Solid Marker Arrow as drawn in wireframe */}
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#0070BA" />
              </marker>
            </defs>

            {/* Horizontal Grid lines */}
            {[250, 200, 150, 100, 50].map((val) => {
              const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={val === 140 ? '4 3' : 'none'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="#94A3B8"
                    fontSize="11"
                    textAnchor="end"
                    fontFamily="Inter, sans-serif"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Target line label (140 baris target) */}
            <text
              x={width - paddingRight + 4}
              y={paddingTop + (1 - (140 - minVal) / (maxVal - minVal)) * chartHeight + 3}
              fill="#0070BA"
              fontSize="10"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              Target
            </text>

            {/* Main Trend Line (Solid Blue as per DESIGN.md) */}
            <polyline
              fill="none"
              stroke="#0070BA"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* Upward arrow segment matching wireframe sketch */}
            <line
              x1={lastPoint.x}
              y1={lastPoint.y}
              x2={arrowEndX}
              y2={arrowEndY}
              stroke="#0070BA"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />

            {/* Data Points (Solid Circles) */}
            {points.map((p, i) => {
              const isHovered = hoveredIndex === i;
              const isLast = i === points.length - 1;

              return (
                <g key={p.day}>
                  {/* Invisible hit area for comfortable hover */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Outer circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? '6' : '4.5'}
                    fill="#FFFFFF"
                    stroke="#0070BA"
                    strokeWidth="3"
                    className="transition-all duration-150 cursor-pointer pointer-events-none"
                  />

                  {/* Highlighting today's or hovered dot */}
                  {isLast && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      fill="none"
                      stroke="#0070BA"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      className="pointer-events-none animate-pulse"
                    />
                  )}

                  {/* Day label on X-axis */}
                  <text
                    x={p.x}
                    y={height - 12}
                    fill={isLast ? '#0070BA' : '#64748B'}
                    fontSize="11"
                    fontWeight={isLast ? '700' : '500'}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {p.day}
                  </text>

                  {/* Value badge tooltip when hovered */}
                  {isHovered && (
                    <g transform={`translate(${p.x}, ${p.y - 38})`}>
                      <rect
                        x="-48"
                        y="0"
                        width="96"
                        height="30"
                        rx="6"
                        fill="#0F172A"
                        className="shadow-md"
                      />
                      <polygon
                        points="-5,30 5,30 0,35"
                        fill="#0F172A"
                      />
                      <text
                        x="0"
                        y="14"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                      >
                        {p.day}: {p.totalBaris} Baris
                      </text>
                      <text
                        x="0"
                        y="24"
                        fill="#94A3B8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                      >
                        {p.santriHadir} Santri Setor
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Arah panah menunjukkan tren kumulatif peningkatan kecepatan ziyadah halaqoh
        </span>
        <span className="font-medium text-slate-700">Pembaruan: Hari ini 10:45 WIB</span>
      </div>
    </div>
  );
};
