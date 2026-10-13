import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
      }, 600);
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
      }, 600);
    } else {
      toast.error(result.error || 'Kode halaqoh tidak valid.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header Branding & Judul Terpusat */}
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
          {/* Switcher Tab Mode (Segmented Control dengan Spring Physics) */}
          <div className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs select-none">
            <button
              type="button"
              onClick={() => setSelectedMode('create')}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedMode === 'create'
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {selectedMode === 'create' && (
                <motion.div
                  layoutId="active-onboarding-pill"
                  className="absolute inset-0 rounded-lg bg-white shadow-xs"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <PlusCircle className={`w-3.5 h-3.5 ${selectedMode === 'create' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
                <span>Buat Ruang Baru</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('join')}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedMode === 'join'
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {selectedMode === 'join' && (
                <motion.div
                  layoutId="active-onboarding-pill"
                  className="absolute inset-0 rounded-lg bg-white shadow-xs"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <KeyRound className={`w-3.5 h-3.5 ${selectedMode === 'join' ? 'text-[#0070BA]' : 'text-slate-400'}`} />
                <span>Masukkan Kode</span>
              </span>
            </button>
          </div>

          {/* Form Content - Smooth Dynamic Height & Directional Transition */}
          <motion.div 
            layout 
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {selectedMode === 'create' ? (
                /* FORM 1: BUAT RUANG BARU */
                <motion.form
                  key="form-create"
                  onSubmit={handleCreate}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3.5"
                >
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
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isCreating ? 'Membuat Ruang...' : 'Buat Ruang & Mulai Mengampu'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                /* FORM 2: GABUNG VIA KODE AKSES */
                <motion.form
                  key="form-join"
                  onSubmit={handleJoin}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3.5"
                >
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
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isJoining || !joinCode.trim()}
                      className="w-full h-10 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isJoining ? 'Memverifikasi...' : 'Verifikasi & Masuk Halaqoh'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Switcher Bawah (Link Cepat) */}
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
