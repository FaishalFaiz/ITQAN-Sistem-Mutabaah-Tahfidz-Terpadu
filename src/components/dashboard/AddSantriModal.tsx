import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import type { Santri, HalaqahGroup } from './types';
import { storageService } from '../../services/storageService';
import { waGatewayService } from '../../services/waGatewayService';
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
import { formatJuz } from '@/lib/utils';

interface AddSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSantri: (santri: Santri) => void;
}

export const AddSantriModal: React.FC<AddSantriModalProps> = ({
  isOpen,
  onClose,
  onAddSantri,
}) => {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [juzAchieved, setJuzAchieved] = useState('');
  const [dailyTargetLines, setDailyTargetLines] = useState(15);
  const [lastSurah, setLastSurah] = useState('');
  const [halaqahList, setHalaqahList] = useState<HalaqahGroup[]>([]);
  const [selectedHalaqahName, setSelectedHalaqahName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const groups = storageService.getHalaqahList();
      const active = storageService.getActiveHalaqah();
      setHalaqahList(groups);
      setSelectedHalaqahName(active?.name || (groups[0]?.name ?? 'Halaqoh Utama'));
      setDailyTargetLines(active?.targetDailyLines || 15);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate initials
    const words = name.trim().split(' ');
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const cleanPhone = parentPhone.trim() ? waGatewayService.normalizePhoneNumber(parentPhone.trim()) : '';

    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `santri-${Date.now()}`;

    const newSantri: Santri = {
      id: generatedId,
      name: name.trim(),
      nis: nis.trim() || `2024${Math.floor(100 + Math.random() * 900)}`,
      parentName: parentName.trim() || `Wali ${name.trim()}`,
      parentPhone: cleanPhone,
      avatarInitials: initials,
      juzAchieved: formatJuz(juzAchieved.trim() || '1 Juz'),
      dailyTargetLines: Number(dailyTargetLines) || 15,
      linesCompletedToday: 0,
      status: 'belum_setor',
      lastSurah: lastSurah.trim() || 'Al-Fatihah 1-7',
      totalLinesMemorized: 15 * 15,
      totalLinesTarget: 9060,
      halaqahName: selectedHalaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
    };

    onAddSantri(newSantri);
    toast.success('Santri baru berhasil ditambahkan!', {
      description: `${newSantri.name} • ${newSantri.halaqahName}`,
    });
    onClose();

    // Reset form
    setName('');
    setNis('');
    setParentName('');
    setParentPhone('');
    setJuzAchieved('');
    setDailyTargetLines(15);
    setLastSurah('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <DialogHeader className="text-left pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 leading-snug">
              Tambah Santri Baru
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Daftarkan santri ke halaqoh aktif beserta target hafalan dan kontak wali.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Lengkap Santri <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Zaid bin Haritsah"
                className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Halaqoh Santri
              </label>
              <select
                value={selectedHalaqahName}
                onChange={(e) => setSelectedHalaqahName(e.target.value)}
                className="w-full h-9.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100/80 border border-slate-300 text-slate-900 shadow-xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 cursor-pointer transition-all"
              >
                {halaqahList.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                NIS (Nomor Induk)
              </label>
              <Input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 2024013"
                className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Capaian Juz Awal
              </label>
              <Input
                type="text"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                placeholder="Contoh: 1 Juz"
                className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Target Baris / Hari
                </label>
                <span className="text-[10px] font-semibold text-[#0070BA]">
                  {(dailyTargetLines / 15).toFixed(1)} Hal/hari
                </span>
              </div>
              <Input
                type="number"
                min={1}
                max={300}
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                placeholder="15"
                className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Surah Terakhir
              </label>
              <Input
                type="text"
                value={lastSurah}
                onChange={(e) => setLastSurah(e.target.value)}
                placeholder="Contoh: An-Naba 1-15"
                className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:bg-slate-100 hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>
          </div>

          {/* Kontak Wali Santri (Walsan) */}
          <div className="bg-[#EBF5FB]/50 border border-[#0070BA]/20 rounded-xl p-3.5 space-y-2.5 mt-2">
            <div>
              <span className="block text-xs font-bold text-slate-900">
                Kontak Wali Santri
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nama Ayah / Ibu / Wali
                </label>
                <Input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Bpk. Ruslan Abdullah"
                  className="text-xs h-9.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:border-slate-400 focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  No. WhatsApp Wali
                </label>
                <Input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="text-xs h-9.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs hover:border-slate-400 focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 border-slate-200 rounded-lg cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Santri Baru
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
