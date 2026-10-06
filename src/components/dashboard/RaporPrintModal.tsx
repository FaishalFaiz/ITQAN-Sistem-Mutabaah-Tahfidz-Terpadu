import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Award } from 'lucide-react';
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
  periodLabel = 'Bulan Berjalan',
}) => {
  if (!isOpen || !santri) return null;

  const halaqahSettings = storageService.getHalaqahSettings();
  const currentMusyrifName = halaqahSettings.musyrifName || 'Muhaffizh Halaqoh';
  const currentHalaqahName =
    ('halaqahName' in santri && santri.halaqahName) ||
    halaqahSettings.halaqahName ||
    'Halaqoh Tahfidz';

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
      : 85;

  const jayyidPercent =
    'jayyidPercent' in santri
      ? santri.jayyidPercent
      : totalRecords > 0
      ? Math.round((jayyidCount / totalRecords) * 100)
      : 15;

  const iadahPercent =
    'iadahPercent' in santri
      ? santri.iadahPercent
      : totalRecords > 0
      ? Math.round((iadahCount / totalRecords) * 100)
      : 0;

  const totalLines =
    santri.totalLinesMemorized ||
    (parseFloat(santri.juzAchieved.replace(/[^0-9.]/g, '')) || 1) * 300;

  const pagesCompleted = +(totalLines / 15).toFixed(1);

  // Ambil riwayat setoran terbaru untuk tabel rincian (maksimal 5 record terakhir)
  const recentRecords = records.slice(0, 5);

  // Tanggal cetak format resmi Indonesia
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const nomorDokumen = `ITQAN/RAPOR/${new Date().getFullYear()}/${santri.nis.replace(/\D/g, '').slice(-4) || '0101'}`;

  return createPortal(
    <div
      className="print-modal-backdrop fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
      data-print-container="true"
    >
      <div className="print-modal-container bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden">
        {/* Modal Action Bar (Tampil di layar, Sembunyi mutlak saat cetak / PDF) */}
        <div className="print-modal-header flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              Pratinjau Dokumen Rapor Resmi A4 (Siap Cetak / PDF)
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
        {/* OFFICIAL A4 DOCUMENT SHEET (DESAIN KHUSUS RAPOR PESANTREN) */}
        {/* ======================================================== */}
        <div className="print-page bg-white p-6 sm:p-8 md:p-10 text-slate-900 font-sans leading-relaxed selection:bg-none">
          {/* 1. KOP SURAT FORMAL */}
          <div className="kop-surat pb-3.5 border-b-[3px] border-double border-slate-900 avoid-break">
            <div className="flex items-center justify-between gap-4">
              {/* Logo / Monogram Resmi */}
              <div className="w-16 h-16 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center bg-slate-50 text-slate-900 shrink-0">
                <span className="text-base font-black tracking-tighter leading-none">ITQAN</span>
                <span className="text-[7px] font-bold uppercase tracking-widest text-[#0070BA] mt-0.5">TAHFIDZ</span>
              </div>

              {/* Teks Identitas Lembaga */}
              <div className="text-center flex-1 space-y-0.5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  LEMBAGA PENDIDIKAN &amp; PEMBINAAN TAHFIDZ AL-QUR'AN
                </p>
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wide text-slate-950 font-serif leading-tight">
                  PESANTREN TAHFIDZ TERPADU ITQAN
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-600">
                  Kompleks Masjid Jami' Islamic Center • Jl. Pesantren Mandiri No. 101
                </p>
                <p className="text-[9px] text-slate-500">
                  Email: sekretariat@itqan.sch.id • Website: www.itqan.sch.id • Telp: (021) 8876-5432
                </p>
              </div>

              {/* Box Akreditasi */}
              <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 flex flex-col items-center justify-center text-center bg-slate-50/50 shrink-0">
                <Award className="w-4 h-4 text-emerald-700 mb-0.5" />
                <span className="text-[8px] font-extrabold text-slate-800 leading-none">MUTQIN</span>
                <span className="text-[7px] text-slate-500 mt-0.5">A-Unggul</span>
              </div>
            </div>
          </div>

          {/* 2. JUDUL DOKUMEN & NOMOR REGISTRASI */}
          <div className="text-center pt-3 pb-3 avoid-break space-y-1">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-950 underline decoration-slate-400 decoration-1 underline-offset-4">
              LEMBAR RAPOR MUTABA'AH HAFALAN AL-QUR'AN
            </h2>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-medium">
              <span>Periode: <strong className="text-slate-800">{periodLabel}</strong></span>
              <span>•</span>
              <span>Tahun Akademik: <strong className="text-slate-800">2026/2027</strong></span>
              <span>•</span>
              <span className="font-mono">No: {nomorDokumen}</span>
            </div>
          </div>

          {/* 3. BIODATA SANTRI FORMAL */}
          <div className="biodata-box p-3 bg-slate-50/70 border border-slate-300 rounded-lg text-[11px] avoid-break">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-24 text-slate-600 py-0.5">Nama Santri</td>
                  <td className="w-3 text-slate-400 py-0.5">:</td>
                  <td className="font-bold text-slate-950 uppercase tracking-tight py-0.5">{santri.name}</td>
                  <td className="w-24 text-slate-600 py-0.5">Halaqoh</td>
                  <td className="w-3 text-slate-400 py-0.5">:</td>
                  <td className="font-semibold text-slate-900 py-0.5">{currentHalaqahName}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 py-0.5">Nomor Induk (NIS)</td>
                  <td className="text-slate-400 py-0.5">:</td>
                  <td className="font-mono font-semibold text-slate-800 py-0.5">{santri.nis}</td>
                  <td className="text-slate-600 py-0.5">Muhaffizh</td>
                  <td className="text-slate-400 py-0.5">:</td>
                  <td className="font-semibold text-slate-900 py-0.5">{currentMusyrifName}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 py-0.5">Target Jenjang</td>
                  <td className="text-slate-400 py-0.5">:</td>
                  <td className="text-slate-800 py-0.5">30 Juz Mutqin Bersanad</td>
                  <td className="text-slate-600 py-0.5">Status Capaian</td>
                  <td className="text-slate-400 py-0.5">:</td>
                  <td className="py-0.5">
                    <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      santri.status === 'tercapai' 
                        ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300' 
                        : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                    }`}>
                      {santri.status === 'tercapai' ? 'Target Terpenuhi' : 'Perlu Tambahan Setoran'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. TABEL CAPAIAN HAFALAN & INDIKATOR */}
          <div className="section-tabel pt-3.5 space-y-1.5 avoid-break">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>I. REKAPITULASI PROGRES HAFALAN</span>
              </h3>
              <span className="text-[10px] text-slate-500 italic">Standar Mushaf Madinah (15 Baris / Halaman)</span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border-r border-slate-300 text-left">Indikator Mutaba'ah</th>
                  <th className="p-2 border-r border-slate-300 text-right w-28">Target Kurikulum</th>
                  <th className="p-2 border-r border-slate-300 text-right w-32">Realisasi Santri</th>
                  <th className="p-2 text-center w-28">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 text-center border-r border-slate-300">1</td>
                  <td className="p-2 font-medium border-r border-slate-300">Total Akumulasi Hafalan (Juz)</td>
                  <td className="p-2 text-right border-r border-slate-300">30.0 Juz</td>
                  <td className="p-2 text-right font-bold text-slate-950 border-r border-slate-300">{santri.juzAchieved}</td>
                  <td className="p-2 text-center font-medium text-emerald-800">Mutqin Terjaga</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-300">2</td>
                  <td className="p-2 font-medium border-r border-slate-300">Total Akumulasi Baris &amp; Halaman</td>
                  <td className="p-2 text-right border-r border-slate-300">9.060 Baris (604 Hal)</td>
                  <td className="p-2 text-right font-bold text-slate-950 border-r border-slate-300">
                    {totalLines.toLocaleString()} B ({pagesCompleted} Hal)
                  </td>
                  <td className="p-2 text-center text-slate-700">Tercatat di Sistem</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-300">3</td>
                  <td className="p-2 font-medium border-r border-slate-300">Target Harian Halaqoh</td>
                  <td className="p-2 text-right border-r border-slate-300">{santri.dailyTargetLines || 15} Baris / Hari</td>
                  <td className="p-2 text-right font-bold text-slate-950 border-r border-slate-300">
                    {santri.linesCompletedToday || 0} Baris
                  </td>
                  <td className="p-2 text-center">
                    <span className={`font-semibold ${
                      (santri.linesCompletedToday || 0) >= (santri.dailyTargetLines || 15)
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}>
                      {(santri.linesCompletedToday || 0) >= (santri.dailyTargetLines || 15) ? 'Tercapai' : 'Proses Berjalan'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-300">4</td>
                  <td className="p-2 font-medium border-r border-slate-300">Surah &amp; Ayat Terakhir Disimak</td>
                  <td className="p-2 text-right border-r border-slate-300">-</td>
                  <td className="p-2 text-right font-bold text-slate-950 border-r border-slate-300">{santri.lastSurah}</td>
                  <td className="p-2 text-center text-slate-600">Simak Terakhir</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. TABEL EVALUASI MUTU BACAAN & TAJWID */}
          <div className="section-mutu pt-3.5 space-y-1.5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              II. EVALUASI KUALITAS MUTU SETORAN &amp; TAJWID
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="border border-slate-300 rounded p-2.5 text-center bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  MUMTAZ (LANCAR &amp; FASIH)
                </span>
                <span className="text-xl font-black text-emerald-900 my-0.5 block">{mumtazPercent}%</span>
                <p className="text-[9px] text-slate-500">
                  Bacaan lancar tanpa jeda, makhraj dan tajwid sesuai kaidah.
                </p>
              </div>

              <div className="border border-slate-300 rounded p-2.5 text-center bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">
                  JAYYID (CUKUP LANCAR)
                </span>
                <span className="text-xl font-black text-amber-900 my-0.5 block">{jayyidPercent}%</span>
                <p className="text-[9px] text-slate-500">
                  Perlu penguatan harakat dan konsistensi mad (panjang-pendek).
                </p>
              </div>

              <div className="border border-slate-300 rounded p-2.5 text-center bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider block">
                  I'ADAH (PENGULANGAN)
                </span>
                <span className="text-xl font-black text-red-900 my-0.5 block">{iadahPercent}%</span>
                <p className="text-[9px] text-slate-500">
                  Ayat yang perlu diulang sebelum melanjutkan ke halaman baru.
                </p>
              </div>
            </div>
          </div>

          {/* 6. RINCIAN SETORAN TERAKHIR (JIKA ADA RECORD) */}
          {recentRecords.length > 0 && (
            <div className="section-log pt-3.5 space-y-1.5 avoid-break">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                III. LOG 5 SESI SIMAKAN TERAKHIR
              </h3>
              <table className="w-full border-collapse border border-slate-300 text-[10px] tabular-nums">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300 text-left">Waktu Setor</th>
                    <th className="p-1.5 border-r border-slate-300 text-left">Jenis</th>
                    <th className="p-1.5 border-r border-slate-300 text-left">Surah / Halaman</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">Volume</th>
                    <th className="p-1.5 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="p-1.5 border-r border-slate-300 text-slate-600">{r.formattedDate}</td>
                      <td className="p-1.5 border-r border-slate-300 font-semibold uppercase text-slate-800">
                        {r.type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-medium text-slate-900">
                        {r.surahName} (Juz {r.juz})
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-bold text-slate-800">
                        {r.totalLines} baris
                      </td>
                      <td className="p-1.5 text-center font-bold uppercase">
                        <span className={
                          r.grade === 'mumtaz' 
                            ? 'text-emerald-700' 
                            : r.grade === 'iadah' 
                            ? 'text-red-700' 
                            : 'text-amber-700'
                        }>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. CATATAN PEMBINA & ARAHAN WALI SANTRI */}
          <div className="section-catatan pt-3.5 space-y-1 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              {recentRecords.length > 0 ? 'IV' : 'III'}. CATATAN &amp; ARAHAN MUHAFFIZH
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] text-slate-700 space-y-1 leading-relaxed">
              <p>
                Alhamdulillah, ananda <strong>{santri.name}</strong> menunjukkan adab yang mulia dan kesungguhan dalam talaqqi Al-Qur'an di halaqoh.
              </p>
              <p className="italic text-slate-600">
                Pesan untuk Wali Santri: Mohon terus memotivasi ananda untuk rutin muroja'ah mandiri di rumah minimal 1 juz per hari serta membiasakan simakan keluarga sebelum tidur agar kelancaran hafalan senantiasa terjaga.
              </p>
            </div>
          </div>

          {/* 8. BLOK TANDA TANGAN FORMAL */}
          <div className="section-ttd pt-6 avoid-break">
            <div className="flex justify-between items-end text-[11px] text-slate-900">
              {/* Kolom Mengetahui Wali Santri */}
              <div className="text-center w-52 space-y-16">
                <p className="text-slate-600">
                  Mengetahui,<br />
                  <span className="font-semibold text-slate-800">Orang Tua / Wali Santri</span>
                </p>
                <div className="border-t border-slate-400 pt-1 font-medium text-slate-700">
                  ( ............................................ )
                </div>
              </div>

              {/* Titimangsa & Muhaffizh */}
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

          {/* 9. WATERMARK FOOTER DOKUMEN RESMI */}
          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between text-[9px] text-slate-400 avoid-break font-mono">
            <span>ITQAN Tahfidz Management Information System</span>
            <span>Dokumen ini sah dan diterbitkan secara digital oleh Pesantren Tahfidz Terpadu ITQAN</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
