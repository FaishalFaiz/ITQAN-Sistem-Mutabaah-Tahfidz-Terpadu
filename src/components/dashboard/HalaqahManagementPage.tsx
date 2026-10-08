import React, { useState, useEffect } from 'react';
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
  CheckCircle2, 
  LogOut,
  AlertCircle
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
import type { HalaqahGroup, Santri } from './types';

export const HalaqahManagementPage: React.FC = () => {
  const [myRooms, setMyRooms] = useState<HalaqahGroup[]>(() => storageService.getUserHalaqahList());
  const [activeRoom, setActiveRoom] = useState<HalaqahGroup | null>(() => storageService.getActiveHalaqah());
  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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

  const currentUserScope = storageService.getActiveUserScope();

  // Sync state on events
  useEffect(() => {
    const handleUpdate = () => {
      setMyRooms(storageService.getUserHalaqahList());
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

  const handleLeaveRoom = (room: HalaqahGroup) => {
    if (myRooms.length <= 1) {
      toast.error('Anda harus memiliki minimal 1 ruang halaqoh.', {
        description: 'Buat halaqoh baru terlebih dahulu sebelum meninggalkan halaqoh ini.',
      });
      return;
    }

    if (window.confirm(`Yakin ingin meninggalkan ruang "${room.name}"? Anda dapat bergabung kembali jika memiliki kode ${room.code}.`)) {
      storageService.leaveHalaqahRoom(room.id);
      setMyRooms(storageService.getUserHalaqahList());
      setActiveRoom(storageService.getActiveHalaqah());
      toast.info(`Anda telah keluar dari ${room.name}.`);
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
            Kelola ruang kelas tahfidz Anda, bagikan kode akses ke musyrif pembimbing lain, atau gabung ke halaqoh yang sudah ada.
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
        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-blue-200/90 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Info Halaqoh Aktif */}
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF5FB] text-[#0070BA] border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Halaqoh Aktif Sedang Diampu</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {activeRoom.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeRoom.description || 'Kelompok halaqoh tahfidz reguler dan mutaba\'ah terpadu.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <User className="w-3.5 h-3.5 text-[#0070BA]" />
                  <span>{activeRoom.musyrifName || 'Pembimbing'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeRoom.room || 'Ruangan Belum Diatur'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target: <strong>{activeRoom.targetDailyLines || 15} Baris/hari</strong></span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Santri: <strong>{getSantriCount(activeRoom.id, activeRoom.name)} santri</strong></span>
                </span>
              </div>
            </div>

            {/* Kotak Kode Akses / Join Code */}
            <div className="bg-white border-2 border-dashed border-[#0070BA]/40 rounded-xl p-3.5 sm:p-4 text-center shrink-0 min-w-[260px] space-y-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Kode Akses / Join Room
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-[#0070BA] tracking-widest bg-[#EBF5FB] px-3 py-1.5 rounded-lg select-all border border-blue-100">
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
            <span>Anda belum memilih atau belum memiliki ruang halaqoh aktif.</span>
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
          <span className="text-xs text-slate-500">
            Hanya akun Anda dan rekan musyrif dengan kode yang memiliki akses.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {myRooms.map((room) => {
            const isActive = activeRoom?.id === room.id;
            const santriCount = getSantriCount(room.id, room.name);
            const isOwner = room.creatorId === currentUserScope || room.creatorId === 'system';

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
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {isOwner ? 'Pembuat' : 'Anggota'}
                      </span>
                    </div>
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
                      <span className="font-semibold text-slate-800">{room.musyrifName || 'Pembimbing'}</span>
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
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(room.code)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0070BA] hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Salin Kode Akses"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Kode</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {myRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleLeaveRoom(room)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs"
                        title="Tinggalkan Halaqoh Ini"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isActive ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSwitchActiveRoom(room)}
                        className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 rounded-lg cursor-pointer"
                      >
                        Jadikan Aktif
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Sedang Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Edit Parameter Halaqoh Aktif */}
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

      {/* 5. MODAL: Buat Ruang Halaqoh Baru */}
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

      {/* 6. MODAL: Gabung ke Halaqoh Lain via Kode */}
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
    </div>
  );
};
