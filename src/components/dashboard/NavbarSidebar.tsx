import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import gsap from 'gsap';
import type { NavItemKey } from './types';
import { authService, type MusyrifUser } from '../../services/authService';

interface NavbarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: NavItemKey;
  onSelectItem?: (item: NavItemKey) => void;
}


interface NavItemDef {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  path: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { key: 'beranda', label: 'Beranda', icon: Home, path: '/beranda' },
  { key: 'laporan', label: 'Laporan', icon: FileText, path: '/laporan' },
  { key: 'santri', label: 'Santri', icon: Users, path: '/santri' },
  { key: 'pengaturan', label: 'Pengaturan', icon: Settings, path: '/pengaturan' },
];

export const NavbarSidebar: React.FC<NavbarSidebarProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [currentUser, setCurrentUser] = React.useState<MusyrifUser | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Map route pathname to NavItemKey
  const getActiveKey = (): NavItemKey => {
    const path = location.pathname;
    if (path === '/' || path === '/beranda') return 'beranda';
    if (path.startsWith('/laporan')) return 'laporan';
    if (path.startsWith('/santri')) return 'santri';
    if (path.startsWith('/pengaturan')) return 'pengaturan';
    return 'beranda';
  };

  const activeKey = getActiveKey();

  // Animasi bergeser smooth (sliding indicator) pada sidebar saat berpindah page
  useEffect(() => {
    if (navRef.current && indicatorRef.current) {
      const activeBtn = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeBtn) {
        const targetTop = activeBtn.offsetTop;
        const targetHeight = activeBtn.offsetHeight;

        if (!hasInitialized.current) {
          gsap.set(indicatorRef.current, {
            top: targetTop,
            height: targetHeight,
            opacity: 1,
          });
          hasInitialized.current = true;
        } else {
          // Balok background meluncur & bergeser smooth secara elastis
          gsap.to(indicatorRef.current, {
            top: targetTop,
            height: targetHeight,
            opacity: 1,
            duration: 0.32,
            ease: 'power3.out',
          });

          // Animasi micro-interaction pada icon yang baru aktif
          const icon = activeBtn.querySelector('.nav-icon');
          if (icon) {
            gsap.fromTo(
              icon,
              { scale: 0.75, rotate: -8 },
              { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)', clearProps: 'transform' }
            );
          }
        }
      }
    }
  }, [activeKey]);

  const handleNavClick = (item: NavItemDef) => {
    if (onSelectItem) onSelectItem(item.key);
    navigate(item.path);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay - hanya aktif di mobile / tablet */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/30 z-40 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar: Selalu terbuka di desktop (sticky w-64), drawer geser di mobile */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 lg:z-30 flex flex-col shadow-xl lg:shadow-none transition-transform duration-200 ease-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: ITQAN Logo & Close Button (Close button hanya mobile) */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Logo ITQAN"
              className="w-8 h-8 rounded-lg shadow-2xs shrink-0 object-contain"
            />
            <div>
              <span className="font-extrabold text-base text-slate-900 leading-tight block">ITQAN</span>
              <span className="text-[10px] text-slate-500 font-medium block">Tahfidz Terpadu</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden cursor-pointer"
            aria-label="Tutup Navbar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items dengan Animasi Bergeser Smooth (Sliding Indicator) */}
        <nav ref={navRef} className="relative flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-medium">
          {/* Background Indicator yang Bergeser Mulus Mengikuti Menu Aktif */}
          <div
            ref={indicatorRef}
            className="absolute left-4 right-4 bg-[#0070BA] rounded-lg shadow-xs pointer-events-none z-0"
            style={{ top: 0, height: 0, opacity: 0 }}
            aria-hidden="true"
          />

          {NAV_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors duration-200 relative z-10 group cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-transparent text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-4 h-4 nav-icon" />
                </div>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-4 bg-white/90 rounded-full ml-auto shrink-0 shadow-2xs animate-in fade-in zoom-in-75 duration-200" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info (Khusus Muhaffizh) */}
        <div className="p-3.5 border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.fullName
                  ? currentUser.fullName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0].toUpperCase())
                      .join('')
                  : 'MH'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block truncate" title={currentUser?.fullName || 'Muhaffizh'}>
                  {currentUser?.fullName || 'Muhaffizh'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Pembimbing Halaqoh
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await authService.signOut();
                navigate('/login');
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              title="Keluar dari Portal Muhaffizh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
