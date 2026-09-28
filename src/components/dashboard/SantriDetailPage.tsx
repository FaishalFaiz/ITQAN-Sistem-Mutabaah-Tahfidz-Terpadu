import React, { useState } from 'react';
import { 
  ArrowLeft, 
  AlertCircle, 
  Lightbulb, 
  ChevronRight 
} from 'lucide-react';
import type { Santri } from './types';
import { MushafHeatmap } from '../visualization/MushafHeatmap';
import { PacingCard } from '../visualization/PacingCard';

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
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'heatmap' | 'riwayat'>('ringkasan');

  // Realistic recommendations logic based on status
  const getRecommendations = () => {
    if (santri.status === 'tercapai') {
      return [
        {
          type: 'action',
          badge: 'Rekomendasi Utama',
          title: "Lanjutkan Ziyadah Surah Berikutnya",
          desc: `Target harian ${santri.dailyTargetLines} baris hari ini sudah tercapai (${santri.linesCompletedToday} baris). Disarankan mengunci hafalan ${santri.lastSurah} sebelum melangkah ke ayat berikutnya besok.`,
          actionLabel: "Setor Ziyadah Baru",
          priority: 'high',
        },
        {
          type: 'retention',
          badge: 'Muroja\'ah Spaced Repetition',
          title: "Jadwal Pengulangan Juz 29",
          desc: "Sudah 4 hari sejak setoran Juz 29. Lakukan tasmi' mandiri 1 ruku' sebelum tidur untuk memperkuat ketahanan memori.",
          actionLabel: "Setor Muroja'ah",
          priority: 'medium',
        },
        {
          type: 'tasmi',
          badge: 'Persiapan Ujian',
          title: "Ujian Tasmi' 5 Juz Sekali Duduk",
          desc: "Akumulasi capaian mencapai 14+ Juz. Santri memenuhi syarat pengajuan Tasmi' 5 Juz terakreditasi.",
          actionLabel: "Daftar Ujian",
          priority: 'low',
        },
      ];
    }

    if (santri.status === 'tidak_tercapai') {
      const deficit = santri.dailyTargetLines - santri.linesCompletedToday;
      return [
        {
          type: 'action',
          badge: 'Prioritas Tertinggi (Defisit)',
          title: `Kejar Kekurangan ${deficit} Baris Sesi Sore`,
          desc: `Hari ini baru menyelesaikan ${santri.linesCompletedToday} dari target ${santri.dailyTargetLines} baris. Diberikan waktu penguatan pada halaqoh ba'da Ashar agar target adaptif tidak membengkak besok.`,
          actionLabel: "Setor Tambahan",
          priority: 'high',
        },
        {
          type: 'method',
          badge: 'Metode Talaqqi',
          title: "Bimbingan Talaqqi Khusus Musyrif",
          desc: `Hafalan terakhir pada ${santri.lastSurah} terdapat beberapa ketukan tajwid. Berikan talaqqi 3x repetisi bersama musyrif halaqoh.`,
          actionLabel: "Mulai Talaqqi",
          priority: 'medium',
        },
        {
          type: 'pacing',
          badge: 'Penyesuaian Beban',
          title: "Evaluasi Kurva Kecepatan",
          desc: "Pacing hafalan santri tertinggal ~5 hari dari target kelulusan 3 tahun. Disarankan fokus pada kestabilan mutqin dibanding kuantitas.",
          actionLabel: "Lihat Pacing",
          priority: 'low',
        },
      ];
    }

    // belum_setor
    return [
      {
        type: 'action',
        badge: 'Harus Dilakukan Segera',
        title: "Panggil Santri untuk Setoran Ziyadah",
        desc: `Santri belum menyetorkan hafalan untuk sesi hari ini (target: ${santri.dailyTargetLines} baris). Prioritaskan antrean paling awal di halaqoh aktif.`,
        actionLabel: "Mulai Setor Sekarang",
        priority: 'high',
      },
      {
        type: 'check',
        badge: 'Cek Kesiapan',
        title: "Konfirmasi Hafalan Mandiri",
        desc: `Capaian terakhir tercatat di ${santri.lastSurah}. Pastikan santri sudah melakukan mutabaah mandiri minimal 2 kali sebelum disimak.`,
        actionLabel: "Verifikasi Hafalan",
        priority: 'medium',
      },
    ];
  };

  const recommendations = getRecommendations();

  // Mocked specific pages based on santri juz
  const completedCount = Math.min(604, Math.round((santri.totalLinesMemorized || 1500) / 15));
  const completedPages = Array.from({ length: completedCount }, (_, i) => i + 1);
  const inProgressPages = [completedCount + 1, completedCount + 2, completedCount + 3];

  return (
    <div className="space-y-6">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0070BA] hover:text-[#005C9E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Santri</span>
        </button>

        <button
          onClick={() => onSetor(santri)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070BA] text-white hover:bg-[#005C9E] transition-colors shadow-2xs"
        >
          Input Setoran Santri Ini
        </button>
      </div>

      {/* Santri Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#EBF5FB] border-2 border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xl">
              {santri.avatarInitials}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white ${
                santri.status === 'tercapai'
                  ? 'bg-emerald-500'
                  : santri.status === 'tidak_tercapai'
                  ? 'bg-red-500'
                  : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{santri.name}</h2>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                NIS: {santri.nis}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Halaqoh Abu Bakar Ash-Shiddiq • Terakhir Setor: <b className="text-slate-800">{santri.lastSurah}</b>
            </p>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
            <span className="text-[11px] text-slate-500 block">Total Capaian</span>
            <span className="text-base font-bold text-[#0070BA]">{santri.juzAchieved}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
            <span className="text-[11px] text-slate-500 block">Status Hari Ini</span>
            <span className={`text-xs font-bold ${
              santri.status === 'tercapai'
                ? 'text-emerald-700'
                : santri.status === 'tidak_tercapai'
                ? 'text-red-700'
                : 'text-amber-700'
            }`}>
              {santri.status === 'tercapai' && 'Tercapai'}
              {santri.status === 'tidak_tercapai' && 'Tidak Tercapai'}
              {santri.status === 'belum_setor' && 'Belum Setor'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
            <span className="text-[11px] text-slate-500 block">Baris Hari Ini</span>
            <span className="text-base font-bold text-slate-900">
              {santri.linesCompletedToday} <span className="text-xs text-slate-400 font-normal">/ {santri.dailyTargetLines}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'ringkasan'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Ringkasan & Rekomendasi
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'heatmap'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Heatmap 604 Halaman Santri
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'riwayat'
              ? 'border-[#0070BA] text-[#0070BA]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Riwayat Setoran Mutabaah
        </button>
      </div>

      {/* Tab 1: Ringkasan & Rekomendasi (What To Do) */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Rekomendasi What To Do */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Rekomendasi Tindakan (What To Do)
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {recommendations.length} Panduan Musyrif
                </span>
              </div>

              {/* List of Actionable Recommendations */}
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      rec.priority === 'high'
                        ? 'bg-amber-50/40 border-amber-200'
                        : rec.priority === 'medium'
                        ? 'bg-blue-50/30 border-blue-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          rec.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {rec.badge}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                      </div>

                      <button
                        onClick={() => onSetor(santri)}
                        className="text-xs font-semibold text-[#0070BA] hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>{rec.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pacing Card Visual */}
            <PacingCard
              santriName={santri.name}
              nis={santri.nis}
              totalLinesMemorized={santri.totalLinesMemorized || 1500}
              totalLinesTarget={9060}
              daysRemaining={650}
              dailyTargetLines={santri.dailyTargetLines}
              linesCompletedToday={santri.linesCompletedToday}
              status={santri.status === 'tercapai' ? 'on_track' : 'behind'}
            />
          </div>

          {/* Right Col: Statistik Performa & Mutabaah */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Statistik Evaluasi Santri
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Tingkat Kelancaran</span>
                  <span className="font-bold text-emerald-700">94% Mumtaz</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Rata-rata Setor / Hari</span>
                  <span className="font-bold text-slate-900">14.2 Baris</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Konsistensi Kehadiran</span>
                  <span className="font-bold text-[#0070BA]">100% (24 Sesi)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Estimasi Khatam 30 Juz</span>
                  <span className="font-bold text-slate-900">Maret 2027</span>
                </div>
              </div>
            </div>

            {/* Spaced Retention Warning */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Pengingat Muroja'ah Rutin</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hafalan halaman 570 - 582 belum disetorkan ulang dalam 7 hari terakhir. Jadwalkan pengulangan sebelum ujian semester.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Heatmap 604 Halaman */}
      {activeTab === 'heatmap' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Peta Hafalan 604 Halaman Mushaf: {santri.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hijau = Mutqin (Lulus Ujian), Oranye = Dalam Proses Ziyadah/Muroja'ah, Abu-abu = Belum Disetor.
            </p>
          </div>

          <MushafHeatmap
            completedPages={completedPages}
            inProgressPages={inProgressPages}
            totalPages={604}
          />
        </div>
      )}

      {/* Tab 3: Riwayat Setoran */}
      {activeTab === 'riwayat' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Riwayat Setoran Mutabaah Terakhir
            </h3>
            <span className="text-xs text-slate-500">Menampilkan 5 sesi terakhir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Tanggal & Sesi</th>
                  <th className="py-2.5 px-4">Jenis</th>
                  <th className="py-2.5 px-4">Surah & Ayat</th>
                  <th className="py-2.5 px-4">Baris</th>
                  <th className="py-2.5 px-4">Nilai Kelancaran</th>
                  <th className="py-2.5 px-4">Musyrif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">Hari ini, 07:15 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0070BA]">
                      Ziyadah
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{santri.lastSurah}</td>
                  <td className="py-3 px-4 font-bold">{santri.linesCompletedToday || 15} Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Mumtaz
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Ust. Abdullah</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">Kemarin, 16:30 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                      Muroja'ah
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">An-Naziat 1-46</td>
                  <td className="py-3 px-4 font-bold">15 Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Mumtaz
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Ust. Abdullah</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">26 Sep 2026, 07:10 WIB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0070BA]">
                      Ziyadah
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">Abasa 1-42</td>
                  <td className="py-3 px-4 font-bold">15 Baris</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                      Jayyid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Ust. Abdullah</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
