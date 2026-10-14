import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { Menu, Calendar, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService, EVENT_DATA_CHANGED, getTodayDateKey, emitChange } from './services/storageService';
import { syncService, resolveHalaqahName, ensureUUID } from './services/syncService';
import { getSantriSlug, findSantriByParam } from './lib/utils';
import type { Santri, HalaqahGroup } from './components/dashboard/types';
import { StatCards } from './components/dashboard/StatCards';
import { SantriListSection, type SetoranFilterType } from './components/dashboard/SantriListSection';
import { TodayProgressCard } from './components/dashboard/TodayProgressCard';
import { NavbarSidebar } from './components/dashboard/NavbarSidebar';
import { HalaqahSwitcher } from './components/dashboard/HalaqahSwitcher';
import { SantriModal } from './components/dashboard/SantriModal';
import { SendWalsanModal, type WalsanModalData } from './components/dashboard/SendWalsanModal';
import { AddSantriModal } from './components/dashboard/AddSantriModal';
import { EditTargetModal } from './components/dashboard/EditTargetModal';
import { DailyReportModal } from './components/dashboard/DailyReportModal';
import { TeacherProfileMenu } from './components/dashboard/TeacherProfileMenu';
import { authService } from './services/authService';
import { Toaster } from './components/ui/sonner';

