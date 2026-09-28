import React, { useState, useRef, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';

interface SantriListSectionProps {
  santriList: Santri[];
  activeFilter: 'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  onFilterChange: (filter: 'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor') => void;
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
  onOpenAddModal: () => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  activeFilter,
  onFilterChange,
  onSetor,
  onDetail,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = santriList.filter((s) => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.juzAchieved.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search);
    return matchesFilter && matchesSearch;
  });

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
  }, [filtered.length, search, activeFilter]);

  const countTercapai = santriList.filter((s) => s.status === 'tercapai').length;
  const countTidak = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const countBelum = santriList.filter((s) => s.status === 'belum_setor').length;

  return (
    <div ref={sectionRef} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
      {/* Section Header with Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-base text-slate-900">
            Daftar Santri Halaqoh
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {filtered.length} dari {santriList.length} Santri
          </span>
        </div>

        {/* Filter Tabs + Search + Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tercapai')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'tercapai'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tercapai ({countTercapai})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tidak_tercapai')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'tidak_tercapai'
                  ? 'bg-white text-red-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tidak Tercapai ({countTidak})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('belum_setor')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'belum_setor'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Setor ({countBelum})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="w-40 sm:w-48 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>

          {/* Add Santri Button */}
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

      {/* Grid container for santri cards - natural full display */}
      <div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada santri yang sesuai kriteria pencarian atau filter status.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
