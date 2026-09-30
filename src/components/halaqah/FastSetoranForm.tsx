import React, { useState } from 'react';
import { CheckCircle, MessageSquare, Send, AlertTriangle, ExternalLink } from 'lucide-react';
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

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* 1. Identitas Santri */}
        {initialSantri ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0">
                {initialSantri.avatarInitials}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {initialSantri.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  NIS: {initialSantri.nis} • Capaian: {initialSantri.juzAchieved}
                </span>
                {initialSantri.parentName && (
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Wali: <strong className="text-slate-800">{initialSantri.parentName}</strong> ({initialSantri.parentPhone || 'No WA belum diisi'})
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Target Harian</span>
              <span className="text-xs font-bold text-[#0070BA]">{initialSantri.dailyTargetLines} Baris</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Pilih Santri</label>
            <select
              value={selectedSantriId}
              onChange={(e) => handleSantriChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
            >
              {allSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (NIS: {s.nis}) — Capaian: {s.juzAchieved} — Target: {s.dailyTargetLines} Baris
                </option>
              ))}
            </select>
            {activeSantri && (
              <p className="text-xs text-slate-500 mt-1.5">
                Wali: <strong className="text-slate-700">{activeSantri.parentName}</strong> ({activeSantri.parentPhone || 'No WA belum diisi'})
              </p>
            )}
          </div>
        )}

        {/* 2. Jenis Setoran (Toggle Cepat) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Jenis Setoran</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setType('ziyadah')}
              className={`h-10 text-sm font-semibold rounded-lg border transition-all ${
                type === 'ziyadah'
                  ? 'bg-[#0070BA] text-white border-[#0070BA] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Ziyadah (Hafalan Baru)
            </button>
            <button
              type="button"
              onClick={() => setType('murojaah')}
              className={`h-10 text-sm font-semibold rounded-lg border transition-all ${
                type === 'murojaah'
                  ? 'bg-[#0070BA] text-white border-[#0070BA] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Muroja'ah (Pengulangan)
            </button>
          </div>
        </div>

        {/* 3. Surah & Juz */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nama Surah &amp; Ayat
            </label>
            <input
              type="text"
              list="surah-list"
              required
              value={surahName}
              onChange={(e) => setSurahName(e.target.value)}
              placeholder="Contoh: An-Naba 1-40"
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
            />
            <datalist id="surah-list">
              {COMMON_SURAHS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Juz</label>
            <select
              value={juz}
              onChange={(e) => setJuz(Number(e.target.value))}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Rentang Halaman & Posisi Baris (Lapang & Jelas) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="font-bold text-slate-800">
              Posisi Halaman Mushaf &amp; Granularitas Baris
            </span>
            <span className="self-start sm:self-auto font-bold text-[#0070BA] bg-[#EBF5FB] px-2.5 py-1 rounded-md border border-[#D6EAF8] text-xs">
              {totalLines} Baris Terhitung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Subgrup 1: Halaman Mushaf (1–604) */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                1. Rentang Halaman (Mushaf Madinah 1–604)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Halaman Awal</label>
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
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Halaman Akhir</label>
                  <input
                    type="number"
                    min={pageStart}
                    max={604}
                    value={pageEnd}
                    onChange={(e) => setPageEnd(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Subgrup 2: Posisi Baris (1–15) */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                2. Posisi Baris Ayat (Standar 1–15 Baris)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Baris Awal (1–15)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={lineStart}
                    onChange={(e) => setLineStart(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Baris Akhir (1–15)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={lineEnd}
                    onChange={(e) => setLineEnd(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Evaluasi Kelancaran (Mumtaz, Jayyid, I'adah) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Evaluasi Mutu Kelancaran</label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setGrade('mumtaz')}
              className={`h-10 text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                grade === 'mumtaz'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              MUMTAZ (Lancar)
            </button>
            <button
              type="button"
              onClick={() => setGrade('jayyid')}
              className={`h-10 text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                grade === 'jayyid'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              JAYYID (Cukup)
            </button>
            <button
              type="button"
              onClick={() => setGrade('iadah')}
              className={`h-10 text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                grade === 'iadah'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              I'ADAH (Ulang)
            </button>
          </div>
        </div>

        {/* 6. Catatan Musyrif */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Catatan Musyrif <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Makharijul huruf fasih, tingkatkan ketukan waqaf"
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-xs"
          />
        </div>

        {/* 7. Pengaturan Notifikasi WhatsApp Gateway */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-[#F4FDF8]">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Notifikasi WhatsApp ke Wali Santri
              </span>
              <span className="text-xs text-slate-500">
                {activeSantri?.parentPhone ? `Kirim ke: ${activeSantri.parentPhone} (${activeSantri.parentName})` : 'Nomor WhatsApp wali belum tersimpan'}
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sendWA}
              disabled={!activeSantri?.parentPhone}
              onChange={(e) => setSendWA(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Tombol Simpan Setoran */}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold text-sm h-11 rounded-lg shadow-xs mt-2"
        >
          {isSubmitting ? 'Menyimpan & Memproses WA...' : 'Simpan & Validasi Setoran Santri'}
        </Button>
      </form>
    </div>
  );
};
