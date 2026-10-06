import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  Check, 
  MessageSquare, 
  BookOpen, 
  Search, 
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { Santri } from '../dashboard/types';
import { storageService } from '../../services/storageService';
import { waGatewayService } from '../../services/waGatewayService';
import { toast } from '@/components/ui/sonner';
import { QURAN_SURAHS, JUZ_TO_START_SURAH, type SurahItem } from '../../data/quranData';

interface FastSetoranFormProps {
  santri?: Santri | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSaveSetor?: (linesAdded: number) => void;
}

export const FastSetoranForm: React.FC<FastSetoranFormProps> = ({ 
  santri: initialSantri, 
  onSuccess,
  onCancel,
  onSaveSetor,
}) => {
  const [allSantri] = useState<Santri[]>(() => storageService.getSantriList());
  const [selectedSantriId, setSelectedSantriId] = useState<string>(() => {
    if (initialSantri) return initialSantri.id;
    const list = storageService.getSantriList();
    return list.length > 0 ? list[0].id : '1';
  });

  const activeSantri = initialSantri || allSantri.find((s) => s.id === selectedSantriId) || allSantri[0];
  
  const [type, setType] = useState<'ziyadah' | 'murojaah'>('ziyadah');
  
  // Juz & Surah States
  const [juz, setJuz] = useState<number>(30);
  const [selectedSurah, setSelectedSurah] = useState<SurahItem>(() => {
    return QURAN_SURAHS.find((s) => s.name === 'An-Naba') || QURAN_SURAHS[77];
  });
  const [surahSearchText, setSurahSearchText] = useState<string>('An-Naba');
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Range Ayat & Input Manual Baris Setoran
  const [ayatStart, setAyatStart] = useState<number>(1);
  const [ayatEnd, setAyatEnd] = useState<number>(15);
  const [manualLines, setManualLines] = useState<number>(15);

  const [notes, setNotes] = useState<string>('');
  const [sendWA, setSendWA] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [waFeedback, setWaFeedback] = useState<{
    status: 'idle' | 'success' | 'failed' | 'fallback';
    message: string;
    fallbackUrl?: string;
  }>({ status: 'idle', message: '' });

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSurahDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter surah berdasarkan search text
  const filteredSurahs = useMemo(() => {
    const query = surahSearchText.toLowerCase().trim();
    if (!query) {
      // Tampilkan surah yang ada di juz yang dipilih di bagian atas
      const sameJuz = QURAN_SURAHS.filter((s) => s.juz === juz);
      const otherJuz = QURAN_SURAHS.filter((s) => s.juz !== juz);
      return [...sameJuz, ...otherJuz];
    }
    return QURAN_SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        String(s.number).includes(query) ||
        `juz ${s.juz}`.includes(query)
    );
  }, [surahSearchText, juz]);

  // Saat Musyrif mengganti Juz, arahkan surah default ke surah pembuka juz tersebut
  const handleJuzChange = (newJuz: number) => {
    setJuz(newJuz);
    const startSurahName = JUZ_TO_START_SURAH[newJuz];
    const found = QURAN_SURAHS.find((s) => s.name === startSurahName);
    if (found) {
      setSelectedSurah(found);
      setSurahSearchText(found.name);
      setAyatStart(1);
      setAyatEnd(Math.min(15, found.totalAyat));
    }
  };

  const handleSelectSurah = (surah: SurahItem) => {
    setSelectedSurah(surah);
    setSurahSearchText(surah.name);
    setJuz(surah.juz);
    setAyatStart(1);
    setAyatEnd(Math.min(15, surah.totalAyat));
    setIsSurahDropdownOpen(false);
  };

  const handleSantriChange = (id: string) => {
    setSelectedSantriId(id);
    const target = allSantri.find((s) => s.id === id);
    if (target?.lastSurah) {
      const match = target.lastSurah.match(/^([a-zA-Z\s'-]+)/);
      if (match) {
        const found = QURAN_SURAHS.find((s) => s.name.toLowerCase() === match[1].trim().toLowerCase());
        if (found) {
          handleSelectSurah(found);
        }
      }
    }
  };

  const dailyTarget = activeSantri?.dailyTargetLines || 15;
  const isTargetMet = manualLines >= dailyTarget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSantri) return;

    setIsSubmitting(true);
    setWaFeedback({ status: 'idle', message: '' });

    const formattedSurahRange = `${selectedSurah.name} : ${ayatStart}-${ayatEnd}`;
    const halaqahSettings = storageService.getHalaqahSettings();

    // 1. Simpan ke database lokal
    const result = storageService.addSetoranRecord({
      santriId: activeSantri.id,
      santriName: activeSantri.name,
      nis: activeSantri.nis,
      type,
      juz,
      surahName: formattedSurahRange,
      pageStart: 1,
      pageEnd: 1,
      lineStart: 1,
      lineEnd: manualLines,
      totalLines: manualLines,
      grade: 'mumtaz', // Default mutqin/lancar karena disahkan muhaffizh
      musyrif: halaqahSettings.musyrifName || 'Muhaffizh Halaqoh',
      notes: notes.trim() || undefined,
      waStatus: 'not_sent',
    });

    if (onSaveSetor) {
      onSaveSetor(manualLines);
    }

    // 2. Jika opsi kirim WA dicentang dan santri memiliki no WA, siapkan link wa.me dan opsi salin
    if (sendWA && activeSantri.parentPhone) {
      const messageText = waGatewayService.buildSetoranMessage(result.record, result.updatedSantri);
      const waLink = waGatewayService.getDirectWALink(activeSantri.parentPhone, messageText);
      storageService.updateSetoranWAStatus(result.record.id, 'sent');

      setWaFeedback({
        status: 'fallback',
        message: `Setoran berhasil dicatat! Siap dikirim ke wali (${activeSantri.parentPhone}):`,
        fallbackUrl: waLink,
      });

      toast.success(`Setoran ${activeSantri.name} tersimpan`, {
        description: `${manualLines} baris (${type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"}) • Teks WA siap dikirim`,
      });
      setIsSubmitting(false);
    } else {
      setWaFeedback({
        status: 'success',
        message: `Setoran berhasil disimpan! (${manualLines} baris tercatat).`,
      });
      toast.success(`Setoran ${activeSantri.name} tersimpan`, {
        description: `${manualLines} baris • ${type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"}`,
      });
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      }, 800);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Status WA */}
      {waFeedback.status === 'success' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{waFeedback.message}</span>
        </div>
      )}

      {waFeedback.status === 'fallback' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{waFeedback.message}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {waFeedback.fallbackUrl && (
              <a
                href={waFeedback.fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    if (onSuccess) onSuccess();
                  }, 800);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onSuccess}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Santri Picker (jika tanpa santri spesifik) */}
        {!initialSantri && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Santri
            </label>
            <select
              value={selectedSantriId}
              onChange={(e) => handleSantriChange(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
            >
              {allSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nis}) — Target: {s.dailyTargetLines} Baris
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 1. Jenis Setoran (Segmented Tab Control) */}
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setType('ziyadah')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'ziyadah'
                ? 'bg-white text-[#0070BA] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${type === 'ziyadah' ? 'bg-[#0070BA]' : 'bg-transparent'}`} />
            <span>Ziyadah (Baru)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('murojaah')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'murojaah'
                ? 'bg-white text-[#0070BA] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${type === 'murojaah' ? 'bg-[#0070BA]' : 'bg-transparent'}`} />
            <span>Muroja'ah (Ulang)</span>
          </button>
        </div>

        {/* 2. Surah (Search + Dropdown) & Juz (Dropdown) */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Searchable Surah Dropdown */}
            <div className="col-span-2 sm:col-span-3 relative" ref={dropdownRef}>
              <label className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cari &amp; Pilih Surah</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedSurah.totalAyat} Ayat
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={surahSearchText}
                  onFocus={() => setIsSurahDropdownOpen(true)}
                  onChange={(e) => {
                    setSurahSearchText(e.target.value);
                    setIsSurahDropdownOpen(true);
                  }}
                  placeholder="Ketik nama atau nomor surat..."
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-8 pr-7 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                />
                <button
                  type="button"
                  onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSurahDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Floating Dropdown List */}
              {isSurahDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  {filteredSurahs.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Surah tidak ditemukan
                    </div>
                  ) : (
                    filteredSurahs.map((s) => (
                      <button
                        key={s.number}
                        type="button"
                        onClick={() => handleSelectSurah(s)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#EBF5FB] transition-colors cursor-pointer ${
                          selectedSurah.number === s.number ? 'bg-blue-50/80 font-bold text-[#0070BA]' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[10px] text-slate-400 text-right font-mono">
                            {s.number}.
                          </span>
                          <span>{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Juz {s.juz}</span>
                          <span>{s.totalAyat} ayat</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Juz Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pilih Juz
              </label>
              <select
                value={juz}
                onChange={(e) => handleJuzChange(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 font-semibold focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20 cursor-pointer"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>Juz {j}</option>
                ))}
              </select>
            </div>
          </div>

          {activeSantri?.lastSurah && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <span>Setoran terakhir:</span>
              <span className="text-[#0070BA] font-semibold">{activeSantri.lastSurah}</span>
            </div>
          )}
        </div>

        {/* 3. Rentang Ayat & Input Manual Baris Setoran (IDN Style) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Rentang Ayat &amp; Jumlah Baris
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF5FB] text-[#0070BA] border border-[#0070BA]/20">
                {manualLines} Baris
              </span>
              {type === 'ziyadah' && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isTargetMet
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isTargetMet ? 'Target Tercapai ✓' : `${dailyTarget - manualLines} baris lagi`}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Input Ayat Dari s/d */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Rentang Ayat ({selectedSurah.name})</span>
                <span className="text-slate-400 text-[9px]">Max: {selectedSurah.totalAyat} ayat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={selectedSurah.totalAyat}
                    value={ayatStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAyatStart(val);
                      if (ayatEnd < val) setAyatEnd(val);
                    }}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Ayat Awal</span>
                </div>
                <span className="text-slate-400 text-xs font-bold pb-3">s/d</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={ayatStart}
                    max={selectedSurah.totalAyat}
                    value={ayatEnd}
                    onChange={(e) => setAyatEnd(Number(e.target.value))}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Ayat Akhir</span>
                </div>
              </div>
            </div>

            {/* Input Baris Setoran Manual */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Baris Setoran (Input Manual)</span>
                <span className="text-[#0070BA] font-bold text-[10px]">
                  {manualLines === 15 ? '1 Halaman Penuh' : `${manualLines} Baris`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={300}
                  required
                  value={manualLines}
                  onChange={(e) => setManualLines(Math.max(1, Number(e.target.value)))}
                  className="w-full h-8 text-center text-sm font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                />
              </div>
              {/* Shortcut Cepat Baris */}
              <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-slate-100">
                <span className="text-[9px] text-slate-400">Pintasan:</span>
                <div className="flex items-center gap-1">
                  {[5, 10, 15, 30].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setManualLines(b)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                        manualLines === b 
                          ? 'bg-[#0070BA] text-white border-[#0070BA]' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b}b
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Catatan Talaqqi (Opsional) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Catatan Talaqqi / Muhaffizh <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Perhatikan makhraj huruf 'Ain dan mad thabi'i..."
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20 font-medium"
          />
        </div>

        {/* 5. Kirim WhatsApp ke Wali */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sendWA && activeSantri?.parentPhone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <label htmlFor="wa-send-toggle" className="text-xs font-semibold text-slate-800 block cursor-pointer">
                Kirim notifikasi WA ke wali santri
              </label>
              <span className="text-[10px] text-slate-500 block truncate">
                {activeSantri?.parentPhone ? (
                  <span>Tujuan: <b>{activeSantri.parentPhone}</b> ({activeSantri.parentName || 'Wali'})</span>
                ) : (
                  <span className="text-amber-600 font-medium">Nomor WhatsApp wali belum terdaftar</span>
                )}
              </span>
            </div>
          </div>
          <input
            id="wa-send-toggle"
            type="checkbox"
            checked={sendWA && Boolean(activeSantri?.parentPhone)}
            disabled={!activeSantri?.parentPhone}
            onChange={(e) => setSendWA(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] cursor-pointer shrink-0 disabled:opacity-50"
          />
        </div>

        {/* 6. Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              className="h-10 px-4 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer rounded-xl"
            >
              Batal
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-[#0070BA] hover:bg-[#005C9E] active:scale-[0.98] text-white font-bold text-xs h-10 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>Menyimpan Setoran...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simpan Setoran</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
