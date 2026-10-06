import React, { useState } from 'react';
import { 
  Server, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Settings, 
  Sliders, 
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storageService } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';
import type { WAGatewayConfig, HalaqahSettings } from './types';

export const PengaturanView: React.FC = () => {
  // Gateway config state
  const [waConfig, setWaConfig] = useState<WAGatewayConfig>(storageService.getWAGatewayConfig());
  const [testPhone, setTestPhone] = useState('081234567890');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; fallbackUrl?: string } | null>(null);
  const [configSaved, setConfigSaved] = useState(false);
  // Halaqah settings state
  const [settings, setSettings] = useState<HalaqahSettings>(storageService.getHalaqahSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveWAConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveWAGatewayConfig(waConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveHalaqahSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!testPhone.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    // Pastikan config terbaru tersimpan dulu sebelum tes
    storageService.saveWAGatewayConfig(waConfig);

    const res: SendResult = await waGatewayService.sendTestMessage(testPhone);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.success 
        ? 'Sukses! Pesan uji coba berhasil dikirim ke nomor tujuan.'
        : res.message || res.error || 'Pengujian pengiriman pesan belum berhasil. Anda tetap dapat menggunakan Direct WA.',
      fallbackUrl: res.fallbackUrl,
    });
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data santri, setoran, dan log? Database akan dikosongkan.')) {
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
          <span>Pengaturan Sistem &amp; Notifikasi WhatsApp</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur pengiriman pesan WhatsApp ke wali santri, format laporan, dan data halaqoh.
        </p>
      </div>

      {/* 1. SECTION: Pengaturan Pengiriman WhatsApp */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Pengaturan Pengiriman WhatsApp
            </h3>
            <p className="text-[11px] text-slate-500">
              Konfigurasi pengiriman notifikasi setoran otomatis ke nomor WhatsApp wali santri
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveWAConfig} className="space-y-4">
          {/* Toggles: Auto-send per setoran & 1 Pesan per Hari per Wali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Batasi 1 Pesan / Hari Per Wali
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Mencegah spam ke wali santri. Ringkasan setoran dikumpulkan dalam 1 pesan laporan harian.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={waConfig.limitOneMessagePerDay}
                  onChange={(e) => setWaConfig({ ...waConfig, limitOneMessagePerDay: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0070BA]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Auto-Send Saat Input Setoran
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Kirim notifikasi instan langsung begitu setoran baru dicatat oleh muhaffizh.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={waConfig.autoSendOnSetoran}
                  onChange={(e) => setWaConfig({ ...waConfig, autoSendOnSetoran: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0070BA]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-emerald-700 font-medium">
              {configSaved && 'Pengaturan WhatsApp berhasil disimpan!'}
            </span>
            <Button
              type="submit"
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Pengaturan
            </Button>
          </div>
        </form>

        {/* Alat Uji Coba Kirim Pesan */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0070BA]" />
              <span className="text-xs font-bold text-slate-900">Uji Coba Kirim Pesan</span>
            </div>
            <span className="text-[11px] text-slate-500">Kirim pesan uji coba ke nomor Anda / nomor tujuan</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Masukkan No WhatsApp Anda (contoh: 081234567890)"
              className="text-xs h-10 bg-white flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isTesting || !testPhone}
              onClick={handleTestConnection}
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 border-[#0070BA] text-[#0070BA] hover:bg-[#EBF5FB] rounded-lg cursor-pointer"
            >
              {isTesting ? 'Menguji Pengiriman...' : 'Kirim Pesan Uji Coba'}
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
              {testResult.fallbackUrl && (
                <a
                  href={testResult.fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap self-start sm:self-center shrink-0 cursor-pointer shadow-xs"
                >
                  <span>Buka Direct WA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION: Pengaturan Halaqoh & Kurikulum */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Parameter Halaqoh &amp; Kurikulum
            </h3>
            <p className="text-[11px] text-slate-500">
              Konfigurasi target baris standar dan identitas rombel halaqoh aktif
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
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Nama Muhaffizh Penanggung Jawab
              </label>
              <Input
                type="text"
                value={settings.musyrifName}
                onChange={(e) => setSettings({ ...settings, musyrifName: e.target.value })}
                className="text-xs h-9 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-emerald-700 font-medium">
              {settingsSaved && 'Parameter halaqoh berhasil diperbarui!'}
            </span>
            <Button
              type="submit"
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-10 px-5 rounded-lg shadow-xs"
            >
              Simpan Parameter
            </Button>
          </div>
        </form>
      </div>

      {/* 5. SECTION: Manajemen Database & Bersihkan Data */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Bersihkan Database</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Kosongkan seluruh data santri, setoran mutaba'ah, dan catatan log.
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

