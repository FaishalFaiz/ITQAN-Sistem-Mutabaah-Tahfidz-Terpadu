import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Settings, 
  MessageSquare, 
  Copy, 
  Check, 
  User, 
  Mail, 
  ShieldCheck, 
  Server, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  LogOut,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { emailValidationService, type EmailValidationResult } from '../../services/emailValidationService';
import type { WATemplateConfig } from './types';

export const PengaturanView: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();

  // WA Template config state
  const [waTemplates, setWaTemplates] = useState<WATemplateConfig>(storageService.getWATemplateConfig());
  const [templatesSaved, setTemplatesSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email Diagnostic Lab State
  const [testEmail, setTestEmail] = useState(storedUser?.email || 'muhaffizh@itqan.sch.id');
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
          Kelola profil akun muhaffizh, format pesan WhatsApp ke wali santri, diagnostik email, dan preferensi penyimpanan.
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

      {/* 3. SECTION: Alat Diagnostik & Pengujian Validasi Email Terpadu */}
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
              className="bg-[#0070BA] hover:bg-[#005C9E] text-white text-xs h-10 px-4 font-semibold shrink-0 cursor-pointer"
            >
              {isTestingEmail ? 'Menganalisis...' : 'Jalankan Diagnostik Email'}
            </Button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Contoh Cepat:</span>
            {[
              'muhaffizh@itqan.sch.id',
              'guru@pesantren.ac.id',
              'test@gmail.com',
              'fakemail@mailinator.com',
              'salahformat@@domain',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTestEmail(sample);
                  setTimeout(() => {
                    emailValidationService.validateEmail(sample).then((r) => setTestResult(r));
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

      {/* 4. SECTION: Manajemen Database & Bersihkan Data */}
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
