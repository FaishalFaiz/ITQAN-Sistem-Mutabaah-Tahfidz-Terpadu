import React, { useState, useRef, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';

interface SantriListSectionProps {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
  onOpenAddModal: () => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  onSetor,
  onDetail,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = santriList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.juzAchieved.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.santri-card-item',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.03,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [filtered.length, search]);

  return (
    <div ref={sectionRef} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-base text-slate-900">
            Daftar Santri
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {santriList.length} Santri
          </span>
        </div>

        {/* Controls: Search & Add Santri */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari santri..."
              className="w-40 sm:w-52 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] text-xs font-semibold transition-colors shadow-2xs active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Scrollable grid container for santri cards */}
      <div 
        className="max-h-[440px] overflow-y-auto pr-1"
        tabIndex={0}
        aria-label="Daftar Santri yang dapat digulir ke bawah"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((santri) => (
            <div key={santri.id} className="santri-card-item">
              <SantriCard
                santri={santri}
                onSetor={onSetor}
                onDetail={onDetail}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
