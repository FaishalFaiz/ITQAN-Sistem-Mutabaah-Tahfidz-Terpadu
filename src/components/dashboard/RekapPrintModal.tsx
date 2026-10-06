import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Award, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storageService } from '../../services/storageService';
import type { SantriReportItem } from './laporanData';

interface RekapPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriReports: SantriReportItem[];
  periodLabel: string;
  totalZiyadahLines: number;
  totalMurojaahLines: number;
  avgMumtaz: number;
  avgJayyid: number;
  avgIadah: number;
  onTrackPercentage: number;
}

export const RekapPrintModal: React.FC<RekapPrintModalProps> = ({
  isOpen,
  onClose,
  santriReports,
  periodLabel,
  totalZiyadahLines,
  totalMurojaahLines,
  avgMumtaz,
  avgJayyid,
  avgIadah,
  onTrackPercentage,
}) => {
  if (!isOpen) return null;

  const halaqahSettings = storageService.getHalaqahSettings();
  const currentMusyrifName = halaqahSettings.musyrifName || 'Muhaffizh Halaqoh';
  const currentHalaqahName = halaqahSettings.halaqahName || 'Halaqoh Tahfidz';

  const totalSantri = santriReports.length;
  const totalPagesZiyadah = +(totalZiyadahLines / 15).toFixed(1);
  const totalJuzMurojaah = +(totalMurojaahLines / 300).toFixed(1);

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const nomorDokumen = `ITQAN/REKAP/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;

  return createPortal(
    <div
      className="print-modal-backdrop fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
      data-print-container="true"
    >
      <div className="print-modal-container bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden">
        {/* Modal Action Bar (Sembunyi mutlak saat cetak / PDF) */}
        <div className="print-modal-header flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#0070BA]" />
            <span className="text-xs font-bold text-slate-800">
              Pratinjau Lembar Rekapitulasi Halaqoh A4 (Siap Cetak / PDF)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => window.print()}
              className="h-8.5 px-3.5 text-xs bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OFFICIAL A4 DOCUMENT: LEMBAR REKAP HALAQOH                */}
        {/* ======================================================== */}
        <div className="print-page bg-white p-6 sm:p-8 md:p-10 text-slate-900 font-sans leading-relaxed selection:bg-none">
          {/* 1. KOP SURAT RESMI */}
          <div className="kop-surat pb-3 border-b-[3px] border-double border-slate-900 avoid-break">
            <div className="flex items-center justify-between gap-4">
              <div className="w-14 h-14 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center bg-slate-50 text-slate-900 shrink-0">
                <span className="text-sm font-black tracking-tighter leading-none">ITQAN</span>
                <span className="text-[7px] font-bold uppercase tracking-widest text-[#0070BA] mt-0.5">TAHFIDZ</span>
              </div>

              <div className="text-center flex-1 space-y-0.5">
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
                  LEMBAGA PENDIDIKAN &amp; PEMBINAAN TAHFIDZ AL-QUR'AN
                </p>
                <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-950 font-serif leading-tight">
                  PESANTREN TAHFIDZ TERPADU ITQAN
                </h1>
                <p className="text-[10px] text-slate-600">
                  Laporan Rekapitulasi Progres Talaqqi &amp; Mutaba'ah Halaqoh
                </p>
              </div>

              <div className="w-14 h-14 border border-slate-300 rounded-lg p-1 flex flex-col items-center justify-center text-center bg-slate-50/50 shrink-0">
                <Award className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span className="text-[7px] font-extrabold text-slate-800 leading-none">RESMI</span>
                <span className="text-[7px] text-slate-500 mt-0.5">Halaqoh</span>
              </div>
            </div>
          </div>

          {/* 2. JUDUL DOKUMEN */}
          <div className="text-center pt-3 pb-3 avoid-break space-y-1">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-950 underline decoration-slate-400 decoration-1 underline-offset-4">
              LEMBAR REKAPITULASI CAPAIAN HALAQOH
            </h2>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-medium">
              <span>Halaqoh: <strong className="text-slate-800">{currentHalaqahName}</strong></span>
              <span>•</span>
              <span>Muhaffizh: <strong className="text-slate-800">{currentMusyrifName}</strong></span>
              <span>•</span>
              <span>Periode: <strong className="text-slate-800">{periodLabel}</strong></span>
            </div>
          </div>

          {/* 3. RINGKASAN METRIK HALAQOH */}
          <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-50/70 border border-slate-300 rounded-lg text-center avoid-break">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Santri</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{totalSantri} Santri</span>
              <span className="text-[9px] text-emerald-700 font-semibold">{onTrackPercentage}% On Track</span>
            </div>
            <div className="border-r border-slate-200 px-2">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Ziyadah</span>
              <span className="text-base font-extrabold text-[#0070BA] mt-0.5 block">{totalZiyadahLines.toLocaleString()} B</span>
              <span className="text-[9px] text-slate-500">~{totalPagesZiyadah} Halaman</span>
            </div>
            <div className="border-r border-slate-200 px-2">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Muroja'ah</span>
              <span className="text-base font-extrabold text-sky-700 mt-0.5 block">{totalMurojaahLines.toLocaleString()} B</span>
              <span className="text-[9px] text-slate-500">~{totalJuzMurojaah} Juz</span>
            </div>
            <div className="pl-2">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Rata Mutu Bacaan</span>
              <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">{avgMumtaz}%</span>
              <span className="text-[9px] text-slate-500">Mumtaz • {avgJayyid}% Jayyid • {avgIadah}% I'adah</span>
            </div>
          </div>

          {/* 4. TABEL CAPAIAN SELURUH SANTRI */}
          <div className="pt-3.5 space-y-1.5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              I. REKAP INDIVIDUAL SANTRI DALAM HALAQOH
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-[10px] tabular-nums">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300 text-center w-8">No</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Nama Santri</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-20">NIS</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-24">Akumulasi Juz</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-24">Ziyadah (Periode)</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-24">Muroja'ah</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-20">Kelancaran</th>
                  <th className="p-1.5 text-center w-24">Status Pacing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {santriReports.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : ''}>
                    <td className="p-1.5 text-center border-r border-slate-300 text-slate-500">{idx + 1}</td>
                    <td className="p-1.5 font-bold border-r border-slate-300 text-slate-900">{s.name}</td>
                    <td className="p-1.5 text-center font-mono border-r border-slate-300 text-slate-600">{s.nis}</td>
                    <td className="p-1.5 text-right font-semibold border-r border-slate-300 text-slate-900">{s.juzAchieved}</td>
                    <td className="p-1.5 text-right font-medium border-r border-slate-300 text-slate-800">
                      {s.ziyadahLinesPeriod} B ({s.ziyadahPagesPeriod} H)
                    </td>
                    <td className="p-1.5 text-right font-medium border-r border-slate-300 text-slate-800">
                      {s.murojaahLinesPeriod} B ({s.murojaahJuzPeriod} J)
                    </td>
                    <td className="p-1.5 text-center font-semibold border-r border-slate-300 text-emerald-800">
                      {s.mumtazPercent}%
                    </td>
                    <td className="p-1.5 text-center font-bold">
                      <span className={
                        s.pacingStatus === 'behind'
                          ? 'text-red-700'
                          : s.pacingStatus === 'accelerated'
                          ? 'text-emerald-700'
                          : 'text-[#0070BA]'
                      }>
                        {s.pacingStatus === 'behind' ? 'Defisit' : s.pacingStatus === 'accelerated' ? 'Melebihi' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. TANDA TANGAN FORMAL */}
          <div className="section-ttd pt-8 avoid-break">
            <div className="flex justify-between items-end text-[11px] text-slate-900">
              <div className="text-center w-52 space-y-16">
                <p className="text-slate-600">
                  Mengetahui,<br />
                  <span className="font-semibold text-slate-800">Koordinator Tahfidz Lembaga</span>
                </p>
                <div className="border-t border-slate-400 pt-1 font-medium text-slate-700">
                  ( ............................................ )
                </div>
              </div>

              <div className="text-center w-52 space-y-16">
                <p className="text-slate-600">
                  Ditetapkan di Jakarta,<br />
                  <span className="font-semibold text-slate-800">{currentDateFormatted}</span><br />
                  <span className="text-[10px] text-slate-500">Muhaffizh Pembimbing Halaqoh</span>
                </p>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-950 uppercase">{currentMusyrifName}</p>
                  <p className="text-[9px] font-mono text-slate-500">NIP / ID: {nomorDokumen.slice(-6)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. FOOTER RESMI */}
          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between text-[9px] text-slate-400 avoid-break font-mono">
            <span>ITQAN Tahfidz Management Information System</span>
            <span>Dokumen Lembar Rekapitulasi Halaqoh Resmi</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
