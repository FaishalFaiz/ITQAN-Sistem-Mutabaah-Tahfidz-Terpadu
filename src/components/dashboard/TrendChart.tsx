import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import gsap from 'gsap';

interface DataPoint {
  day: string;
  value: number;
}

const CHART_DATA: DataPoint[] = [
  { day: 'Sen', value: 135 },
  { day: 'Sel', value: 180 },
  { day: 'Rab', value: 120 },
  { day: 'Kam', value: 210 },
  { day: 'Jum', value: 155 },
  { day: 'Sab', value: 175 },
  { day: 'Ahd', value: 225 },
];

export const TrendChart: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'pekan' | 'bulan'>('pekan');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);

  const width = 800;
  const height = 120;
  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 14;
  const paddingBottom = 22;

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

  const areaPoints = `${points[0].x},${height - paddingBottom} ` +
    polylinePoints +
    ` ${points[points.length - 1].x},${height - paddingBottom}`;

  // Arrow marker vector
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  const dx = lastPoint.x - secondLastPoint.x;
  const dy = lastPoint.y - secondLastPoint.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const arrowEndX = lastPoint.x + (dx / len) * 16;
  const arrowEndY = lastPoint.y + (dy / len) * 16;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance container
      gsap.fromTo(
        chartCardRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      );

      // Area fade in
      gsap.fromTo(
        '.chart-area-fill',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      );

      // Dots staggered pop
      gsap.fromTo(
        '.chart-node',
        { scale: 0, transformOrigin: 'center' },
        { scale: 1, duration: 0.45, stagger: 0.05, ease: 'power3.out', delay: 0.35 }
      );
    }, chartCardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={chartCardRef} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {/* Header compact */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            Tren Capaian Mutabaah
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            +18.4%
          </span>
        </div>

        {/* Range switcher compact */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveRange('pekan')}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
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
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
              activeRange === 'bulan'
                ? 'bg-white text-[#0070BA] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* SVG compact */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="areaGradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0070BA" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0070BA" stopOpacity="0.0" />
            </linearGradient>

            <marker
              id="chart-arrowhead-compact"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" fill="#0070BA" />
            </marker>
          </defs>

          {/* Grid lines */}
          {[200, 100].map((val) => {
            const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#94A3B8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#areaGradientCompact)"
            className="chart-area-fill"
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#0070BA"
            strokeWidth="2.5"
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
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd="url(#chart-arrowhead-compact)"
          />

          {/* Dots */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            const isLast = i === points.length - 1;

            return (
              <g key={p.day}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#0070BA"
                  strokeWidth="2"
                  className="chart-node transition-all pointer-events-none"
                />

                <text
                  x={p.x}
                  y={height - 4}
                  fill={isLast ? '#0070BA' : '#64748B'}
                  fontSize="10"
                  fontWeight={isLast ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {p.day}
                </text>

                {isHovered && (
                  <g transform={`translate(${p.x}, ${p.y - 28})`} className="pointer-events-none">
                    <rect
                      x="-38"
                      y="0"
                      width="76"
                      height="22"
                      rx="4"
                      fill="#0F172A"
                    />
                    <polygon points="-3,22 3,22 0,25" fill="#0F172A" />
                    <text
                      x="0"
                      y="14"
                      fill="#FFFFFF"
                      fontSize="10"
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
