import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { emailValidationService, type EmailValidationResult } from '@/services/emailValidationService';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Harap setujui pakta integritas dan ketentuan layanan.');
      return;
    }

    // Validasi multi-layer email (Syntax, Disposable, Domain & MX)
    setIsLoading(true);
    const valRes = await emailValidationService.validateEmail(email);
    if (valRes.verdict === 'invalid' || valRes.isDisposable) {
      setIsLoading(false);
      setErrorMsg(valRes.summaryMessage);
      setEmailValidation(valRes);
      return;
    }

    const res = await authService.signUp(fullName, email, password);
    setIsLoading(false);

    if (res.success) {
      if (res.hasSession) {
        setSuccessMsg('Pendaftaran akun berhasil! Mengalihkan ke pemilihan halaqoh...');
        setTimeout(() => {
          navigate('/pilih-halaqoh');
        }, 1000);
      } else {
        setSuccessMsg('Pendaftaran akun muhaffizh berhasil! Silakan masuk untuk memulai halaqoh.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } else {
      setErrorMsg(res.error || 'Gagal mendaftar akun. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <img
            src="/favicon.svg"
            alt="Logo ITQAN"
            className="inline-block w-12 h-12 rounded-xl shadow-xs mb-3 object-contain"
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Muhaffizh Baru
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pendaftaran akun pembimbing halaqoh tahfidz ITQAN
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-5 sm:px-8 border border-slate-200 rounded-2xl shadow-xs">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Nama Lengkap Muhaffizh
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ust. Abdullah Fauzi"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Alamat Email
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

            {/* Kata Sandi */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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

            {/* Konfirmasi Kata Sandi */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                />
              </div>
            </div>

            {/* Ketentuan Layanan */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  Saya mendaftar sebagai Muhaffizh Halaqoh dan menyetujui integritas mutaba'ah tahfidz ITQAN.
                </span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-3 cursor-pointer"
            >
              {isLoading ? 'Mendaftarkan Akun...' : 'Daftar sebagai Muhaffizh'}
            </Button>
          </form>

          {/* Link ke Login */}
          <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#0070BA] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} ITQAN. Pesantren Tahfidz Terpadu.
        </p>
      </div>
    </div>
  );
};
