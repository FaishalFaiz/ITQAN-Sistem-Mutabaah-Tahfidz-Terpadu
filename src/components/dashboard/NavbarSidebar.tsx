import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Award, 
  Layers, 
  BarChart3, 
  Sparkles
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
  // Setoran sub-menu expansion state
  const [isSetoranOpen, setIsSetoranOpen] = useState(true);
  // DLL sub-menu expansion state
  const [isDllOpen, setIsDllOpen] = useState(true);

  const handleNavClick = (key: NavItemKey) => {
    onSelectItem(key);
    // On mobile screen, close sidebar on select
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel - Matches "Navbar" in wireframe */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 z-50 flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm">
              IT
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">ITQAN Menu</span>
              <span className="text-[11px] text-slate-500">Navigasi Sistem</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Menu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List - Exactly matching user wireframe */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium">
          {/* 1. Beranda */}
          <button
            type="button"
            onClick={() => handleNavClick('beranda')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left ${
              activeItem === 'beranda'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="flex-1">Beranda</span>
          </button>

          {/* 2. Laporan/ringkasan */}
          <button
            type="button"
            onClick={() => handleNavClick('laporan')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left ${
              activeItem === 'laporan'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="flex-1">Laporan/ringkasan</span>
          </button>

          {/* 3. Santri */}
          <button
            type="button"
            onClick={() => handleNavClick('santri')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left ${
              activeItem === 'santri'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="flex-1">Santri</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              12
            </span>
          </button>

          {/* 4. Pengaturan */}
          <button
            type="button"
            onClick={() => handleNavClick('pengaturan')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left ${
              activeItem === 'pengaturan'
                ? 'bg-[#0070BA] text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="flex-1">Pengaturan</span>
          </button>

          {/* 5. Setoran (Collapsible Group as sketched: -Ziyadah, -Murajaah) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsSetoranOpen(!isSetoranOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
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
              <div className="pl-6 pr-1 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('setoran-ziyadah')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    activeItem === 'setoran-ziyadah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold border border-[#D6EAF8]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA]" />
                  <span>- Ziyadah (Hafalan Baru)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('setoran-murajaah')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    activeItem === 'setoran-murajaah'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold border border-[#D6EAF8]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>- Muraja'ah (Pengulangan)</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. DLL (Dan Lain-Lain: Ujian Tasmi, Heatmap, Pacing) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsDllOpen(!isDllOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-slate-600" />
                <span>DLL (Fitur Tambahan)</span>
              </div>
              {isDllOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isDllOpen && (
              <div className="pl-6 pr-1 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('dll-ujian')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    activeItem === 'dll-ujian'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold border border-[#D6EAF8]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Ujian Tasmi' (Tap Counter)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('dll-pacing')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    activeItem === 'dll-pacing'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold border border-[#D6EAF8]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Target Pacing 3-Tahun</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('dll-heatmap')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    activeItem === 'dll-heatmap'
                      ? 'bg-[#EBF5FB] text-[#0070BA] font-bold border border-[#D6EAF8]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Heatmap 604 Halaman</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
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