// Lazy loaded page components for optimal production chunking
const SantriDetailPage = lazy(() =>
  import('./components/dashboard/SantriDetailPage').then((m) => ({ default: m.SantriDetailPage }))
);
const OtherView = lazy(() =>
  import('./components/dashboard/OtherViews').then((m) => ({ default: m.OtherView }))
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('./pages/auth/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const OnboardingHalaqahPage = lazy(() =>
  import('./pages/halaqah/OnboardingHalaqahPage').then((m) => ({ default: m.OnboardingHalaqahPage }))
);
const LandingPage = lazy(() =>
  import('./pages/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);

function PageLoadingFallback({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50 bg-[#F8FAFC]' : 'min-h-[60vh] w-full'
      } flex flex-col items-center justify-center p-4 text-center`}
    >
      <div className="w-8 h-8 border-2 border-[#0070BA] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-500 mt-3 font-medium">Memuat halaman...</span>
    </div>
  );
}

// Helper component for /santri/:id route (mendukung slug nama, NIS, dan backward compatibility UUID)
function SantriDetailRoute({
  santriList,
  onSetor,
}: {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const santri = useMemo(() => findSantriByParam(santriList, id), [santriList, id]);

  // Jika URL saat ini masih berupa UUID lama, secara mulus perbarui ke route slug yang rapi
  useEffect(() => {
    if (santri && id) {
      const cleanSlug = getSantriSlug(santri, santriList);
      if (id !== cleanSlug && (id === santri.id || id.replace(/-/g, '') === santri.id.replace(/-/g, ''))) {
        navigate(`/santri/${cleanSlug}`, { replace: true });
      }
    }
  }, [santri, id, santriList, navigate]);

  if (!santri) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <h3 className="font-bold text-base text-slate-800">Santri Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500">Data santri dengan rute "{id}" tidak ditemukan dalam sistem.</p>
        <button
          onClick={() => navigate('/beranda')}
          className="px-4 py-2 bg-[#0070BA] text-white rounded-lg text-xs font-semibold cursor-pointer"
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
  const [walsanModalData, setWalsanModalData] = useState<WalsanModalData | null>(null);

  // Modal state for Add Santri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal state for Daily Report to Parents via WhatsApp
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);

  // Modal state for Editing Santri Target
  const [editingTargetSantri, setEditingTargetSantri] = useState<Santri | null>(null);

  // Filter state for Santri cards
  const [activeFilter, setActiveFilter] = useState<SetoranFilterType>('all');

  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());
  const [userRoomsCount, setUserRoomsCount] = useState<number>(() => storageService.getUserHalaqahList().length);
  const [activeHalaqah, setActiveHalaqah] = useState<HalaqahGroup | null>(() => storageService.getActiveHalaqah());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    return Boolean(authService.getStoredUser());
  });

  // Verifikasi status login musyrif dari Supabase dan sinkronisasi data cloud
  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then(async (user) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(user));
        if (user) {
          await syncService.syncAll();
        }
        if (isMounted) {
          setSantriList(storageService.getSantriList());
          setUserRoomsCount(storageService.getUserHalaqahList().length);
          setActiveHalaqah(storageService.getActiveHalaqah());
        }
      }
    });

    const handleStorageChange = () => {
      const stored = authService.getStoredUser();
      setIsAuthenticated(Boolean(stored));
      setSantriList(storageService.getSantriList());
      setUserRoomsCount(storageService.getUserHalaqahList().length);
      setActiveHalaqah(storageService.getActiveHalaqah());
    };
    window.addEventListener(EVENT_DATA_CHANGED, handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_DATA_CHANGED, handleStorageChange);
    };
  }, [location.pathname]);

  // Deteksi otomatis saat tanggal berganti (tengah malam atau kembali fokus ke tab) agar target harian ter-reset
  useEffect(() => {
    let lastDate = getTodayDateKey();

    const handleDateRoll = () => {
      const currentDate = getTodayDateKey();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        setSantriList(storageService.getSantriList());
        setActiveHalaqah(storageService.getActiveHalaqah());
        emitChange('date_changed_rollover');
      }
    };

    const timer = setInterval(handleDateRoll, 30000);
    window.addEventListener('focus', handleDateRoll);
    document.addEventListener('visibilitychange', handleDateRoll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleDateRoll);
      document.removeEventListener('visibilitychange', handleDateRoll);
    };
  }, []);


  const handleOpenSetor = (santri: Santri) => {
    setSelectedSantriForSetor(santri);
    setModalType('setor');
  };

  const handleOpenDetail = (santri: Santri) => {
    const slug = getSantriSlug(santri, santriList);
    navigate(`/santri/${slug}`);
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

  // Active Halaqah State
  const halaqahName = activeHalaqah?.name || '';

  // Filter santri sesuai halaqoh aktif yang sedang diampu (dimemoize untuk cegah alokasi array berulang)
  const currentHalaqahSantriList = useMemo(() => {
    if (!activeHalaqah) return [];
    const allRooms = storageService.getAllHalaqahRooms();
    const activeUUID = ensureUUID(activeHalaqah.id);
    const activeCleanName = (activeHalaqah.name || '').trim().toLowerCase();

    return santriList.filter((s) => {
      if (s.halaqahId) {
        if (s.halaqahId === activeHalaqah.id) return true;
        if (ensureUUID(s.halaqahId) === activeUUID) return true;
      }
      const sHalaqah = resolveHalaqahName(s.halaqahName || s.halaqahId, allRooms);
      return Boolean(sHalaqah && sHalaqah.trim().toLowerCase() === activeCleanName);
    });
  }, [santriList, activeHalaqah]);

  const getHeaderTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/beranda') return halaqahName || 'Beranda';
    if (p.startsWith('/santri/')) {
      const param = p.split('/')[2];
      const s = findSantriByParam(santriList, param);
      return s ? s.name : 'Detail Santri';
    }
    if (p.startsWith('/santri')) return 'Daftar Santri';
    if (p.startsWith('/laporan')) return 'Laporan Capaian';
    if (p.startsWith('/halaqah')) return 'Manajemen Halaqoh';
    if (p.startsWith('/pengaturan')) return 'Pengaturan Akun';
    return 'ITQAN';
  };

  // Recalculate dynamic stats from halaqoh aktif santriList (dimemoize)
  const tercapaiCount = useMemo(
    () => currentHalaqahSantriList.filter((s) => s.status === 'tercapai').length,
    [currentHalaqahSantriList]
  );
  const tidakTercapaiCount = useMemo(
    () => currentHalaqahSantriList.filter((s) => s.status === 'tidak_tercapai').length,
    [currentHalaqahSantriList]
  );
  const belumSetorCount = useMemo(
    () => currentHalaqahSantriList.filter((s) => s.status === 'belum_setor').length,
    [currentHalaqahSantriList]
  );

  const todayKey = getTodayDateKey();
  const pendingDailyReportsCount = useMemo(() => {
    return currentHalaqahSantriList.filter(
      (s) => s.lastDailyReportSentDate !== todayKey && s.parentPhone && s.parentPhone.trim().length > 5
    ).length;
  }, [currentHalaqahSantriList, todayKey]);

  // Scroll to top saat berpindah rute
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Dynamic Browser Document Title
  useEffect(() => {
    const p = location.pathname;
    let title = 'ITQAN — Sistem Mutabaah Tahfidz Terpadu';
    if (p === '/' || p === '/beranda') {
      title = `Beranda • ${halaqahName} | ITQAN`;
    } else if (p.startsWith('/santri/')) {
      const param = p.split('/')[2];
      const s = findSantriByParam(santriList, param);
      title = `${s ? s.name : 'Detail Santri'} | ITQAN`;
    } else if (p.startsWith('/santri')) {
      title = 'Manajemen Santri | ITQAN';
    } else if (p.startsWith('/laporan')) {
      title = 'Laporan Capaian | ITQAN';
    } else if (p.startsWith('/halaqah')) {
      title = 'Manajemen Halaqoh | ITQAN';
    } else if (p.startsWith('/pengaturan')) {
      title = 'Pengaturan Akun | ITQAN';
    } else if (p === '/pilih-halaqoh') {
      title = 'Pilih atau Buat Halaqoh | ITQAN';
    } else if (p === '/landing') {
      title = 'ITQAN — Sistem Mutabaah Tahfidz Terpadu';
    } else if (p === '/login') {
      title = 'Masuk Portal Muhaffizh | ITQAN';
    } else if (p === '/signup') {
      title = 'Daftar Akun Muhaffizh | ITQAN';
    }
    document.title = title;
  }, [location.pathname, halaqahName, santriList]);

  // Landing Page Route: Root '/' dan '/landing' selalu menampilkan Landing Page publik
  if (location.pathname === '/' || location.pathname === '/landing') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  // Auth routes (render standalone full page)
  if (location.pathname === '/login' || location.pathname === '/signup') {
    if (isAuthenticated === true || Boolean(authService.getStoredUser())) {
      const userRooms = storageService.getUserHalaqahList();
      if (userRooms.length === 0) {
        return <Navigate to="/pilih-halaqoh" replace />;
      }
      return <Navigate to="/beranda" replace />;
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        {location.pathname === '/login' ? <LoginPage /> : <SignupPage />}
      </Suspense>
    );
  }

  // Onboarding route: pemilihan halaqoh saat akun baru belum memiliki ruangan
  if (location.pathname === '/pilih-halaqoh') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <OnboardingHalaqahPage />
      </Suspense>
    );
  }

  // Jika auth state masih dicek pertama kali dan belum ada cache user di localStorage
  if (isAuthenticated === null && !authService.getStoredUser()) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-3">
          <img src="/favicon.svg" alt="ITQAN" className="w-7 h-7 object-contain" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <div className="w-3.5 h-3.5 border-2 border-[#0070BA] border-t-transparent rounded-full animate-spin" />
          <span>Memuat Portal ITQAN...</span>
        </div>
      </div>
    );
  }

  // Jika belum login dan tidak ada sesi tersimpan di localStorage, alihkan ke login
  if (isAuthenticated === false && !authService.getStoredUser()) {
    return <Navigate to="/login" replace />;
  }

  // Jika akun musyrif belum bergabung atau membuat ruang halaqoh apapun, alihkan ke onboarding
  if (userRoomsCount === 0 || storageService.getUserHalaqahList().length === 0) {
    return <Navigate to="/pilih-halaqoh" replace />;
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
              {/* Sisi Kiri: Hamburger Button + Halaqah Switcher / Title */}
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

                {/* Di halaman Beranda, tampilkan HalaqahSwitcher interaktif agar guru bisa memilih halaqoh yang diampu */}
                {location.pathname === '/' || location.pathname === '/beranda' ? (
                  <div className="flex items-center gap-2">
                    <HalaqahSwitcher />
                  </div>
                ) : (
                  <div className="min-w-0">
                    <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate leading-tight">
                      {getHeaderTitle()}
                    </h1>
                  </div>
                )}
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

                {/* Profil Guru Halaqoh di Kanan Atas */}
                <TeacherProfileMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route View dengan Animasi Halus & Lazy Suspense */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto flex flex-col">
          <Suspense fallback={<PageLoadingFallback fullScreen={false} />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col space-y-4"
              >
                <Routes location={location}>
              {/* Redirect root ke /beranda jika berada dalam sesi dashboard */}
              <Route path="/" element={<Navigate to="/beranda" replace />} />

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
                      santriList={currentHalaqahSantriList}
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                    />

                    <SantriListSection
                      santriList={currentHalaqahSantriList}
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                      onSetor={handleOpenSetor}
                      onDetail={handleOpenDetail}
                      onEditTarget={setEditingTargetSantri}
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
                    santriList={santriList}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                }
              />

              <Route
                path="/halaqah"
                element={
                  <OtherView
                    currentView="halaqah"
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
                    santriList={santriList}
                    onSetor={handleOpenSetor}
                    onDetail={handleOpenDetail}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                }
              />

              {/* 404 Wildcard Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {/* Setor Modal */}
      <SantriModal
        type={modalType}
        santri={selectedSantriForSetor}
        onClose={handleCloseModal}
        onSuccess={(data) => {
          handleCloseModal();
          if (data) {
            setWalsanModalData(data);
          }
        }}
        onSaveSetor={handleSaveSetor}
      />

      {/* Modal Kirim Laporan WA ke Walsan */}
      <SendWalsanModal
        isOpen={Boolean(walsanModalData)}
        data={walsanModalData}
        onClose={() => setWalsanModalData(null)}
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

      {/* Edit Target Santri Modal */}
      <EditTargetModal
        isOpen={Boolean(editingTargetSantri)}
        onClose={() => setEditingTargetSantri(null)}
        santri={editingTargetSantri}
        onSaved={() => setSantriList(storageService.getSantriList())}
      />

      {/* Global Toast Notification System */}
      <Toaster />
    </div>
  );
}

export default App;
