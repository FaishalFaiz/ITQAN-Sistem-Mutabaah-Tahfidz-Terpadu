import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Santri } from '../dashboard/types';

interface FastSetoranFormProps {
  santri?: Santri | null;
  onSuccess?: () => void;
  onSaveSetor?: (linesAdded: number) => void;
}

export const FastSetoranForm: React.FC<FastSetoranFormProps> = ({ 
  santri, 
  onSuccess,
  onSaveSetor,
}) => {
  const [selectedSantri, setSelectedSantri] = useState(santri ? santri.id : '1');
  const [type, setType] = useState<'ziyadah' | 'murojaah'>('ziyadah');
  const [juz, setJuz] = useState(30);
  const [pageStart, setPageStart] = useState(582);
  const [pageEnd, setPageEnd] = useState(582);
  const [lineStart, setLineStart] = useState(1);
  const [lineEnd, setLineEnd] = useState(15);
  const [grade, setGrade] = useState<'mumtaz' | 'jayyid' | 'iadah'>('mumtaz');
  const [submitted, setSubmitted] = useState(false);

  // Kalkulasi total baris
  const totalPages = Math.max(1, pageEnd - pageStart + 1);
  const totalLines = totalPages === 1 
    ? Math.max(1, lineEnd - lineStart + 1)
    : (totalPages - 2) * 15 + (15 - lineStart + 1) + lineEnd;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSaveSetor) onSaveSetor(totalLines);
    setTimeout(() => {
      setSubmitted(false);
      if (onSuccess) onSuccess();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {submitted && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Setoran berhasil disimpan! Baris tersimpan: <b>{totalLines} baris</b>.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Identitas Santri (Otomatis jika modal dibuka dari santri terkait) */}
        {santri ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0">
                {santri.avatarInitials}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {santri.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  NIS: {santri.nis} • Capaian: {santri.juzAchieved}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Target Harian</span>
              <span className="text-xs font-bold text-[#0070BA]">{santri.dailyTargetLines} Baris</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Nama Santri</label>
            <select
              value={selectedSantri}
              onChange={(e) => setSelectedSantri(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            >
              <option value="1">Muhammad Faiz (NIS: 2024001) - Target: 12 Baris</option>
              <option value="2">Ahmad Zaki (NIS: 2024002) - Target: 15 Baris</option>
              <option value="3">Farhan Ramadhan (NIS: 2024003) - Target: 10 Baris</option>
            </select>
          </div>
        )}

        {/* 2. Jenis Setoran (Toggle Cepat) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Jenis Setoran</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'ziyadah' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('ziyadah')}
              className="text-xs h-9"
            >
              Ziyadah (Hafalan Baru)
            </Button>
            <Button
              type="button"
              variant={type === 'murojaah' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('murojaah')}
              className="text-xs h-9"
            >
              Muroja'ah (Pengulangan)
            </Button>
          </div>
        </div>

        {/* 3. Juz & Rentang Halaman */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Juz</label>
            <select
              value={juz}
              onChange={(e) => setJuz(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Hal. Awal</label>
            <Input
              type="number"
              min={1}
              max={604}
              value={pageStart}
              onChange={(e) => setPageStart(Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Hal. Akhir</label>
            <Input
              type="number"
              min={1}
              max={604}
              value={pageEnd}
              onChange={(e) => setPageEnd(Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* 4. Granularitas Baris (1-15 Baris / Halaman) */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Posisi Baris (Standar 15 Baris/Hal)</span>
            <span className="font-bold text-primary">{totalLines} Baris Terhitung</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Baris Awal (1–15)</label>
              <Input
                type="number"
                min={1}
                max={15}
                value={lineStart}
                onChange={(e) => setLineStart(Number(e.target.value))}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Baris Akhir (1–15)</label>
              <Input
                type="number"
                min={1}
                max={15}
                value={lineEnd}
                onChange={(e) => setLineEnd(Number(e.target.value))}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        </div>

        {/* 5. Tingkat Kelancaran (Mumtaz, Jayyid, I'adah) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Evaluasi Kelancaran</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setGrade('mumtaz')}
              className={`py-2 text-xs font-semibold rounded-md border transition-all ${
                grade === 'mumtaz'
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              MUMTAZ
            </button>
            <button
              type="button"
              onClick={() => setGrade('jayyid')}
              className={`py-2 text-xs font-semibold rounded-md border transition-all ${
                grade === 'jayyid'
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              JAYYID
            </button>
            <button
              type="button"
              onClick={() => setGrade('iadah')}
              className={`py-2 text-xs font-semibold rounded-md border transition-all ${
                grade === 'iadah'
                  ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-200'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              I'ADAH
            </button>
          </div>
        </div>

        {/* Tombol Simpan Setoran */}
        <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          Simpan Setoran Santri
        </Button>
      </form>
    </div>
  );
};
