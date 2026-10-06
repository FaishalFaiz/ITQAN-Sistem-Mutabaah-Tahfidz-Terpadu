import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Santri } from './types';
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
  const [juzAchieved, setJuzAchieved] = useState('1.0 Juz');
  const [dailyTargetLines, setDailyTargetLines] = useState(15);
  const [lastSurah, setLastSurah] = useState('An-Naba 1-15');

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

    const newSantri: Santri = {
      id: Date.now().toString(),
      name: name.trim(),
      nis: nis.trim() || `2024${Math.floor(100 + Math.random() * 900)}`,
      parentName: parentName.trim() || `Wali ${name.trim()}`,
      parentPhone: cleanPhone,
      avatarInitials: initials,
      juzAchieved: juzAchieved.trim() || '1.0 Juz',
      dailyTargetLines: Number(dailyTargetLines) || 15,
      linesCompletedToday: 0,
      status: 'belum_setor',
      lastSurah: lastSurah.trim() || 'Al-Fatihah 1-7',
      totalLinesMemorized: 15 * 15,
      totalLinesTarget: 9060,
      halaqahName: 'Halaqoh Abu Bakar Ash-Shiddiq',
    };

    onAddSantri(newSantri);
    toast.success('Santri baru berhasil ditambahkan!', {
      description: `${newSantri.name} • NIS ${newSantri.nis}`,
    });
    onClose();

    // Reset form
    setName('');
    setNis('');
    setParentName('');
    setParentPhone('');
    setJuzAchieved('1.0 Juz');
    setDailyTargetLines(15);
    setLastSurah('An-Naba 1-15');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Tambah Santri Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Masukkan santri ke daftar rombel halaqoh aktif beserta kontak wali untuk notifikasi WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Nama Lengkap Santri <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Zaid bin Haritsah"
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                NIS (Nomor Induk)
              </label>
              <Input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="2024013"
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Capaian Juz Awal
              </label>
              <Input
                type="text"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                placeholder="5.0 Juz"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Target Baris / Hari
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Surah Terakhir
              </label>
              <Input
                type="text"
                value={lastSurah}
                onChange={(e) => setLastSurah(e.target.value)}
                placeholder="An-Naba 1-40"
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Kontak Wali Santri (Walsan) */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="block text-xs font-bold text-slate-800">
              Kontak Wali Santri
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Nama Ayah / Ibu / Wali
                </label>
                <Input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Bpk. Ruslan Abdullah"
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  No. WhatsApp Wali
                </label>
                <Input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="081234567890"
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold h-10 px-4 border-slate-200 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="text-xs font-semibold h-10 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-xs"
            >
              Simpan Santri Baru
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
