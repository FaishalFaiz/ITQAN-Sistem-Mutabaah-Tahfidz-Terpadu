import React, { useState, useRef } from 'react';
import { RotateCcw, Award } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TapCounterExam: React.FC = () => {
  const [ketukan, setKetukan] = useState(0); // Salah Ringan / Tawaqquf
  const [dibetulkan, setDibetulkan] = useState(0); // Salah Fatal / Fath
  const [tajwidScore, setTajwidScore] = useState(85);
  const [fashahahScore, setFashahahScore] = useState(85);

  const ketukanBtnRef = useRef<HTMLButtonElement>(null);
  const dibetulkanBtnRef = useRef<HTMLButtonElement>(null);

  // Kalkulasi skor akhir: Basis 100 - (Ketukan * 0.5) - (Dibetulkan * 2) + Rata-rata Bobot
  const penalty = ketukan * 0.5 + dibetulkan * 2.0;
  const rawScore = (tajwidScore + fashahahScore) / 2 - penalty;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));
  const isPassed = finalScore >= 75 && dibetulkan <= 3;

  const handleTapKetukan = () => {
    setKetukan((prev) => prev + 1);
    if (ketukanBtnRef.current) {
      gsap.fromTo(
        ketukanBtnRef.current,
        { scale: 0.93 },
        { scale: 1, duration: 0.25, ease: 'back.out(2)' }
      );
    }
  };

  const handleTapDibetulkan = () => {
    setDibetulkan((prev) => prev + 1);
    if (dibetulkanBtnRef.current) {
      gsap.fromTo(
        dibetulkanBtnRef.current,
        { scale: 0.93 },
        { scale: 1, duration: 0.25, ease: 'back.out(2)' }
      );
    }
  };

  return (
    <Card className="p-5 shadow-xs space-y-4 border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">Ujian Tasmi' / Kenaikan Juz</h2>
          <p className="text-xs text-muted-foreground">Santri: Muhammad Faiz — Juz 30 (Status Tiket: APPROVED)</p>
        </div>
        <Badge variant={isPassed ? 'mumtaz' : 'iadah'} className="text-xs font-bold">
          {isPassed ? 'MEMENUHI SYARAT' : 'BELUM MEMENUHI'}
        </Badge>
      </div>

      {/* Nilai Akhir Live */}
      <div className="bg-muted/50 p-4 rounded-xl border border-border text-center">
        <span className="text-xs font-medium text-muted-foreground block mb-0.5">Kalkulasi Skor Berjalan</span>
        <div className="text-4xl font-extrabold text-primary font-mono">{finalScore}</div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Penalti: -{penalty} poin (Toleransi salah fatal &le; 3 kali)
        </div>
      </div>

      {/* Digital Tap Counter Buttons with GSAP Micro-Feedback */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tombol Ketukan (Tawaqquf) */}
        <button
          ref={ketukanBtnRef}
          type="button"
          onClick={handleTapKetukan}
          className="h-24 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex flex-col items-center justify-center text-amber-900 hover:bg-amber-100 active:scale-95 transition-all shadow-xs"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Ketukan (Ringan)</span>
          <span className="text-3xl font-extrabold font-mono mt-1 text-amber-900">{ketukan}</span>
          <span className="text-[10px] text-amber-700 mt-0.5">+1 Tap (-0.5)</span>
        </button>

        {/* Tombol Dibetulkan (Fath) */}
        <button
          ref={dibetulkanBtnRef}
          type="button"
          onClick={handleTapDibetulkan}
          className="h-24 bg-red-50 border-2 border-red-300 rounded-xl p-3 flex flex-col items-center justify-center text-red-900 hover:bg-red-100 active:scale-95 transition-all shadow-xs"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Dibetulkan (Fatal)</span>
          <span className="text-3xl font-extrabold font-mono mt-1 text-red-900">{dibetulkan}</span>
          <span className="text-[10px] text-red-700 mt-0.5">+1 Tap (-2.0)</span>
        </button>
      </div>

      {/* Slider Penilaian Tajwid & Fashahah */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>Nilai Tajwid & Makhraj</span>
            <span className="font-bold text-primary">{tajwidScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={tajwidScore}
            onChange={(e) => setTajwidScore(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>Nilai Fashahah & Adab</span>
            <span className="font-bold text-primary">{fashahahScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={fashahahScore}
            onChange={(e) => setFashahahScore(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Aksi Selesai / Reset */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => { setKetukan(0); setDibetulkan(0); }}
          className="flex items-center gap-1.5 text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Counter</span>
        </Button>
        <Button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
          <Award className="w-4 h-4" />
          <span>Selesaikan & Terbitkan Hasil Ujian</span>
        </Button>
      </div>
    </Card>
  );
};
