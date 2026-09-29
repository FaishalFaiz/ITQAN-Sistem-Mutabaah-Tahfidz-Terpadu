import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  Award, 
  History, 
  Share2, 
  Sparkles, 
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserCheck
} from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { PacingCard } from '../visualization/PacingCard';
import { Button } from '@/components/ui/button';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'riwayat' | 'analisis'>('overview');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Metrik kalkulasi
  const totalLines = santri.totalLinesMemorized || 1500;
  const totalTarget = 9060;
  const pagesCompleted = (totalLines / 15).toFixed(1);
  const remainingLines = Math.max(0, totalTarget - totalLines);
  const remainingDays = 650;
  const requiredDailyLines = Math.ceil(remainingLines / remainingDays);

  const detailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.detail-tab-pane',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
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

  const statusConfig = {
    tercapai: {
      label: 'Target Tercapai',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      subText: 'Target harian terpenuhi'
    },
    tidak_tercapai: {
      label: 'Defisit Setoran',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      subText: `Kurang ${santri.dailyTargetLines - santri.linesCompletedToday} baris`
    },
    belum_setor: {
      label: 'Belum Setor',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      subText: 'Menunggu giliran talaqqi'
    }
  }[santri.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div ref={detailContainerRef} className="space-y-4">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#0070BA] transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#EBF5FB] flex items-center justify-center text-slate-600 group-hover:text-[#0070BA] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Kembali ke Daftar Santri</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Tombol Salin WA Digest */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyWADigest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold h-8.5 px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
            title="Salin ringkasan progres untuk dikirim ke Wali Santri via WA"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{copyFeedback ? 'Tersalin!' : 'Laporan WA Wali'}</span>
          </Button>

          {/* Tombol Input Setoran */}
          <Button
            type="button"
            size="sm"
            onClick={() => onSetor(santri)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold h-8.5 px-3.5 bg-[#0070BA] hover:bg-[#005C9E] text-white shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Input Setoran</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Profile Banner (Executive Enterprise Look) */}
      <Card className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Kolom Kiri: Profil & Meta Halaqoh */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-2xs">
              {santri.avatarInitials}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {santri.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  NIS {santri.nis}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${statusConfig.badgeClass}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{statusConfig.label}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Halaqoh: <strong className="text-slate-800 font-semibold">Abu Bakar Ash-Shiddiq</strong></span>
                </span>
                <span className="text-slate-300">•</span>
                <span>Musyrif: <strong className="text-slate-800 font-semibold">Ust. Abdullah</strong></span>
                <span className="text-slate-300">•</span>
                <span>Setoran Terakhir: <strong className="text-[#0070BA] font-semibold">{santri.lastSurah}</strong></span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 3 Kartu Key Performance Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Total Capaian */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[105px] text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total Hafalan</span>
              <span className="text-lg font-bold text-[#0070BA] block mt-0.5">{santri.juzAchieved}</span>
              <span className="text-[10px] text-slate-500 block">~{pagesCompleted} Halaman</span>
            </div>

            {/* Target Harian */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[105px] text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Setoran Hari Ini</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">
                {santri.linesCompletedToday}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {santri.dailyTargetLines}</span>
              </span>
              <span className="text-[10px] text-slate-500 block">baris</span>
            </div>

            {/* Status & Kelancaran */}
            <div className={`border rounded-xl px-4 py-3 min-w-[110px] text-center ${
              santri.status === 'tercapai'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : santri.status === 'tidak_tercapai'
                ? 'bg-red-50/70 border-red-200 text-red-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}>
              <span className="text-[11px] font-medium opacity-80 block">Mutaba'ah</span>
              <span className="text-sm font-bold block mt-1">
                {santri.status === 'tercapai' && '92% Mumtaz'}
                {santri.status === 'tidak_tercapai' && 'Perlu I\'adah'}
                {santri.status === 'belum_setor' && 'Talaqqi'}
              </span>
              <span className="text-[10px] opacity-75 block truncate mt-0.5">
                {statusConfig.subText}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Tab Navigasi Detail (Clean Underline Style) */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2">
        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ringkasan &amp; Rekomendasi Pacing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'riwayat'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Setoran Halaqoh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analisis')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analisis'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analisis Retensi &amp; Spaced Muroja'ah</span>
          </button>
        </div>
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
              hideHeader={true}
            />

            {/* Rekomendasi Tindakan Musyrif */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Rekomendasi Tindakan Musyrif
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Rencana aksi talaqqi &amp; pengulangan berbasis evaluasi harian
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Action Card 1: Ziyadah */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-[#F4F9FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                        : `Terdapat defisit ${santri.dailyTargetLines - santri.linesCompletedToday} baris. Berikan slot setoran khusus pada sesi halaqoh berikutnya.`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white shrink-0 h-8"
                  >
                    Setor Sekarang
                  </Button>
                </div>

                {/* Action Card 2: Spaced Repetition Muroja'ah */}
                <div className="p-3.5 rounded-xl border border-amber-100 bg-[#FFFDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSetor(santri)}
                    className="self-start sm:self-center text-xs font-semibold border-amber-200 text-amber-800 hover:bg-amber-50 shrink-0 h-8"
                  >
                    Simak Muroja'ah
                  </Button>
                </div>

                {/* Action Card 3: Tiket Ujian Tasmi' */}
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-[#F4FDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md shrink-0">
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
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Statistik Mutaba'ah
                </h3>
                <span className="text-[11px] font-medium text-slate-400">Kurikulum 3 Tahun</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Sisa Target Hafalan</span>
                  <span className="font-bold text-slate-800">{remainingLines.toLocaleString()} Baris</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Est. Waktu Khatam</span>
                  <span className="font-bold text-[#0070BA]">~{remainingDays} Hari ({Math.round(remainingDays / 30)} Bulan)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Kehadiran Halaqoh</span>
                  <span className="font-bold text-slate-900">98% (28 dari 29 Sesi)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 font-medium">Target Harian Ideal</span>
                  <span className="font-bold text-emerald-700">{requiredDailyLines} Baris / Hari</span>
                </div>
              </div>
            </div>

            {/* Kotak Pengingat Ujian Tasmi' */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Award className="w-4 h-4 text-[#0070BA]" />
                <span>Riwayat Tiket Ujian Terakhir</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tasmi' Juz 29 telah diselesaikan pada 12 Agustus 2026 dengan predikat <strong className="text-slate-900">Mumtaz (Nilai: 94.5)</strong>.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sertifikat Terbit ber-QR Code</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Riwayat Setoran */}
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
