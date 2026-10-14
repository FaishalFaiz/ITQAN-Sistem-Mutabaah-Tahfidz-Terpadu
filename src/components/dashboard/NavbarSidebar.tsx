import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Layers,
  Settings, 
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import type { NavItemKey } from './types';

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
  { key: 'santri', label: 'Santri', icon: Users, path: '/santri' },
  { key: 'laporan', label: 'Laporan', icon: FileText, path: '/laporan' },
  { key: 'halaqah', label: 'Halaqoh', icon: Layers, path: '/halaqah' },
  { key: 'pengaturan', label: 'Pengaturan', icon: Settings, path: '/pengaturan' },
];

export const NavbarSidebar: React.FC<NavbarSidebarProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map route pathname to NavItemKey
  const getActiveKey = (): NavItemKey => {
    const path = location.pathname;
    if (path === '/' || path === '/beranda') return 'beranda';
    if (path.startsWith('/santri')) return 'santri';
    if (path.startsWith('/laporan')) return 'laporan';
    if (path.startsWith('/halaqah')) return 'halaqah';
    if (path.startsWith('/pengaturan')) return 'pengaturan';
    return 'beranda';
  };

  const activeKey = getActiveKey();

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
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/favicon.svg"
              alt="Logo ITQAN"
              className="w-8 h-8 rounded-lg shadow-2xs shrink-0 object-contain"
            />
            <div className="shrink-0">
              <span className="font-extrabold text-base text-slate-900 leading-tight block">ITQAN</span>
              <span className="text-[10px] text-slate-500 font-medium block">Tahfidz Terpadu</span>
            </div>
            <div className="h-7 w-px bg-slate-200 mx-0.5 shrink-0" />
            <img
              src="/harisantri2026logo.webp"
              alt="Hari Santri 2026"
              className="h-8 w-auto object-contain shrink-0"
            />
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

        {/* Menu Items dengan Animasi Bergeser Smooth Menggunakan Motion layoutId */}
        <nav className="relative flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.key}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors duration-150 relative z-10 group cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {/* Active Sliding Indicator (Motion Spring Physics) */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-pill"
                    className="absolute inset-0 bg-[#0070BA] rounded-lg shadow-xs pointer-events-none"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150 relative z-10 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-transparent text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate relative z-10">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-4 bg-white/90 rounded-full ml-auto shrink-0 shadow-2xs relative z-10" />
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
