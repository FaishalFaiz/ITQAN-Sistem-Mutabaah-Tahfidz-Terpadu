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
import { OtherView } from './components/dashboard/OtherViews';

export function App() {
  const [activeNav, setActiveNav] = useState<NavItemKey>('beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal state for Setor & Detail
  const [modalType, setModalType] = useState<'setor' | 'detail' | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  // Modal state for Add Santri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [santriList, setSantriList] = useState<Santri[]>(INITIAL_SANTRI_LIST);

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
        onSelectItem={(item) => setActiveNav(item)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Header Bar with Hamburger Button ☰ */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0070BA]"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-slate-900">
              {activeNav === 'beranda' ? 'Beranda' : activeNav.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline font-medium text-slate-700">Halaqoh Abu Bakar</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Ahad, 28 Sep 2026</span>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeNav === 'beranda' ? (
            <div className="space-y-6">
              {/* Top 3 KPI Cards: [ Tercapai ] [ Tidak Tercapai ] [ Belum Setor ] */}
              <StatCards
                tercapaiCount={tercapaiCount}
                tidakTercapaiCount={tidakTercapaiCount}
                belumSetorCount={belumSetorCount}
              />

              {/* Middle Section: Line Chart Trend */}
              <TrendChart />

              {/* Bottom Section: Santri Cards Grid with Vertical Scroll */}
              <SantriListSection
                santriList={santriList}
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

      {/* Santri Action Modal (Setor & Detail) */}
      <SantriModal
        type={modalType}
        santri={selectedSantri}
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
