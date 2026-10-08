import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import type { Santri } from './types';
import { SantriCard } from './SantriCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type SetoranFilterType = 'all' | 'sudah_setor' | 'belum_setor' | 'tercapai' | 'tidak_tercapai';

interface SantriListSectionProps {
  santriList: Santri[];
  activeFilter: SetoranFilterType;
  onFilterChange: (filter: SetoranFilterType) => void;
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
  onEditTarget?: (santri: Santri) => void;
  onOpenAddModal: () => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  activeFilter,
  onFilterChange,
  onSetor,
  onDetail,
  onEditTarget,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');

  const countTercapai = santriList.filter((s) => s.status === 'tercapai').length;
  const countTidak = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const countBelum = santriList.filter((s) => s.status === 'belum_setor').length;
  const countSudah = countTercapai + countTidak;

  const filtered = santriList.filter((s) => {
    let matchesFilter = true;
    if (activeFilter === 'sudah_setor') {
      matchesFilter = s.status === 'tercapai' || s.status === 'tidak_tercapai' || s.linesCompletedToday > 0;
    } else if (activeFilter === 'belum_setor') {
      matchesFilter = s.status === 'belum_setor';
    } else if (activeFilter !== 'all') {
      matchesFilter = s.status === activeFilter;
    }
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.juzAchieved.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <Card className="p-3.5 sm:p-6 shadow-xs space-y-4">
      {/* Section Header: Title & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Left Side: Title & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground whitespace-nowrap">
              Target &amp; Setoran Santri Hari Ini
            </h3>
            <Badge variant="secondary" className="font-semibold text-xs">
              {filtered.length}
            </Badge>
          </div>

          {/* Switcher Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg text-center transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-background text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('sudah_setor')}
              className={`px-2.5 py-1 rounded-lg text-center transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'sudah_setor'
                  ? 'bg-background text-[#0070BA] font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Sudah Setor ({countSudah})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('belum_setor')}
              className={`px-2.5 py-1 rounded-lg text-center transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'belum_setor'
                  ? 'bg-background text-amber-700 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Belum Setor ({countBelum})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tercapai')}
              className={`px-2.5 py-1 rounded-lg text-center transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'tercapai'
                  ? 'bg-background text-emerald-700 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Tercapai ({countTercapai})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('tidak_tercapai')}
              className={`px-2.5 py-1 rounded-lg text-center transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'tidak_tercapai'
                  ? 'bg-background text-red-700 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Defisit ({countTidak})
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
      {santriList.length === 0 ? (
        <div className="py-10 px-5 text-center text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-4">
          <div className="w-13 h-13 rounded-2xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center mx-auto shadow-2xs border border-[#D6EAF8]">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Selamat Datang di Halaqoh ITQAN
            </h4>
            <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
              Belum ada santri yang terdaftar dalam rombel halaqoh Anda. Daftarkan santri pertama untuk mulai mencatat talaqqi hafalan dan mengirim update harian ke wali santri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto text-left pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
              <span className="font-bold text-[#0070BA] block text-[11px]">1. Tambah Santri</span>
              <p className="text-[10px] text-slate-500">Input nama, NIS, dan kontak WhatsApp wali.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
              <span className="font-bold text-emerald-700 block text-[11px]">2. Catat Setoran</span>
              <p className="text-[10px] text-slate-500">Talaqqi Ziyadah &amp; Muroja'ah sekali klik.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
              <span className="font-bold text-amber-700 block text-[11px]">3. Kirim Laporan</span>
              <p className="text-[10px] text-slate-500">Kirim format pesan resmi langsung ke WhatsApp wali.</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 h-9 px-5 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs cursor-pointer shadow-xs rounded-lg"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Santri Pertama Sekarang</span>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
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
              onEditTarget={onEditTarget}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
