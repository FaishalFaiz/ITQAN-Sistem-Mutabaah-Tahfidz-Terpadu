import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('abdullah@itqan.sch.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'musyrif' | 'admin' | 'wali'>('musyrif');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulates quick login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/beranda');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      {/* Container Tengah */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo & Judul Institusi */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0070BA] text-white shadow-xs mb-3.5">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            ITQAN TAHFIDZ
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistem Mutaba'ah &amp; Evaluasi Tahfidz Terpadu
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-5 sm:px-8 border border-slate-200 rounded-2xl shadow-xs">
          {/* Header Tab Peran Akun */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Masuk Sebagai
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setRole('musyrif');
                  setEmail('abdullah@itqan.sch.id');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  role === 'musyrif'
                    ? 'bg-white text-[#0070BA] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Musyrif
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setEmail('admin@itqan.sch.id');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  role === 'admin'
                    ? 'bg-white text-[#0070BA] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Koordinator
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('wali');
                  setEmail('wali.fatih@gmail.com');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  role === 'wali'
                    ? 'bg-white text-[#0070BA] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wali Santri
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email / Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Alamat Email / NIS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@itqan.sch.id atau NIS"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  Kata Sandi
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi Koordinator Tahfidz/Admin untuk reset kata sandi akun.');
                  }}
                  className="text-xs text-[#0070BA] hover:underline font-medium"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-600">Ingat sesi saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2"
            >
              {isLoading ? 'Memproses Masuk...' : 'Masuk ke Portal'}
            </Button>
          </form>

          {/* Quick Demo Info */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Akun Demo Cepat</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gunakan email &amp; sandi default yang telah terisi, lalu klik <b>Masuk ke Portal</b> untuk mulai eksplorasi.
            </p>
          </div>

          {/* Link ke Registrasi */}
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Belum memiliki akun?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#0070BA] hover:underline"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} ITQAN. Pesantren Tahfidz Terpadu.
        </p>
      </div>
    </div>
  );
};
