import React from 'react';

interface DataPoint {
  day: string;
  value: number;
}

const CHART_DATA: DataPoint[] = [
  { day: 'Sen', value: 120 },
  { day: 'Sel', value: 180 },
  { day: 'Rab', value: 140 },
  { day: 'Kam', value: 210 },
  { day: 'Jum', value: 160 },
  { day: 'Sab', value: 190 },
  { day: 'Ahd', value: 230 },
];

export const TrendChart: React.FC = () => {
  const width = 800;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 250;
  const minVal = 80;

  const points = CHART_DATA.map((d, i) => {
    const x = paddingLeft + (i / (CHART_DATA.length - 1)) * chartWidth;
    const y = paddingTop + (1 - (d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  const dx = lastPoint.x - secondLastPoint.x;
  const dy = lastPoint.y - secondLastPoint.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const arrowEndX = lastPoint.x + (dx / len) * 16;
  const arrowEndY = lastPoint.y + (dy / len) * 16;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <marker
              id="chart-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#0F172A" />
            </marker>
          </defs>

          {/* Clean grid lines */}
          {[200, 150, 100].map((val) => {
            const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
            return (
              <line
                key={val}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            );
          })}

          {/* Line */}
          <polyline
            fill="none"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Upward arrow at the end */}
          <line
            x1={lastPoint.x}
            y1={lastPoint.y}
            x2={arrowEndX}
            y2={arrowEndY}
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#chart-arrow)"
          />

          {/* Points */}
          {points.map((p) => (
            <g key={p.day}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={height - 8}
                fill="#64748B"
                fontSize="12"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
