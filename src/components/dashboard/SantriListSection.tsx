import React, { useState, useRef, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.04,
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
    <Card ref={sectionRef} className="p-3.5 sm:p-6 shadow-xs space-y-4">
      {/* Section Header: Switcher beside title (Left) & Searchbar beside Add button (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Left Side: Title & Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground whitespace-nowrap">
              Daftar Santri Halaqoh
            </h3>
            <Badge variant="secondary" className="font-semibold text-xs">
              {filtered.length}
            </Badge>
          </div>

          {/* Switcher Filter (Responsif: 4 Kolom di Mobile, Flex di Desktop) */}
          <div className="grid grid-cols-4 sm:flex items-center bg-muted/60 p-0.5 sm:p-1 rounded-lg border border-border text-xs w-full sm:w-auto overflow-hidden">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-1.5 sm:px-3 py-1 rounded-md text-center transition-all truncate cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-background text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span className="hidden sm:inline">Semua ({santriList.length})</span>
              <span className="sm:hidden text-[11px]">Semua ({santriList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tercapai')}
              className={`px-1.5 sm:px-3 py-1 rounded-md text-center transition-all truncate cursor-pointer ${
                activeFilter === 'tercapai'
                  ? 'bg-background text-emerald-700 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span className="hidden sm:inline">Tercapai ({countTercapai})</span>
              <span className="sm:hidden text-[11px]">Tercapai ({countTercapai})</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tidak_tercapai')}
              className={`px-1.5 sm:px-3 py-1 rounded-md text-center transition-all truncate cursor-pointer ${
                activeFilter === 'tidak_tercapai'
                  ? 'bg-background text-red-700 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span className="hidden sm:inline">Tidak Tercapai ({countTidak})</span>
              <span className="sm:hidden text-[11px]">Defisit ({countTidak})</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('belum_setor')}
              className={`px-1.5 sm:px-3 py-1 rounded-md text-center transition-all truncate cursor-pointer ${
                activeFilter === 'belum_setor'
                  ? 'bg-background text-amber-700 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span className="hidden sm:inline">Belum Setor ({countBelum})</span>
              <span className="sm:hidden text-[11px]">Belum ({countBelum})</span>
            </button>
          </div>
        </div>

        {/* Right Side: Search Input beside Add Santri Button */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari santri atau juz..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Tombol Tambah Santri */}
          <Button
            type="button"
            size="sm"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* Grid Kartu Santri */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border space-y-2">
          <p className="font-semibold text-foreground text-sm">Tidak ada santri yang cocok</p>
          <p>Coba ubah kata kunci pencarian atau ganti filter status di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((santri) => (
            <SantriCard
              key={santri.id}
              santri={santri}
              onSetor={onSetor}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
