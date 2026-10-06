import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Clock, 
  XCircle, 
  Save 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storageService } from '../../services/storageService';
import { QURAN_SURAHS } from '../../data/quranData';
import type { SetoranRecord, Santri } from './types';
import { toast } from '@/components/ui/sonner';

interface EditSetoranModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SetoranRecord | null;
  santriName: string;
  onSuccess: (updatedSantri: Santri) => void;
}

export const EditSetoranModal: React.FC<EditSetoranModalProps> = ({
  isOpen,
  onClose,
  record,
  santriName,
  onSuccess,
}) => {
  const [type, setType] = useState<'ziyadah' | 'murojaah'>('ziyadah');
  const [surahName, setSurahName] = useState('');
  const [juz, setJuz] = useState<number>(1);
  const [pageStart, setPageStart] = useState<number>(1);
  const [pageEnd, setPageEnd] = useState<number>(1);
  const [lineStart, setLineStart] = useState<number>(1);
  const [lineEnd, setLineEnd] = useState<number>(15);
  const [totalLines, setTotalLines] = useState<number>(15);
  const [grade, setGrade] = useState<'mumtaz' | 'jayyid' | 'iadah'>('mumtaz');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (record) {
      setType(record.type);
      setSurahName(record.surahName);
      setJuz(record.juz);
      setPageStart(record.pageStart);
      setPageEnd(record.pageEnd);
      setLineStart(record.lineStart || 1);
      setLineEnd(record.lineEnd || 15);
      setTotalLines(record.totalLines);
      setGrade(record.grade);
      setNotes(record.notes || '');
    }
  }, [record]);

  if (!record) return null;

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSurahName(selectedName);
    const found = QURAN_SURAHS.find((s) => s.name === selectedName);
    if (found) {
      setJuz(found.juz);
    }
  };

  const handlePagesChange = (start: number, end: number) => {
    const s = Math.max(1, start);
    const e = Math.max(s, end);
    setPageStart(s);
    setPageEnd(e);
    // Standar 1 halaman mushaf pojok Madinah = 15 baris
    const calculatedLines = (e - s + 1) * 15;
    setTotalLines(calculatedLines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    const updatedRecord: SetoranRecord = {
      ...record,
      type,
      surahName: surahName.trim() || record.surahName,
      juz: Number(juz),
      pageStart: Number(pageStart),
      pageEnd: Number(pageEnd),
      lineStart: Number(lineStart),
      lineEnd: Number(lineEnd),
      totalLines: Number(totalLines),
      grade,
      notes: notes.trim(),
    };

    const updatedSantri = storageService.updateSetoranRecord(updatedRecord);
    if (updatedSantri) {
      toast.success('Catatan setoran berhasil diperbarui!');
      onSuccess(updatedSantri);
      onClose();
    } else {
      toast.error('Gagal memperbarui catatan setoran.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto p-0 rounded-xl sm:rounded-2xl border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Koreksi / Edit Catatan Setoran
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Santri: <strong>{santriName}</strong> • {record.formattedDate}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Form Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* 1. Tipe Setoran */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Jenis Setoran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('ziyadah')}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                    type === 'ziyadah'
                      ? 'bg-blue-50 text-[#0070BA] border-blue-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Ziyadah (Hafalan Baru)
                </button>
                <button
                  type="button"
                  onClick={() => setType('murojaah')}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                    type === 'murojaah'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Muroja'ah (Pengulangan)
                </button>
              </div>
            </div>

            {/* 2. Surah & Juz */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Surah
                </label>
                <select
                  value={surahName}
                  onChange={handleSurahChange}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070BA] font-medium"
                >
                  {QURAN_SURAHS.map((s) => (
                    <option key={s.number} value={s.name}>
                      {s.number}. {s.name} (Juz {s.juz})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Juz
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={juz}
                  onChange={(e) => setJuz(parseInt(e.target.value) || 1)}
                  className="h-9 font-medium"
                />
              </div>
            </div>

            {/* 3. Halaman & Baris */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hal. Mulai
                </label>
                <Input
                  type="number"
                  min={1}
                  max={604}
                  value={pageStart}
                  onChange={(e) => handlePagesChange(parseInt(e.target.value) || 1, pageEnd)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hal. Akhir
                </label>
                <Input
                  type="number"
                  min={1}
                  max={604}
                  value={pageEnd}
                  onChange={(e) => handlePagesChange(pageStart, parseInt(e.target.value) || 1)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Baris
                </label>
                <Input
                  type="number"
                  min={1}
                  value={totalLines}
                  onChange={(e) => setTotalLines(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 font-bold text-[#0070BA]"
                />
              </div>
            </div>

            {/* 4. Mutu Kelancaran */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Mutu Kelancaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGrade('mumtaz')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    grade === 'mumtaz'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600" />
                  <span className="text-[11px] block">Mumtaz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGrade('jayyid')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    grade === 'jayyid'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-600" />
                  <span className="text-[11px] block">Jayyid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGrade('iadah')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    grade === 'iadah'
                      ? 'bg-red-50 text-red-800 border-red-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 mx-auto mb-0.5 text-red-600" />
                  <span className="text-[11px] block">I'adah</span>
                </button>
              </div>
            </div>

            {/* 5. Catatan / Evaluasi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Evaluasi Musrif (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Misal: Perhatikan mad wajib dan idgham bighunnah"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 px-4 border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="text-xs h-9 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
