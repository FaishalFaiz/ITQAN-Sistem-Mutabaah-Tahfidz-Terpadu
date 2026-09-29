import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  X
} from 'lucide-react';
import type { NavItemKey } from './types';

interface NavbarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: NavItemKey;
  onSelectItem?: (item: NavItemKey) => void;
}

export const NavbarSidebar: React.FC<NavbarSidebarProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [isSetoranOpen, setIsSetoranOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Map route pathname to NavItemKey
  const getActiveKey = (): NavItemKey => {
    const path = location.pathname;
    if (path === '/' || path === '/beranda') return 'beranda';
    if (path.startsWith('/laporan')) return 'laporan';
    if (path.startsWith('/santri')) return 'santri';
    if (path.startsWith('/pengaturan')) return 'pengaturan';
    if (path.startsWith('/setoran/ziyadah')) return 'setoran-ziyadah';
    if (path.startsWith('/setoran/murajaah')) return 'setoran-murajaah';
    if (path.startsWith('/ujian')) return 'dll-ujian';
    if (path.startsWith('/pacing')) return 'dll-pacing';
    return 'beranda';
  };

  const activeKey = getActiveKey();

  const handleNavClick = (key: NavItemKey) => {
    if (onSelectItem) onSelectItem(key);
    
    // URL routing map
    switch (key) {
      case 'beranda':
        navigate('/beranda');
        break;
      case 'laporan':
        navigate('/laporan');
        break;
      case 'santri':
        navigate('/santri');
        break;
      case 'pengaturan':
        navigate('/pengaturan');
        break;
      case 'setoran-ziyadah':
        navigate('/setoran/ziyadah');
        break;
      case 'setoran-murajaah':
        navigate('/setoran/murajaah');
        break;
      case 'dll-ujian':
        navigate('/ujian-tasmi');
        break;
      case 'dll-pacing':
        navigate('/pacing');
        break;
      default:
        navigate('/beranda');
        break;
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay - quick, crisp transition */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/30 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Left Sidebar Drawer - fast & lightweight CSS transform */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 flex flex-col shadow-xl transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header: ITQAN Logo & Close Button */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              IT
            </div>
            <span className="font-bold text-base text-slate-900 leading-tight">Menu Navigasi</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Navbar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium text-slate-700">
          {/* Beranda */}
          <button
            type="button"
            onClick={() => handleNavClick('beranda')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeKey === 'beranda'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Beranda</span>
          </button>

          {/* Laporan/ringkasan */}
          <button
            type="button"
            onClick={() => handleNavClick('laporan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeKey === 'laporan'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Laporan/ringkasan</span>
          </button>

          {/* Santri */}
          <button
            type="button"
            onClick={() => handleNavClick('santri')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeKey === 'santri'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Santri</span>
          </button>

          {/* Pengaturan */}
          <button
            type="button"
            onClick={() => handleNavClick('pengaturan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeKey === 'pengaturan'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Pengaturan</span>
          </button>

          {/* Setoran (Ziyadah & Murajaah) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsSetoranOpen(!isSetoranOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-slate-100 transition-colors font-medium text-slate-700"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0 text-[#0070BA]" />
                <span>Setoran</span>
              </div>
              {isSetoranOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isSetoranOpen && (
              <div className="pl-7 pr-1 py-1 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleNavClick('setoran-ziyadah')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeKey === 'setoran-ziyadah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA]" />
                  <span>- Ziyadah</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('setoran-murajaah')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeKey === 'setoran-murajaah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>- Murajaah</span>
                </button>
              </div>
            )}
          </div>

          {/* DLL */}
          <button
            type="button"
            onClick={() => handleNavClick('dll-ujian')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeKey.startsWith('dll')
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'hover:bg-slate-100'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            <span>DLL / Ujian &amp; Pacing</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xs">
              UA
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 block truncate">Ust. Abdullah</span>
              <span className="text-[11px] text-slate-500 block truncate">Musyrif Halaqoh 1</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
