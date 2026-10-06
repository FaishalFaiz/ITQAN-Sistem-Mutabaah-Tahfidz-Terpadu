import React, { useState } from 'react';
import { 
  Trash2, 
  Settings, 
  Sliders, 
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storageService } from '../../services/storageService';
import type { HalaqahSettings, WATemplateConfig } from './types';

export const PengaturanView: React.FC = () => {
  // Halaqah settings state
  const [settings, setSettings] = useState<HalaqahSettings>(storageService.getHalaqahSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // WA Template config state
  const [waTemplates, setWaTemplates] = useState<WATemplateConfig>(storageService.getWATemplateConfig());
  const [templatesSaved, setTemplatesSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveHalaqahSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveWATemplateConfig(waTemplates);
    setTemplatesSaved(true);
    setTimeout(() => setTemplatesSaved(false), 2500);
  };

  const handleCopySnippet = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data santri dan setoran? Database lokal akun ini akan dikosongkan.')) {
      storageService.resetDatabase();
      alert('Seluruh data mutabaah dan santri telah dibersihkan (kosong).');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0070BA]" />
          <span>Pengaturan Halaqoh &amp; Format Pesan WhatsApp</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur parameter halaqoh, muhaffizh, dan kustomisasi format teks pesan laporan WhatsApp ke wali santri.
        </p>
      </div>

      {/* 1. SECTION: Pengaturan Halaqoh & Kurikulum */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Parameter Halaqoh &amp; Kurikulum
            </h3>
            <p className="text-[11px] text-slate-500">
              Konfigurasi target baris standar harian dan identitas halaqoh aktif
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Target Harian Standar (Baris/Hari)
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={settings.standardDailyTargetLines}
                onChange={(e) => setSettings({ ...settings, standardDailyTargetLines: Number(e.target.value) })}
                className="text-xs h-9 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Nama Kelompok Halaqoh
              </label>
              <Input
                type="text"
                value={settings.halaqahName}
                onChange={(e) => setSettings({ ...settings, halaqahName: e.target.value })}
                className="text-xs h-9 bg-white"
                placeholder="Contoh: Halaqoh Abu Bakar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Nama Muhaffizh / Pembimbing
              </label>
              <Input
                type="text"
                value={settings.musyrifName}
                onChange={(e) => setSettings({ ...settings, musyrifName: e.target.value })}
                className="text-xs h-9 bg-white"
                placeholder="Nama Muhaffizh"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-emerald-700 font-medium">
              {settingsSaved && 'Parameter halaqoh berhasil diperbarui!'}
            </span>
            <Button
              type="submit"
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Parameter
            </Button>
          </div>
        </form>
      </div>

      {/* 2. SECTION: Format Teks Pesan WhatsApp (wa.me) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
