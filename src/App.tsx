import { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  Layers,
  ShieldCheck
} from 'lucide-react';
import { PacingCard } from './components/visualization/PacingCard';
import { MushafHeatmap } from './components/visualization/MushafHeatmap';
import { FastSetoranForm } from './components/halaqah/FastSetoranForm';
import { TapCounterExam } from './components/halaqah/TapCounterExam';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';

export function App() {
  const [activeTab, setActiveTab] = useState<'halaqah' | 'ujian' | 'heatmap' | 'pacing'>('halaqah');
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar Institusi SIAP IDN Style */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0070BA] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              IT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">ITQAN</span>
                <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  SIMP Tahfidz
                </span>
              </div>
              <p className="text-xs text-slate-500">Sistem Mutabaah Tahfidz Terpadu</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Koneksi Offline-First */}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online (Tersinkron)' : 'Offline (Tersimpan Lokal)'}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                U
              </span>
              <div>
                <span className="font-semibold block text-slate-900">Ust. Abdullah</span>
                <span className="text-[11px] text-slate-500">Musyrif Halaqoh 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigasi Horizontal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'halaqah'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Fast-Logging Halaqoh</span>
          </button>

          <button
            onClick={() => setActiveTab('pacing')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'pacing'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Target Pacing 3 Tahun (9.060 Baris)</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Heatmap 604 Halaman</span>
          </button>

          <button
            onClick={() => setActiveTab('ujian')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'ujian'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Ujian Tasmi' (Tap Counter)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Quick Context */}
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EBF5FB] text-[#0070BA] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Halaqoh Abu Bakar Ash-Shiddiq</h1>
              <p className="text-xs text-slate-500">Angkatan 2024 • Target: 30 Juz (15 baris/hal) dalam 3 tahun</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsOnline(!isOnline)}>
              Simulasi {isOnline ? 'Offline' : 'Online'}
            </Button>
            <Badge variant="info">Semester 1 Aktif</Badge>
          </div>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'halaqah' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FastSetoranForm />
              
              {/* Daily Checklist Halaqoh Santri */}
              <Card title="Checklist Target Harian Santri (Halaqoh Hari Ini)">
                <div className="divide-y divide-slate-100">
                  {[
                    { name: 'Muhammad Faiz', nis: '2024001', target: 12, achieved: 15, status: 'tercapai', last: 'An-Naba 1-40' },
                    { name: 'Ahmad Zaki', nis: '2024002', target: 12, achieved: 8, status: 'kurang', last: 'An-Naziat 1-20' },
                    { name: 'Farhan Ramadhan', nis: '2024003', target: 15, achieved: 0, status: 'belum', last: 'Abasa 1-15' },
                    { name: 'Bilal Al-Habasyi', nis: '2024004', target: 10, achieved: 10, status: 'tercapai', last: 'At-Takwir 1-29' },
                  ].map((s, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">NIS: {s.nis} • Terakhir: {s.last}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="font-bold text-slate-900">{s.achieved}</span> / {s.target} Baris
                        </div>
                        {s.status === 'tercapai' && <Badge variant="mumtaz">Tercapai</Badge>}
                        {s.status === 'kurang' && <Badge variant="jayyid">Kurang 4 Baris</Badge>}
                        {s.status === 'belum' && <Badge variant="iadah">Belum Setor</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Side Column: Santri Highlight Pacing */}
            <div className="space-y-6">
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

              <Card title="Rekomendasi Spaced Retention">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-amber-800">Perhatian: Muroja'ah Jatuh Tempo</div>
                  <p className="text-amber-700">
                    Juz 29 (Hal. 562–564) belum pernah dimuroja'ah dalam 8 hari terakhir. Status sebelumnya: <b>I'ADAH</b>.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'pacing' && (
          <div className="space-y-6">
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

            <Card title="Metodologi Kalkulasi Target Baris (15 Baris / Halaman)">
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  • <b>Standar Mushaf Madinah</b>: 604 halaman &times; 15 baris = <b>9.060 total baris</b> (30 Juz).
                </p>
                <p>
                  • <b>Durasi Program 3 Tahun</b>: ~800 hari efektif setoran ziyadah halaqoh.
                </p>
                <p>
                  • <b>Formula Adaptif Harian</b>: Sisa baris menuju 9.060 dibagi sisa hari aktif santri. Jika santri tertinggal, sistem otomatis menaikkan target baris harian berikutnya secara proporsional.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <Card 
              title="Heatmap Matriks Mushaf (604 Halaman)"
              subtitle="Representasi visual solid 604 halaman mushaf Madinah. Klik kotak untuk detail halaman."
            >
              <MushafHeatmap />
            </Card>
          </div>
        )}

        {activeTab === 'ujian' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <TapCounterExam />
          </div>
        )}
      </main>

      {/* Footer Flat */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        ITQAN — Sistem Mutabaah Tahfidz Terpadu • Enterprise-Minimalist UI (Solid Blue & White)
      </footer>
    </div>
  );
}

export default App;
