import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Settings, 
  Sliders, 
  MessageSquare, 
  Copy, 
  Check, 
  Layers, 
  Plus, 
  Target, 
  User, 
  MapPin, 
  Clock, 
  Users,
  Mail,
  ShieldCheck,
  Server,
  Terminal,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { storageService, EVENT_DATA_CHANGED } from '../../services/storageService';
import { resolveHalaqahUUID } from '../../services/syncService';
import { emailValidationService, type EmailValidationResult } from '../../services/emailValidationService';
import type { HalaqahGroup, WATemplateConfig, Santri } from './types';

export const PengaturanView: React.FC = () => {
  // Halaqah state
  const [halaqahList, setHalaqahList] = useState<HalaqahGroup[]>(() => storageService.getHalaqahList());
  const [activeHalaqah, setActiveHalaqah] = useState<HalaqahGroup>(() => storageService.getActiveHalaqah());
  const [santriList, setSantriList] = useState<Santri[]>(() => storageService.getSantriList());

  // Selected Halaqoh yang sedang dikostumisasi di Section 1
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<string>(() => {
    const act = storageService.getActiveHalaqah();
    return act?.id || halaqahList[0]?.id || '';
  });

  // Form Fields untuk halaqoh terpilih
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState<number>(15);
  const [formMusyrif, setFormMusyrif] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSessionTime, setFormSessionTime] = useState('');
  const [syncSantriTarget, setSyncSantriTarget] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Form Tambah Halaqoh Baru di Section 2
  const [newHalaqahName, setNewHalaqahName] = useState('');
  const [newHalaqahTarget, setNewHalaqahTarget] = useState<number>(15);
  const [newHalaqahMusyrif, setNewHalaqahMusyrif] = useState('');
  const [newHalaqahRoom, setNewHalaqahRoom] = useState('');
  const [newHalaqahDesc, setNewHalaqahDesc] = useState('');
  const [newHalaqahSessionTime, setNewHalaqahSessionTime] = useState('');

  // WA Template config state
  const [waTemplates, setWaTemplates] = useState<WATemplateConfig>(storageService.getWATemplateConfig());
  const [templatesSaved, setTemplatesSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email Diagnostic Lab State
  const [testEmail, setTestEmail] = useState('muhaffizh@itqan.sch.id');
  const [testResult, setTestResult] = useState<EmailValidationResult | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const handleRunEmailTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testEmail.trim()) return;
    setIsTestingEmail(true);
    try {
      const res = await emailValidationService.validateEmail(testEmail);
      setTestResult(res);
      toast.info('Hasil validasi email diperbarui!', {
        description: `Skor deliverability: ${res.deliverabilityScore}/100 • ${res.verdict.toUpperCase()}`,
      });
    } catch {
      toast.error('Gagal menjalankan pengujian email.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Sinkronisasi form saat selectedHalaqahId berganti
  useEffect(() => {
    const target = halaqahList.find((h) => h.id === selectedHalaqahId) || halaqahList[0];
    if (target) {
      setFormName(target.name || '');
      setFormTarget(target.targetDailyLines || 15);
      setFormMusyrif(target.musyrifName || '');
      setFormRoom(target.room || '');
      setFormDescription(target.description || '');
      setFormSessionTime(target.sessionTime || '');
    }
  }, [selectedHalaqahId, halaqahList]);

  // Sinkronisasi realtime saat ada event storage di tab / komponen lain
  useEffect(() => {
    const handleUpdate = () => {
      setHalaqahList(storageService.getHalaqahList());
      setActiveHalaqah(storageService.getActiveHalaqah());
      setSantriList(storageService.getSantriList());
    };

    window.addEventListener(EVENT_DATA_CHANGED, handleUpdate);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, handleUpdate);
  }, []);

  // Helper cek santri di suatu halaqoh
  const isSantriInHalaqah = (santri: Santri, halaqah: HalaqahGroup): boolean => {
    if (santri.halaqahId && (santri.halaqahId === halaqah.id || santri.halaqahId === resolveHalaqahUUID(halaqah.name))) {
      return true;
    }
    if (!santri.halaqahName || !halaqah.name) return false;
    const sNorm = santri.halaqahName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hNorm = halaqah.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return sNorm.includes(hNorm) || hNorm.includes(sNorm);
  };

  const getSantriCount = (halaqah: HalaqahGroup) => {
    return santriList.filter((s) => isSantriInHalaqah(s, halaqah)).length;
  };

  const currentEditingHalaqah = halaqahList.find((h) => h.id === selectedHalaqahId) || halaqahList[0];
  const selectedHalaqahSantriCount = currentEditingHalaqah ? getSantriCount(currentEditingHalaqah) : 0;

  // Handler Simpan Kostumisasi Halaqoh
  const handleSaveHalaqahCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHalaqahId || !formName.trim()) return;

    const updated = storageService.updateHalaqah(
      selectedHalaqahId,
      {
        name: formName.trim(),
        targetDailyLines: Math.max(1, Number(formTarget) || 15),
        musyrifName: formMusyrif.trim(),
        room: formRoom.trim(),
        description: formDescription.trim(),
        sessionTime: formSessionTime.trim(),
      },
      syncSantriTarget
    );

    if (updated) {
      setHalaqahList(storageService.getHalaqahList());
      setActiveHalaqah(storageService.getActiveHalaqah());
      setSantriList(storageService.getSantriList());
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);

      toast.success(
        `Parameter ${updated.name} berhasil disimpan!${
          syncSantriTarget ? ` Target ${formTarget} baris diterapkan ke ${selectedHalaqahSantriCount} santri.` : ''
        }`
      );
    }
  };

  // Handler Pilih Halaqoh untuk diedit
  const handleSelectHalaqahToEdit = (id: string, scrollUp: boolean = false) => {
    setSelectedHalaqahId(id);
    if (scrollUp) {
      const el = document.getElementById('parameter-halaqoh-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Handler Beralih Ampu Halaqoh
  const handleSwitchActive = (id: string) => {
    storageService.setActiveHalaqah(id);
    const updatedActive = storageService.getActiveHalaqah();
    setActiveHalaqah(updatedActive);
    setSelectedHalaqahId(id);
    toast.success(`Halaqoh aktif sekarang: ${updatedActive.name}`);
  };

  // Handler Tambah Halaqoh Baru
  const handleAddNewHalaqah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHalaqahName.trim()) return;

    const created = storageService.addHalaqah({
      name: newHalaqahName.trim(),
      targetDailyLines: Math.max(1, Number(newHalaqahTarget) || 15),
      musyrifName: newHalaqahMusyrif.trim() || 'Pembimbing Halaqoh',
      room: newHalaqahRoom.trim() || undefined,
      description: newHalaqahDesc.trim() || undefined,
      sessionTime: newHalaqahSessionTime.trim() || undefined,
    });

    const refreshedList = storageService.getHalaqahList();
    setHalaqahList(refreshedList);
    setSelectedHalaqahId(created.id);

    // Reset Form
    setNewHalaqahName('');
    setNewHalaqahTarget(15);
    setNewHalaqahMusyrif('');
    setNewHalaqahRoom('');
    setNewHalaqahDesc('');
    setNewHalaqahSessionTime('');

    toast.success(`Halaqoh baru "${created.name}" berhasil ditambahkan!`);
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveWATemplateConfig(waTemplates);
    setTemplatesSaved(true);
    setTimeout(() => setTemplatesSaved(false), 2500);
    toast.success('Template pesan WhatsApp berhasil diperbarui');
  };

  const handleCopySnippet = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data santri dan setoran? Database lokal akun ini akan dikosongkan.')) {
      storageService.resetDatabase();
      toast.info('Seluruh data mutabaah dan santri telah dibersihkan.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman Pengaturan */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0070BA]" />
          <span>Pengaturan Halaqoh &amp; Format Pesan WhatsApp</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kostumisasi target harian, guru pembimbing, ruang, kurikulum tiap halaqoh, serta format pesan WhatsApp ke wali santri.
        </p>
      </div>

      {/* 1. SECTION: Parameter & Kostumisasi Tiap Halaqoh */}
      <div id="parameter-halaqoh-section" className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Parameter &amp; Kostumisasi Tiap Halaqoh
              </h3>
              <p className="text-[11px] text-slate-500">
                Tentukan target baris standar harian, pembimbing, ruangan, dan fokus kurikulum untuk masing-masing kelompok
              </p>
            </div>
          </div>

          {/* Status Halaqoh Aktif */}
          {activeHalaqah?.id === selectedHalaqahId ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Sedang Diampu Saat Ini
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSwitchActive(selectedHalaqahId)}
              className="text-xs h-8 border-slate-200 text-[#0070BA] hover:bg-[#EBF5FB] cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Ampu Halaqoh Ini
            </Button>
          )}
        </div>

        {/* Tab Selector: Pilih Halaqoh yang Sedang Dikostumisasi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Pilih Kelompok Halaqoh yang Ingin Dikostumisasi:
          </label>
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            {halaqahList.map((h) => {
              const isSelected = h.id === selectedHalaqahId;
              const isActive = h.id === activeHalaqah?.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleSelectHalaqahToEdit(h.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#0070BA] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{h.name}</span>
                  {isActive && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#EBF5FB] text-[#0070BA] border border-[#D6EAF8]'
                      }`}
                    >
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Kostumisasi Parameter Halaqoh Terpilih */}
        <form onSubmit={handleSaveHalaqahCustomization} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Target Harian Standar */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Target Harian Standar (Baris/Hari) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={formTarget}
                  onChange={(e) => setFormTarget(Number(e.target.value))}
                  className="text-xs h-9 bg-white pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium pointer-events-none">
                  Baris
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Setara {(formTarget / 15).toFixed(1)} halaman Al-Qur'an Madinah per hari
              </p>
            </div>

            {/* Nama Kelompok Halaqoh */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Nama Kelompok Halaqoh <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-xs h-9 bg-white"
                placeholder="Contoh: Halaqoh Abu Bakar"
              />
            </div>

            {/* Nama Muhaffizh / Pembimbing */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Nama Muhaffizh / Pembimbing
              </label>
              <Input
                type="text"
                value={formMusyrif}
                onChange={(e) => setFormMusyrif(e.target.value)}
                className="text-xs h-9 bg-white"
                placeholder="Nama Pembimbing Halaqoh"
              />
            </div>

            {/* Ruang / Lokasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Ruang / Lokasi Halaqoh
              </label>
              <Input
                type="text"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                className="text-xs h-9 bg-white"
                placeholder="Misal: Masjid Utama / Ruang A-101"
              />
            </div>

            {/* Waktu / Jadwal Sesi */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Jadwal / Waktu Sesi Halaqoh
              </label>
              <Input
                type="text"
                value={formSessionTime}
                onChange={(e) => setFormSessionTime(e.target.value)}
                className="text-xs h-9 bg-white"
                placeholder="Misal: Ba'da Subuh (05:30 - 06:45 WIB)"
              />
            </div>

            {/* Fokus Kurikulum / Program */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Fokus Kurikulum / Program
              </label>
              <Input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-xs h-9 bg-white"
                placeholder="Misal: Talaqqi Ziyadah & Murojaah Lanjutan"
              />
            </div>
          </div>

          {/* Opsi Sinkronisasi Target ke Santri di Halaqoh Ini */}
          <div className="p-3 bg-[#EBF5FB]/50 border border-[#D6EAF8] rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="syncSantriTarget"
              checked={syncSantriTarget}
              onChange={(e) => setSyncSantriTarget(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] cursor-pointer"
            />
            <label htmlFor="syncSantriTarget" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-semibold text-slate-900 block">
                Terapkan target {formTarget} baris/hari ke seluruh santri ({selectedHalaqahSantriCount} santri) di halaqoh ini
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Target harian pada profil santri yang tergabung dalam "{formName || 'halaqoh ini'}" akan otomatis disinkronkan ke nilai baru.
              </span>
            </label>
          </div>

          {/* Tombol Simpan Parameter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {settingsSaved && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Parameter "{formName}" berhasil disimpan!
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-9 px-6 rounded-lg shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Simpan Parameter Halaqoh
            </Button>
          </div>
        </form>
      </div>

      {/* 2. SECTION: Daftar Kelompok Halaqoh & Ringkasan Parameter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Daftar &amp; Status Kelompok Halaqoh
              </h3>
              <p className="text-[11px] text-slate-500">
                Pantau parameter tiap kelompok dan klik "Kostumisasi" untuk mengubah target atau pembimbing
              </p>
            </div>
          </div>
        </div>

        {/* List of Halaqoh Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {halaqahList.map((h) => {
            const isActive = activeHalaqah?.id === h.id;
            const santriCount = getSantriCount(h);
            const isEditingThis = h.id === selectedHalaqahId;

            return (
              <div
                key={h.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-[#EBF5FB]/40 border-[#0070BA]/40 shadow-xs ring-1 ring-[#0070BA]/20'
                    : isEditingThis
                    ? 'bg-slate-50/80 border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate">
                        {h.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {h.description || 'Kelompok Halaqoh Tahfidz'}
                      </p>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0070BA] text-white shrink-0 shadow-2xs">
                        Sedang Diampu
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        Tersedia
                      </span>
                    )}
                  </div>

                  {/* Metadata Parameter Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700 bg-emerald-50/60 border border-emerald-100 px-2 py-1 rounded-md">
                      <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-800 truncate">{h.targetDailyLines || 15} Baris/Hari</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate" title={h.musyrifName}>{h.musyrifName || 'Pembimbing'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{h.room || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900">{santriCount} Santri</span>
                    </div>
                    {h.sessionTime && (
                      <div className="col-span-2 flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{h.sessionTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSelectHalaqahToEdit(h.id, true)}
                    className="text-xs font-semibold text-slate-700 hover:text-[#0070BA] hover:bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Kostumisasi
                  </button>
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => handleSwitchActive(h.id)}
                      className="text-xs font-semibold text-white bg-[#0070BA] hover:bg-[#005C9E] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      Ampu Ini
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Tambah Halaqoh Baru Lengkap */}
        <form
          onSubmit={handleAddNewHalaqah}
          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4"
        >
          <span className="text-xs font-bold text-slate-900 block">
            Tambah Kelompok Halaqoh Baru
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Halaqoh <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={newHalaqahName}
                onChange={(e) => setNewHalaqahName(e.target.value)}
                placeholder="Misal: Halaqoh Zubair"
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Target Harian Standar (Baris/Hari)
              </label>
              <Input
                type="number"
                min={1}
                max={60}
                value={newHalaqahTarget}
                onChange={(e) => setNewHalaqahTarget(Number(e.target.value))}
                placeholder="15"
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Guru / Pembimbing
              </label>
              <Input
                type="text"
                value={newHalaqahMusyrif}
                onChange={(e) => setNewHalaqahMusyrif(e.target.value)}
                placeholder="Nama Pembimbing"
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ruang / Lokasi
              </label>
              <Input
                type="text"
                value={newHalaqahRoom}
                onChange={(e) => setNewHalaqahRoom(e.target.value)}
                placeholder="Misal: Ruang B-202"
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Waktu Sesi
              </label>
              <Input
                type="text"
                value={newHalaqahSessionTime}
                onChange={(e) => setNewHalaqahSessionTime(e.target.value)}
                placeholder="Misal: Ba'da Ashar"
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Fokus Kurikulum
              </label>
              <Input
                type="text"
                value={newHalaqahDesc}
                onChange={(e) => setNewHalaqahDesc(e.target.value)}
                placeholder="Misal: Ziyadah Reguler Juz 1-5"
                className="text-xs h-9 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              className="text-xs h-8.5 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Simpan Halaqoh Baru</span>
            </Button>
          </div>
        </form>
      </div>

      {/* 3. SECTION: Format Teks Pesan WhatsApp (wa.me) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Format Teks Pesan WhatsApp (Pengiriman Langsung ke Wali)
            </h3>
            <p className="text-[11px] text-slate-500">
              Sesuaikan kata-kata laporan yang otomatis terisi saat muhaffizh mengklik Buka WhatsApp / Salin Teks
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveTemplates} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Template 1: Laporan Harian */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Template Laporan Harian Santri
                </label>
                <button
                  type="button"
                  onClick={() => handleCopySnippet(waTemplates.templateDailyProgress, 'daily')}
                  className="inline-flex items-center gap-1 text-[11px] text-[#0070BA] hover:underline cursor-pointer"
                >
                  {copiedKey === 'daily' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'daily' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <textarea
                rows={7}
                value={waTemplates.templateDailyProgress}
                onChange={(e) => setWaTemplates({ ...waTemplates, templateDailyProgress: e.target.value })}
                className="w-full p-2.5 font-mono text-[11px] rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-[#0070BA] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block">
                Variabel: {'{nama}'}, {'{nis}'}, {'{tanggal}'}, {'{tercapaiHariIni}'}, {'{targetHarian}'}, {'{totalHafalan}'}, {'{rincianSesi}'}, {'{musyrif}'}
              </span>
            </div>

            {/* Template 2: Setoran Ziyadah */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Template Notifikasi Setoran Baru (Ziyadah)
                </label>
                <button
                  type="button"
                  onClick={() => handleCopySnippet(waTemplates.templateZiyadah, 'ziyadah')}
                  className="inline-flex items-center gap-1 text-[11px] text-[#0070BA] hover:underline cursor-pointer"
                >
                  {copiedKey === 'ziyadah' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ziyadah' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <textarea
                rows={7}
                value={waTemplates.templateZiyadah}
                onChange={(e) => setWaTemplates({ ...waTemplates, templateZiyadah: e.target.value })}
                className="w-full p-2.5 font-mono text-[11px] rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-[#0070BA] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block">
                Variabel: {'{nama}'}, {'{surah}'}, {'{juz}'}, {'{halaman}'}, {'{baris}'}, {'{nilai}'}, {'{capaianJuz}'}, {'{waktu}'}, {'{musyrif}'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-emerald-700 font-medium">
              {templatesSaved && 'Format template WhatsApp berhasil disimpan!'}
            </span>
            <Button
              type="submit"
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Template Pesan
            </Button>
          </div>
        </form>
      </div>

      {/* 4. SECTION: Alat Diagnostik & Pengujian Validasi Email Terpadu */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Alat Diagnostik &amp; Validasi Email Terpadu
              </h3>
              <p className="text-[11px] text-slate-500">
                Uji sintaks RFC 5322, kueri rekod DNS MX via DNS-over-HTTPS (DoH), deteksi disposable, dan simulasi ESMTP handshake
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto font-mono">
            DNS DoH: Google &amp; Cloudflare
          </span>
        </div>

        {/* Form Pengujian Email */}
        <form onSubmit={handleRunEmailTest} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Masukkan email untuk diuji (cth: muhaffizh@itqan.sch.id)..."
                className="w-full text-xs pl-9 pr-3 h-10 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA]"
              />
            </div>
            <Button
              type="submit"
              disabled={isTestingEmail || !testEmail.trim()}
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs font-bold h-10 px-5 rounded-lg shadow-xs cursor-pointer shrink-0 inline-flex items-center gap-2"
            >
              {isTestingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  <span>Uji Validasi Sekarang</span>
                </>
              )}
            </Button>
          </div>

          {/* Preset Contoh Cepat */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-medium text-slate-400">Contoh Cepat:</span>
            {[
              'muhaffizh@itqan.sch.id',
              'ust.fauzi@gmail.com',
              'wali.santri@yahoo.com',
              'admin@sekolah.com',
              'test@mailinator.com',
              'user@gmial.com',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTestEmail(sample);
                  setTimeout(() => {
                    emailValidationService.validateEmail(sample).then(setTestResult);
                  }, 50);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </form>

        {/* Hasil Diagnostik Terperinci */}
        {testResult && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            {/* Skor Deliverability Banner */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              testResult.verdict === 'valid'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : testResult.verdict === 'risky'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-red-50/80 border-red-200 text-red-900'
            }`}>
              <div>
                <span className="font-bold text-sm block">
                  {testResult.verdict === 'valid' ? 'Email Valid & Terverifikasi' : testResult.verdict === 'risky' ? 'Email Berisiko / Perlu Ditinjau' : 'Email Tidak Valid'}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">{testResult.summaryMessage}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-xl font-mono block">
                  {testResult.deliverabilityScore}/100
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  Skor Deliverability
                </span>
              </div>
            </div>

            {/* Grid 4 Evaluasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Layer 1: Syntax Check */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">1. Pengecekan Sintaks RFC 5322</span>
                  {testResult.syntax.valid ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  User: {testResult.localPart} ({testResult.syntax.localPartLength} char) • Domain: {testResult.domain}
                </p>
              </div>

              {/* Layer 2: Disposable Check */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">2. Deteksi Sekali Pakai &amp; Role</span>
                  {!testResult.isDisposable ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aman (Non-Disposable)
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Disposable Blacklisted
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  {testResult.isRoleBased ? 'Alamat Divisi/Role (admin/support)' : 'Email Personal/Institusional'}
                </p>
              </div>

              {/* Layer 3: DNS MX Records via DoH */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#0070BA]" />
                    <span>3. Rekod DNS MX (via {testResult.domainCheck.dnsProviderUsed.toUpperCase()} DoH)</span>
                  </span>
                  {testResult.domainCheck.hasMxRecords ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {testResult.domainCheck.mxRecords.length} Host MX Ditemukan ({testResult.domainCheck.queryTimeMs}ms)
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> MX Record Tidak Ditemukan
                    </span>
                  )}
                </div>
                {testResult.domainCheck.mxRecords.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {testResult.domainCheck.mxRecords.map((mx, idx) => (
                      <div key={idx} className="flex items-center justify-between font-mono text-[10px] bg-white px-2 py-1 rounded border border-slate-200">
                        <span className="text-slate-800 truncate">{mx.host}</span>
                        <span className="text-slate-400 font-semibold shrink-0">Prioritas: {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-red-600 pt-1">
                    {testResult.domainCheck.reason || 'Domain ini tidak dapat menerima email karena tidak memiliki rekod MX.'}
                  </p>
                )}
              </div>

              {/* Layer 4: SMTP Handshake Protocol Transcript */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Log Protokol Handshake SMTP (Port 25/ESMTP)</span>
                  </span>
                  <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                    testResult.smtp.canConnect ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                  }`}>
                    Respon Kode {testResult.smtp.responseCode}
                  </span>
                </div>

                <div className="font-mono text-[10px] space-y-1 overflow-x-auto max-h-36 no-scrollbar">
                  {testResult.smtp.handshakeLog.map((log, idx) => (
                    <div key={idx} className="space-y-0.5">
                      {log.command && (
                        <div className="text-sky-300">
                          <span className="text-slate-500 mr-1.5">&gt;</span>
                          {log.command}
                        </div>
                      )}
                      <div className={log.success ? 'text-emerald-400' : 'text-red-400'}>
                        <span className="text-slate-500 mr-1.5">&lt;</span>
                        {log.response}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Penyedia: <strong className="text-slate-200">{testResult.smtp.provider}</strong></span>
                  <span>Total Latency: {testResult.smtp.durationMs}ms</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. SECTION: Manajemen Database & Bersihkan Data */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Bersihkan Database</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Kosongkan seluruh data santri dan rekaman setoran mutaba'ah di perangkat ini.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="border-red-200 text-red-700 hover:bg-red-50 text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Semua Data</span>
        </Button>
      </div>
    </div>
  );
};
