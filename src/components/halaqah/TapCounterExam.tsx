import React, { useState, useRef } from 'react';
import { RotateCcw, Award, CheckCircle2, XCircle, BookOpen, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Santri, ExamRecord } from '../dashboard/types';
import { storageService } from '../../services/storageService';

interface TapCounterExamProps {
  santri: Santri;
  onFinish?: (record: ExamRecord) => void;
  onCancel?: () => void;
}

export const TapCounterExam: React.FC<TapCounterExamProps> = ({
  santri,
  onFinish,
  onCancel,
}) => {
  // Parsing juz default dari capaian santri atau juz 30
  const initialJuz = Math.max(1, Math.min(30, Math.floor(parseFloat(santri.juzAchieved) || 30)));
  const [selectedJuz, setSelectedJuz] = useState<number>(initialJuz);
  const [ketukan, setKetukan] = useState(0); // Salah Ringan / Tawaqquf (-0.5)
  const [dibetulkan, setDibetulkan] = useState(0); // Salah Fatal / Fath (-2.0)
  const [tajwidScore, setTajwidScore] = useState(85);
  const [fashahahScore, setFashahahScore] = useState(85);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const ketukanBtnRef = useRef<HTMLButtonElement>(null);
  const dibetulkanBtnRef = useRef<HTMLButtonElement>(null);

  // Kalkulasi skor akhir: (Tajwid + Fashahah)/2 - Penalti
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

  const handleFinishExam = () => {
    const settings = storageService.getHalaqahSettings();
    const newRecord = storageService.addExamRecord({
      santriId: santri.id,
      santriName: santri.name,
      nis: santri.nis,
      juz: selectedJuz,
      ketukan,
      dibetulkan,
      tajwidScore,
      fashahahScore,
      penalty,
      finalScore,
      isPassed,
      musyrif: settings.musyrifName || 'Muhaffizh Halaqoh',
      notes: notes.trim() || undefined,
    });

    setIsSaved(true);
    if (onFinish) {
      setTimeout(() => onFinish(newRecord), 600);
    }
  };

  return (
    <Card className="p-5 shadow-xs space-y-4 border border-slate-200 bg-white rounded-xl">
      {/* Header Info Ujian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                title="Batal / Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-slate-900">Ujian Tasmi' / Kenaikan Juz</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Santri: <strong className="text-slate-800 font-semibold">{santri.name}</strong> (NIS: {santri.nis})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Pilih Juz:</span>
            <select
              value={selectedJuz}
              onChange={(e) => setSelectedJuz(Number(e.target.value))}
              className="bg-transparent font-bold text-[#0070BA] focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
                <option key={juzNum} value={juzNum}>
                  Juz {juzNum}
                </option>
              ))}
            </select>
          </div>

          <Badge 
            variant="outline"
            className={`text-xs font-bold px-2.5 py-1 ${
              isPassed 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-red-50 text-red-700 border-red-300'
            }`}
          >
            {isPassed ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                MEMENUHI SYARAT
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                BELUM MEMENUHI
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* Nilai Akhir Live Display */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 text-center">
        <span className="text-xs font-semibold text-slate-500 block mb-0.5">
          Kalkulasi Skor Berjalan — Juz {selectedJuz}
        </span>
        <div className="text-4xl font-extrabold text-[#0070BA] font-mono">{finalScore}</div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-3">
          <span>Penalti: <strong className="text-red-600">-{penalty}</strong> poin</span>
          <span>•</span>
          <span>Standar Kelulusan: Nilai &ge; 75 &amp; Fatal &le; 3 kali</span>
        </div>
      </div>

      {/* Digital Tap Counter Buttons with GSAP Feedback */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tombol Ketukan (Tawaqquf) */}
        <button
          ref={ketukanBtnRef}
          type="button"
          onClick={handleTapKetukan}
          className="h-24 bg-amber-50/80 border-2 border-amber-300 rounded-xl p-3 flex flex-col items-center justify-center text-amber-900 hover:bg-amber-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Ketukan (Ringan)</span>
          <span className="text-3xl font-extrabold font-mono mt-1 text-amber-950">{ketukan}</span>
          <span className="text-[10px] text-amber-700 mt-0.5">+1 Tap (-0.5 Poin)</span>
        </button>

        {/* Tombol Dibetulkan (Fath) */}
        <button
          ref={dibetulkanBtnRef}
          type="button"
          onClick={handleTapDibetulkan}
          className="h-24 bg-red-50/80 border-2 border-red-300 rounded-xl p-3 flex flex-col items-center justify-center text-red-900 hover:bg-red-100 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-red-900">Dibetulkan (Fatal)</span>
          <span className="text-3xl font-extrabold font-mono mt-1 text-red-950">{dibetulkan}</span>
          <span className="text-[10px] text-red-700 mt-0.5">+1 Tap (-2.0 Poin)</span>
        </button>
      </div>

      {/* Slider Penilaian Tajwid & Fashahah */}
      <div className="space-y-3 pt-1">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Nilai Tajwid &amp; Makharijul Huruf</span>
            <span className="font-bold text-[#0070BA] font-mono">{tajwidScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={tajwidScore}
            onChange={(e) => setTajwidScore(Number(e.target.value))}
            className="w-full accent-[#0070BA] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Nilai Fashahah &amp; Kelancaran Waqaf</span>
            <span className="font-bold text-[#0070BA] font-mono">{fashahahScore}</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={fashahahScore}
            onChange={(e) => setFashahahScore(Number(e.target.value))}
            className="w-full accent-[#0070BA] cursor-pointer"
          />
        </div>
      </div>

      {/* Catatan Penguji */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Catatan Muhaffizh / Evaluasi Tasmi'
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan catatan kelancaran, ghunnah, mad, atau bagian yang perlu dimuraja'ah..."
          rows={2}
          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
        />
      </div>

      {/* Aksi Selesai / Reset */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => { setKetukan(0); setDibetulkan(0); }}
          className="flex items-center justify-center gap-1.5 text-xs h-10 border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Counter</span>
        </Button>

        <Button 
          type="button"
          disabled={isSaved}
          onClick={handleFinishExam}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>{isSaved ? 'Hasil Tersimpan!' : 'Selesaikan & Terbitkan Hasil Ujian'}</span>
        </Button>
      </div>
    </Card>
  );
};
