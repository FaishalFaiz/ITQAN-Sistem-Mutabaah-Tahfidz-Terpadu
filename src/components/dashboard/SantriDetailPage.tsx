import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  Award, 
  History, 
  Layers, 
  Share2, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { MushafHeatmap } from '../visualization/MushafHeatmap';
import { PacingCard } from '../visualization/PacingCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SantriDetailPageProps {
  santri: Santri;
  onBack: () => void;
  onSetor: (santri: Santri) => void;
}

export const SantriDetailPage: React.FC<SantriDetailPageProps> = ({
  santri,
  onBack,
  onSetor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'riwayat' | 'analisis'>('overview');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Metrik kalkulasi
  const totalLines = santri.totalLinesMemorized || 1500;
  const totalTarget = 9060;
  const progressPercent = Math.min(100, Math.round((totalLines / totalTarget) * 100));
  const pagesCompleted = (totalLines / 15).toFixed(1);
  const remainingLines = Math.max(0, totalTarget - totalLines);
  const remainingDays = 650;
  const requiredDailyLines = Math.ceil(remainingLines / remainingDays);

  const completedCount = Math.min(604, Math.round(totalLines / 15));
  const completedPages = Array.from({ length: completedCount }, (_, i) => i + 1);
  const inProgressPages = [completedCount + 1, completedCount + 2, completedCount + 3];

  const detailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.detail-tab-pane',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }, detailContainerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // WhatsApp Digest Generator
  const handleCopyWADigest = () => {
    const text = `*LAPORAN MUTABA'AH TAHFIDZ SANTRI ITQAN*\n\n` +
      `Nama: *${santri.name}* (NIS: ${santri.nis})\n` +
      `Kelompok: Halaqoh Abu Bakar Ash-Shiddiq\n` +
      `Total Capaian: *${santri.juzAchieved}* (${totalLines} baris / ~${pagesCompleted} Halaman)\n` +
      `Target Hari Ini: ${santri.dailyTargetLines} Baris | Tercapai: ${santri.linesCompletedToday} Baris (${santri.status.toUpperCase()})\n` +
      `Surah Terakhir: *${santri.lastSurah}*\n\n` +
      `_Pesan otomatis Sistem Mutaba'ah ITQAN - Pesantren Tahfidz Terpadu_`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div ref={detailContainerRef} className="space-y-5 animate-fadeIn">
      {/* 1. Top Bar: Breadcrumb + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
        >
          <div className="w-6 h-6 rounded-md bg-brand-50 flex items-center justify-center group-hover:bg-brand-100">
            <ArrowLeft className="w-3.5 h-3.5 text-brand" />
          </div>
          <span>Kembali ke Beranda Halaqoh</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Tombol Salin WA Digest */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyWADigest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            title="Salin ringkasan progres untuk dikirim ke Wali Santri via WA"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{copyFeedback ? 'Tersalin ke Clipboard!' : 'Kirim WA Wali'}</span>
          </Button>

          {/* Tombol Input Setoran Cepat */}
          <Button
            type="button"
            size="sm"
            onClick={() => onSetor(santri)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Input Setoran</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Profile Banner */}
      <Card className="p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-border">
        {/* Identitas Santri */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-50 border border-brand-100 text-brand flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xs">
              {santri.avatarInitials}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-card flex items-center justify-center text-[10px] text-white ${
                santri.status === 'tercapai'
                  ? 'bg-emerald-600'
                  : santri.status === 'tidak_tercapai'
                  ? 'bg-red-600'
                  : 'bg-amber-500'
              }`}
            >
              {santri.status === 'tercapai' ? '✓' : '!'}
            </span>
          </div>


          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {santri.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                NIS: {santri.nis}
              </Badge>
              <Badge variant="info" className="text-xs">
                Angkatan 2024
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
              <span>Halaqoh: <b className="text-slate-800">Abu Bakar Ash-Shiddiq</b></span>
              <span className="text-slate-300">•</span>
              <span>Musyrif: <b className="text-slate-800">Ust. Abdullah</b></span>
              <span className="text-slate-300">•</span>
              <span>Terakhir Setor: <b className="text-[#0070BA]">{santri.lastSurah}</b></span>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block uppercase">
              Total Hafalan
            </span>
            <span className="text-base sm:text-lg font-bold text-[#0070BA]">
              {santri.juzAchieved}
            </span>
            <span className="text-[10px] text-slate-500 block">
              ~{pagesCompleted} Hal
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block uppercase">
              Target Hari Ini
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {santri.linesCompletedToday} <span className="text-xs font-normal text-slate-400">/ {santri.dailyTargetLines}</span>
            </span>
            <span className="text-[10px] text-slate-500 block">
              baris
            </span>
          </div>

          <div className={`border rounded-xl px-3.5 py-2.5 text-center ${
            santri.status === 'tercapai'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : santri.status === 'tidak_tercapai'
              ? 'bg-red-50/60 border-red-200 text-red-800'
              : 'bg-amber-50/60 border-amber-200 text-amber-800'
          }`}>
            <span className="text-[10px] sm:text-[11px] font-semibold block uppercase">
              Status Harian
            </span>
            <span className="text-xs sm:text-sm font-bold block mt-0.5">
              {santri.status === 'tercapai' && 'Tercapai'}
              {santri.status === 'tidak_tercapai' && 'Defisit'}
              {santri.status === 'belum_setor' && 'Belum Setor'}
            </span>
            <span className="text-[10px] opacity-80 block">
              Sesi Pagi
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Tab Navigasi Detail */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ringkasan &amp; Rekomendasi Pacing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('heatmap')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'heatmap'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Heatmap Mushaf 604 Halaman</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('riwayat')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'riwayat'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Setoran Halaqoh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analisis')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analisis'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analisis Retensi &amp; Spaced Muroja'ah</span>
        </button>
      </div>

      {/* 4. Tab 1: Overview & Rekomendasi Pacing */}
      {activeTab === 'overview' && (
        <div className="detail-tab-pane grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Kolom Kiri: Pacing Card & Actionable Guidance */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pacing Engine Card */}
            <PacingCard
              santriName={santri.name}
              nis={santri.nis}
              totalLinesMemorized={totalLines}
              totalLinesTarget={totalTarget}
              daysRemaining={remainingDays}
              dailyTargetLines={santri.dailyTargetLines}
              linesCompletedToday={santri.linesCompletedToday}
              status={santri.status === 'tercapai' ? 'on_track' : 'behind'}
            />

            {/* Rekomendasi Tindakan Musyrif */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Rekomendasi Tindakan Musyrif (Adaptive Action Plan)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Rencana aksi otomatis berdasarkan data kecepatan setoran &amp; kurva retensi santri
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Action Card 1 */}
                <div className="p-3.5 rounded-lg border border-blue-200 bg-[#EBF5FB]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#0070BA] px-2 py-0.5 rounded">
                        Ziyadah
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">
                        {santri.status === 'tercapai' ? 'Lanjutkan Ayat Baru Besok Pagi' : 'Tuntaskan Target Sesi Sore'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {santri.status === 'tercapai'
                        ? `Target hari ini telah tuntas. Kunci hafalan ${santri.lastSurah} dengan tasmi' mandiri 2x sebelum berpindah ke surah berikutnya.`
                        : `Terdapat defisit ${santri.dailyTargetLines - santri.linesCompletedToday} baris. Berikan slot setoran khusus pada sesi halaqoh Ashar agar sisa target tidak membebani hari esok.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] shrink-0"
                  >
                    Setor Sekarang
                  </button>
                </div>

                {/* Action Card 2: Spaced Repetition Muroja'ah */}
                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Muroja'ah Rutin
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">
                        Ulangi Juz 29 (Hal. 562–564)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem mendeteksi rentang halaman ini terakhir dimuroja'ah 8 hari yang lalu dengan status I'adah. Sangat krusial disimak ulang pekan ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 shrink-0"
                  >
                    Simak Muroja'ah
                  </button>
                </div>

                {/* Action Card 3: Tiket Ujian Tasmi' */}
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Kesiapan Tasmi'
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">
                        Kelayakan Ujian Tasmi' Juz 30 (Sekali Duduk)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Akumulasi setoran Juz 30 telah lengkap 100%. Santri dapat didaftarkan tiket ujian kenaikan juz melalui koordinator tahfidz.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded shrink-0">
                    Siap Ujian
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rapor Ringkas & Status Akademik */}
          <div className="space-y-4">
            {/* Kartu Parameter Akademik */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Statistik Mutaba'ah Santri
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Target Durasi</span>
                  <span className="font-bold text-slate-900">3 Tahun (36 Bulan)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Persentase Khatam</span>
                  <span className="font-bold text-[#0070BA]">{progressPercent}%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Rata-rata Kelancaran</span>
                  <span className="font-bold text-emerald-700">92% Mumtaz</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Kehadiran Halaqoh</span>
                  <span className="font-bold text-slate-900">98% (28 dari 29 Sesi)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Rekomendasi Harian Baru</span>
                  <span className="font-bold text-[#0070BA]">{requiredDailyLines} Baris / Hari</span>
                </div>
              </div>
            </div>

            {/* Kotak Pengingat Ujian Tasmi' */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Award className="w-4 h-4 text-[#0070BA]" />
                <span>Riwayat Tiket Ujian Terakhir</span>
              </div>
              <p className="text-xs text-slate-600">
                Tasmi' Juz 29 telah diselesaikan pada 12 Agustus 2026 dengan predikat <b>Mumtaz (Nilai: 94.5)</b>.
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Sertifikat Terbit ber-QR Code
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Heatmap 604 Halaman */}
      {activeTab === 'heatmap' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Peta Matriks Mushaf (604 Halaman) — {santri.name}
              </h3>
              <p className="text-xs text-slate-500">
                Setiap kotak merepresentasikan 1 halaman mushaf Madinah standar (15 baris per halaman)
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-[#EBF5FB] text-[#0070BA] rounded-lg border border-[#D6EAF8]">
              {completedCount} / 604 Halaman Tuntas
            </div>
          </div>

          <MushafHeatmap
            completedPages={completedPages}
            inProgressPages={inProgressPages}
            totalPages={604}
          />
        </div>
      )}

      {/* 6. Tab 3: Riwayat Setoran */}
      {activeTab === 'riwayat' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Log Catatan Mutaba'ah Halaqoh
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat setoran hafalan baru (Ziyadah) dan pengulangan (Muroja'ah)
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Menampilkan 5 sesi terakhir
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu &amp; Sesi</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Surah &amp; Ayat</th>
                  <th className="py-3 px-4">Posisi Baris</th>
                  <th className="py-3 px-4">Jumlah Baris</th>
                  <th className="py-3 px-4">Kelancaran</th>
                  <th className="py-3 px-4">Musyrif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">Hari ini, 07:15 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-[#0070BA] border border-blue-200">
                      ZIYADAH
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{santri.lastSurah}</td>
                  <td className="py-3 px-4 text-slate-500">Hal. 582 (B 1–15)</td>
                  <td className="py-3 px-4 font-bold text-[#0070BA]">{santri.linesCompletedToday || 15} Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      MUMTAZ
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">Ust. Abdullah</td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">Kemarin, 16:30 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                      MUROJA'AH
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">An-Naziat 1-46</td>
                  <td className="py-3 px-4 text-slate-500">Hal. 583–584</td>
                  <td className="py-3 px-4 font-bold text-slate-800">30 Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      MUMTAZ
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">Ust. Abdullah</td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">26 Sep 2026, 07:10 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-[#0070BA] border border-blue-200">
                      ZIYADAH
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">Abasa 1-42</td>
                  <td className="py-3 px-4 text-slate-500">Hal. 585 (B 1–15)</td>
                  <td className="py-3 px-4 font-bold text-[#0070BA]">15 Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                      JAYYID
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">Ust. Abdullah</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Analisis Retensi & Spaced Repetition */}
      {activeTab === 'analisis' && (
        <div className="detail-tab-pane bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Analisis Kurva Retensi Hafalan (Spaced Retention Engine)
            </h3>
            <p className="text-xs text-slate-500">
              Mendeteksi titik kritis lupa berdasarkan interval hari dan evaluasi kelancaran sebelumnya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Titik Lemah (I'adah Belum Tuntas)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                • <b>Surah Al-Muthaffifin (Ayat 10–25)</b>: Terjadi ketukan tajwid &amp; makhraj berulang pada 3 sesi lalu. Wajib disimak talaqqi sebelum lanjut surah baru.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Peringatan Jeda Muroja'ah &gt; 7 Hari</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                • <b>Juz 29 (Surah Al-Mulk s.d. Al-Mursalat)</b>: Belum pernah dimuroja'ahkan sejak 8 hari lalu. Jadwalkan tasmi' santri pekan ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
