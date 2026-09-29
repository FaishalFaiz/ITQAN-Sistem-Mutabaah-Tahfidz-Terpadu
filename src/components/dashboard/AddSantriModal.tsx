import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Santri } from './types';
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

    const newSantri: Santri = {
      id: Date.now().toString(),
      name: name.trim(),
      nis: nis.trim() || `2024${Math.floor(100 + Math.random() * 900)}`,
      avatarInitials: initials,
      juzAchieved: juzAchieved.trim() || '1.0 Juz',
      dailyTargetLines: Number(dailyTargetLines) || 15,
      linesCompletedToday: 0,
      status: 'belum_setor',
      lastSurah: lastSurah.trim() || 'Al-Fatihah 1-7',
      totalLinesMemorized: 15 * 15,
      totalLinesTarget: 9060,
    };

    onAddSantri(newSantri);
    onClose();

    // Reset form
    setName('');
    setNis('');
    setJuzAchieved('1.0 Juz');
    setDailyTargetLines(15);
    setLastSurah('An-Naba 1-15');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Tambah Santri Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Masukkan santri ke daftar rombel halaqoh aktif
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nama Lengkap Santri <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Zaid bin Haritsah"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                NIS (Nomor Induk)
              </label>
              <Input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="2024013"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Capaian Juz Awal
              </label>
              <Input
                type="text"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                placeholder="5.0 Juz"
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Baris / Hari
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Surah Terakhir
              </label>
              <Input
                type="text"
                value={lastSurah}
                onChange={(e) => setLastSurah(e.target.value)}
                placeholder="An-Naba 1-40"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
            >
              Simpan Santri
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
