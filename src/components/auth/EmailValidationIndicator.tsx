import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Server, 
  Terminal, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import type { EmailValidationResult } from '@/services/emailValidationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EmailValidationIndicatorProps {
  result: EmailValidationResult | null;
  isValidating: boolean;
  onApplySuggestion?: (suggestedEmail: string) => void;
  className?: string;
}

export const EmailValidationIndicator: React.FC<EmailValidationIndicatorProps> = ({
  result,
  isValidating,
  onApplySuggestion,
  className = '',
}) => {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 text-[11px] text-slate-500 font-medium py-1 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070BA]" />
        <span>Memverifikasi sintaks, DNS MX &amp; handshake SMTP...</span>
      </div>
    );
  }

  if (!result || !result.email) return null;

  return (
    <div className={`space-y-1.5 pt-1 ${className}`}>
      {/* 1. Main Status Indicator Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        {result.verdict === 'valid' && (
          <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Email valid &amp; MX aktif ({result.smtp.provider})</span>
          </div>
        )}

        {result.verdict === 'risky' && (
          <div className="inline-flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{result.summaryMessage}</span>
          </div>
        )}

        {result.verdict === 'invalid' && (
          <div className="inline-flex items-center gap-1.5 text-red-700 font-semibold text-[11px]">
            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{result.summaryMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsDiagnosticOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] hover:underline cursor-pointer ml-auto"
        >
          <Info className="w-3 h-3" />
          <span>Lihat Diagnostik MX &amp; SMTP</span>
        </button>
      </div>

      {/* 2. Typo Suggestion Chip */}
      {result.suggestion && onApplySuggestion && (
        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#0070BA] shrink-0" />
            <span>Maksud Anda: <strong className="text-[#0070BA]">{result.suggestion}</strong>?</span>
          </div>
          <button
            type="button"
            onClick={() => onApplySuggestion(result.suggestion!)}
            className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#0070BA] hover:bg-[#005C9E] text-white cursor-pointer shadow-2xs transition-colors shrink-0"
          >
            Terapkan
          </button>
        </div>
      )}

      {/* 3. Detailed Diagnostic Modal (Syntax, DNS MX, SMTP Handshake) */}
      <Dialog open={isDiagnosticOpen} onOpenChange={setIsDiagnosticOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200">
          <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="font-bold text-sm text-slate-900">
                  Laporan Diagnostik Validasi Email
                </DialogTitle>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-sm">
                  {result.email}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4 text-xs">
            {/* Score & Verdict Banner */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              result.verdict === 'valid'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : result.verdict === 'risky'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-red-50/80 border-red-200 text-red-900'
            }`}>
              <div>
                <span className="font-bold text-sm block">
                  {result.verdict === 'valid' ? 'Email Valid & Terverifikasi' : result.verdict === 'risky' ? 'Email Berisiko / Perlu Ditinjau' : 'Email Tidak Valid'}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">{result.summaryMessage}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-lg font-mono block">
                  {result.deliverabilityScore}/100
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  Skor Validasi
                </span>
              </div>
            </div>

            {/* Grid 4 Evaluasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Layer 1: Syntax Check */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">1. Pengecekan Sintaks</span>
                  {result.syntax.valid ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> RFC 5322 Valid
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Tidak Valid
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  User: {result.localPart} ({result.syntax.localPartLength} kar) • Domain: {result.domain}
                </p>
              </div>

              {/* Layer 2: Disposable Check */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">2. Deteksi Sekali Pakai</span>
                  {!result.isDisposable ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Bukan Disposable
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Domain Sekali Pakai
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  {result.isRoleBased ? 'Alamat Role/Divisi (cth: admin)' : 'Email Personal / Institusi'}
                </p>
              </div>

              {/* Layer 3: DNS MX Records */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#0070BA]" />
                    <span>3. Rekod MX (DNS-over-HTTPS via {result.domainCheck.dnsProviderUsed.toUpperCase()})</span>
                  </span>
                  {result.domainCheck.hasMxRecords ? (
                    <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {result.domainCheck.mxRecords.length} Host MX Ditemukan
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-[10px] inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> MX Tidak Ditemukan
                    </span>
                  )}
                </div>
                {result.domainCheck.mxRecords.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {result.domainCheck.mxRecords.map((mx, idx) => (
                      <div key={idx} className="flex items-center justify-between font-mono text-[10px] bg-white px-2 py-1 rounded border border-slate-200">
                        <span className="text-slate-800 truncate">{mx.host}</span>
                        <span className="text-slate-400 font-semibold shrink-0">Prioritas: {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-red-600 pt-1">
                    {result.domainCheck.reason || 'Domain ini tidak memiliki server pertukaran email (MX) terkonfigurasi.'}
                  </p>
                )}
              </div>

              {/* Layer 4: SMTP Handshake Transcript */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Log Protokol Handshake SMTP (Port 25/ESMTP)</span>
                  </span>
                  <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                    result.smtp.canConnect ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                  }`}>
                    Kode {result.smtp.responseCode}
                  </span>
                </div>

                <div className="font-mono text-[10px] space-y-1 overflow-x-auto max-h-36 no-scrollbar">
                  {result.smtp.handshakeLog.map((log, idx) => (
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
                  <span>Penyedia: <strong className="text-slate-200">{result.smtp.provider}</strong></span>
                  <span>Latency: {result.smtp.durationMs}ms</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDiagnosticOpen(false)}
              className="text-xs h-8 px-4"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
