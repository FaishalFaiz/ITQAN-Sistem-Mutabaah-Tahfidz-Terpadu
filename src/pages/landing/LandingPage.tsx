import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Send,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Check,
  ImageIcon,
  Award,
  Printer,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { authService } from '@/services/authService';

// Static Module-level datasets (Allocated once, avoiding allocation churn & GC overhead)
const HALAQAH_ROOMS = [
  {
    name: 'Halaqoh Abu Bakar Ash-Shiddiq',
    code: 'HLQ-ABU-01',
    musyrif: 'Ust. Ahmad Fauzi, Al-Hafizh',
    pendamping: 'Ust. Zulkifli (Pendamping)',
    target: '15 Baris / Hari',
    santriCount: 10,
    focus: 'Talaqqi Ziyadah Juz 30 & Muroja\'ah Lanjutan',
    room: 'Masjid Utama Lt. 1',
  },
  {
    name: 'Halaqoh Umar bin Khattab',
    code: 'HLQ-UMR-02',
    musyrif: 'Ust. Rahmat Hidayat, Lc.',
    pendamping: 'Ust. Abdullah (Pendamping)',
    target: '12 Baris / Hari',
    santriCount: 10,
    focus: 'Halaqoh Tahfidz Reguler Juz 1-5',
    room: 'Ruang A-101',
  },
  {
    name: 'Halaqoh Utsman bin Affan',
    code: 'HLQ-UTS-03',
    musyrif: 'Ust. Salman Al-Farisi, S.Pd.I',
    pendamping: 'Ust. Farhan (Pendamping)',
    target: '20 Baris / Hari',
    santriCount: 10,
    focus: 'Halaqoh Mutqin 10 Juz & Ujian Caturwulan',
    room: 'Ruang A-102',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apakah ITQAN bisa dibuka dan digunakan dari smartphone / HP?',
    a: 'Ya, seluruh antarmuka ITQAN responsif penuh untuk layar ponsel. Anda bahkan dapat menyematkannya ke layar utama (Add to Home Screen) seperti aplikasi bawaan.',
  },
  {
    q: 'Bagaimana cara laporan dikirimkan ke WhatsApp wali santri?',
    a: 'ITQAN menggunakan deep-link resmi WhatsApp (wa.me) yang secara instan merangkum data setoran hari ini menjadi teks rapi. Muhaffizh tidak perlu menyimpan nomor wali di kontak HP terlebih dahulu.',
  },
  {
    q: 'Apakah satu akun ustadz bisa mengampu lebih dari satu halaqoh?',
    a: 'Tentu. Anda dapat membuat beberapa ruang halaqoh atau bergabung ke ruang halaqoh rekan ustadz lain melalui fitur "Gabung via Kode". Beralih antar-halaqoh dapat dilakukan dalam satu klik melalui Halaqah Switcher.',
  },
  {
    q: 'Apakah data setoran santri tetap aman tersimpan?',
    a: 'Ya, data disimpan secara lokal pada peramban dan tersinkronisasi dengan database cloud Supabase bila konfigurasi cloud diaktifkan.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Showcase 1: Interactive WhatsApp Message Simulator State
  const [waTab, setWaTab] = useState<'ziyadah' | 'murojaah' | 'harian'>('ziyadah');

  // Showcase 2: Interactive Halaqoh Multi-Room Simulator State
  const [activeRoomIndex, setActiveRoomIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const storedUser = authService.getStoredUser();
  const isLoggedIn = Boolean(storedUser);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kode akses "${code}" disalin!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const currentRoom = HALAQAH_ROOMS[activeRoomIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-[#EBF5FB] selection:text-[#0070BA]">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
              onClick={() => navigate('/')}
            >
              <img
                src="/favicon.svg"
                alt="Logo ITQAN"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-2xs group-hover:scale-105 transition-transform object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 leading-none">
                  ITQAN
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#0070BA] uppercase tracking-wider mt-0.5">
                  Tahfidz Terpadu
                </span>
              </div>
              <div className="h-7 sm:h-9 w-px bg-slate-300 mx-0.5 sm:mx-1 shrink-0" />
              <img
                src="/harisantri2026logo.webp"
                alt="Logo Hari Santri 2026"
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
              />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => scrollToSection('fitur')}
                className="hover:text-[#0070BA] transition-colors cursor-pointer"
              >
                Fitur Utama
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('laporan-wa')}
                className="hover:text-[#0070BA] transition-colors cursor-pointer"
              >
                Laporan WhatsApp
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('halaqoh')}
                className="hover:text-[#0070BA] transition-colors cursor-pointer"
              >
                Manajemen Halaqoh
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('cara-kerja')}
                className="hover:text-[#0070BA] transition-colors cursor-pointer"
              >
                Cara Kerja
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#0070BA] transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </nav>

            {/* Header Right Actions */}
            <div className="hidden sm:flex items-center gap-2.5">
              {isLoggedIn ? (
                <Button
                  type="button"
                  onClick={() => navigate('/beranda')}
                  className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-xs active:scale-[0.98]"
                >
                  <span>Buka Dasbor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-3.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Masuk Portal
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-xs active:scale-[0.98]"
                  >
                    <span>Mulai Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => scrollToSection('fitur')}
                className="text-left py-2 hover:text-[#0070BA]"
              >
                Fitur Utama
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('laporan-wa')}
                className="text-left py-2 hover:text-[#0070BA]"
              >
                Laporan WhatsApp
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('halaqoh')}
                className="text-left py-2 hover:text-[#0070BA]"
              >
                Manajemen Halaqoh
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('cara-kerja')}
                className="text-left py-2 hover:text-[#0070BA]"
              >
                Cara Kerja
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 hover:text-[#0070BA]"
              >
                FAQ
              </button>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isLoggedIn ? (
                <Button
                  type="button"
                  onClick={() => navigate('/beranda')}
                  className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-semibold h-9 rounded-lg"
                >
                  Buka Dasbor
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full text-xs h-9 border-slate-300"
                  >
                    Masuk Portal
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-9"
                  >
                    Mulai Sekarang
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Layout Referensi Gambar 1 dengan Animasi Halus) */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-slate-200 bg-white">
        {/* Subtle Decorative Geometric Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Subheadline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill Badge */}
              <div className="hero-animate-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5FB] border border-blue-200/90 text-[#0070BA] text-[11px] font-bold tracking-tight shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0070BA] animate-pulse" />
                <span>Sistem Mutaba'ah &amp; Evaluasi Tahfidz Terpadu</span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-animate-item text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Modernisasi Mutaba'ah Tahfidz Santri{' '}
                <span className="text-[#0070BA] relative inline-block">
                  Rapi, Terukur, &amp; Terkoneksi
                </span>{' '}
                ke Wali.
              </h1>

              {/* Subheadline Paragraph */}
              <p className="hero-animate-item text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Tinggalkan pencatatan setoran manual di buku fisik. ITQAN membantu ustadz mencatat hafalan ziyadah &amp; muroja'ah santri dalam hitungan detik, memantau target harian, serta mengirim laporan resmi ke WhatsApp wali santri dalam satu klik.
              </p>

              {/* Action Buttons */}
              <div className="hero-animate-item flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => navigate(isLoggedIn ? '/beranda' : '/signup')}
                  className="w-full sm:w-auto h-11 px-6 bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isLoggedIn ? 'Buka Dasbor Mutaba\'ah' : 'Coba Sekarang — Gratis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('cara-kerja')}
                  className="w-full sm:w-auto h-11 px-5 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  <span>Lihat Cara Kerja</span>
                </Button>
              </div>

              {/* Trust Indicators / Badges */}
              <div className="hero-animate-item pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Input Setoran &lt; 10 Detik</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Format WhatsApp Siap Kirim</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dukungan Multi-Halaqoh</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Container & Interactive Mockup (Layout Referensi Gambar 1) */}
            <div className="lg:col-span-5">
              <div className="hero-visual-box relative mx-auto max-w-md lg:max-w-none">
                {/* Window Bar Header Mockup */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-semibold text-slate-600">portal.itqan.id • Halaqoh Aktif</span>
                    <span className="text-[9px] font-bold text-[#0070BA] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Live Preview
                    </span>
                  </div>

                  {/* PLACEHOLDER GAMBAR HERO / INTERACTIVE LIVE MOCKUP */}
                  <div 
                    id="placeholder-hero-image"
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-[#0070BA]/35 bg-gradient-to-br from-[#F8FAFC] to-[#EBF5FB]/60 p-4 sm:p-5 flex flex-col justify-between relative group overflow-hidden"
                  >
                    {/* Placeholder Badge Indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[#0070BA] font-bold text-[10px] tracking-wider uppercase border border-blue-200 shadow-2xs">
                        <ImageIcon className="w-3 h-3 text-[#0070BA]" />
                        <span>Slot Placeholder Gambar</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Rasio 4:3
                      </span>
                    </div>

                    {/* Interactive Simulated Santri Card Inside Preview */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5 my-auto">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#EBF5FB] border border-blue-200 text-[#0070BA] font-black text-xs flex items-center justify-center shrink-0">
                            MF
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate">
                              Muhammad Fatih Robbani
                            </h5>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              NIS: 20250101 • Juz 30
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          Mumtaz
                        </span>
                      </div>

                      {/* Progress Bar Animated */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-600">
                          <span>Target Harian</span>
                          <span className="font-bold font-mono text-slate-800">15 / 15 Baris (100%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div className="hero-progress-fill h-full rounded-full bg-emerald-600 transition-all duration-700" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="truncate">Setoran: Surah An-Naba' (1-15)</span>
                        <span className="text-[#0070BA] font-semibold shrink-0">Baru Saja</span>
                      </div>
                    </div>

                    {/* Bottom Helper Note inside Placeholder */}
                    <div className="text-center pt-1">
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Area gambar preview dasbor mutaba'ah santri.
                      </p>
                    </div>
                  </div>

                  {/* Floating Micro-Card Tag (GPU-Accelerated Micro Animation) */}
                  <div className="hero-float-card animate-float-gpu mt-3 bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-2xs text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">Target Mutqin Tercapai</span>
                        <span className="text-[10px] text-slate-500">100% Setoran Hari Ini Terverifikasi</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Lengkap
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT & STATS BANNER */}
      <section className="py-6 sm:py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="stat-item bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs hover:-translate-y-1 hover:shadow-xs transition-all duration-300 flex flex-col justify-center">
              <span className="font-mono text-xl sm:text-3xl font-black text-[#0070BA] block">
                30 Juz
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 block leading-tight">
                Ziyadah &amp; Muroja'ah
              </span>
            </div>
            <div className="stat-item bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs hover:-translate-y-1 hover:shadow-xs transition-all duration-300 flex flex-col justify-center">
              <span className="font-mono text-xl sm:text-3xl font-black text-emerald-700 block">
                100%
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 block leading-tight">
                Transparansi ke Wali
              </span>
            </div>
            <div className="stat-item bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs hover:-translate-y-1 hover:shadow-xs transition-all duration-300 flex flex-col justify-center">
              <span className="font-mono text-xl sm:text-3xl font-black text-slate-900 block">
                &lt; 10 Detik
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 block leading-tight">
                Input Cepat per Santri
              </span>
            </div>
            <div className="stat-item bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs hover:-translate-y-1 hover:shadow-xs transition-all duration-300 flex flex-col justify-center">
              <span className="font-mono text-xl sm:text-3xl font-black text-indigo-600 block">
                Multi-Room
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 block leading-tight">
                Halaqoh Mandiri
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FITUR UTAMA (Grid Cards - Layout Referensi Gambar 1 Bawah dengan Hover Interaktif) */}
      <section id="fitur" className="py-10 sm:py-20 lg:py-24 border-b border-slate-200 bg-white cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Section Header */}
          <div className="feature-header text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0070BA] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Fitur Terpadu
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Seluruh Kebutuhan Mutaba'ah dalam Satu Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Didesain khusus untuk ritme pondok tahfidz yang menuntut kecepatan, kepraktisan, serta keterbukaan informasi bagi orang tua santri.
            </p>
          </div>

          {/* Feature Grid: 4 Cards (2x2 pada Mobile, 4 kolom pada Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {/* Card 1 */}
            <div className="feature-card group bg-[#F8FAFC] border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 hover:border-[#0070BA]/50 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0070BA] border border-blue-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0070BA] group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0070BA] leading-snug transition-colors">
                  Ziyadah &amp; Muroja'ah
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat juz, surah, nomor baris, dan predikat nilai santri secara presisi.
                </p>
              </div>
              <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-[#0070BA] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Presisi nomor baris</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-card group bg-[#F8FAFC] border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 hover:border-emerald-400 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Send className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 leading-snug transition-colors">
                  Laporan WhatsApp Otomatis
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kirim rincian hafalan harian langsung ke WhatsApp orang tua tanpa simpan nomor manual.
                </p>
              </div>
              <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Pesan rapi resmi</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-card group bg-[#F8FAFC] border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 hover:border-indigo-400 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Layers className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 leading-snug transition-colors">
                  Manajemen Multi-Halaqoh
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola banyak ruang kelas dengan kode unik 6-karakter dan guru pendamping.
                </p>
              </div>
              <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-indigo-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Kode join unik</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="feature-card group bg-[#F8FAFC] border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 hover:border-amber-400 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <Printer className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 leading-snug transition-colors">
                  Target &amp; Rapor Cetak
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pantau statistik target baris santri dan cetak rapor tahfidz format resmi.
                </p>
              </div>
              <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-amber-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Format cetak resmi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEEP DIVE FEATURE 1: LAPORAN WHATSAPP DENGAN SIMULATOR INTERAKTIF (Layout Referensi Gambar 2 Atas) */}
      <section id="laporan-wa" className="py-10 sm:py-20 lg:py-24 border-b border-slate-200 bg-[#F8FAFC] cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="wa-left-col lg:col-span-6 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Konektivitas Wali Santri</span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Hubungkan Perkembangan Hafalan Langsung ke WhatsApp Wali
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kekhawatiran orang tua santri terjawab dengan keterbukaan laporan mutaba'ah harian. ITQAN secara otomatis merangkai data setoran hari ini, sisa target, serta catatan evaluasi ustadz menjadi pesan WhatsApp resmi yang sopan dan terstruktur.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Pesan Terformat Otomatis:</strong> Mencantumkan nama santri, surah, capaian baris, dan predikat (Mumtaz/Jayyid/I'adah).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Satu Klik Terkirim:</strong> Membuka aplikasi WhatsApp resmi langsung ke nomor wali santri.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Penanda Terkirim:</strong> Status laporan diperbarui sehingga ustadz mengetahui wali mana yang belum dikirimi kabar hari ini.
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  onClick={() => navigate(isLoggedIn ? '/beranda' : '/signup')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Coba Fitur Laporan WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Right Interactive Simulator inside Placeholder Frame */}
            <div className="wa-right-col lg:col-span-6">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                {/* Simulator Tab Selector */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setWaTab('ziyadah')}
                      className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        waTab === 'ziyadah'
                          ? 'text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {waTab === 'ziyadah' && (
                        <motion.div
                          layoutId="active-wa-preview-pill"
                          className="absolute inset-0 bg-white rounded-md shadow-2xs"
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      <span className="relative z-10">Pesan Ziyadah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaTab('murojaah')}
                      className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        waTab === 'murojaah'
                          ? 'text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {waTab === 'murojaah' && (
                        <motion.div
                          layoutId="active-wa-preview-pill"
                          className="absolute inset-0 bg-white rounded-md shadow-2xs"
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      <span className="relative z-10">Pesan Muroja'ah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaTab('harian')}
                      className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        waTab === 'harian'
                          ? 'text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {waTab === 'harian' && (
                        <motion.div
                          layoutId="active-wa-preview-pill"
                          className="absolute inset-0 bg-white rounded-md shadow-2xs"
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      <span className="relative z-10">Rekap Harian</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Interactive Preview
                  </span>
                </div>

                {/* PLACEHOLDER GAMBAR FEATURE 1 DENGAN TAMPILAN WA AKTIF */}
                <div
                  id="placeholder-feature-wa"
                  className="rounded-xl border-2 border-dashed border-emerald-300/70 bg-[#EFEAE2] p-4 sm:p-5 space-y-3 relative overflow-hidden"
                >
                  {/* Watermark / Badge Info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      Slot Gambar: Preview WhatsApp
                    </span>
                    <span className="font-mono">Chat Room: +62 812-3456-7890</span>
                  </div>

                  {/* Animated WhatsApp Message Bubble */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={waTab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-xs max-w-sm ml-1 space-y-2 border border-slate-200/80 font-sans text-xs text-slate-800 leading-relaxed"
                    >
                      {waTab === 'ziyadah' && (
                        <>
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] text-emerald-800">
                            *SETORAN HAFALAN BARU (ZIYADAH)*
                          </div>
                          <p className="text-[11px]">
                            Assalamu'alaikum Yth. Wali dari ananda <strong>*Muhammad Fatih*</strong>,
                          </p>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-0.5">
                            <p>• <strong>Surah:</strong> An-Naba' (Juz 30)</p>
                            <p>• <strong>Halaman:</strong> Hal 582 (15 baris)</p>
                            <p>• <strong>Nilai:</strong> <span className="font-bold text-emerald-700">*Mumtaz*</span></p>
                            <p>• <strong>Catatan:</strong> Makhraj tajwid sangat jelas, lancar.</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Ustadz Ahmad Fauzi</span>
                            <span className="text-emerald-600 font-bold">07:15 WIB ✓✓</span>
                          </div>
                        </>
                      )}

                      {waTab === 'murojaah' && (
                        <>
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] text-emerald-800">
                            *SETORAN PENGULANGAN (MUROJA'AH)*
                          </div>
                          <p className="text-[11px]">
                            Assalamu'alaikum Yth. Wali dari ananda <strong>*Muhammad Fatih*</strong>,
                          </p>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-0.5">
                            <p>• <strong>Muroja'ah:</strong> Juz 29 (Surah Al-Mulk s/d Al-Qalam)</p>
                            <p>• <strong>Jumlah:</strong> 30 baris pengulangan</p>
                            <p>• <strong>Nilai:</strong> <span className="font-bold text-emerald-700">*Mumtaz*</span></p>
                            <p>• <strong>Status:</strong> Hafalan mutqin terjaga kuat.</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Ustadz Ahmad Fauzi</span>
                            <span className="text-emerald-600 font-bold">16:40 WIB ✓✓</span>
                          </div>
                        </>
                      )}

                      {waTab === 'harian' && (
                        <>
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px] text-emerald-800">
                            *REKAP MUTABA'AH HARIAN - ITQAN*
                          </div>
                          <p className="text-[11px]">
                            Laporan capaian ananda <strong>*Muhammad Fatih*</strong> hari ini:
                          </p>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-0.5">
                            <p>• <strong>Capaian:</strong> 15 dari 15 Baris Harian</p>
                            <p>• <strong>Status Harian:</strong> <span className="font-bold text-emerald-700">Tercapai (Mumtaz)</span></p>
                            <p>• <strong>Total Riwayat:</strong> 3 Juz Mutqin</p>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            "Terima kasih atas bimbingan dan doa di rumah."
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>ITQAN Tahfidz Terpadu</span>
                            <span className="text-emerald-600 font-bold">17:00 WIB ✓✓</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400">
                    Klik tab di atas untuk menguji simulasi format laporan pesan WhatsApp yang diterima wali santri.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEEP DIVE FEATURE 2: MANAJEMEN HALAQOH DENGAN SWITCHER INTERAKTIF (Layout Referensi Gambar 2 Tengah) */}
      <section id="halaqoh" className="py-10 sm:py-20 lg:py-24 border-b border-slate-200 bg-white cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Interactive Room Switcher Placeholder */}
            <div className="halaqah-left-col lg:col-span-6 order-2 lg:order-1">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                {/* Room Selector Tab */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    {HALAQAH_ROOMS.map((room, idx) => (
                      <button
                        key={room.code}
                        type="button"
                        onClick={() => setActiveRoomIndex(idx)}
                        className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          activeRoomIndex === idx
                            ? 'text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {activeRoomIndex === idx && (
                          <motion.div
                            layoutId="active-halaqah-tab-pill"
                            className="absolute inset-0 bg-[#0070BA] rounded-md shadow-2xs"
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                          />
                        )}
                        <span className="relative z-10">{room.name.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-[#0070BA] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    Multi-Teacher Room
                  </span>
                </div>

                {/* PLACEHOLDER GAMBAR FEATURE 2 DENGAN DATA HALAQOH DINAMIS */}
                <div
                  id="placeholder-feature-halaqah"
                  className="rounded-xl border-2 border-dashed border-[#0070BA]/35 bg-white p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      Slot Gambar: Manajemen Halaqoh
                    </span>
                    <span>Status: Terdaftar Aktif</span>
                  </div>

                  {/* Room Card Preview Dinamis */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentRoom.code}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{currentRoom.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{currentRoom.focus}</p>
                        </div>

                        {/* Join Code Box */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(currentRoom.code)}
                          className="p-1.5 px-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[#0070BA] font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                          title="Klik untuk salin kode join"
                        >
                          <span>{currentRoom.code}</span>
                          {copiedCode === currentRoom.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Room Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pembimbing Utama:</span>
                          <span className="font-semibold text-slate-800">{currentRoom.musyrif}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Guru Pendamping:</span>
                          <span className="font-semibold text-slate-800">{currentRoom.pendamping}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Lokasi Ruangan:</span>
                          <span className="font-semibold text-slate-700">{currentRoom.room}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Target Standar:</span>
                          <span className="font-bold text-emerald-700">{currentRoom.target}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400">
                    Klik nama halaqoh di atas untuk melihat bagaimana ustadz berpindah ruangan dan membagikan kode join.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="halaqah-right-col lg:col-span-6 order-1 lg:order-2 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0070BA] text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Struktur Kelas Terisolasi</span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Fleksibilitas Mengelola Banyak Ruang Halaqoh
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pondok pesantren memiliki beragam jenjang halaqoh. Sistem ITQAN memungkinkan setiap ruang memiliki nama, target kurikulum baris, dan kode unik tersendiri untuk mengundang guru pendamping tanpa saling mencampuri data santri.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0070BA] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Kode Akses Unik (HLQ-XXXX):</strong> Cukup bagikan 6-karakter kode ke ustadz pendamping agar dapat mengampu ruang yang sama.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0070BA] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Daftar Pengajar Terpantau:</strong> Tampilkan siapa saja pembimbing utama dan guru pendamping yang bertugas.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0070BA] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Keluar &amp; Hapus Mandiri:</strong> Pengelolaan halaqoh mandiri dengan pengalihan fallback otomatis jika seluruh ruang ditutup.
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  onClick={() => navigate(isLoggedIn ? '/halaqah' : '/signup')}
                  className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Manajemen Halaqoh</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ALUR KERJA / 3 LANGKAH MUDAH (Layout Referensi Gambar 2) */}
      <section id="cara-kerja" className="py-10 sm:py-20 lg:py-24 border-b border-slate-200 bg-[#F8FAFC] cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Section Header */}
          <div className="workflow-header text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/70 px-3 py-1 rounded-full">
              Alur Penggunaan
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Mulai dalam 3 Langkah Sederhana
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Langsung dapat digunakan melalui peramban web HP maupun komputer tanpa perlu konfigurasi teknis yang membingungkan.
            </p>
          </div>

          {/* 3 Step Cards dengan Efek Hover & Border Elevation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="workflow-card group bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-3 sm:space-y-4 relative hover:-translate-y-1 hover:border-[#0070BA] hover:shadow-xs transition-all duration-300">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0070BA] font-black text-sm sm:text-base flex items-center justify-center border border-blue-200 group-hover:scale-110 group-hover:bg-[#0070BA] group-hover:text-white transition-all duration-300">
                1
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0070BA] transition-colors">
                Pilih atau Buat Halaqoh
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buat nama halaqoh baru dengan target baris standar harian, atau masukkan kode akses dari ustadz pembuat ruang.
              </p>
            </div>

            {/* Step 2 */}
            <div className="workflow-card group bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-3 sm:space-y-4 relative hover:-translate-y-1 hover:border-[#0070BA] hover:shadow-xs transition-all duration-300">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0070BA] font-black text-sm sm:text-base flex items-center justify-center border border-blue-200 group-hover:scale-110 group-hover:bg-[#0070BA] group-hover:text-white transition-all duration-300">
                2
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0070BA] transition-colors">
                Input Setoran Harian
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih santri yang menyetor, tentukan ziyadah atau muroja'ah, masukkan surah &amp; baris, lalu pilih predikat penilaian.
              </p>
            </div>

            {/* Step 3 */}
            <div className="workflow-card group bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-3 sm:space-y-4 relative hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xs transition-all duration-300">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm sm:text-base flex items-center justify-center border border-emerald-200 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                3
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                Kirim Laporan &amp; Evaluasi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Klik tombol kirim WA wali santri dan pantau persentase ketercapaian target halaqoh hari ini di dasbor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ DENGAN TRANSISI AKORDEON HALUS */}
      <section id="faq" className="py-10 sm:py-20 lg:py-24 border-b border-slate-200 bg-white cv-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="faq-header text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0070BA] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Pusat Bantuan
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs text-slate-500">
              Segala hal yang perlu Anda ketahui mengenai sistem mutaba'ah ITQAN.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-item border rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen ? 'border-[#0070BA] bg-white shadow-2xs' : 'border-slate-200 bg-[#F8FAFC] hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer"
                  >
                    <span className={isOpen ? 'text-[#0070BA]' : ''}>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#0070BA]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        transition={{
                          duration: 0.32,
                          ease: [0.16, 1, 0.3, 1],
                          opacity: { duration: 0.2 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION BANNER (Layout Referensi Gambar 2 Bawah) */}
      <section className="py-10 sm:py-16 bg-[#0070BA] text-white relative overflow-hidden">
        {/* Subtle background circle aesthetic */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="cta-inner max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6 relative">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Wujudkan Pengelolaan Tahfidz yang Tertib &amp; Transparan
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Dukung santri mencapai target mutqin hafalan Al-Qur'an dengan sistem mutaba'ah terpadu yang mempermudah muhaffizh dan menentramkan hati wali santri.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              onClick={() => navigate(isLoggedIn ? '/beranda' : '/signup')}
              className="w-full sm:w-auto h-11 px-7 bg-white text-[#0070BA] hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isLoggedIn ? 'Buka Dasbor Mutaba\'ah' : 'Daftar Akun Muhaffizh'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto h-11 px-6 border-2 border-white/80 bg-transparent hover:bg-white/15 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Masuk Portal</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/favicon.svg"
                  alt="ITQAN"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <span className="font-bold text-base text-white tracking-tight">
                  ITQAN
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Sistem Mutaba'ah &amp; Evaluasi Tahfidz Terpadu untuk Pondok Pesantren, Rumah Tahfidz, dan Halaqoh Mandiri.
              </p>
              <span className="text-[11px] text-slate-500 block font-mono">
                Versi Produksi 1.0 • Built with dedication for Al-Qur'an
              </span>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">
                Navigasi
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={() => scrollToSection('fitur')} className="hover:text-white transition-colors cursor-pointer">
                    Fitur Utama
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('laporan-wa')} className="hover:text-white transition-colors cursor-pointer">
                    Laporan WhatsApp
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('halaqoh')} className="hover:text-white transition-colors cursor-pointer">
                    Manajemen Halaqoh
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('cara-kerja')} className="hover:text-white transition-colors cursor-pointer">
                    Cara Kerja
                  </button>
                </li>
              </ul>
            </div>

            {/* Portal Actions */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">
                Akses Portal
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
                    Masuk Portal Muhaffizh
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/signup')} className="hover:text-white transition-colors cursor-pointer">
                    Daftar Akun Baru
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/beranda')} className="hover:text-white transition-colors cursor-pointer">
                    Dasbor Mutaba'ah
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/pilih-halaqoh')} className="hover:text-white transition-colors cursor-pointer">
                    Pemilihan Ruang Halaqoh
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} ITQAN. Pesantren Mutaba'ah Tahfidz Terpadu.</span>
            <span>Semua Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
