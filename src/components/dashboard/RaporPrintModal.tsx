import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, X, Check, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storageService } from '../../services/storageService';
import { formatJuz } from '@/lib/utils';
import type { Santri, SetoranRecord } from './types';
import type { SantriReportItem } from './laporanData';

interface RaporPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | SantriReportItem | null;
  records?: SetoranRecord[];
  periodLabel?: string;
}

export const RaporPrintModal: React.FC<RaporPrintModalProps> = ({
  isOpen,
  onClose,
  santri,
  records = [],
  periodLabel = 'Bulan Berjalan',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !santri) return null;

  const halaqahSettings = storageService.getHalaqahSettings();
  const currentMusyrifName = halaqahSettings.musyrifName || 'Ust. H. Ahmad Dahlan, Al-Hafizh';
  const currentHalaqahName = ('halaqahName' in santri && santri.halaqahName) || halaqahSettings.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq';

  // Normalisasi data statistik
  const totalRecords = records.length;
  const mumtazCount = records.filter((r) => r.grade === 'mumtaz').length;
  const jayyidCount = records.filter((r) => r.grade === 'jayyid').length;
  const iadahCount = records.filter((r) => r.grade === 'iadah').length;

  const mumtazPercent =
    'mumtazPercent' in santri
      ? santri.mumtazPercent
      : totalRecords > 0
      ? Math.round((mumtazCount / totalRecords) * 100)
      : 92;

  const jayyidPercent =
    'jayyidPercent' in santri
      ? santri.jayyidPercent
      : totalRecords > 0
      ? Math.round((jayyidCount / totalRecords) * 100)
      : 8;

  const iadahPercent =
    'iadahPercent' in santri
      ? santri.iadahPercent
      : totalRecords > 0
      ? Math.round((iadahCount / totalRecords) * 100)
      : 0;

  const totalLines =
    santri.totalLinesMemorized ||
    (parseFloat(santri.juzAchieved.replace(/[^0-9.]/g, '')) || 1) * 300;

  // Sesi talaqqi terbaru (maksimal 6 rekaman untuk rapor halaman 1)
  const recentRecords = records.slice(0, 6);

  // Tanggal Titimangsa Rapor
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return createPortal(
    <div 
      onClick={onClose}
      className="print-modal-backdrop fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
          }
          .print-modal-container {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page {
            padding: 0 !important;
            width: 100% !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="print-modal-container bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden cursor-default"
      >
        {/* Modal Header Bar (Hanya tampil di layar browser) */}
        <div className="print-modal-header flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-50 no-print gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <FileText className="w-4 h-4 text-[#0070BA] shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              <span className="hidden sm:inline">Format Lembar Rapor Resmi A4 (Siap Cetak / PDF)</span>
              <span className="sm:hidden">Pratinjau Rapor Resmi</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => window.print()}
              className="h-8 px-2.5 sm:px-3.5 text-xs bg-[#0070BA] hover:bg-[#005C9E] text-white flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cetak / Ekspor PDF</span>
              <span className="sm:hidden">Cetak</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= OFFICIAL PRINTABLE SHEET (A4) ================= */}
        <div className="print-page p-4 sm:p-8 space-y-4 text-slate-900 text-xs bg-white overflow-x-auto">
          
          {/* 1. KOP SURAT FORMAL LEMBAGA PESANTREN */}
          <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1 avoid-break">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#0070BA] text-white flex items-center justify-center font-extrabold text-sm tracking-wider shadow-xs">
                ITQAN
              </div>
              <div className="text-left">
                <h2 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-900 leading-tight">
                  PESANTREN TAHFIDZ AL-QUR'AN TERPADU ITQAN
                </h2>
                <p className="text-[10px] text-slate-600 font-medium">
                  Pusat Pembinaan &amp; Mutaba'ah Tahfidz Berkelanjutan • Terakreditasi A
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Jl. Pesantren Terpadu No. 07, Kompleks Islamic Center • Telp: (021) 8876-5432 • www.itqan-tahfidz.sch.id
            </p>
            {/* Garis ganda formal */}
            <div className="pt-2 border-b border-slate-300"></div>
            <div className="pt-1.5 text-center">
              <h3 className="font-extrabold text-xs sm:text-sm tracking-wider text-[#0070BA] uppercase">
                LEMBAR RAPOR MUTABA'AH TAHFIDZ AL-QUR'AN
              </h3>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                Periode: {periodLabel} • Tahun Ajaran 2026/2027
              </p>
            </div>
          </div>

          {/* 2. IDENTITAS SANTRI & HALAQOH */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200 avoid-break text-[11px]">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-900">: {santri.name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Nomor Induk (NIS)</span>
                <span className="font-mono font-semibold text-slate-800">: {santri.nis}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Halaqoh / Kelas</span>
                <span className="text-slate-800 font-semibold">: {currentHalaqahName}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-500">Muhaffizh Pembina</span>
                <span className="text-slate-800 font-semibold">: {currentMusyrifName}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Target Kurikulum</span>
                <span className="text-slate-800 font-medium">: 30 Juz Mutqin (15 Baris/Hari)</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Status Capaian</span>
                <span className="font-bold text-[#0070BA]">
                  : {santri.status === 'tercapai' ? 'ON TRACK (TERCAPAI)' : 'DALAM PENDAMPINGAN AKTIF'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. BAGIAN I: REKAPITULASI CAPAIAN HAFALAN */}
          <div className="space-y-1.5 avoid-break">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>I. Rekapitulasi Capaian Hafalan Al-Qur'an</span>
              <span className="text-[10px] text-slate-500 font-normal">Standar 1 Halaman = 15 Baris</span>
            </h4>
            <table className="w-full text-left border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px]">
                <tr>
                  <th className="p-2 border-b border-slate-300">Indikator Mutaba'ah</th>
                  <th className="p-2 border-b border-slate-300 text-right">Target Kurikulum</th>
                  <th className="p-2 border-b border-slate-300 text-right">Realisasi Santri</th>
                  <th className="p-2 border-b border-slate-300 text-center">Tingkat Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="p-2 font-medium">Total Akumulasi Hafalan</td>
                  <td className="p-2 text-right">9.060 Baris (30 Juz)</td>
                  <td className="p-2 text-right font-bold text-[#0070BA]">
                    {formatJuz(santri.juzAchieved)} ({totalLines.toLocaleString()} Baris)
                  </td>
                  <td className="p-2 text-center text-emerald-700 font-bold">
                    {Math.min(100, Math.round((totalLines / 9060) * 100))}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Target Talaqqi Harian</td>
                  <td className="p-2 text-right">{santri.dailyTargetLines || 15} Baris</td>
                  <td className="p-2 text-right font-bold">{santri.linesCompletedToday || 0} Baris</td>
                  <td className="p-2 text-center text-slate-700 font-semibold">
                    {(santri.linesCompletedToday || 0) >= (santri.dailyTargetLines || 15) ? 'Tercapai' : 'Proses Berjalan'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Surah Terakhir Disimak</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right font-semibold text-slate-900">{santri.lastSurah || '-'}</td>
                  <td className="p-2 text-center text-emerald-700 font-semibold">Mutqin</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. BAGIAN II: EVALUASI MUTU KELANCARAN & TAJWID */}
          <div className="space-y-1.5 avoid-break">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800">
              II. Mutu &amp; Kualitas Bacaan (Tajwid &amp; Kelancaran)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MUMTAZ (Lancar &amp; Fasih)</span>
                </div>
                <span className="text-lg font-black text-emerald-900 mt-0.5 block">{mumtazPercent}%</span>
                <span className="text-[10px] text-emerald-700 block">Sangat baik tanpa jeda</span>
              </div>
              <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/70">
                <div className="flex items-center justify-center gap-1 text-amber-800 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>JAYYID (Cukup / Terbimbing)</span>
                </div>
                <span className="text-lg font-black text-amber-900 mt-0.5 block">{jayyidPercent}%</span>
                <span className="text-[10px] text-amber-700 block">1–2 kali teguran makhraj</span>
              </div>
              <div className="p-2.5 rounded-lg border border-red-300 bg-red-50/70">
                <div className="flex items-center justify-center gap-1 text-red-800 font-bold text-[11px]">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>I'ADAH (Perlu Pengulangan)</span>
                </div>
                <span className="text-lg font-black text-red-900 mt-0.5 block">{iadahPercent}%</span>
                <span className="text-[10px] text-red-700 block">Perlu pendampingan khusus</span>
              </div>
            </div>
          </div>

          {/* 5. BAGIAN III: LOG SESI SETORAN TERAKHIR */}
          {recentRecords.length > 0 && (
            <div className="space-y-1.5 avoid-break">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>III. Rekaman Sesi Talaqqi Terbaru</span>
                <span className="text-[10px] text-slate-500 font-normal">Riwayat Setoran Resmi</span>
              </h4>
              <table className="w-full text-left border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px]">
                  <tr>
                    <th className="p-1.5 border-b border-slate-300">Waktu</th>
                    <th className="p-1.5 border-b border-slate-300">Jenis</th>
                    <th className="p-1.5 border-b border-slate-300">Materi Talaqqi</th>
                    <th className="p-1.5 border-b border-slate-300 text-right">Baris</th>
                    <th className="p-1.5 border-b border-slate-300 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10px]">
                  {recentRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="p-1.5 text-slate-600 whitespace-nowrap">{r.formattedDate}</td>
                      <td className="p-1.5 font-bold uppercase text-[9px]">
                        <span className={r.type === 'ziyadah' ? 'text-[#0070BA]' : 'text-amber-800'}>
                          {r.type}
                        </span>
                      </td>
                      <td className="p-1.5 font-medium text-slate-900">
                        {r.surahName} (Juz {r.juz} • Hal. {r.pageStart === r.pageEnd ? r.pageStart : `${r.pageStart}–${r.pageEnd}`})
                      </td>
                      <td className="p-1.5 text-right font-bold text-slate-800">{r.totalLines}</td>
                      <td className="p-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          r.grade === 'mumtaz'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.grade === 'jayyid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {r.grade.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. BAGIAN IV: CATATAN & ARAHAN MUHAFFIZH */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1 avoid-break">
            <span className="font-bold text-slate-900 block text-[11px]">
              IV. Catatan Bimbingan &amp; Arahan Muhaffizh:
            </span>
            <p className="text-slate-700 leading-relaxed text-[10px]">
              Alhamdulillah, ananda menunjukkan kesungguhan dan adab yang mulia dalam halaqoh Al-Qur'an. Diharapkan wali santri terus mendampingi disiplin muroja'ah mandiri 20–30 menit setiap selesai shalat maghrib/subuh di rumah agar hafalan tetap mutqin dan kokoh tertanam.
            </p>
          </div>

          {/* 7. BAGIAN V: PENGESAHAN TANDA TANGAN RESMI TIGA PIHAK */}
          <div className="pt-3 avoid-break">
            <div className="text-right text-[10px] text-slate-600 mb-3">
              Diterbitkan di: Jakarta, {todayFormatted}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
              <div className="space-y-12">
                <span className="text-slate-600 block">Mengetahui,<br />Orang Tua / Wali Santri</span>
                <span className="font-bold text-slate-900 block border-t border-slate-400 pt-1">
                  ( ......................................... )
                </span>
              </div>

              <div className="space-y-12">
                <span className="text-slate-600 block">Muhaffizh Pembina<br />Halaqoh Santri</span>
                <span className="font-bold text-slate-900 block border-t border-slate-400 pt-1">
                  {currentMusyrifName}
                </span>
              </div>

              <div className="space-y-12">
                <span className="text-slate-600 block">Mudir / Kepala Bidang<br />Tahfidz Al-Qur'an</span>
                <span className="font-bold text-slate-900 block border-t border-slate-400 pt-1">
                  Ust. Dr. Muhammad Zaki, Lc., M.A.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
