import React, { useState } from 'react';
import { Search, Users, ArrowDown } from 'lucide-react';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';

interface SantriListSectionProps {
  santriList: Santri[];
  activeFilter: 'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor';
  onFilterChange: (filter: 'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor') => void;
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  activeFilter,
  onFilterChange,
  onSetor,
  onDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter santri
  const filteredSantri = santriList.filter((s) => {
    const matchesFilter =
      activeFilter === 'all' || s.status === activeFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.lastSurah.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0070BA]" />
              Daftar Santri Halaqoh
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {santriList.length} Santri
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <span>Klik kartu santri untuk setor atau lihat riwayat capaian</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[#0070BA] font-medium">
              <ArrowDown className="w-3 h-3" /> Scroll ke bawah untuk melihat semua santri
            </span>
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri / NIS..."
              className="w-48 sm:w-60 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
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
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'tercapai'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tercapai (10)
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tidak_tercapai')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'tidak_tercapai'
                  ? 'bg-white text-red-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tidak (1)
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('belum_setor')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'belum_setor'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum (1)
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Container (Matching "bisa di scroll kebawah santrinya") */}
      <div 
        className="max-h-[560px] overflow-y-auto pr-1 space-y-4 focus:outline-none"
        tabIndex={0}
        aria-label="Daftar Santri Halaqoh yang dapat digeser ke bawah"
      >
        {filteredSantri.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Tidak ada santri yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSantri.map((santri) => (
              <SantriCard
                key={santri.id}
                santri={santri}
                onSetor={onSetor}
                onDetail={onDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll Hint Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-500">
          <ArrowDown className="w-3.5 h-3.5 text-[#0070BA] animate-bounce" />
          <span>Menampilkan <b>{filteredSantri.length}</b> dari {santriList.length} santri dalam halaqoh ini (bisa digulir ke bawah)</span>
        </span>
        <span className="font-medium text-slate-700">Total Kuota: 12 Santri</span>
      </div>
    </div>
  );
};
