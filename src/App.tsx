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
        {/* Header Bar */}
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
              {activeSantriPage
                ? `Santri: ${activeSantriPage.name}`
                : activeNav === 'beranda'
                ? 'Beranda'
                : activeNav.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline font-medium text-slate-700">Halaqoh Abu Bakar</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Ahad, 28 Sep 2026</span>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
          {activeSantriPage ? (
            /* Dedicated Santri Page */
            <SantriDetailPage
              santri={activeSantriPage}
              onBack={() => setActiveSantriPage(null)}
              onSetor={handleOpenSetor}
            />
          ) : activeNav === 'beranda' ? (
            <div className="space-y-4">
              {/* Dashboard Banner: ITQAN Sistem Muroja'ah + Assalamualaikum + Sesi Halaqoh + Jam & Hari/Tgl */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0070BA] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                    IT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ITQAN</h1>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF5FB] text-[#0070BA] border border-[#D6EAF8]">
                        Sistem Muroja'ah & Mutabaah Tahfidz
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      Assalamu'alaikum, <span className="text-[#0070BA]">Ust. Abdullah</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
                    <span className="text-[11px] text-slate-500 block">Sesi Halaqoh</span>
                    <span className="font-bold text-slate-900">Pagi (Ba'da Shubuh)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
                    <span className="text-[11px] text-slate-500 block">Waktu Sesi</span>
                    <span className="font-bold text-slate-900">07:15 WIB</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
                    <span className="text-[11px] text-slate-500 block">Hari & Tanggal</span>
                    <span className="font-bold text-[#0070BA]">Ahad, 28 September 2026</span>
                  </div>
                </div>
              </div>

              {/* Top 3 KPI Cards */}
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
