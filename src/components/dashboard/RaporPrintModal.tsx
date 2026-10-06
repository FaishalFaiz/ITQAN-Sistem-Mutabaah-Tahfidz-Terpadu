import React from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storageService } from '../../services/storageService';
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
  periodLabel = 'Bulan Ini',
}) => {
  if (!isOpen || !santri) return null;

  const halaqahSettings = storageService.getHalaqahSettings();
  const currentMusyrifName = halaqahSettings.musyrifName || 'Muhaffizh Halaqoh';
  const currentHalaqahName = ('halaqahName' in santri && santri.halaqahName) || halaqahSettings.halaqahName || 'Halaqoh Tahfidz';

  // Normalisasi data dari Santri atau SantriReportItem
  const totalRecords = records.length;
  const mumtazCount = records.filter((r) => r.grade === 'mumtaz').length;
  const jayyidCount = records.filter((r) => r.grade === 'jayyid').length;
  const iadahCount = records.filter((r) => r.grade === 'iadah').length;

  const mumtazPercent =
    'mumtazPercent' in santri
      ? santri.mumtazPercent
      : totalRecords > 0
      ? Math.round((mumtazCount / totalRecords) * 100)
      : 90;

  const jayyidPercent =
    'jayyidPercent' in santri
      ? santri.jayyidPercent
      : totalRecords > 0
      ? Math.round((jayyidCount / totalRecords) * 100)
      : 10;

  const iadahPercent =
    'iadahPercent' in santri
      ? santri.iadahPercent
      : totalRecords > 0
      ? Math.round((iadahCount / totalRecords) * 100)
      : 0;

  const totalLines =
    santri.totalLinesMemorized ||
    (parseFloat(santri.juzAchieved.replace(/[^0-9.]/g, '')) || 1) * 300;

  return createPortal(
    <div className="print-modal-backdrop fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="print-modal-container bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full my-6 overflow-hidden">
        {/* Modal Actions Bar (Sembunyi saat dicetak) */}
        <div className="print-modal-header flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0070BA]" />
            Format Cetak / Ekspor PDF Rapor Resmi
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => window.print()}
              className="h-8 px-3 text-xs bg-[#0070BA] hover:bg-[#005C9E] text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ekspor ke PDF / Cetak</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Report Document Body */}
        <div className="print-page p-6 sm:p-8 space-y-4 text-slate-900 text-xs bg-white">
          {/* Kop Pesantren */}
          <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1 avoid-break">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0070BA] text-white font-extrabold text-sm mb-0.5">
              IT
            </div>
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-900 leading-tight">
              PESANTREN TAHFIDZ TERPADU ITQAN
            </h3>
            <p className="text-[11px] text-slate-600">
              Lembaga Pembinaan Al-Qur'an &amp; Mutaba'ah Berkelanjutan • Terakreditasi
            </p>
            <p className="text-[10px] text-slate-500">
              Jl. Pesantren No. 101, Kompleks Masjid Jami' • Telp: (021) 8876-5432
            </p>
            <div className="pt-2 font-bold text-xs sm:text-sm tracking-wide text-[#0070BA] uppercase">
              LEMBAR MUTABA'AH BULANAN SANTRI
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Periode: {periodLabel} • Tahun Akademik 2026/2027
            </div>
          </div>

          {/* Data Santri */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 avoid-break">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-24 text-slate-500">Nama Santri</span>
                <span className="font-bold text-slate-900">: {santri.name}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500">NIS</span>
                <span className="font-mono font-semibold text-slate-800">: {santri.nis}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500">Halaqoh</span>
                <span className="text-slate-800 font-medium">
                  : {currentHalaqahName}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-24 text-slate-500">Muhaffizh</span>
                <span className="text-slate-800 font-medium">: {currentMusyrifName}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500">Target Jenjang</span>
                <span className="text-slate-800 font-medium">: 30 Juz Mutqin</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500">Status Capaian</span>
                <span className="font-bold text-[#0070BA]">
                  : {santri.status === 'tercapai' ? 'ON TRACK' : 'DALAM PENDAMPINGAN'}
                </span>
              </div>
            </div>
          </div>

          {/* Rekap Capaian Tabel */}
          <div className="space-y-1.5 avoid-break">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              I. Capaian Hafalan Al-Qur'an
            </h5>
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="p-2 border-b border-slate-200">Parameter Evaluasi</th>
                  <th className="p-2 border-b border-slate-200 text-right">Target</th>
                  <th className="p-2 border-b border-slate-200 text-right">Realisasi</th>
                  <th className="p-2 border-b border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="p-2 font-medium">Total Akumulasi Hafalan</td>
                  <td className="p-2 text-right">9.060 Baris</td>
                  <td className="p-2 text-right font-bold text-[#0070BA]">
                    {santri.juzAchieved} ({totalLines.toLocaleString()} Baris)
                  </td>
                  <td className="p-2 text-center text-emerald-700 font-semibold">Aktif</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Target Harian</td>
                  <td className="p-2 text-right">{santri.dailyTargetLines || 15} Baris</td>
                  <td className="p-2 text-right font-bold">{santri.linesCompletedToday || 0} Baris</td>
                  <td className="p-2 text-center text-emerald-700 font-semibold">
                    {(santri.linesCompletedToday || 0) >= (santri.dailyTargetLines || 15) ? 'Tercapai' : 'Proses'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Surah Terakhir Disimak</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right font-semibold text-slate-800">{santri.lastSurah}</td>
                  <td className="p-2 text-center text-slate-600 font-medium">Terekam</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Penilaian Mutu Kelancaran */}
          <div className="space-y-1.5 avoid-break">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              II. Mutu &amp; Kualitas Bacaan
            </h5>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50">
                <span className="text-[10px] text-emerald-700 block">Mumtaz (Lancar)</span>
                <span className="text-base font-bold text-emerald-800">{mumtazPercent}%</span>
              </div>
              <div className="p-2 rounded-lg border border-amber-200 bg-amber-50">
                <span className="text-[10px] text-amber-700 block">Jayyid (Cukup)</span>
                <span className="text-base font-bold text-amber-800">{jayyidPercent}%</span>
              </div>
              <div className="p-2 rounded-lg border border-red-200 bg-red-50">
                <span className="text-[10px] text-red-700 block">I'adah (Diulang)</span>
                <span className="text-base font-bold text-red-800">{iadahPercent}%</span>
              </div>
            </div>
          </div>

          {/* Catatan Muhaffizh */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 avoid-break">
            <span className="font-bold text-slate-900 block text-[11px]">Catatan &amp; Arahan Muhaffizh:</span>
            <p className="text-slate-600 leading-relaxed text-[10px] sm:text-[11px]">
              Alhamdulillah, ananda menunjukkan komitmen yang baik dalam halaqoh Al-Qur'an. Diharapkan wali santri terus mendampingi muroja'ah mandiri di rumah agar hafalan tetap mutqin dan terjaga.
            </p>
          </div>

          {/* Tanda Tangan Tunggal Muhaffizh */}
          <div className="flex justify-end pt-4 text-center avoid-break">
            <div className="space-y-12 min-w-[180px]">
              <span className="text-slate-600 block text-[11px]">Muhaffizh Halaqoh,</span>
              <span className="font-bold text-slate-900 block border-t border-slate-300 pt-1 text-[11px]">
                {currentMusyrifName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
