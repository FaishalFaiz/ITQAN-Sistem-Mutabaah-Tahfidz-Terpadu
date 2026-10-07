import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { Menu, Calendar, Send } from 'lucide-react';
import gsap from 'gsap';
import { storageService, EVENT_DATA_CHANGED, getTodayDateKey } from './services/storageService';
import type { Santri } from './components/dashboard/types';
import { StatCards } from './components/dashboard/StatCards';
import { SantriListSection, type SetoranFilterType } from './components/dashboard/SantriListSection';
import { TodayProgressCard } from './components/dashboard/TodayProgressCard';
import { NavbarSidebar } from './components/dashboard/NavbarSidebar';
import { SantriModal } from './components/dashboard/SantriModal';
import { AddSantriModal } from './components/dashboard/AddSantriModal';
import { DailyReportModal } from './components/dashboard/DailyReportModal';
import { SantriDetailPage } from './components/dashboard/SantriDetailPage';
import { OtherView } from './components/dashboard/OtherViews';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { authService } from './services/authService';
import { Toaster } from './components/ui/sonner';

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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Modal state for Setor
  const [modalType, setModalType] = useState<'setor' | null>(null);
  const [selectedSantriForSetor, setSelectedSantriForSetor] = useState<Santri | null>(null);

  // Modal state for Add Santri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal state for Daily Report to Parents via WhatsApp
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);

  // Filter state for Santri cards
  const [activeFilter, setActiveFilter] = useState<SetoranFilterType>('all');

  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    return Boolean(authService.getStoredUser());
  });

  // Verifikasi status login musyrif dari Supabase
  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((user) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(user));
        setSantriList(storageService.getSantriList());
      }
    });

    const handleStorageChange = () => {
      const stored = authService.getStoredUser();
      setIsAuthenticated(Boolean(stored));
      setSantriList(storageService.getSantriList());
    };
    window.addEventListener(EVENT_DATA_CHANGED, handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_DATA_CHANGED, handleStorageChange);
    };
  }, [location.pathname]);


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

  const handleSaveSetor = () => {
    setSantriList(storageService.getSantriList());
  };

  const handleAddSantri = (newSantri: Santri) => {
    const updated = storageService.addSantri(newSantri);
    setSantriList(updated);
  };

  // Dynamic header title based on URL
  const halaqahSettings = storageService.getHalaqahSettings();
  const halaqahName = halaqahSettings?.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq';

  const getHeaderTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/beranda') return halaqahName;
    if (p.startsWith('/santri/')) {
      const id = p.split('/')[2];
      const s = santriList.find((item) => item.id === id);
      return s ? s.name : 'Detail Santri';
    }
    if (p.startsWith('/santri')) return 'Daftar Santri';
    if (p.startsWith('/laporan')) return 'Laporan';
    if (p.startsWith('/pengaturan')) return 'Pengaturan';
    return 'ITQAN';
  };

  // Recalculate dynamic stats from santriList
  const tercapaiCount = santriList.filter((s) => s.status === 'tercapai').length;
  const tidakTercapaiCount = santriList.filter((s) => s.status === 'tidak_tercapai').length;
  const belumSetorCount = santriList.filter((s) => s.status === 'belum_setor').length;

  const todayKey = getTodayDateKey();
  const pendingDailyReportsCount = santriList.filter(
    (s) => s.lastDailyReportSentDate !== todayKey && s.parentPhone && s.parentPhone.trim().length > 5
  ).length;

  // Animasi Halus & Dinamis Saat Perpindahan Page / Route
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      const ctx = gsap.context(() => {
        // 1. Animasi transisi container utama
        gsap.fromTo(
          mainContentRef.current,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );

        // 2. Animasi bertingkat (stagger) pada blok konten utama halaman
        const contentBlocks = mainContentRef.current?.querySelectorAll(':scope > div > *, :scope > *');
        if (contentBlocks && contentBlocks.length > 0) {
          gsap.fromTo(
            Array.from(contentBlocks).slice(0, 4),
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }
          );
        }
      }, mainContentRef);

      window.scrollTo({ top: 0, behavior: 'instant' });
      return () => ctx.revert();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Auth routes (render standalone full page)
  if (location.pathname === '/login' || location.pathname === '/signup') {
    if (isAuthenticated === true || Boolean(authService.getStoredUser())) {
      return <Navigate to="/beranda" replace />;
    }
    return location.pathname === '/login' ? <LoginPage /> : <SignupPage />;
  }

  // Jika belum login dan tidak ada sesi tersimpan di localStorage, alihkan ke /login
  if (isAuthenticated === false && !authService.getStoredUser()) {
    return <Navigate to="/login" replace />;
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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              {/* Sisi Kiri: Hamburger Button + Title */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {/* Tombol Hamburger di Mobile (lg:hidden) */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 -ml-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0070BA] lg:hidden shrink-0 cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate leading-tight">
                    {getHeaderTitle()}
                  </h1>
                </div>
              </div>

              {/* Sisi Kanan: Laporan Harian WA Button + Tanggal */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
                {/* Tombol Akses Cepat Laporan Harian Wali (Ringkas di Mobile) */}
                <button
                  type="button"
                  onClick={() => setIsDailyReportModalOpen(true)}
                  className="relative inline-flex items-center justify-center gap-1.5 h-9 min-w-[36px] px-2.5 sm:px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold transition-colors shadow-2xs cursor-pointer text-xs shrink-0"
                  title="Kirim Laporan Harian ke Wali Santri"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Laporan Harian WA</span>
                  {pendingDailyReportsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold leading-none shadow-xs shrink-0">
                      {pendingDailyReportsCount}
                    </span>
                  )}
                </button>

                {/* Badge Tanggal (Disembunyikan di Mobile agar Header Lega) */}
                <div className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {new Intl.DateTimeFormat('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route View dengan Animasi Halus */}
        <main ref={mainContentRef} className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
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

                  <TodayProgressCard
                    santriList={santriList}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />

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

                  <TodayProgressCard
                    santriList={santriList}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />

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
              element={<Navigate to="/santri" replace />}
            />
          </Routes>
        </main>
      </div>

      {/* Setor Modal */}
      <SantriModal
        type={modalType}
        santri={selectedSantriForSetor}
        onClose={handleCloseModal}
        onSaveSetor={handleSaveSetor}
      />

      {/* Add Santri Modal */}
      <AddSantriModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSantri={handleAddSantri}
      />

      {/* Daily Report to Parents Modal (Manual Direct WhatsApp) */}
      <DailyReportModal
        isOpen={isDailyReportModalOpen}
        onClose={() => setIsDailyReportModalOpen(false)}
        santriList={santriList}
        onDataRefresh={() => setSantriList(storageService.getSantriList())}
      />

      {/* Global Toast Notification System */}
      <Toaster />
    </div>
  );
}

export default App;
