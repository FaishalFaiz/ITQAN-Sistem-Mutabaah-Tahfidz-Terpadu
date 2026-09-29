import { useState } from 'react';
import { Menu } from 'lucide-react';
import { INITIAL_SANTRI_LIST } from './components/dashboard/mockData';
import type { Santri, NavItemKey } from './components/dashboard/types';
import { StatCards } from './components/dashboard/StatCards';
import { TrendChart } from './components/dashboard/TrendChart';
import { SantriListSection } from './components/dashboard/SantriListSection';
import { NavbarSidebar } from './components/dashboard/NavbarSidebar';
import { SantriModal } from './components/dashboard/SantriModal';
import { AddSantriModal } from './components/dashboard/AddSantriModal';
import { SantriDetailPage } from './components/dashboard/SantriDetailPage';
import { HalaqahQuickFocus } from './components/dashboard/HalaqahQuickFocus';
import { OtherView } from './components/dashboard/OtherViews';

export function App() {
  const [activeNav, setActiveNav] = useState<NavItemKey>('beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dedicated page view for selected santri
  const [activeSantriPage, setActiveSantriPage] = useState<Santri | null>(null);

  // Modal state for Setor
  const [modalType, setModalType] = useState<'setor' | null>(null);
  const [selectedSantriForSetor, setSelectedSantriForSetor] = useState<Santri | null>(null);

  // Modal state for Add Santri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter state for Santri cards
  const [activeFilter, setActiveFilter] = useState<'all' | 'tercapai' | 'tidak_tercapai' | 'belum_setor'>('all');

  const [santriList, setSantriList] = useState<Santri[]>(INITIAL_SANTRI_LIST);

  const handleOpenSetor = (santri: Santri) => {
    setSelectedSantriForSetor(santri);
    setModalType('setor');
  };

  const handleOpenDetail = (santri: Santri) => {
    setActiveSantriPage(santri);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedSantriForSetor(null);
  };

  const handleAddSantri = (newSantri: Santri) => {
    setSantriList((prev) => [newSantri, ...prev]);
  };

  // Recalculate dynamic stats from santriList
  const tercapaiCount = santriList.filter((s) => s.status === 'tercapai').length;
  const tidakTercapaiCount = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const belumSetorCount = santriList.filter((s) => s.status === 'belum_setor').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Navbar Sidebar */}
      <NavbarSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem={activeNav}
        onSelectItem={(item) => {
          setActiveNav(item);
          setActiveSantriPage(null); // Reset detail page when switching main nav
        }}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar yang Bersih, Terintegrasi, & Bernapas */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Sisi Kiri: Hamburger + Breadcrumb / Navigation Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  IT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 tracking-tight">ITQAN</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-sm text-[#0070BA]">
                      {activeSantriPage
                        ? activeSantriPage.name
                        : activeNav === 'beranda'
                        ? 'Beranda Halaqoh'
                        : activeNav.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-none mt-0.5">
                    Halaqoh Abu Bakar Ash-Shiddiq
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Context Chip Terpadu (Sesi & Tanggal) + Profil Ringkas */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-slate-600">Sesi Pagi</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-800">Ahad, 28 Sep 2026</span>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0">
                  UA
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">Ust. Abdullah</span>
                  <span className="text-[10px] text-slate-500">Musyrif</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
          {activeSantriPage ? (
            /* Dedicated Santri Page */
            <SantriDetailPage
              santri={activeSantriPage}
              onBack={() => setActiveSantriPage(null)}
              onSetor={handleOpenSetor}
            />
          ) : activeNav === 'beranda' ? (
            <div className="space-y-4">

              {/* Top 3 KPI Cards with filter interaction */}
              <StatCards
                tercapaiCount={tercapaiCount}
                tidakTercapaiCount={tidakTercapaiCount}
                belumSetorCount={belumSetorCount}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Halaqah Focus & Target Progress */}
              <HalaqahQuickFocus
                santriList={santriList}
                onSetor={handleOpenSetor}
                onDetail={handleOpenDetail}
              />

              {/* Middle Section: Line Chart Trend */}
              <TrendChart />

              {/* Bottom Section: Santri Cards Grid with Filter Tabs & Search */}
              <SantriListSection
                santriList={santriList}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onSetor={handleOpenSetor}
                onDetail={handleOpenDetail}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </div>
          ) : (
            <OtherView
              currentView={activeNav}
              onBackToBeranda={() => setActiveNav('beranda')}
              santriList={santriList}
              onSetor={handleOpenSetor}
              onDetail={handleOpenDetail}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Setor Modal */}
      <SantriModal
        type={modalType}
        santri={selectedSantriForSetor}
        onClose={handleCloseModal}
      />

      {/* Add Santri Modal */}
      <AddSantriModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSantri={handleAddSantri}
      />
    </div>
  );
}

export default App;
