import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Santri } from './types';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate initials
    const initials = name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');

    const newSantri: Santri = {
      id: Date.now().toString(),
      name: name.trim(),
      nis: nis.trim() || `2024${Math.floor(100 + Math.random() * 900)}`,
      juzAchieved: juzAchieved.trim().endsWith('Juz') ? juzAchieved.trim() : `${juzAchieved.trim()} Juz`,
      linesCompletedToday: 0,
      dailyTargetLines: Number(dailyTargetLines) || 15,
      totalLinesMemorized: 0,
      totalLinesTarget: 9060,
      status: 'belum_setor',
      lastSurah: lastSurah.trim() || 'Baru Masuk',
      avatarInitials: initials || 'ST',
    };

    onAddSantri(newSantri);
    setName('');
    setNis('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Tambah Santri Baru</h3>
              <p className="text-xs text-slate-500">Masukkan santri ke daftar halaqoh</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Nama Lengkap Santri <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Zaid bin Haritsah"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                NIS (Nomor Induk)
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="2024013"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Capaian Juz Awal
              </label>
              <input
                type="text"
                value={juzAchieved}
                onChange={(e) => setJuzAchieved(e.target.value)}
                placeholder="5.0 Juz"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Target Baris / Hari
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={dailyTargetLines}
                onChange={(e) => setDailyTargetLines(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Surah Terakhir
              </label>
              <input
                type="text"
                value={lastSurah}
                onChange={(e) => setLastSurah(e.target.value)}
                placeholder="An-Naba 1-40"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] transition-colors shadow-2xs"
            >
              Simpan Santri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
