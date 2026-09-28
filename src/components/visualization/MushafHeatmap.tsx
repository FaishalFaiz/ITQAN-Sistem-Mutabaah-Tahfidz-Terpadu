import React from 'react';

interface MushafHeatmapProps {
  completedPages?: number[]; // Green (Mutqin / Exam Passed)
  inProgressPages?: number[]; // Orange (Setor / Ziyadah / Murojaah)
  totalPages?: number;
  onPageClick?: (pageNumber: number) => void;
}

export const MushafHeatmap: React.FC<MushafHeatmapProps> = ({
  completedPages = [1, 2, 3, 4, 5, 582, 583, 584, 600, 601, 602, 603, 604],
  inProgressPages = [6, 7, 8, 9, 10, 585, 586, 587],
  totalPages = 604,
  onPageClick,
}) => {
  const completedSet = new Set(completedPages);
  const inProgressSet = new Set(inProgressPages);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#059669] inline-block"></span>
            <span>Mutqin (Lulus Tasmi')</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#F59E0B] inline-block"></span>
            <span>Setoran / Ziyadah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#E2E8F0] inline-block"></span>
            <span>Belum Disetor</span>
          </div>
        </div>
        <div className="font-semibold text-slate-800">
          Total: {completedPages.length + inProgressPages.length} / {totalPages} Halaman
        </div>
      </div>

      <div className="grid grid-cols-20 sm:grid-cols-25 md:grid-cols-30 lg:grid-cols-38 gap-1 max-h-[300px] overflow-y-auto p-3 bg-white border border-slate-200 rounded-lg">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          let bg = 'bg-[#E2E8F0] hover:ring-2 hover:ring-slate-400';
          let title = `Halaman ${page} - Belum disetor`;

          if (completedSet.has(page)) {
            bg = 'bg-[#059669] hover:ring-2 hover:ring-emerald-700';
            title = `Halaman ${page} - Mutqin / Lulus Ujian`;
          } else if (inProgressSet.has(page)) {
            bg = 'bg-[#F59E0B] hover:ring-2 hover:ring-amber-600';
            title = `Halaman ${page} - Sudah disetor`;
          }

          return (
            <button
              key={page}
              title={title}
              onClick={() => onPageClick && onPageClick(page)}
              className={`w-3.5 h-3.5 rounded-sm transition-all text-[9px] flex items-center justify-center font-mono ${bg}`}
              aria-label={title}
            />
          );
        })}
      </div>
    </div>
  );
};
