import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface FastSetoranFormProps {
  onSuccess?: () => void;
}

export const FastSetoranForm: React.FC<FastSetoranFormProps> = () => {
  const [selectedSantri, setSelectedSantri] = useState('1');
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
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Input Setoran Cepat Halaqoh</h2>
          <p className="text-xs text-slate-500">Target input &lt; 15 detik saat halaqoh aktif</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-[#EBF5FB] text-[#0070BA] rounded-md border border-[#D6EAF8]">
          Mode Cepat
        </span>
      </div>

      {submitted && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Setoran berhasil disimpan! Baris tersimpan: <b>{totalLines} baris</b>.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Pilih Santri */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">Nama Santri</label>
          <select
            value={selectedSantri}
            onChange={(e) => setSelectedSantri(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
          >
            <option value="1">Muhammad Faiz (NIS: 2024001) - Target: 12 Baris</option>
            <option value="2">Ahmad Zaki (NIS: 2024002) - Target: 15 Baris</option>
            <option value="3">Farhan Ramadhan (NIS: 2024003) - Target: 10 Baris</option>
          </select>
        </div>

        {/* 2. Jenis Setoran (Toggle Cepat) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">Jenis Setoran</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('ziyadah')}
              className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                type === 'ziyadah'
                  ? 'bg-[#0070BA] text-white border-[#0070BA]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Ziyadah (Hafalan Baru)
            </button>
            <button
              type="button"
              onClick={() => setType('murojaah')}
              className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                type === 'murojaah'
                  ? 'bg-[#0070BA] text-white border-[#0070BA]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Muroja'ah (Pengulangan)
            </button>
          </div>
        </div>

        {/* 3. Juz & Rentang Halaman */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Juz</label>
            <select
              value={juz}
              onChange={(e) => setJuz(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hal. Awal</label>
            <input
              type="number"
              min={1}
              max={604}
              value={pageStart}
              onChange={(e) => setPageStart(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hal. Akhir</label>
            <input
              type="number"
              min={1}
              max={604}
              value={pageEnd}
              onChange={(e) => setPageEnd(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Granularitas Baris (1-15 Baris / Halaman) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-2">
            <span>Posisi Baris (Standar 15 Baris/Hal)</span>
            <span className="font-bold text-[#0070BA]">{totalLines} Baris Terhitung</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Baris Awal (1–15)</label>
              <input
                type="number"
                min={1}
                max={15}
                value={lineStart}
                onChange={(e) => setLineStart(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Baris Akhir (1–15)</label>
              <input
                type="number"
                min={1}
                max={15}
                value={lineEnd}
                onChange={(e) => setLineEnd(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Tingkat Kelancaran (Mumtaz, Jayyid, I'adah) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">Evaluasi Kelancaran</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setGrade('mumtaz')}
              className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
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
              className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
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
              className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
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
        <Button type="submit" fullWidth size="lg" className="mt-2">
          Simpan Setoran Santri
        </Button>
      </form>
    </div>
  );
};
