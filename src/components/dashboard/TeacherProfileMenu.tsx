import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown, UserCheck } from 'lucide-react';
import { authService, type MusyrifUser } from '../../services/authService';
import { EVENT_DATA_CHANGED } from '../../services/storageService';
import { toast } from '@/components/ui/sonner';

interface TeacherProfileMenuProps {
  className?: string;
}

export const TeacherProfileMenu: React.FC<TeacherProfileMenuProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<MusyrifUser | null>(() => authService.getStoredUser());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi data user dari session aktif Supabase & storage lokal
  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((currentUser) => {
      if (isMounted && currentUser) {
        setUser(currentUser);
      }
    });

    const handleDataChanged = () => {
      setUser(authService.getStoredUser());
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleDataChanged);
    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_DATA_CHANGED, handleDataChanged);
    };
  }, []);

  // Tutup dropdown saat klik di luar atau saat menekan Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'MH';

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await authService.signOut();
      toast.success('Berhasil keluar dari akun');
      navigate('/login');
    } catch {
      toast.error('Gagal keluar dari akun');
    }
  };

  const handleNavigateSettings = () => {
    setIsOpen(false);
    navigate('/pengaturan');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Tombol Profil Guru Halaqoh */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Profil: ${user?.fullName || 'Muhaffizh'}`}
        className="flex items-center gap-2 h-9 px-1.5 sm:px-2.5 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 shadow-2xs group"
      >
        {/* Avatar Inisial Bulat */}
        <div className="w-7 h-7 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xs shrink-0 select-none group-hover:scale-[1.03] transition-transform">
          {initials}
        </div>

        {/* Nama & Peran (Layar Tablet/Desktop) */}
        <div className="hidden md:flex flex-col text-left min-w-0 pr-0.5">
          <span className="font-semibold text-xs text-slate-900 truncate max-w-[120px] lg:max-w-[150px] leading-tight">
            {user?.fullName || 'Muhaffizh'}
          </span>
          <span className="text-[10px] text-slate-500 leading-tight">
            Pembimbing
          </span>
        </div>

        {/* Indikator Panah Chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 hidden sm:block ${
            isOpen ? 'rotate-180 text-[#0070BA]' : ''
          }`}
        />
      </button>

      {/* Menu Popover Profil & Keluar */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          {/* Header Informasi Profil Guru */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EBF5FB] border border-[#D6EAF8] text-[#0070BA] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 block truncate" title={user?.fullName || 'Muhaffizh'}>
                {user?.fullName || 'Muhaffizh'}
              </span>
              <span className="text-[11px] text-slate-500 block truncate" title={user?.email || ''}>
                {user?.email || 'pembimbing@itqan.sch.id'}
              </span>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5FB] text-[#0070BA] border border-[#D6EAF8]">
                <UserCheck className="w-3 h-3 text-[#0070BA]" />
                Pembimbing Halaqoh
              </span>
            </div>
          </div>

          {/* Navigasi Pengaturan */}
          <div className="p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={handleNavigateSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer group"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Pengaturan & Sistem</span>
            </button>
          </div>

          {/* Tombol Logout */}
          <div className="pt-1 border-t border-slate-100 px-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer group"
            >
              <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
