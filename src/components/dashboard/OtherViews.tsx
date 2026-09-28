import React from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import { FastSetoranForm } from '../halaqah/FastSetoranForm';
import { TapCounterExam } from '../halaqah/TapCounterExam';
import { MushafHeatmap } from '../visualization/MushafHeatmap';
import { PacingCard } from '../visualization/PacingCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { NavItemKey } from './types';

interface OtherViewProps {
  currentView: NavItemKey;
  onBackToBeranda: () => void;
}

export const OtherView: React.FC<OtherViewProps> = ({
  currentView,
  onBackToBeranda,
}) => {
  return (
    <div className="space-y-6">
      {/* Return button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onBackToBeranda}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0070BA] hover:text-[#005C9E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      {currentView === 'laporan' && (
        <Card title="Laporan & Ringkasan Capaian Halaqoh" subtitle="Rekapitulasi mutabaah mingguan dan bulanan">
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500 block">Total Baris Terkumpul</span>
                <span className="text-2xl font-bold text-[#0070BA]">24.850 Baris</span>
                <span className="text-xs text-emerald-600 block mt-1">+12% dari bulan lalu</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500 block">Rata-rata Kelancaran</span>
                <span className="text-2xl font-bold text-emerald-700">92% Mumtaz</span>
                <span className="text-xs text-slate-500 block mt-1">Evaluasi 12 santri</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500 block">Halaqoh Aktif</span>
                <span className="text-2xl font-bold text-slate-900">Abu Bakar</span>
                <span className="text-xs text-slate-500 block mt-1">Sesi Pagi & Sore</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentView === 'santri' && (
        <Card title="Manajemen Data Santri Halaqoh" subtitle="Daftar lengkap profil dan kontak santri">
          <div className="p-4 text-center text-slate-500 text-sm">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">12 Santri Terdaftar di Halaqoh 1</p>
            <p className="text-xs text-slate-500 mt-1">Seluruh data santri dapat dikelola melalui menu ini atau langsung dari kartu santri di Beranda.</p>
          </div>
        </Card>
      )}

      {currentView === 'pengaturan' && (
        <Card title="Pengaturan Halaqoh & Kurikulum" subtitle="Konfigurasi target baris, jadwal, dan standar penilaian">
          <div className="space-y-4 text-xs text-slate-700 max-w-xl">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Target Harian Standar (Baris / Hari)</label>
              <input type="number" defaultValue={15} className="w-full rounded-lg border border-slate-300 p-2.5 bg-white" />
            </div>
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Nama Kelompok Halaqoh</label>
              <input type="text" defaultValue="Halaqoh Abu Bakar Ash-Shiddiq" className="w-full rounded-lg border border-slate-300 p-2.5 bg-white" />
            </div>
            <div>
              <Button size="sm">Simpan Pengaturan</Button>
            </div>
          </div>
        </Card>
      )}

      {(currentView === 'setoran-ziyadah' || currentView === 'setoran-murajaah') && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-medium">
            Mode Input Setoran Langsung: {currentView === 'setoran-ziyadah' ? 'Ziyadah (Hafalan Baru)' : 'Muraja\'ah (Pengulangan)'}
          </div>
          <FastSetoranForm />
        </div>
      )}

      {currentView === 'dll-ujian' && (
        <div className="max-w-2xl mx-auto">
          <TapCounterExam />
        </div>
      )}

      {currentView === 'dll-pacing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PacingCard
            santriName="Muhammad Faiz"
            nis="2024001"
            totalLinesMemorized={1420}
            totalLinesTarget={9060}
            daysRemaining={650}
            dailyTargetLines={12}
            linesCompletedToday={15}
            status="on_track"
          />
          <PacingCard
            santriName="Ahmad Zaki"
            nis="2024002"
            totalLinesMemorized={780}
            totalLinesTarget={9060}
            daysRemaining={650}
            dailyTargetLines={15}
            linesCompletedToday={8}
            status="behind"
          />
        </div>
      )}

      {currentView === 'dll-heatmap' && (
        <Card title="Heatmap Matriks Mushaf (604 Halaman)" subtitle="Klik kotak untuk melihat status hafalan tiap halaman">
          <MushafHeatmap />
        </Card>
      )}
    </div>
  );
};
