import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Settings, 
  MessageSquare, 
  Copy, 
  Check, 
  User, 
  LogOut,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import type { WATemplateConfig } from './types';

export const PengaturanView: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();

  // WA Template config state
  const [waTemplates, setWaTemplates] = useState<WATemplateConfig>(storageService.getWATemplateConfig());
  const [templatesSaved, setTemplatesSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);



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

  const handleSignOut = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun muhaffizh?')) {
      await authService.signOut();
      toast.info('Anda telah keluar dari akun.');
      navigate('/login');
    }
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
          <span>Pengaturan Akun &amp; Sistem</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil akun muhaffizh, format pesan WhatsApp ke wali santri, dan preferensi penyimpanan.
        </p>
      </div>

      {/* 1. SECTION: Profil Akun Muhaffizh */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Profil Akun Muhaffizh
              </h3>
              <p className="text-[11px] text-slate-500">
                Informasi identitas akun pembimbing halaqoh yang aktif saat ini
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Sesi Terautentikasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Nama Lengkap</span>
            <span className="font-bold text-slate-900 text-sm block">
              {storedUser?.fullName || 'Muhaffizh Halaqoh'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Alamat Email</span>
            <span className="font-semibold text-slate-800 text-xs block font-mono truncate" title={storedUser?.email}>
              {storedUser?.email || 'muhaffizh@itqan.sch.id'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Peran Sistem</span>
            <span className="font-bold text-[#0070BA] text-xs block">
              Muhaffizh / Guru Halaqoh
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/halaqah')}
            className="text-xs h-9 border-[#0070BA]/30 text-[#0070BA] hover:bg-blue-50 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Buka Manajemen Ruang Halaqoh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-xs h-9 border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun (Logout)</span>
          </Button>
        </div>
      </div>

      {/* 2. SECTION: Format Teks Pesan WhatsApp (wa.me) */}
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

      {/* 3. SECTION: Manajemen Database & Bersihkan Data */}
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
