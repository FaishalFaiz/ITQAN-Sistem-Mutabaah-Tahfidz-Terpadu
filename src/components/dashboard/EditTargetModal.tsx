import React, { useState, useEffect } from 'react';
import { Target, Check } from 'lucide-react';
import type { Santri } from './types';
import { storageService } from '../../services/storageService';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatJuz } from '@/lib/utils';

interface EditTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | null;
  onSaved?: (updated: Santri) => void;
}

export const EditTargetModal: React.FC<EditTargetModalProps> = ({
  isOpen,
  onClose,
  santri,
  onSaved,
}) => {
  const [dailyTargetLines, setDailyTargetLines] = useState<number>(15);
  const [totalLinesTarget, setTotalLinesTarget] = useState<number>(9060);
  const [totalLinesMemorized, setTotalLinesMemorized] = useState<number>(0);
  const [juzAchieved, setJuzAchieved] = useState<string>('0 Juz');

  useEffect(() => {
    if (santri) {
      setDailyTargetLines(santri.dailyTargetLines || 15);
      setTotalLinesTarget(santri.totalLinesTarget || 9060);
      setTotalLinesMemorized(santri.totalLinesMemorized || 0);
      setJuzAchieved(formatJuz(santri.juzAchieved || '0 Juz'));
    }
  }, [santri]);

  if (!santri) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!santri) return;

    const updated: Santri = {
      ...santri,
      dailyTargetLines: Math.max(1, Number(dailyTargetLines) || 15),
      totalLinesTarget: Math.max(15, Number(totalLinesTarget) || 9060),
      totalLinesMemorized: Math.max(0, Number(totalLinesMemorized) || 0),
      juzAchieved: formatJuz(juzAchieved.trim() || santri.juzAchieved),
    };

    // Update status harian berdasarkan target baru jika santri sudah setor hari ini
    if (updated.linesCompletedToday >= updated.dailyTargetLines) {
      updated.status = 'tercapai';
    } else if (updated.linesCompletedToday > 0) {
      updated.status = 'tidak_tercapai';
    } else {
      updated.status = 'belum_setor';
    }

    storageService.updateSantri(updated);
    toast.success(`Target hafalan ${santri.name} berhasil diperbarui!`);
    if (onSaved) onSaved(updated);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0 overflow-hidden rounded-2xl border-slate-200">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Header */}
          <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="font-bold text-sm text-slate-900">
                  Pengaturan Target &amp; Capaian Santri
                </DialogTitle>
                <p className="text-xs text-slate-500">{santri.name} (NIS: {santri.nis})</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 space-y-4">
            {/* Input Target Harian */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Target Setoran Harian (Baris)
                </label>
                <span className="text-[11px] font-semibold text-[#0070BA]">
                  {(dailyTargetLines / 15).toFixed(1)} Halaman / Hari
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="300"
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-semibold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Standar Mushaf Madinah: 15 baris per halaman. (Contoh: 15 baris = 1 hal, 30 baris = 2 hal).
              </p>
            </div>

            {/* Input Total Baris yang Telah Dihapal */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Akumulasi Hafalan (Total Baris)
                </label>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {(totalLinesMemorized / 15).toFixed(0)} Halaman • {formatJuz(totalLinesMemorized / 300)}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={totalLinesTarget}
                value={totalLinesMemorized}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalLinesMemorized(val);
                  setJuzAchieved(formatJuz(val / 300));
                }}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-semibold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Diperbarui otomatis setiap sesi setoran ziyadah disimpan.
              </p>
            </div>

            {/* Input Label Capaian Juz */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Label Capaian Juz (Teks Tampilan)
              </label>
              <input
                type="text"
                placeholder="Contoh: 5 Juz atau Juz 1 - 5"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] text-slate-800 font-medium"
              />
            </div>

            {/* Target Total Kurikulum */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Target Kurikulum Halaqoh (Total Baris)
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formatJuz(totalLinesTarget / 300)}
                </span>
              </div>
              <input
                type="number"
                min="300"
                max="9060"
                value={totalLinesTarget}
                onChange={(e) => setTotalLinesTarget(Number(e.target.value))}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-semibold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Default program khatam 30 Juz = 9.060 baris (604 halaman × 15 baris).
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <DialogFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
