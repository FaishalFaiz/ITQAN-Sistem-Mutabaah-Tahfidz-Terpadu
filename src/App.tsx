import { useState } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Menu, Calendar } from 'lucide-react';
import { INITIAL_SANTRI_LIST } from './components/dashboard/mockData';
import type { Santri } from './components/dashboard/types';
import { StatCards } from './components/dashboard/StatCards';
import { TrendChart } from './components/dashboard/TrendChart';
import { SantriListSection } from './components/dashboard/SantriListSection';
import { NavbarSidebar } from './components/dashboard/NavbarSidebar';
import { SantriModal } from './components/dashboard/SantriModal';
import { AddSantriModal } from './components/dashboard/AddSantriModal';
import { SantriDetailPage } from './components/dashboard/SantriDetailPage';
import { HalaqahQuickFocus } from './components/dashboard/HalaqahQuickFocus';
import { OtherView } from './components/dashboard/OtherViews';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Helper component for /santri/:id route
function SantriDetailRoute({
  santriList,
  onSetor,
}: {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const santri = santriList.find((s) => s.id === id);

  if (!santri) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <h3 className="font-bold text-base text-slate-800">Santri Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500">Data santri dengan ID {id} tidak ada dalam daftar.</p>
        <button
          onClick={() => navigate('/beranda')}
          className="px-4 py-2 bg-[#0070BA] text-white rounded-lg text-xs font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <SantriDetailPage
      santri={santri}
      onBack={() => navigate('/beranda')}
      onSetor={onSetor}
    />
  );
}

export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate(`/santri/${santri.id}`);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedSantriForSetor(null);
  };

  const handleAddSantri = (newSantri: Santri) => {
    setSantriList((prev) => [newSantri, ...prev]);
  };

  // Dynamic header title based on URL
  const getHeaderTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/beranda') return 'Beranda Halaqoh';
    if (p.startsWith('/santri/')) {
      const id = p.split('/')[2];
      const s = santriList.find((item) => item.id === id);
      return s ? s.name : 'Detail Santri';
    }
    if (p.startsWith('/santri')) return 'Daftar Santri';
    if (p.startsWith('/laporan')) return 'Laporan & Ringkasan';
    if (p.startsWith('/pengaturan')) return 'Pengaturan';
    if (p.startsWith('/ujian')) return "Ujian Tasmi'";
    if (p.startsWith('/pacing')) return 'Target Pacing 3 Tahun';
    return 'ITQAN';
  };

  // Recalculate dynamic stats from santriList
  const tercapaiCount = santriList.filter((s) => s.status === 'tercapai').length;
  const tidakTercapaiCount = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const belumSetorCount = santriList.filter((s) => s.status === 'belum_setor').length;

  // Auth routes (render standalone full page)
  if (location.pathname === '/login') {
    return <LoginPage />;
  }
  if (location.pathname === '/signup') {
    return <SignupPage />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Navbar Sidebar with Router Navigation */}
      <NavbarSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Sisi Kiri: Hamburger + Breadcrumb */}
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
                <div 
                  onClick={() => navigate('/beranda')}
                  className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 cursor-pointer"
                >
                  IT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => navigate('/beranda')}
                      className="font-extrabold text-base text-slate-900 tracking-tight cursor-pointer"
                    >
                      ITQAN
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-sm text-[#0070BA]">
                      {getHeaderTitle()}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-none mt-0.5">
                    Halaqoh Abu Bakar Ash-Shiddiq
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Tanggal Real & Profil */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-800">
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date())}
                </span>
              </div>

              <div 
                onClick={() => navigate('/login')}
                title="Klik untuk Keluar / Ganti Akun"
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              >
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

        {/* Dynamic Route View */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
          <Routes>
            {/* Beranda Dashboard */}
            <Route
              path="/"
              element={
                <div className="space-y-4">
                  <StatCards
                    tercapaiCount={tercapaiCount}
                    tidakTercapaiCount={tidakTercapaiCount}
                    belumSetorCount={belumSetorCount}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />

                  <HalaqahQuickFocus
                    santriList={santriList}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                  />

                  <TrendChart />

                  <SantriListSection
                    santriList={santriList}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                </div>
              }
            />

            <Route
              path="/beranda"
              element={
                <div className="space-y-4">
                  <StatCards
                    tercapaiCount={tercapaiCount}
                    tidakTercapaiCount={tidakTercapaiCount}
                    belumSetorCount={belumSetorCount}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />

                  <HalaqahQuickFocus
                    santriList={santriList}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                  />

                  <TrendChart />

                  <SantriListSection
                    santriList={santriList}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                </div>
              }
            />

            {/* Dedicated Detail Santri with URL /santri/:id */}
            <Route
              path="/santri/:id"
              element={
                <SantriDetailRoute
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                />
              }
            />

            {/* Sub-halaman Ber-URL */}
            <Route
              path="/santri"
              element={
                <OtherView
                  currentView="santri"
                  onBackToBeranda={() => navigate('/beranda')}
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                  onDetail={handleOpenDetail}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/laporan"
              element={
                <OtherView
                  currentView="laporan"
                  onBackToBeranda={() => navigate('/beranda')}
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                  onDetail={handleOpenDetail}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/pengaturan"
              element={
                <OtherView
                  currentView="pengaturan"
                  onBackToBeranda={() => navigate('/beranda')}
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                  onDetail={handleOpenDetail}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/ujian-tasmi"
              element={
                <OtherView
                  currentView="dll-ujian"
                  onBackToBeranda={() => navigate('/beranda')}
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                  onDetail={handleOpenDetail}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/pacing"
              element={
                <OtherView
                  currentView="dll-pacing"
                  onBackToBeranda={() => navigate('/beranda')}
                  santriList={santriList}
                  onSetor={handleOpenSetor}
                  onDetail={handleOpenDetail}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />
          </Routes>
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
