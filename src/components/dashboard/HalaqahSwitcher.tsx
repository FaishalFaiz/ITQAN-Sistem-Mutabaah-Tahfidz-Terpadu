import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Plus, BookOpen, Layers, KeyRound, Settings2 } from 'lucide-react';
import type { HalaqahGroup } from './types';
import { storageService, EVENT_DATA_CHANGED } from '../../services/storageService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface HalaqahSwitcherProps {
  onHalaqahChanged?: (halaqah: HalaqahGroup) => void;
  className?: string;
}

export const HalaqahSwitcher: React.FC<HalaqahSwitcherProps> = ({
  onHalaqahChanged,
  className = '',
}) => {
  const navigate = useNavigate();
  const [halaqahList, setHalaqahList] = useState<HalaqahGroup[]>(() => storageService.getUserHalaqahList());
  const [activeHalaqah, setActiveHalaqah] = useState<HalaqahGroup | null>(() => storageService.getActiveHalaqah());
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // New Halaqah Form
  const [newHalaqahName, setNewHalaqahName] = useState('');
  const [newHalaqahRoom, setNewHalaqahRoom] = useState('');
  const [newHalaqahDesc, setNewHalaqahDesc] = useState('');

  // Join Halaqah Form
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state when changes occur in storage
  useEffect(() => {
    const handleUpdate = () => {
      setHalaqahList(storageService.getUserHalaqahList());
      const currentActive = storageService.getActiveHalaqah();
      setActiveHalaqah(currentActive);
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleUpdate);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectHalaqah = (group: HalaqahGroup) => {
    storageService.setActiveHalaqah(group.id);
    setActiveHalaqah(group);
    setIsOpen(false);
    onHalaqahChanged?.(group);
    toast.success(`Mengampu ${group.name}`, {
      description: 'Data santri dan mutaba\'ah telah disesuaikan.',
    });
  };

  const handleCreateHalaqah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHalaqahName.trim()) {
      toast.error('Nama halaqoh wajib diisi');
      return;
    }

    const created = storageService.createHalaqahRoom({
      name: newHalaqahName.trim(),
      room: newHalaqahRoom.trim() || undefined,
      description: newHalaqahDesc.trim() || undefined,
    });

    storageService.setActiveHalaqah(created.id);
    setActiveHalaqah(created);
    setHalaqahList(storageService.getUserHalaqahList());
    setIsAddModalOpen(false);
    setIsOpen(false);
    setNewHalaqahName('');
    setNewHalaqahRoom('');
    setNewHalaqahDesc('');

    toast.success(`Ruang halaqoh baru berhasil dibuat`, {
      description: `Sekarang mengampu: ${created.name} (Kode: ${created.code})`,
    });
    onHalaqahChanged?.(created);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) {
      toast.error('Masukkan kode halaqoh.');
      return;
    }

    setIsJoining(true);
    const result = storageService.joinHalaqahByCode(clean);
    setIsJoining(false);

    if (result.success && result.halaqah) {
      setHalaqahList(storageService.getUserHalaqahList());
      setActiveHalaqah(result.halaqah);
      setIsJoinModalOpen(false);
      setIsOpen(false);
      setJoinCodeInput('');
      toast.success(`Berhasil bergabung ke "${result.halaqah.name}"!`);
      onHalaqahChanged?.(result.halaqah);
    } else {
      toast.error(result.error || 'Gagal bergabung ke halaqoh.');
    }
  };

  return (
    <>
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        {/* Switcher Button Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all text-xs font-semibold cursor-pointer shadow-2xs max-w-[210px] sm:max-w-[280px]"
          aria-expanded={isOpen}
          aria-haspopup="true"
          title="Klik untuk memilih halaqoh yang diampu"
        >
          <div className="w-5 h-5 rounded-md bg-[#0070BA] text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="truncate text-left flex-1 font-bold text-slate-900">
            {activeHalaqah?.name || 'Pilih / Buat Halaqoh'}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0070BA]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-[340px] sm:w-[390px] max-w-[calc(100vw-24px)] rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Ruang Halaqoh Diampu
                </span>
                <span className="text-[11px] text-slate-400">
                  {halaqahList.length} ruang yang dapat Anda akses
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsJoinModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#0070BA] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Gabung via kode halaqoh"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Gabung</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0070BA] hover:text-[#005C9E] bg-[#EBF5FB] hover:bg-[#D6EAF8] px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Tambah kelompok halaqoh baru"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buat Baru</span>
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
              {halaqahList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                  <p>Anda belum memiliki atau bergabung ke ruang halaqoh apapun.</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="h-8 text-xs bg-[#0070BA] text-white"
                  >
                    Buat Halaqoh Pertama
                  </Button>
                </div>
              ) : (
                halaqahList.map((item) => {
                  const isSelected = item.id === activeHalaqah?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectHalaqah(item)}
                      className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                        isSelected ? 'bg-[#EBF5FB]/60' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#0070BA] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-xs font-bold truncate block ${
                              isSelected ? 'text-[#0070BA]' : 'text-slate-900'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                            {item.code}
                          </span>
                          {isSelected && (
                            <span className="shrink-0 text-[#0070BA] font-bold">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 min-w-0">
                          {item.room && (
                            <span className="font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/70 px-1.5 py-0.5 rounded text-[10px] shrink-0 whitespace-nowrap leading-tight">
                              {item.room}
                            </span>
                          )}
                          {item.targetDailyLines ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded text-[10px] shrink-0 whitespace-nowrap leading-tight">
                              {item.targetDailyLines} Baris
                            </span>
                          ) : null}
                          <span className="truncate min-w-0 flex-1 text-slate-400">
                            {item.musyrifName || item.description || 'Halaqoh Tahfidz'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/halaqah');
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0070BA] hover:underline cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Buka Pengaturan Room Halaqoh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Halaqoh Baru */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Tambah Kelompok Halaqoh Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Buat kelompok halaqoh baru. Sistem akan otomatis memberikan kode join unik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHalaqah} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Halaqoh <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={newHalaqahName}
                onChange={(e) => setNewHalaqahName(e.target.value)}
                placeholder="Contoh: Halaqoh Zubair bin Awwam"
                className="text-xs h-9.5 bg-white border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Lokasi / Ruang Halaqoh (Opsional)
              </label>
              <Input
                type="text"
                value={newHalaqahRoom}
                onChange={(e) => setNewHalaqahRoom(e.target.value)}
                placeholder="Contoh: Masjid Lt. 2 / Ruang C-10"
                className="text-xs h-9.5 bg-white border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Deskripsi / Keterangan (Opsional)
              </label>
              <Input
                type="text"
                value={newHalaqahDesc}
                onChange={(e) => setNewHalaqahDesc(e.target.value)}
                placeholder="Contoh: Tingkat Mutawassith (Juz 5-10)"
                className="text-xs h-9.5 bg-white border-slate-300"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs h-9 font-semibold text-slate-600"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="text-xs h-9 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold"
              >
                Simpan &amp; Aktifkan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Gabung via Kode */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0070BA]" />
              <span>Gabung ke Ruang Halaqoh</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Masukkan kode akses yang diberikan oleh musyrif pembuat halaqoh.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinByCode} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Kode Akses Halaqoh <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                autoFocus
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Contoh: HLQ-ABU-01 atau HLQ-XXXXXX"
                className="text-sm font-mono tracking-widest font-bold h-10 bg-white border-slate-300 uppercase pl-3"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsJoinModalOpen(false)}
                className="text-xs h-9 font-semibold text-slate-600"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isJoining || !joinCodeInput.trim()}
                className="text-xs h-9 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold"
              >
                {isJoining ? 'Memeriksa...' : 'Gabung Halaqoh'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
