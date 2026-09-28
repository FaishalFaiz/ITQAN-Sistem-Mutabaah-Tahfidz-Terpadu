import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface DataPoint {
  day: string;
  value: number;
  santri: number;
}

const CHART_DATA: DataPoint[] = [
  { day: 'Sen', value: 135, santri: 11 },
  { day: 'Sel', value: 180, santri: 12 },
  { day: 'Rab', value: 120, santri: 10 },
  { day: 'Kam', value: 210, santri: 12 },
  { day: 'Jum', value: 155, santri: 12 },
  { day: 'Sab', value: 175, santri: 12 },
  { day: 'Ahd', value: 225, santri: 12 },
];

export const TrendChart: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'pekan' | 'bulan'>('pekan');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 800;
  const height = 230;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 250;
  const minVal = 50;

  const points = CHART_DATA.map((d, i) => {
    const x = paddingLeft + (i / (CHART_DATA.length - 1)) * chartWidth;
    const y = paddingTop + (1 - (d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Gradient area points
  const areaPoints = `${points[0].x},${height - paddingBottom} ` +
    polylinePoints +
    ` ${points[points.length - 1].x},${height - paddingBottom}`;

  // Arrow calculation at the end
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  const dx = lastPoint.x - secondLastPoint.x;
  const dy = lastPoint.y - secondLastPoint.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const arrowEndX = lastPoint.x + (dx / len) * 20;
  const arrowEndY = lastPoint.y + (dy / len) * 20;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base text-slate-900">
            Tren Capaian Mutabaah
          </h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            +18.4%
          </span>
        </div>

        {/* Range Segmented Control */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveRange('pekan')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
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
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeRange === 'bulan'
                ? 'bg-white text-[#0070BA] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Soft area gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0070BA" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0070BA" stopOpacity="0.0" />
            </linearGradient>

            {/* Solid arrow marker */}
            <marker
              id="chart-arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#0070BA" />
            </marker>
          </defs>

          {/* Grid lines */}
          {[200, 150, 100, 50].map((val) => {
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
                  strokeDasharray={val === 150 ? '3 3' : 'none'}
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

          {/* Gradient area */}
          <polygon points={areaPoints} fill="url(#areaGradient)" />

          {/* Solid line */}
          <polyline
            fill="none"
            stroke="#0070BA"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Upward arrow segment */}
          <line
            x1={lastPoint.x}
            y1={lastPoint.y}
            x2={arrowEndX}
            y2={arrowEndY}
            stroke="#0070BA"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#chart-arrowhead)"
          />

          {/* Nodes */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            const isLast = i === points.length - 1;

            return (
              <g key={p.day}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Node dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#FFFFFF"
                  stroke="#0070BA"
                  strokeWidth="2.5"
                  className="transition-all pointer-events-none"
                />

                {/* Day label */}
                <text
                  x={p.x}
                  y={height - 10}
                  fill={isLast ? '#0070BA' : '#64748B'}
                  fontSize="12"
                  fontWeight={isLast ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {p.day}
                </text>

                {/* Interactive Tooltip */}
                {isHovered && (
                  <g transform={`translate(${p.x}, ${p.y - 36})`} className="pointer-events-none">
                    <rect
                      x="-44"
                      y="0"
                      width="88"
                      height="26"
                      rx="6"
                      fill="#0F172A"
                    />
                    <polygon points="-4,26 4,26 0,30" fill="#0F172A" />
                    <text
                      x="0"
                      y="16"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                    >
                      {p.value} Baris
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
