import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  KeyRound, 
  PlusCircle, 
  Plus, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { storageService } from '@/services/storageService';
import { authService } from '@/services/authService';

export const OnboardingHalaqahPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();
  const userName = storedUser?.fullName || 'Muhaffizh';

  // Selection state: 'create' | 'join' | null
  const [selectedMode, setSelectedMode] = useState<'create' | 'join'>('create');

  // Form Create Room
  const [createName, setCreateName] = useState('');
  const [createRoomLoc, setCreateRoomLoc] = useState('');
  const [createTarget, setCreateTarget] = useState<number>(15);
  const [createDesc, setCreateDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form Join Room
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Smooth Tab Switch Animation Ref
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formCardRef.current) {
      gsap.fromTo(
        formCardRef.current,
        { opacity: 0, scale: 0.97, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }
  }, [selectedMode]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Nama halaqoh wajib diisi.');
      return;
    }

    setIsCreating(true);
    try {
      const newRoom = storageService.createHalaqahRoom({
        name: createName.trim(),
        room: createRoomLoc.trim() || undefined,
        targetDailyLines: createTarget || 15,
        musyrifName: userName,
        description: createDesc.trim() || undefined,
      });

      toast.success(`Ruang halaqoh "${newRoom.name}" berhasil dibuat!`, {
        description: `Kode Join Anda: ${newRoom.code}. Mengalihkan ke dasbor...`,
      });

      setTimeout(() => {
        navigate('/beranda');
      }, 700);
    } catch {
      toast.error('Gagal membuat halaqoh. Coba lagi.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (!clean) {
      toast.error('Silakan masukkan kode halaqoh.');
      return;
    }

    setIsJoining(true);
    const result = storageService.joinHalaqahByCode(clean);
    setIsJoining(false);

    if (result.success && result.halaqah) {
      toast.success(`Berhasil bergabung ke "${result.halaqah.name}"!`, {
        description: 'Mengalihkan ke dasbor mutaba\'ah...',
      });
      setTimeout(() => {
        navigate('/beranda');
      }, 700);
    } else {
      toast.error(result.error || 'Kode halaqoh tidak valid.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header Branding & Welcome */}
        <div className="text-center space-y-2">
          <img
            src="/favicon.svg"
            alt="Logo ITQAN"
            className="inline-block w-12 h-12 rounded-xl shadow-2xs object-contain"
          />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Selamat Datang di ITQAN, Ust. {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Untuk memulai mutaba'ah tahfidz, silakan tentukan ruang halaqoh Anda. Anda dapat membuat ruang sendiri atau bergabung ke ruang halaqoh lain menggunakan kode akses.
          </p>
        </div>

        {/* 2 Mode Tabs Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setSelectedMode('create')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              selectedMode === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${selectedMode === 'create' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
            <span>1. Buat Ruang Halaqoh Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('join')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              selectedMode === 'join'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className={`w-4 h-4 ${selectedMode === 'join' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
            <span>2. Gabung via Kode Akses</span>
          </button>
        </div>

        {/* Card Form Container dengan Animasi Smooth Extend & Mengecil */}
        <div ref={formCardRef} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          {/* MODE 1: BUAT RUANG HALAQOH BARU */}
          {selectedMode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0070BA]" />
                  <span>Formulir Pembuatan Ruang Halaqoh</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sistem otomatis meng-generate kode halaqoh yang siap Anda bagikan kepada musyrif pendamping.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nama Ruang Halaqoh <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Contoh: Halaqoh Al-Fatih / Halaqoh Tahfidz Reguler 1"
                    className="text-xs h-10 border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Target Harian Standar
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={150}
                        required
                        value={createTarget}
                        onChange={(e) => setCreateTarget(parseInt(e.target.value) || 15)}
                        className="text-xs h-10 pr-12 font-bold font-mono border-slate-300"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
                        Baris/hari
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Ruangan / Lokasi Belajar
                    </label>
                    <Input
                      type="text"
                      value={createRoomLoc}
                      onChange={(e) => setCreateRoomLoc(e.target.value)}
                      placeholder="Contoh: Masjid Lt. 2 / Ruang 101"
                      className="text-xs h-10 border-slate-300"
                    />
                  </div>
                </div>



                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Catatan Kurikulum / Deskripsi
                  </label>
                  <textarea
                    rows={2}
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="Fokus talaqqi, target juz, atau petunjuk halaqoh..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold text-xs h-11 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>{isCreating ? 'Membuat Ruang...' : 'Buat Ruang & Mulai Mengampu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* MODE 2: GABUNG KE HALAQOH LAIN VIA KODE */}
          {selectedMode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0070BA]" />
                  <span>Masukkan Kode Akses Halaqoh</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dapatkan kode unik dari musyrif pembuat halaqoh untuk mengakses data santri halaqoh tersebut.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Kode Akses Halaqoh <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    autoFocus
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: HLQ-ABU-01 atau HLQ-8K2N9P"
                    className="text-base font-mono tracking-widest font-black h-12 border-slate-300 uppercase pl-3 text-[#0070BA]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Kode case-insensitive (huruf kapital dan angka).
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="w-full bg-[#0070BA] hover:bg-[#005C9E] text-white font-bold text-xs h-11 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>{isJoining ? 'Memverifikasi Kode...' : 'Verifikasi & Masuk Halaqoh'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>



        {/* Shortcut to Dashboard if already has rooms */}
        {storageService.getUserHalaqahList().length > 0 && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate('/beranda')}
              className="text-xs font-semibold text-[#0070BA] hover:text-[#005C9E] hover:underline cursor-pointer"
            >
              ← Kembali ke Dasbor ({storageService.getUserHalaqahList().length} Halaqoh Terdaftar)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
