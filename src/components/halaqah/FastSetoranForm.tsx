import React, { useState } from 'react';
import { CheckCircle, Send, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { Santri } from '../dashboard/types';
import { storageService } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';

interface FastSetoranFormProps {
  santri?: Santri | null;
  onSuccess?: () => void;
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
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
        }, 1200);
      } else if (sendRes.fallbackUrl) {
        // Gateway belum setup atau gagal -> tawarkan direct wa.me
        storageService.updateSetoranWAStatus(result.record.id, 'failed');
        setWaFeedback({
          status: 'fallback',
          message: sendRes.notConfigured
            ? `Setoran tersimpan. Gateway WA belum disetup.`
            : `Setoran tersimpan. Gateway merespon offline/gagal koneksi.`,
          fallbackUrl: sendRes.fallbackUrl,
        });
        setIsSubmitting(false);
      }
    } else {
      setWaFeedback({
        status: 'success',
        message: `Setoran berhasil disimpan! (${totalLines} baris tercatat).`,
      });
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Notifikasi Status WA */}
      {waFeedback.status === 'success' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{waFeedback.message}</span>
        </div>
      )}

      {waFeedback.status === 'fallback' && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{waFeedback.message}</span>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp Web/App</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onSuccess}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 1. Identitas Santri Ringkas */}
        {initialSantri ? (
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 truncate">
              {initialSantri.name} ({initialSantri.nis})
            </span>
            <span className="text-xs font-semibold text-[#0070BA] shrink-0">
              Target: {initialSantri.dailyTargetLines} Baris
            </span>
          </div>
        ) : (
          <div>
            <select
              value={selectedSantriId}
              onChange={(e) => handleSantriChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            >
              {allSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nis})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Jenis Setoran (Ziyadah vs Muroja'ah) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('ziyadah')}
            className={`h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              type === 'ziyadah'
                ? 'bg-[#0070BA] text-white border-[#0070BA]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Ziyadah (Baru)
          </button>
          <button
            type="button"
            onClick={() => setType('murojaah')}
            className={`h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              type === 'murojaah'
                ? 'bg-[#0070BA] text-white border-[#0070BA]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Muroja'ah (Ulang)
          </button>
        </div>

        {/* 3. Surah & Juz */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <div className="col-span-2 sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Surah &amp; Ayat
            </label>
            <input
              type="text"
              list="surah-list"
              required
              value={surahName}
              onChange={(e) => setSurahName(e.target.value)}
              placeholder="Contoh: An-Naba 1-40"
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            />
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
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Posisi Halaman & Baris (Ringkas 4 Kolom) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>Posisi Halaman &amp; Baris</span>
            <span className="text-[#0070BA] font-bold">{totalLines} Baris</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Hal. Awal</label>
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
                className="w-full h-8.5 rounded-md border border-slate-300 bg-white px-1.5 text-xs text-center font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Hal. Akhir</label>
              <input
                type="number"
                min={pageStart}
                max={604}
                value={pageEnd}
                onChange={(e) => setPageEnd(Number(e.target.value))}
                className="w-full h-8.5 rounded-md border border-slate-300 bg-white px-1.5 text-xs text-center font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Baris Awal</label>
              <input
                type="number"
                min={1}
                max={15}
                value={lineStart}
                onChange={(e) => setLineStart(Number(e.target.value))}
                className="w-full h-8.5 rounded-md border border-slate-300 bg-white px-1.5 text-xs text-center font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Baris Akhir</label>
              <input
                type="number"
                min={1}
                max={15}
                value={lineEnd}
                onChange={(e) => setLineEnd(Number(e.target.value))}
                className="w-full h-8.5 rounded-md border border-slate-300 bg-white px-1.5 text-xs text-center font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Evaluasi Kelancaran */}
        <div className="pt-0.5">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nilai Kelancaran</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setGrade('mumtaz')}
              className={`h-8.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                grade === 'mumtaz'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              Mumtaz
            </button>
            <button
              type="button"
              onClick={() => setGrade('jayyid')}
              className={`h-8.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                grade === 'jayyid'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              Jayyid
            </button>
            <button
              type="button"
              onClick={() => setGrade('iadah')}
              className={`h-8.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                grade === 'iadah'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              I'adah
            </button>
          </div>
        </div>

        {/* 6. Catatan Ringkas */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Catatan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan talaqqi..."
            className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none"
          />
        </div>

        {/* 7. Kirim WA & Submit */}
        <div className="flex items-center justify-between py-1 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={sendWA}
              disabled={!activeSantri?.parentPhone}
              onChange={(e) => setSendWA(e.target.checked)}
              className="rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] w-4 h-4 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Kirim laporan WA ke wali</span>
          </label>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold text-xs h-9.5 rounded-lg shadow-xs cursor-pointer"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Setoran'}
        </Button>
      </form>
    </div>
  );
};


