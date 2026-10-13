import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  KeyRound, 
  Copy, 
  Check, 
  Sliders, 
  Target, 
  DoorOpen, 
  Users, 
  User, 
  LogOut,
  AlertCircle,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { storageService, EVENT_DATA_CHANGED } from '../../services/storageService';
import { authService } from '../../services/authService';
import type { HalaqahGroup, Santri, HalaqahMember } from './types';

export const HalaqahManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [myRooms, setMyRooms] = useState<HalaqahGroup[]>(() => storageService.getUserHalaqahList());
  const [activeRoom, setActiveRoom] = useState<HalaqahGroup | null>(() => storageService.getActiveHalaqah());
  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected target for modal actions
  const [roomToLeave, setRoomToLeave] = useState<HalaqahGroup | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<HalaqahGroup | null>(null);

  // Form Create Room
  const [createName, setCreateName] = useState('');
  const [createRoomLoc, setCreateRoomLoc] = useState('');
  const [createTarget, setCreateTarget] = useState<number>(15);
  const [createMusyrif, setCreateMusyrif] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  // Form Join Room
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Form Edit Active Room Parameters
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState<number>(15);
  const [editMusyrif, setEditMusyrif] = useState('');
  const [editRoomLoc, setEditRoomLoc] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [syncSantri, setSyncSantri] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // User identity
  const storedUser = authService.getStoredUser();
  const currentUserScope = storageService.getActiveUserScope();

  // Fallback: Jika tidak ada ruang halaqoh yang dikelola, alihkan ke halaman onboarding / pemilihan halaqoh
  useEffect(() => {
    if (myRooms.length === 0) {
      const timer = setTimeout(() => {
        navigate('/pilih-halaqoh', { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [myRooms.length, navigate]);

  // Sync state on events
  useEffect(() => {
    const handleUpdate = () => {
      const rooms = storageService.getUserHalaqahList();
      setMyRooms(rooms);
      setActiveRoom(storageService.getActiveHalaqah());
      setSantriList(storageService.getSantriList());
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleUpdate);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleUpdate);
  }, []);

  // Update edit form when activeRoom changes
  useEffect(() => {
    if (activeRoom) {
      setEditName(activeRoom.name || '');
      setEditTarget(activeRoom.targetDailyLines || 15);
      setEditMusyrif(activeRoom.musyrifName || '');
      setEditRoomLoc(activeRoom.room || '');
      setEditDesc(activeRoom.description || '');
    }
  }, [activeRoom]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kode halaqoh "${code}" disalin!`, {
      description: 'Bagikan kode ini ke musyrif lain agar dapat bergabung.',
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSwitchActiveRoom = (room: HalaqahGroup) => {
    storageService.setActiveHalaqah(room.id);
    setActiveRoom(room);
    toast.success(`Aktif di ${room.name}`, {
      description: 'Data santri dan laporan kini disesuaikan dengan halaqoh ini.',
    });
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Nama halaqoh wajib diisi.');
      return;
    }

    const created = storageService.createHalaqahRoom({
      name: createName.trim(),
      room: createRoomLoc.trim() || undefined,
      targetDailyLines: createTarget || 15,
      musyrifName: createMusyrif.trim() || undefined,
      description: createDesc.trim() || undefined,
    });

    setMyRooms(storageService.getUserHalaqahList());
    setActiveRoom(created);
    setIsCreateModalOpen(false);

    // Reset Form
    setCreateName('');
    setCreateRoomLoc('');
    setCreateTarget(15);
    setCreateMusyrif('');
    setCreateDesc('');

    toast.success(`Ruang halaqoh "${created.name}" berhasil dibuat!`, {
      description: `Kode Join Anda: ${created.code}`,
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) {
      toast.error('Masukkan kode halaqoh.');
      return;
    }

    setIsJoining(true);
    const result = storageService.joinHalaqahByCode(clean);
    setIsJoining(false);

    if (result.success && result.halaqah) {
      setMyRooms(storageService.getUserHalaqahList());
      setActiveRoom(result.halaqah);
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
      toast.success(`Berhasil bergabung ke ${result.halaqah.name}!`, {
        description: 'Anda sekarang memiliki akses penuh untuk mengampu santri di halaqoh ini.',
      });
    } else {
      toast.error(result.error || 'Gagal bergabung ke halaqoh.');
    }
  };

  // Buka Modal Keluar Halaqoh
  const handleOpenLeaveModal = (room: HalaqahGroup) => {
    setRoomToLeave(room);
    setIsLeaveModalOpen(true);
  };

  // Konfirmasi Keluar Halaqoh
  const handleConfirmLeave = () => {
    if (!roomToLeave) return;
    const res = storageService.leaveHalaqahRoom(roomToLeave.id);
    setIsLeaveModalOpen(false);
    const remaining = storageService.getUserHalaqahList();
    setMyRooms(remaining);
    setActiveRoom(storageService.getActiveHalaqah());
    setRoomToLeave(null);

    if (res.remainingCount === 0 || remaining.length === 0) {
      toast.info(`Anda telah keluar dari ${roomToLeave.name}. Mengalihkan ke pemilihan halaqoh...`);
      navigate('/pilih-halaqoh', { replace: true });
    } else {
      toast.success(`Anda telah keluar dari ${roomToLeave.name}.`);
    }
  };

  // Buka Modal Hapus Halaqoh
  const handleOpenDeleteModal = (room: HalaqahGroup) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  // Konfirmasi Hapus Halaqoh
  const handleConfirmDelete = () => {
    if (!roomToDelete) return;
    const res = storageService.deleteHalaqahRoom(roomToDelete.id);
    setIsDeleteModalOpen(false);
    const remaining = storageService.getUserHalaqahList();
    setMyRooms(remaining);
    setActiveRoom(storageService.getActiveHalaqah());
    setRoomToDelete(null);

    if (res.remainingCount === 0 || remaining.length === 0) {
      toast.success(`Ruang halaqoh "${roomToDelete.name}" berhasil dihapus.`);
      navigate('/pilih-halaqoh', { replace: true });
    } else {
      toast.success(`Ruang halaqoh "${roomToDelete.name}" berhasil dihapus.`);
    }
  };

  const handleSaveActiveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    if (!editName.trim()) {
      toast.error('Nama halaqoh tidak boleh kosong.');
      return;
    }

    setIsSavingEdit(true);
    const updated = storageService.updateHalaqah(
      activeRoom.id,
      {
        name: editName.trim(),
        targetDailyLines: editTarget,
        musyrifName: editMusyrif.trim(),
        room: editRoomLoc.trim(),
        description: editDesc.trim(),
      },
      syncSantri
    );
    setIsSavingEdit(false);

    if (updated) {
      setActiveRoom(updated);
      setMyRooms(storageService.getUserHalaqahList());
      toast.success(`Parameter halaqoh "${updated.name}" berhasil disimpan!`);
    }
  };

  const getSantriCount = (roomId: string, roomName: string) => {
    return santriList.filter(
      (s) => s.halaqahId === roomId || (s.halaqahName && s.halaqahName.toLowerCase() === roomName.toLowerCase())
    ).length;
  };

  // Anggota muhaffizh halaqoh aktif
  const activeMembers: HalaqahMember[] = activeRoom
    ? storageService.getHalaqahMembers(activeRoom.id)
    : [];

  // Fallback View jika user saat ini tidak memiliki halaqoh yang dikelola
  if (myRooms.length === 0) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-10 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Belum Ada Ruang Halaqoh yang Dikelola
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda saat ini belum mengampu atau bergabung ke ruang halaqoh manapun. Silakan buat ruang halaqoh baru atau gabung menggunakan kode akses untuk memulai mutaba'ah santri.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0070BA] mr-1.5" />
              <span>Gabung via Kode</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto h-9 text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Buat Halaqoh Baru</span>
            </Button>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/pilih-halaqoh')}
              className="text-xs font-semibold text-[#0070BA] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Layar Pemilihan Ruang Halaqoh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Buat Ruang */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0070BA]" />
                <span>Buat Ruang Halaqoh Baru</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Sistem akan membuat ruang baru dan menghasilkan kode unik untuk halaqoh Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Halaqoh <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Contoh: Halaqoh Al-Fatih"
                  className="text-xs h-9"
                />
              </div>
              <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="text-xs h-9 border-slate-300">
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-9 px-4 font-semibold">
                  Buat Ruang Halaqoh
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Gabung via Kode */}
        <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
          <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0070BA]" />
                <span>Gabung ke Ruang Halaqoh Lain</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Masukkan kode akses halaqoh yang Anda dapatkan dari musyrif pembimbing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoinRoom} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kode Akses Halaqoh <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  autoFocus
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: HLQ-ABU-01"
                  className="text-sm font-mono tracking-widest font-bold h-10 uppercase"
                />
              </div>
              <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsJoinModalOpen(false)} className="text-xs h-9 border-slate-300">
                  Batal
                </Button>
                <Button type="submit" disabled={isJoining || !joinCodeInput.trim()} size="sm" className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-9 px-4 font-semibold">
                  {isJoining ? 'Memeriksa...' : 'Verifikasi & Bergabung'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0070BA]" />
            <span>Manajemen Ruang Halaqoh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola ruang kelas tahfidz Anda, pantau daftar muhaffizh pembimbing, bagikan kode akses, atau keluar/hapus ruang halaqoh.
          </p>
        </div>

        {/* Action Buttons: Buat & Gabung */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsJoinModalOpen(true)}
            className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Gabung via Kode</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Halaqoh Baru</span>
          </Button>
        </div>
      </div>

      {/* 2. Spotlight Banner: Halaqoh Aktif & Kode Akses */}
      {activeRoom ? (
        <div className="bg-white border border-blue-200/90 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Info Halaqoh Aktif */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeRoom.name}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Sedang Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeRoom.description || 'Kelompok halaqoh tahfidz reguler dan mutaba\'ah terpadu.'}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <User className="w-3.5 h-3.5 text-[#0070BA]" />
                  <span>{activeRoom.musyrifName || 'Pembimbing'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeRoom.room || 'Ruangan Belum Diatur'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target: <strong>{activeRoom.targetDailyLines || 15} Baris/hari</strong></span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Santri: <strong>{getSantriCount(activeRoom.id, activeRoom.name)} santri</strong></span>
                </span>
              </div>
            </div>

            {/* Kotak Kode Akses / Join Code */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-center shrink-0 min-w-[260px] space-y-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Kode Akses / Join Room
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-[#0070BA] tracking-widest bg-white px-3 py-1.5 rounded-lg select-all border border-blue-200 shadow-2xs">
                {activeRoom.code}
              </div>
              <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-tight">
                Bagikan kode ini kepada musyrif lain agar dapat bergabung ke halaqoh ini.
              </p>
              <button
                type="button"
                onClick={() => handleCopyCode(activeRoom.code)}
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {copiedCode === activeRoom.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kode Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Akses</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Anda belum memilih ruang halaqoh aktif.</span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs h-8"
          >
            Buat Sekarang
          </Button>
        </div>
      )}

      {/* 3. Daftar Semua Ruang Halaqoh yang Diikuti Musyrif (Grid Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span>Daftar Ruang Halaqoh Anda</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {myRooms.length} Ruang
            </span>
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Hanya akun Anda dan rekan musyrif dengan kode yang memiliki akses.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {myRooms.map((room) => {
            const isActive = activeRoom?.id === room.id;
            const santriCount = getSantriCount(room.id, room.name);

            return (
              <div
                key={room.id}
                className={`bg-white border rounded-xl p-4 shadow-2xs transition-all relative flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'border-[#0070BA] ring-2 ring-[#0070BA]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0070BA]">
                      {room.code}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1" title={room.name}>
                      {room.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {room.description || 'Tidak ada catatan kurikulum'}
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pembimbing:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={room.musyrifName}>
                        {room.musyrifName || 'Pembimbing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ruangan:</span>
                      <span className="text-slate-700">{room.room || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Harian:</span>
                      <span className="font-bold text-slate-800">{room.targetDailyLines || 15} Baris</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Santri:</span>
                      <span className="font-bold text-[#0070BA] font-mono">{santriCount} santri</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(room.code)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0070BA] hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Salin Kode Akses"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenLeaveModal(room)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer text-xs"
                      title="Keluar dari halaqoh ini"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(room)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs"
                      title="Hapus halaqoh ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isActive ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSwitchActiveRoom(room)}
                        className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 rounded-lg cursor-pointer"
                      >
                        Pilih Aktif
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Dipilih
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DAFTAR MUHAFFIDZ YANG MASUK SITU */}
      {activeRoom && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Daftar Muhaffizh & Pengajar Halaqoh
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#0070BA] font-bold border border-blue-200">
                    {activeMembers.length} Muhaffizh
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Daftar ustadz dan musyrif yang mengampu serta memiliki akses mutaba'ah di ruang <strong>{activeRoom.name}</strong>.
                </p>
              </div>
            </div>

            {/* Quick Action: Keluar dari Ruang Aktif */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenLeaveModal(activeRoom)}
              className="h-8 text-xs font-semibold text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 text-amber-600" />
              <span>Keluar dari Halaqoh Ini</span>
            </Button>
          </div>

          {/* List of Muhaffidz Members */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {activeMembers.map((member, idx) => {
              const isCurrentUser =
                member.id === currentUserScope ||
                (storedUser && member.name.toLowerCase() === storedUser.fullName.toLowerCase());

              const initials = member.name
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase() || 'MH';

              return (
                <div
                  key={member.id || idx}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF5FB] border border-blue-100 text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-[#0070BA] px-1.5 py-0.2 rounded border border-blue-200">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Aktif Mengampu</span>
                        </span>
                        {member.email && <span>• {member.email}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                        member.role === 'utama'
                          ? 'bg-[#EBF5FB] text-[#0070BA] border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {member.role === 'utama' ? 'Pembimbing Utama' : 'Guru Pendamping'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invitation Hint */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0070BA] shrink-0" />
              <span>
                Ingin menambahkan muhaffizh pembimbing lain? Berikan kode join <strong className="font-mono text-[#0070BA]">{activeRoom.code}</strong> kepada ustadz bersangkutan.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(activeRoom.code)}
              className="text-xs font-semibold text-[#0070BA] hover:underline shrink-0 text-left sm:text-right cursor-pointer"
            >
              Salin Kode Join
            </button>
          </div>
        </div>
      )}

      {/* 5. Edit Parameter Halaqoh Aktif */}
      {activeRoom && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Kostumisasi Parameter: {activeRoom.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbarui kurikulum, ruangan, pembimbing, atau target baris harian standar untuk halaqoh aktif ini.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[#0070BA] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Kode: {activeRoom.code}
            </span>
          </div>

          <form onSubmit={handleSaveActiveParameters} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Halaqoh */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Ruang Halaqoh
                </label>
                <Input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Halaqoh Abu Bakar Ash-Shiddiq"
                  className="text-xs h-9"
                />
              </div>

              {/* Target Standar Baris Harian */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Target Baris Standar Harian</span>
                  <span className="text-slate-400 font-normal">Per Santri</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={150}
                    required
                    value={editTarget}
                    onChange={(e) => setEditTarget(parseInt(e.target.value) || 15)}
                    className="text-xs h-9 pr-12 font-bold font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 pointer-events-none">
                    Baris
                  </span>
                </div>
              </div>

              {/* Nama Guru / Pembimbing */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Muhaffizh / Guru Pembimbing
                </label>
                <Input
                  type="text"
                  value={editMusyrif}
                  onChange={(e) => setEditMusyrif(e.target.value)}
                  placeholder="Contoh: Ust. Ahmad Fauzi, Al-Hafizh"
                  className="text-xs h-9"
                />
              </div>

              {/* Lokasi / Ruangan */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Lokasi / Ruangan
                </label>
                <Input
                  type="text"
                  value={editRoomLoc}
                  onChange={(e) => setEditRoomLoc(e.target.value)}
                  placeholder="Contoh: Masjid Utama / Ruang A-101"
                  className="text-xs h-9"
                />
              </div>

              {/* Catatan Kurikulum / Deskripsi */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Deskripsi / Kurikulum Halaqoh
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Catatan kurikulum, fokus juz hafalan, atau target santri..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
                />
              </div>
            </div>

            {/* Checkbox Sync Target ke Santri */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={syncSantri}
                  onChange={(e) => setSyncSantri(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] cursor-pointer"
                />
                <span>
                  Terapkan target harian <strong>{editTarget} baris</strong> ke seluruh santri di halaqoh ini
                </span>
              </label>

              <Button
                type="submit"
                disabled={isSavingEdit}
                className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 6. ZONA BAHAYA: HAPUS RUANG HALAQOH */}
      {activeRoom && (
        <div className="bg-white border border-red-200/90 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-red-900">
                  Zona Bahaya: Hapus Ruang Halaqoh
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">
                  Menghapus ruang halaqoh <strong>"{activeRoom.name}"</strong> secara permanen dari sistem. Kode akses <code className="font-mono text-red-700 bg-red-50 px-1 rounded">{activeRoom.code}</code> dan seluruh data santri di halaqoh ini akan dibersihkan.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleOpenDeleteModal(activeRoom)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 rounded-lg shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Hapus Halaqoh Ini</span>
            </Button>
          </div>
        </div>
      )}

      {/* 7. MODAL: Buat Ruang Halaqoh Baru */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0070BA]" />
              <span>Buat Ruang Halaqoh Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Sistem akan membuat ruang baru dan menghasilkan kode unik yang dapat Anda bagikan ke rekan musyrif.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoom} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Nama Halaqoh <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Contoh: Halaqoh Al-Fatih / Halaqoh Tahfidz 1"
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Standar
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={createTarget}
                    onChange={(e) => setCreateTarget(parseInt(e.target.value) || 15)}
                    className="text-xs h-9 pr-12 font-bold font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                    Baris
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ruangan / Lokasi
                </label>
                <Input
                  type="text"
                  value={createRoomLoc}
                  onChange={(e) => setCreateRoomLoc(e.target.value)}
                  placeholder="Contoh: Masjid Lt. 2"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Deskripsi / Kurikulum
              </label>
              <textarea
                rows={2}
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Target hafalan atau catatan halaqoh..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs h-9 border-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-9 px-4 font-semibold"
              >
                Buat Ruang Halaqoh
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. MODAL: Gabung ke Halaqoh Lain via Kode */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0070BA]" />
              <span>Gabung ke Ruang Halaqoh Lain</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Masukkan kode akses halaqoh yang Anda dapatkan dari musyrif pembuat room.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinRoom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Kode Akses Halaqoh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  autoFocus
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: HLQ-ABU-01 atau HLQ-XXXXXX"
                  className="text-sm font-mono tracking-widest font-bold h-10 border-slate-300 uppercase pl-3"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Format kode biasanya diawali <code className="font-mono text-[#0070BA] font-bold">HLQ-</code> diikuti huruf dan angka unik.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">Kode Bawaan Demo:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setJoinCodeInput('HLQ-ABU-01')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[#0070BA] hover:bg-blue-50 font-bold cursor-pointer"
                >
                  HLQ-ABU-01
                </button>
                <button
                  type="button"
                  onClick={() => setJoinCodeInput('HLQ-UMR-02')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[#0070BA] hover:bg-blue-50 font-bold cursor-pointer"
                >
                  HLQ-UMR-02
                </button>
                <button
                  type="button"
                  onClick={() => setJoinCodeInput('HLQ-UTS-03')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[#0070BA] hover:bg-blue-50 font-bold cursor-pointer"
                >
                  HLQ-UTS-03
                </button>
                <button
                  type="button"
                  onClick={() => setJoinCodeInput('HLQ-ALI-04')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[#0070BA] hover:bg-blue-50 font-bold cursor-pointer"
                >
                  HLQ-ALI-04
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsJoinModalOpen(false)}
                className="text-xs h-9 border-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isJoining || !joinCodeInput.trim()}
                size="sm"
                className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-9 px-4 font-semibold"
              >
                {isJoining ? 'Memeriksa...' : 'Verifikasi & Bergabung'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. MODAL KONFIRMASI: KELUAR DARI HALAQOH */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-amber-600" />
              <span>Keluar dari Ruang Halaqoh</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Konfirmasi untuk menghentikan keikutsertaan Anda di ruang halaqoh ini.
            </DialogDescription>
          </DialogHeader>

          {roomToLeave && (
            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 block">Ruang Halaqoh:</span>
                <span className="font-bold text-sm text-slate-900 block">{roomToLeave.name}</span>
                <span className="text-[11px] font-mono text-[#0070BA] font-semibold">Kode: {roomToLeave.code}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Anda tidak akan lagi dapat menginput setoran atau memantau santri di halaqoh ini. Anda dapat bergabung kembali kapan saja jika memiliki kode akses.
              </p>

              {myRooms.length === 1 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Perhatian: Halaqoh Terakhir Anda</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Ini adalah satu-satunya ruang halaqoh yang Anda kelola. Jika Anda keluar, sistem akan secara otomatis mengalihkan Anda ke halaman untuk membuat atau bergabung ke ruang halaqoh baru.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLeaveModalOpen(false);
                setRoomToLeave(null);
              }}
              className="text-xs h-9 border-slate-300"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmLeave}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-4 font-semibold cursor-pointer"
            >
              Ya, Keluar dari Halaqoh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 10. MODAL KONFIRMASI: HAPUS HALAQOH PERMANEN */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-bold text-red-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Hapus Ruang Halaqoh Permanen</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tindakan ini permanen dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {roomToDelete && (
            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 space-y-1">
                <span className="text-[11px] text-red-600 font-semibold block">Ruang yang akan dihapus:</span>
                <span className="font-bold text-sm text-slate-900 block">{roomToDelete.name}</span>
                <span className="text-[11px] font-mono text-red-700 font-semibold">Kode: {roomToDelete.code}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 text-xs block">Dampak Penghapusan:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                  <li>Kode akses halaqoh akan dinonaktifkan</li>
                  <li>Data santri yang terdaftar di halaqoh ini akan dibersihkan</li>
                  <li>Akses seluruh rekan muhaffizh pada ruang ini akan terputus</li>
                </ul>
              </div>

              {myRooms.length === 1 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Perhatian: Tidak Ada Halaqoh Tersisa</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Setelah ruang ini dihapus, Anda tidak lagi memiliki halaqoh aktif dan akan dialihkan ke halaman pembuatan atau pemilihan halaqoh baru.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setRoomToDelete(null);
              }}
              className="text-xs h-9 border-slate-300"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4 font-semibold cursor-pointer"
            >
              Ya, Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
