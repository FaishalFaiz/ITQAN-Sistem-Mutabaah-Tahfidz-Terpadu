import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';
import { storageService } from '@/services/storageService';
import { emailValidationService, type EmailValidationResult } from '@/services/emailValidationService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email Validation State
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) {
      setEmailValidation(null);
      setIsValidatingEmail(false);
      return;
    }

    setIsValidatingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await emailValidationService.validateEmail(trimmed);
        setEmailValidation(res);
      } finally {
        setIsValidatingEmail(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await authService.signIn(email, password);

    if (res.success) {
      // Sinkronisasi data cloud Supabase ke lokal sebelum redirect
      await syncService.syncAll();
      setIsLoading(false);
      
      const userRooms = storageService.getUserHalaqahList();
      if (userRooms.length === 0) {
        navigate('/pilih-halaqoh');
      } else {
        navigate('/beranda');
      }
    } else {
      setIsLoading(false);
      setErrorMessage(res.error || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      {/* Container Tengah */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo & Judul Institusi */}
        <div className="text-center mb-8">
          <img
            src="/favicon.svg"
            alt="Logo ITQAN"
            className="inline-block w-12 h-12 rounded-xl shadow-xs mb-3.5 object-contain"
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            PORTAL MUHAFFIZH ITQAN
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistem Mutaba'ah &amp; Evaluasi Tahfidz Terpadu
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-5 sm:px-8 border border-slate-200 rounded-2xl shadow-xs">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Alamat Email Muhaffizh
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="muhaffizh@itqan.sch.id"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                />
                {/* Status Centang Hijau / Spinner di Samping Kanan Input */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isValidatingEmail ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-[#0070BA] rounded-full animate-spin" />
                  ) : emailValidation?.verdict === 'valid' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  Kata Sandi
                </label>
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
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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
              className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2 cursor-pointer"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk sebagai Muhaffizh'}
            </Button>
          </form>

          {/* Link ke Registrasi */}
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Belum memiliki akun muhaffizh?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#0070BA] hover:underline"
            >
              Daftar Akun Muhaffizh
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
