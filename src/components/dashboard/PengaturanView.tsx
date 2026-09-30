import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Settings, 
  FileText, 
  Sliders, 
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storageService, EVENT_DATA_CHANGED } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';
import type { WAGatewayConfig, WAGatewayProvider, HalaqahSettings, WALog } from './types';

export const PengaturanView: React.FC = () => {
  // Gateway config state
  const [waConfig, setWaConfig] = useState<WAGatewayConfig>(storageService.getWAGatewayConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testPhone, setTestPhone] = useState('081234567890');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [configSaved, setConfigSaved] = useState(false);

  // Halaqah settings state
  const [settings, setSettings] = useState<HalaqahSettings>(storageService.getHalaqahSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Template active tab
  const [templateTab, setTemplateTab] = useState<'daily' | 'ziyadah' | 'murojaah'>('daily');

  // Logs state
  const [logs, setLogs] = useState<WALog[]>(storageService.getWALogs());

  const refreshLogs = () => {
    setLogs(storageService.getWALogs());
  };

  useEffect(() => {
    window.addEventListener(EVENT_DATA_CHANGED, refreshLogs);
    return () => window.removeEventListener(EVENT_DATA_CHANGED, refreshLogs);
  }, []);

  // Handle provider preset switch
  const handleProviderChange = (provider: WAGatewayProvider) => {
    let endpoint = waConfig.endpointUrl;
    if (provider === 'fonnte') {
      endpoint = 'https://api.fonnte.com/send';
    } else if (provider === 'waha') {
      endpoint = 'http://localhost:3000/api/sendText';
    } else if (provider === 'wablas') {
      endpoint = 'https://kudus.wablas.com/api/send-message';
    }
    setWaConfig((prev) => ({
      ...prev,
      provider,
      endpointUrl: endpoint,
    }));
  };

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
        ? `Sukses! Pesan verifikasi berhasil dikirim melalui gateway ${waConfig.provider.toUpperCase()}.`
        : res.message || res.error || 'Pengujian gateway gagal.',
    });
    refreshLogs();
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data santri, setoran, dan log ke kondisi awal (seed data)?')) {
      storageService.resetDatabase();
      setWaConfig(storageService.getWAGatewayConfig());
      setSettings(storageService.getHalaqahSettings());
      setLogs([]);
      alert('Data sistem ITQAN berhasil direset ke seed awal.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0070BA]" />
          <span>Pengaturan Sistem &amp; WhatsApp Gateway</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi koneksi WhatsApp Gateway, template laporan santri, dan parameter kurikulum halaqoh.
        </p>
      </div>

      {/* 1. SECTION: Konfigurasi WhatsApp Gateway */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Integrasi WhatsApp Gateway
              </h3>
              <p className="text-[11px] text-slate-500">
                Hubungkan dengan provider gateway (Fonnte, WAHA / Baileys, Wablas, atau Custom Webhook)
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
            {waConfig.endpointUrl ? `Provider: ${waConfig.provider.toUpperCase()}` : 'Belum Terhubung'}
          </span>
        </div>

        <form onSubmit={handleSaveWAConfig} className="space-y-4">
          {/* Pilihan Provider Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Pilih Provider Gateway
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fonnte', label: 'Fonnte API', desc: 'api.fonnte.com' },
                { id: 'waha', label: 'WAHA / Localhost', desc: 'WhatsApp HTTP API' },
                { id: 'wablas', label: 'Wablas API', desc: 'wablas.com' },
                { id: 'custom', label: 'Custom REST API', desc: 'Webhook Sendiri' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id as WAGatewayProvider)}
                  className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                    waConfig.provider === p.id
                      ? 'border-[#0070BA] bg-[#EBF5FB] text-[#0070BA] font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">{p.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal block">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint URL & API Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Endpoint URL API Gateway <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                required
                value={waConfig.endpointUrl}
                onChange={(e) => setWaConfig({ ...waConfig, endpointUrl: e.target.value })}
                placeholder="https://api.fonnte.com/send"
                className="text-xs h-9 bg-white"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                URL tujuan HTTP POST untuk mengirim pesan teks.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                API Key / Secret Token
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={waConfig.apiKey}
                  onChange={(e) => setWaConfig({ ...waConfig, apiKey: e.target.value })}
                  placeholder="Masukkan API Token gateway Anda"
                  className="text-xs h-9 bg-white pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Token otentikasi API dari provider gateway Anda.
              </span>
            </div>
          </div>

          {/* Sender Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Nomor Pengirim / Device ID (opsional)
            </label>
            <Input
              type="text"
              value={waConfig.senderNumber}
              onChange={(e) => setWaConfig({ ...waConfig, senderNumber: e.target.value })}
              placeholder="Contoh: 6281234567890"
              className="text-xs h-9 bg-white max-w-sm"
            />
          </div>

          {/* Toggles: Auto-send per setoran & 1 Pesan per Hari per Wali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Batasi 1 Pesan / Hari Per Wali
                </span>
                <span className="text-[11px] text-slate-500">
                  Konsolidasikan seluruh setoran harian (Ziyadah + Muroja'ah) dalam 1 pesan rekapitulasi harian.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={waConfig.limitOneMessagePerDay}
                  onChange={(e) => setWaConfig({ ...waConfig, limitOneMessagePerDay: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0070BA]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Auto-Send Saat Input Setoran
                </span>
                <span className="text-[11px] text-slate-500">
                  Kirim notifikasi instan langsung begitu setoran baru dicatat musyrif.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-emerald-700 font-medium">
              {configSaved && 'Pengaturan WhatsApp Gateway berhasil disimpan!'}
            </span>
            <Button
              type="submit"
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-10 px-5 rounded-lg shadow-xs"
            >
              Simpan Konfigurasi Gateway
            </Button>
          </div>
        </form>

        {/* Alat Uji Coba Gateway (Test Connection) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0070BA]" />
              <span className="text-xs font-bold text-slate-900">Uji Coba Koneksi Gateway</span>
            </div>
            <span className="text-[11px] text-slate-500">Kirim pesan ping ke nomor Anda</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Masukkan No WhatsApp Anda (0812xxxx)"
              className="text-xs h-10 bg-white flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isTesting || !testPhone}
              onClick={handleTestConnection}
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 border-[#0070BA] text-[#0070BA] hover:bg-[#EBF5FB] rounded-lg"
            >
              {isTesting ? 'Menguji Gateway...' : 'Kirim Pesan Uji Coba'}
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION: Template Pesan WhatsApp */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#0070BA] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Kustomisasi Template Pesan WhatsApp
            </h3>
            <p className="text-[11px] text-slate-500">
              Format teks laporan otomatis yang dikirimkan ke wali santri
            </p>
          </div>
        </div>

        {/* Tab Template */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTemplateTab('daily')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              templateTab === 'daily'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Template Laporan Harian (1 Pesan / Hari)
          </button>
          <button
            type="button"
            onClick={() => setTemplateTab('ziyadah')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              templateTab === 'ziyadah'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Template Ziyadah (Hafalan Baru)
          </button>
          <button
            type="button"
            onClick={() => setTemplateTab('murojaah')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              templateTab === 'murojaah'
                ? 'border-[#0070BA] text-[#0070BA]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Template Muroja'ah (Pengulangan)
          </button>
        </div>

        {/* Editor Template */}
        <div>
          {templateTab === 'daily' && (
            <textarea
              rows={11}
              value={waConfig.templateDailyProgress}
              onChange={(e) => setWaConfig({ ...waConfig, templateDailyProgress: e.target.value })}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0070BA] focus:outline-none"
            />
          )}
          {templateTab === 'ziyadah' && (
            <textarea
              rows={9}
              value={waConfig.templateZiyadah}
              onChange={(e) => setWaConfig({ ...waConfig, templateZiyadah: e.target.value })}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0070BA] focus:outline-none"
            />
          )}
          {templateTab === 'murojaah' && (
            <textarea
              rows={9}
              value={waConfig.templateMurojaah}
              onChange={(e) => setWaConfig({ ...waConfig, templateMurojaah: e.target.value })}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0070BA] focus:outline-none"
            />
          )}

          {/* Variabel Token Legend */}
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Daftar Tag Variabel Otomatis:</span>
            {templateTab === 'daily' ? (
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{nama}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{nis}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{wali}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{tanggal}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{targetHarian}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{tercapaiHariIni}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{halamanHariIni}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{statusHarian}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{rincianSesi}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{totalHafalan}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{sisaTarget}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{statusPacing}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{catatanMusyrif}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{musyrif}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{halaqoh}'}</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{nama}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{nis}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{wali}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{surah}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{juz}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{halaman}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{barisAwal}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{barisAkhir}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{baris}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{nilai}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{capaianJuz}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{waktu}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{musyrif}'}</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[#0070BA]">{'{catatan}'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <Button
            onClick={handleSaveWAConfig}
            className="bg-[#0070BA] hover:bg-[#005C9E] text-white font-semibold text-xs h-10 px-5 rounded-lg shadow-xs"
          >
            Simpan Template Pesan
          </Button>
        </div>
      </div>

      {/* 3. SECTION: Log Audit Pengiriman WhatsApp Gateway */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Log Pengiriman Pesan WhatsApp
            </h3>
            <p className="text-[11px] text-slate-500">
              Riwayat pengiriman notifikasi setoran dan broadcast yang diproses sistem ({logs.length} catatan)
            </p>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                storageService.clearWALogs();
                setLogs([]);
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Belum ada aktivitas pengiriman WhatsApp yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Penerima</th>
                  <th className="py-2.5 px-3">Nomor WA</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Cuplikan Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.slice(0, 10).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                      {l.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {l.recipientName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {l.recipientPhone}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {l.status === 'success' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sukses (Gateway)
                        </span>
                      ) : l.status === 'fallback_opened' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0070BA] border border-blue-200">
                          Direct wa.me
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          Gagal Kirim
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={l.snippet}>
                      {l.snippet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. SECTION: Pengaturan Halaqoh & Kurikulum */}
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
                Nama Musyrif Penanggung Jawab
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

      {/* 5. SECTION: Manajemen Database & Reset Seed */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Reset Data ke Kondisi Awal</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Kembalikan daftar 12 santri teladan, riwayat setoran contoh, dan template default.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="border-red-200 text-red-700 hover:bg-red-50 text-xs shrink-0 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Database Lokal</span>
        </Button>
      </div>
    </div>
  );
};
