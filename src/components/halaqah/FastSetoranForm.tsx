import React, { useState } from 'react';
import { CheckCircle2, Send, AlertTriangle, ExternalLink, Check, MessageSquare, BookOpen, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { Santri } from '../dashboard/types';
import { storageService } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';
import { toast } from '@/components/ui/sonner';

interface FastSetoranFormProps {
  santri?: Santri | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSaveSetor?: (linesAdded: number) => void;
}

const COMMON_SURAHS = [
  'An-Naba', 'An-Naziat', 'Abasa', 'At-Takwir', 'Al-Infithar', 'Al-Muthaffifin',
  'Al-Insyiqaq', 'Al-Buruj', 'Ath-Thariq', 'Al-A\'la', 'Al-Ghasyiyah', 'Al-Fajr',
  'Al-Balad', 'Asy-Syams', 'Al-Lail', 'Adh-Dhuha', 'Al-Insyirah', 'At-Tin',
  'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat', 'Al-Qari\'ah',
  'At-Takatsur', 'Al-\'Ashr', 'Al-Humazah', 'Al-Fil', 'Quraisy', 'Al-Ma\'un',
  'Al-Kautsar', 'Al-Kafirun', 'An-Nashr', 'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
  'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij', 'Nuh', 'Al-Jinn', 'Al-Muzzammil',
  'Al-Muddastsir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'Yasin', 'Al-Waqi\'ah',
  'Ar-Rahman', 'Al-Kahf', 'Al-Baqarah', 'Ali \'Imran', 'An-Nisa\''
];

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
  const [surahName, setSurahName] = useState<string>(() => activeSantri?.lastSurah || 'An-Naba 1-40');
  const [juz, setJuz] = useState<number>(30);
  const [pageStart, setPageStart] = useState<number>(582);
  const [pageEnd, setPageEnd] = useState<number>(582);
  const [lineStart, setLineStart] = useState<number>(1);
  const [lineEnd, setLineEnd] = useState<number>(15);
  const [grade, setGrade] = useState<'mumtaz' | 'jayyid' | 'iadah'>('mumtaz');
  const [notes, setNotes] = useState<string>('');
  
  const [sendWA, setSendWA] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [waFeedback, setWaFeedback] = useState<{
    status: 'idle' | 'success' | 'failed' | 'fallback';
    message: string;
    fallbackUrl?: string;
  }>({ status: 'idle', message: '' });

  const handleSantriChange = (id: string) => {
    setSelectedSantriId(id);
    const target = allSantri.find((s) => s.id === id);
    if (target?.lastSurah) {
      setSurahName(target.lastSurah);
    }
  };

  // Kalkulasi total baris
  const totalPages = Math.max(1, pageEnd - pageStart + 1);
  const totalLines = totalPages === 1 
    ? Math.max(1, lineEnd - lineStart + 1)
    : (totalPages - 2) * 15 + (15 - lineStart + 1) + lineEnd;

  const dailyTarget = activeSantri?.dailyTargetLines || 15;
  const isTargetMet = totalLines >= dailyTarget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSantri) return;

    setIsSubmitting(true);
    setWaFeedback({ status: 'idle', message: '' });

    // 1. Simpan ke database lokal melalui storageService
    const halaqahSettings = storageService.getHalaqahSettings();
    const result = storageService.addSetoranRecord({
      santriId: activeSantri.id,
      santriName: activeSantri.name,
      nis: activeSantri.nis,
      type,
      juz,
      surahName: surahName.trim() || 'Hafalan Al-Qur\'an',
      pageStart,
      pageEnd,
      lineStart,
      lineEnd,
      totalLines,
      grade,
      musyrif: halaqahSettings.musyrifName || 'Ust. Abdullah',
      notes: notes.trim() || undefined,
      waStatus: 'not_sent',
    });

    if (onSaveSetor) {
      onSaveSetor(totalLines);
    }

    // 2. Eksekusi Pengiriman WhatsApp jika opsi aktif
    if (sendWA && activeSantri.parentPhone) {
      const messageText = waGatewayService.buildSetoranMessage(result.record, result.updatedSantri);
      const sendRes: SendResult = await waGatewayService.sendMessage(
        activeSantri.parentPhone,
        activeSantri.parentName || `Wali ${activeSantri.name}`,
        messageText,
        'setoran'
      );

      if (sendRes.success) {
        storageService.updateSetoranWAStatus(result.record.id, 'sent');
        setWaFeedback({
          status: 'success',
          message: `Setoran tersimpan & pesan WA terkirim otomatis ke wali (${activeSantri.parentPhone}).`,
        });
        toast.success(`Setoran ${activeSantri.name} tersimpan`, {
          description: `${totalLines} baris (${type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"}) • WA terkirim`,
        });
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        // Jika pengiriman otomatis belum aktif, hubungkan langsung ke WhatsApp
        storageService.updateSetoranWAStatus(result.record.id, 'failed');
        setWaFeedback({
          status: 'fallback',
          message: `Setoran tersimpan. Hubungkan ke WhatsApp wali:`,
          fallbackUrl: sendRes.fallbackUrl,
        });
        toast.success(`Setoran ${activeSantri.name} tersimpan`, {
          description: `${totalLines} baris tercatat. Siap kirim via WhatsApp.`,
        });
        setIsSubmitting(false);
      }
    } else {
      setWaFeedback({
        status: 'success',
        message: `Setoran berhasil disimpan! (${totalLines} baris tercatat).`,
      });
      toast.success(`Setoran ${activeSantri.name} tersimpan`, {
        description: `${totalLines} baris • ${type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"} (${grade.toUpperCase()})`,
      });
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      }, 900);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Notifikasi Status WA */}
      {waFeedback.status === 'success' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{waFeedback.message}</span>
        </div>
      )}

      {waFeedback.status === 'fallback' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">{waFeedback.message}</span>
          </div>
          <p className="text-[11px] text-amber-700">
            Anda dapat langsung mengirimkan ringkasan setoran ini ke WhatsApp Wali Santri dalam 1-klik:
          </p>
          <div className="flex items-center gap-2 pt-1">
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
                <span>Kirim via WhatsApp</span>
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

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Santri Picker (only shown when standalone without initialSantri) */}
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
        <div className="bg-slate-100/90 p-1 rounded-xl grid grid-cols-2 gap-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setType('ziyadah')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'ziyadah'
                ? 'bg-white text-[#0070BA] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${type === 'murojaah' ? 'bg-[#0070BA]' : 'bg-transparent'}`} />
            <span>Muroja'ah (Ulang)</span>
          </button>
        </div>

        {/* 2. Surah & Juz */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <div className="col-span-2 sm:col-span-3">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Surah &amp; Ayat</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="surah-list"
                  required
                  value={surahName}
                  onChange={(e) => setSurahName(e.target.value)}
                  placeholder="Contoh: An-Naba 1-40"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20 font-medium"
                />
              </div>
              <datalist id="surah-list">
                {COMMON_SURAHS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Juz</label>
              <select
                value={juz}
                onChange={(e) => setJuz(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 font-medium focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20 cursor-pointer"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>Juz {j}</option>
                ))}
              </select>
            </div>
          </div>

          {activeSantri?.lastSurah && activeSantri.lastSurah !== surahName && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <span>Setoran sebelumnya:</span>
              <button
                type="button"
                onClick={() => setSurahName(activeSantri.lastSurah)}
                className="inline-flex items-center gap-1 text-[#0070BA] font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{activeSantri.lastSurah}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Posisi Halaman & Baris (Cohesive Grouped Card) */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Posisi Halaman &amp; Baris
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF5FB] text-[#0070BA] border border-[#0070BA]/20">
                {totalLines} Baris
              </span>
              {type === 'ziyadah' && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isTargetMet
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isTargetMet ? 'Target Tercapai ✓' : `${dailyTarget - totalLines} baris lagi`}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Halaman Range */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-medium text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Halaman (1-604)</span>
                <span className="text-slate-400">{totalPages} hal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={pageStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPageStart(val);
                      if (pageEnd < val) setPageEnd(val);
                    }}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Awal</span>
                </div>
                <span className="text-slate-400 text-xs font-bold pb-3">s/d</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={pageStart}
                    max={604}
                    value={pageEnd}
                    onChange={(e) => setPageEnd(Number(e.target.value))}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Akhir</span>
                </div>
              </div>
            </div>

            {/* Baris Range */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-medium text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Baris per Hal (1-15)</span>
                <span className="text-slate-400">Hal. Madinah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={lineStart}
                    onChange={(e) => setLineStart(Number(e.target.value))}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Awal</span>
                </div>
                <span className="text-slate-400 text-xs font-bold pb-3">s/d</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={lineEnd}
                    onChange={(e) => setLineEnd(Number(e.target.value))}
                    className="w-full h-8 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20"
                  />
                  <span className="block text-[9px] text-center text-slate-400 mt-0.5 font-medium">Akhir</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Evaluasi Nilai Kelancaran (Clean Distinct Selectable Cards) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-700">
            Nilai Kelancaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Mumtaz */}
            <button
              type="button"
              onClick={() => setGrade('mumtaz')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                grade === 'mumtaz'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <span className="text-xs font-bold">Mumtaz</span>
              <span className={`text-[10px] mt-0.5 ${grade === 'mumtaz' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Lancar (0-1 salah)
              </span>
            </button>

            {/* Jayyid */}
            <button
              type="button"
              onClick={() => setGrade('jayyid')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                grade === 'jayyid'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <span className="text-xs font-bold">Jayyid</span>
              <span className={`text-[10px] mt-0.5 ${grade === 'jayyid' ? 'text-amber-100' : 'text-slate-500'}`}>
                Cukup (2-3 salah)
              </span>
            </button>

            {/* I'adah */}
            <button
              type="button"
              onClick={() => setGrade('iadah')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                grade === 'iadah'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
              }`}
            >
              <span className="text-xs font-bold">I'adah</span>
              <span className={`text-[10px] mt-0.5 ${grade === 'iadah' ? 'text-rose-100' : 'text-slate-500'}`}>
                Ulang (&gt;3 salah)
              </span>
            </button>
          </div>
        </div>

        {/* 5. Catatan Talaqqi (Opsional) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Catatan Talaqqi <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Perhatikan dengung ikhfa, makhraj 'Ain..."
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]/20 font-medium"
          />
        </div>

        {/* 6. Kirim WhatsApp ke Wali */}
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

        {/* 7. Action Buttons (Batal & Simpan) */}
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
