import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  KeyRound, 
  PlusCircle, 
  BookOpen,
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { storageService } from '@/services/storageService';
import { authService } from '@/services/authService';

export const OnboardingHalaqahPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();
  const userName = storedUser?.fullName || 'Muhaffizh';

  // Mode: 'create' | 'join'
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
  const formContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formContentRef.current) {
      gsap.fromTo(
        formContentRef.current,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
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
        description: `Kode Join: ${newRoom.code}. Mengalihkan ke dasbor...`,
      });

      setTimeout(() => {
        navigate('/beranda');
      }, 700);
    } catch {
      toast.error('Gagal membuat halaqoh. Silakan coba kembali.');
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header Branding & Judul Terpusat (Identik dengan Login / Signup) */}
        <div className="text-center mb-6">
          <img
            src="/favicon.svg"
            alt="Logo ITQAN"
            className="inline-block w-12 h-12 rounded-xl shadow-xs mb-3.5 object-contain"
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            Ruang Halaqoh Tahfidz
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Selamat datang, <span className="font-semibold text-slate-700">{userName}</span>. Tentukan halaqoh Anda untuk memulai.
          </p>
        </div>

        {/* Card Form Terpadu */}
        <div className="bg-white py-7 px-5 sm:px-8 border border-slate-200 rounded-2xl shadow-xs space-y-4">
          {/* Switcher Tab Mode (Mirip Tab Segmented Rapi) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMode('create')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMode === 'create'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className={`w-3.5 h-3.5 ${selectedMode === 'create' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
              <span>Buat Ruang Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('join')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMode === 'join'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className={`w-3.5 h-3.5 ${selectedMode === 'join' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
              <span>Masukkan Kode</span>
            </button>
          </div>

          {/* Form Content */}
          <div ref={formContentRef}>
            {selectedMode === 'create' ? (
              /* FORM 1: BUAT RUANG BARU */
              <form onSubmit={handleCreate} className="space-y-3.5">
                {/* Input Nama Ruang */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Nama Ruang Halaqoh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Contoh: Halaqoh Abu Bakar Ash-Shiddiq"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                    />
                  </div>
                </div>

                {/* Target & Lokasi Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Target Harian
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Target className="w-3.5 h-3.5 text-[#0070BA]" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={150}
                        required
                        value={createTarget}
                        onChange={(e) => setCreateTarget(parseInt(e.target.value) || 15)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-12 py-2.5 text-sm font-bold font-mono text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                        Baris
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Ruang / Lokasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={createRoomLoc}
                        onChange={(e) => setCreateRoomLoc(e.target.value)}
                        placeholder="Masjid Lt. 2"
                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Catatan / Deskripsi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Catatan Halaqoh <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="Fokus talaqqi, target juz, atau petunjuk halaqoh..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] transition-colors"
                  />
                </div>

                {/* Tombol Buat Ruang di Bagian Bawah */}
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isCreating ? 'Membuat Ruang...' : 'Buat Ruang & Mulai Mengampu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              /* FORM 2: GABUNG VIA KODE AKSES */
              <form onSubmit={handleJoin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Kode Akses Halaqoh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4 text-[#0070BA]" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="HLQ-ABU-01"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-base font-mono font-bold tracking-widest text-[#0070BA] placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] uppercase transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                    Masukkan kode halaqoh yang dibagikan oleh muhaffizh pembuat ruang untuk mengakses data santri halaqoh tersebut.
                  </p>
                </div>

                {/* Tombol Masuk di Bagian Bawah */}
                <Button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isJoining ? 'Memverifikasi...' : 'Verifikasi & Masuk Halaqoh'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Switcher Bawah (Identik dengan Link Signup/Login) */}
          <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            {selectedMode === 'create' ? (
              <span>
                Punya kode akses dari muhaffizh lain?{' '}
                <button
                  type="button"
                  onClick={() => setSelectedMode('join')}
                  className="font-semibold text-[#0070BA] hover:underline cursor-pointer"
                >
                  Gabung via Kode Akses
                </button>
              </span>
            ) : (
              <span>
                Ingin membuka ruang halaqoh baru?{' '}
                <button
                  type="button"
                  onClick={() => setSelectedMode('create')}
                  className="font-semibold text-[#0070BA] hover:underline cursor-pointer"
                >
                  Buat Ruang Baru
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Tombol Kembali ke Dasbor jika Akun sudah memiliki halaqoh tersimpan */}
        {storageService.getUserHalaqahList().length > 0 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/beranda')}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              ← Lewati &amp; Kembali ke Dasbor ({storageService.getUserHalaqahList().length} Halaqoh Aktif)
            </button>
          </div>
        )}

        {/* Footer Copyright */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} ITQAN. Pesantren Tahfidz Terpadu.
        </p>
      </div>
    </div>
  );
};
