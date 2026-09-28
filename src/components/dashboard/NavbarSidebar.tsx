import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal
} from 'lucide-react';
import type { NavItemKey } from './types';

interface NavbarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: NavItemKey;
  onSelectItem: (item: NavItemKey) => void;
}

export const NavbarSidebar: React.FC<NavbarSidebarProps> = ({
  isOpen,
  onClose,
  activeItem,
  onSelectItem,
}) => {
  const [isSetoranOpen, setIsSetoranOpen] = useState(true);

  const handleNavClick = (key: NavItemKey) => {
    onSelectItem(key);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: ITQAN Logo */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm">
            IT
          </div>
          <span className="font-bold text-base text-slate-900">ITQAN</span>
        </div>

        {/* Menu Items matching wireframe */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium text-slate-700">
          {/* Beranda */}
          <button
            type="button"
            onClick={() => handleNavClick('beranda')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeItem === 'beranda'
                ? 'bg-[#0070BA] text-white font-semibold'
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
              activeItem === 'laporan'
                ? 'bg-[#0070BA] text-white font-semibold'
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
              activeItem === 'santri'
                ? 'bg-[#0070BA] text-white font-semibold'
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
              activeItem === 'pengaturan'
                ? 'bg-[#0070BA] text-white font-semibold'
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
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0" />
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
                    activeItem === 'setoran-ziyadah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>- Ziyadah</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('setoran-murajaah')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeItem === 'setoran-murajaah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
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
              activeItem.startsWith('dll')
                ? 'bg-[#0070BA] text-white font-semibold'
                : 'hover:bg-slate-100'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            <span>DLL</span>
          </button>
        </nav>
      </aside>
    </>
  );
};
