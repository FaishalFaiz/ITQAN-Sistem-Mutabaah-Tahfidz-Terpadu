import React, { useState } from 'react';
import { RotateCcw, Award } from 'lucide-react';
import { Button } from '../ui/Button';

export const TapCounterExam: React.FC = () => {
  const [ketukan, setKetukan] = useState(0); // Salah Ringan / Tawaqquf
  const [dibetulkan, setDibetulkan] = useState(0); // Salah Fatal / Fath
  const [tajwidScore, setTajwidScore] = useState(85);
  const [fashahahScore, setFashahahScore] = useState(85);

  // Kalkulasi skor akhir: Basis 100 - (Ketukan * 0.5) - (Dibetulkan * 2) + Rata-rata Bobot
  const penalty = ketukan * 0.5 + dibetulkan * 2.0;
  const rawScore = (tajwidScore + fashahahScore) / 2 - penalty;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));
  const isPassed = finalScore >= 75 && dibetulkan <= 3;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Ujian Tasmi' / Kenaikan Juz</h2>
          <p className="text-xs text-slate-500">Santri: Muhammad Faiz — Juz 30 (Status Tiket: APPROVED)</p>
        </div>
        <div className={`px-3 py-1 rounded-md text-xs font-bold border ${isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {isPassed ? 'MEMENUHI SYARAT' : 'BELUM MEMENUHI'}
        </div>
      </div>

      {/* Nilai Akhir Live */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
        <span className="text-xs font-medium text-slate-500 block mb-0.5">Kalkulasi Skor Berjalan</span>
        <div className="text-4xl font-extrabold text-[#0070BA] font-mono">{finalScore}</div>
        <div className="text-[11px] text-slate-500 mt-1">
          Penalti: -{penalty} poin (Toleransi salah fatal &le; 3 kali)
        </div>
      </div>

      {/* Digital Tap Counter Buttons (Minimal Tinggi 72px Sesuai DESIGN.md) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tombol Ketukan (Tawaqquf) */}
        <button
          type="button"
          onClick={() => setKetukan((prev) => prev + 1)}
          className="h-24 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex flex-col items-center justify-center text-amber-900 hover:bg-amber-100 active:scale-95 transition-transform"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Ketukan (Ringan)</span>
          <span className="text-3xl font-extrabold font-mono mt-1">{ketukan}</span>
          <span className="text-[10px] text-amber-700 mt-0.5">+1 Tap (-0.5)</span>
        </button>

        {/* Tombol Dibetulkan (Fath) */}
        <button
          type="button"
          onClick={() => setDibetulkan((prev) => prev + 1)}
          className="h-24 bg-red-50 border-2 border-red-300 rounded-xl p-3 flex flex-col items-center justify-center text-red-900 hover:bg-red-100 active:scale-95 transition-transform"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Dibetulkan (Fatal)</span>
          <span className="text-3xl font-extrabold font-mono mt-1">{dibetulkan}</span>
          <span className="text-[10px] text-red-700 mt-0.5">+1 Tap (-2.0)</span>
        </button>
      </div>

      {/* Slider Penilaian Tajwid & Fashahah */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Nilai Tajwid & Makhraj</span>
            <span className="font-bold text-[#0070BA]">{tajwidScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={tajwidScore}
            onChange={(e) => setTajwidScore(Number(e.target.value))}
            className="w-full accent-[#0070BA]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Nilai Fashahah & Adab</span>
            <span className="font-bold text-[#0070BA]">{fashahahScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={fashahahScore}
            onChange={(e) => setFashahahScore(Number(e.target.value))}
            className="w-full accent-[#0070BA]"
          />
        </div>
      </div>

      {/* Aksi Selesai / Reset */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => { setKetukan(0); setDibetulkan(0); }}
          className="flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Counter</span>
        </Button>
        <Button fullWidth className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Selesaikan & Terbitkan Hasil Ujian</span>
        </Button>
      </div>
    </div>
  );
};
