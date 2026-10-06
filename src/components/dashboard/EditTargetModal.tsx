import React, { useState, useEffect } from 'react';
import { Target, X, Check } from 'lucide-react';
import type { Santri } from './types';
import { storageService } from '../../services/storageService';
import { toast } from '@/components/ui/sonner';

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
      setJuzAchieved(santri.juzAchieved || '0 Juz');
    }
  }, [santri]);

  if (!isOpen || !santri) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!santri) return;

    const updated: Santri = {
      ...santri,
      dailyTargetLines: Math.max(1, Number(dailyTargetLines) || 15),
      totalLinesTarget: Math.max(15, Number(totalLinesTarget) || 9060),
      totalLinesMemorized: Math.max(0, Number(totalLinesMemorized) || 0),
      juzAchieved: juzAchieved.trim() || santri.juzAchieved,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Atur Target Hafalan Santri</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {santri.name} • <span className="font-mono">#{santri.nis}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Target Harian Baris */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Target Baris Harian (Per Hari)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="150"
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-semibold text-slate-800"
                required
              />
              <span className="text-slate-500 font-medium shrink-0">Baris/Hari</span>
            </div>
            {/* Quick buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Pintasan:</span>
              {[5, 10, 15, 20, 30].map((lines) => (
                <button
                  key={lines}
                  type="button"
                  onClick={() => setDailyTargetLines(lines)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    dailyTargetLines === lines
                      ? 'bg-[#0070BA] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {lines}b {lines === 15 ? '(1 Hal)' : ''}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Standar Mushaf Madinah: 15 baris per halaman (1 Juz = 20 halaman = 300 baris).
            </p>
          </div>

          {/* Capaian Juz & Total Baris Terkumpul */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Capaian Hafalan Saat Ini
              </label>
              <input
                type="text"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                placeholder="Misal: 5.2 Juz"
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-medium text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Label capaian rapor</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Akumulasi Baris Mutqin
              </label>
              <input
                type="number"
                min="0"
                max="9060"
                value={totalLinesMemorized}
                onChange={(e) => setTotalLinesMemorized(Number(e.target.value))}
                className="w-full text-xs px-3 h-9 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] font-semibold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Maksimal 9.060 baris</span>
            </div>
          </div>

          {/* Total Target Kurikulum 30 Juz */}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-800">
                Total Target Kurikulum (Baris)
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                ~{(totalLinesTarget / 300).toFixed(1)} Juz
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

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
