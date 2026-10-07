import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, Users } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center mb-4 border border-blue-100 shadow-2xs">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[#0070BA] bg-[#EBF5FB] px-2.5 py-1 rounded-full border border-blue-200 mb-3">
        404 • Halaman Tidak Ditemukan
      </span>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
        Halaman yang Anda Cari Tidak Tersedia
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
        Tautan mungkin rusak atau halaman telah dipindahkan. Silakan kembali ke beranda halaqoh Anda untuk melanjutkan mutaba'ah.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/beranda')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0070BA] text-white text-xs font-semibold hover:bg-[#005C9E] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/santri')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Daftar Santri</span>
        </button>
      </div>
    </div>
  );
};
