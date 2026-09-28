import { useState } from 'react';
import { 
  Menu, 
  Wifi, 
  WifiOff
} from 'lucide-react';
import { INITIAL_SANTRI_LIST } from './components/dashboard/mockData';
import type { Santri, NavItemKey } from './components/dashboard/types';
import { StatCards } from './components/dashboard/StatCards';
import { TrendChart } from './components/dashboard/TrendChart';
import { SantriListSection } from './components/dashboard/SantriListSection';
import { NavbarSidebar } from './components/dashboard/NavbarSidebar';
import { SantriModal } from './components/dashboard/SantriModal';
import { OtherView } from './components/dashboard/OtherViews';

export function App() {
  // Navigation state (Default is 'beranda' as requested in wireframe)
  const [activeNav, setActiveNav] = useState<NavItemKey>('beranda');
  
  // Navbar sidebar toggle state (connected to hamburger button ☰)
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  // Online / Offline indicator
  const [isOnline, setIsOnline] = useState(true);

  // Filter state for Santri cards ('all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor')
  const [activeSantriFilter, setActiveSantriFilter] = useState<'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor'>('all');

  // Modal state for Setor / Detail
  const [modalType, setModalType] = useState<'setor' | 'detail' | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  // Santri list data
  const [santriList] = useState<Santri[]>(INITIAL_SANTRI_LIST);

  const handleOpenSetor = (santri: Santri) => {
    setSelectedSantri(santri);
    setModalType('setor');
  };

  const handleOpenDetail = (santri: Santri) => {
    setSelectedSantri(santri);
    setModalType('detail');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedSantri(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative antialiased">
      {/* Top Header Bar with Hamburger Button (☰) as in wireframe */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Hamburger Button ☰ and Brand Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNavbarOpen(!isNavbarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              title="Buka / Tutup Navbar Menu"
              aria-label="Toggle Navbar Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="w-9 h-9 rounded-lg bg-[#0070BA] flex items-center justify-center text-white font-bold text-base shadow-xs">
              IT
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">ITQAN</span>
                <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  SIMP Tahfidz
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">|</span>
                <span className="hidden sm:inline-block text-xs font-semibold text-[#0070BA]">
                  {activeNav === 'beranda' ? 'Beranda Desktop' : activeNav.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Sistem Mutabaah Tahfidz Terpadu</p>
            </div>
          </div>

          {/* Right Header: Online Status & Musyrif Info & Navbar Button */}
          <div className="flex items-center gap-3">
            {/* Status Koneksi Offline-First */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title="Klik untuk simulasi online/offline"
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online (Tersinkron)' : 'Offline'}</span>
            </button>

            {/* Quick Navbar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsNavbarOpen(!isNavbarOpen)}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                isNavbarOpen 
                  ? 'bg-[#0070BA] text-white border-[#0070BA]' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Navbar</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">☰</span>
            </button>

            {/* Musyrif Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                UA
              </span>
              <div className="hidden md:block">
                <span className="font-semibold block text-slate-900 leading-tight">Ust. Abdullah</span>
                <span className="text-[11px] text-slate-500">Halaqoh 1</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Breadcrumb / Halaqoh Context */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">Beranda Desktop</span>
            <span>/</span>
            <span>Halaqoh Abu Bakar Ash-Shiddiq</span>
            <span>/</span>
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sesi Pagi Aktif
            </span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Target Kurikulum: <b className="text-slate-900">30 Juz (15 baris/hal)</b>
          </div>
        </div>

        {/* Dynamic Nav View: Beranda (Primary Dashboard from Wireframe) vs Other Nav Views */}
        {activeNav === 'beranda' ? (
          <div className="space-y-6">
            {/* Top 3 KPI Cards: [ 10 Tercapai ] [ 01 Tidak Tercapai ] [ 01 Apa ya? ] */}
            <StatCards
              tercapaiCount={10}
              tidakTercapaiCount={1}
              belumSetorCount={1}
              activeFilter={activeSantriFilter}
              onFilterChange={setActiveSantriFilter}
            />

            {/* Middle Section: Line Chart Trend as drawn in wireframe */}
            <TrendChart />

            {/* Bottom Section: Santri Cards Grid with Vertical Scroll */}
            <SantriListSection
              santriList={santriList}
              activeFilter={activeSantriFilter}
              onFilterChange={setActiveSantriFilter}
              onSetor={handleOpenSetor}
              onDetail={handleOpenDetail}
            />
          </div>
        ) : (
          <OtherView
            currentView={activeNav}
            onBackToBeranda={() => setActiveNav('beranda')}
          />
        )}
      </main>

      {/* Navbar Sidebar (Drawer matching the "Navbar" column on right in wireframe) */}
      <NavbarSidebar
        isOpen={isNavbarOpen}
        onClose={() => setIsNavbarOpen(false)}
        activeItem={activeNav}
        onSelectItem={(item) => setActiveNav(item)}
      />

      {/* Santri Action Modal (Setor & Detail) */}
      <SantriModal
        type={modalType}
        santri={selectedSantri}
        onClose={handleCloseModal}
      />

      {/* Footer Flat Institusi Style */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        ITQAN — Sistem Mutabaah Tahfidz Terpadu • Clean & Clear UI Solid Blue & White
      </footer>
    </div>
  );
}

export default App;
