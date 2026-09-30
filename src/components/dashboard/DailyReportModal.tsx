import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  Smartphone, 
  ExternalLink,
  Check,
  Eye,
  Info,
  Edit2
} from 'lucide-react';
import type { Santri } from './types';
import { storageService, getTodayDateKey } from '../../services/storageService';
import { waGatewayService, type SendResult } from '../../services/waGatewayService';
import { EditWaliModal } from './EditWaliModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  onDataRefresh?: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  santriList,
  onDataRefresh,
}) => {
  const today = getTodayDateKey();
  const settings = storageService.getHalaqahSettings();

  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'sent'>('all');
  const [selectedPreviewSantri, setSelectedPreviewSantri] = useState<Santri | null>(null);
  const [editingWaliSantri, setEditingWaliSantri] = useState<Santri | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    isRunning: boolean;
    current: number;
    total: number;
    currentName: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Sync state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setBatchProgress(null);
      setSelectedPreviewSantri(null);
    }
  }, [isOpen]);

  const sentCount = santriList.filter((s) => s.lastDailyReportSentDate === today).length;
  const pendingCount = santriList.filter(
    (s) => s.lastDailyReportSentDate !== today && s.parentPhone && s.parentPhone.trim().length > 5
  ).length;
  const noPhoneCount = santriList.filter((s) => !s.parentPhone || s.parentPhone.trim().length <= 5).length;

  const filteredList = santriList.filter((s) => {
    const isSent = s.lastDailyReportSentDate === today;
    if (filterTab === 'pending') return !isSent;
    if (filterTab === 'sent') return isSent;
    return true;
  });

  const handleSendSingle = async (santri: Santri, force = false) => {
    setSendingId(santri.id);
    setStatusMessage(null);

    try {
      const result: SendResult = await waGatewayService.sendDailyReport(santri, force);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Alhamdulillah! Laporan harian untuk wali ${santri.name} berhasil terkirim ke WhatsApp.`,
        });
        onDataRefresh?.();
      } else if (result.alreadySentToday) {
        setStatusMessage({
          type: 'info',
          text: result.message,
        });
      } else if (result.fallbackUrl) {
        setStatusMessage({
          type: 'error',
          text: `${result.message} Anda dapat membuka WhatsApp secara manual melalui tombol Direct WA.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message || 'Gagal mengirim pesan via WhatsApp Gateway.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSendingId(null);
    }
  };

  const handleSendBatch = async () => {
    const targets = santriList.filter(
      (s) => s.lastDailyReportSentDate !== today && s.parentPhone && s.parentPhone.trim().length > 5
    );

    if (targets.length === 0) {
      setStatusMessage({
        type: 'info',
        text: 'Semua wali santri yang memiliki nomor WhatsApp sudah menerima laporan harian hari ini.',
      });
      return;
    }

    setBatchProgress({
      isRunning: true,
      current: 0,
      total: targets.length,
      currentName: targets[0].name,
    });

    try {
      const summary = await waGatewayService.sendBatchDailyReports(targets, {
        forceResend: false,
        onProgress: (idx, total, currentSantri) => {
          setBatchProgress({
            isRunning: true,
            current: idx,
            total,
            currentName: currentSantri.name,
          });
        },
      });

      setStatusMessage({
        type: 'success',
        text: `Pengiriman batch selesai! ${summary.sent} terkirim, ${summary.skippedAlreadySent} dilewati (sudah terkirim), ${summary.failed} gagal.`,
      });
      onDataRefresh?.();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Pengiriman batch terhenti karena kendala koneksi.',
      });
    } finally {
      setBatchProgress(null);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden w-[95vw] sm:w-full rounded-xl sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Laporan Harian Wali Santri
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{settings.halaqahName}</span>
                <span>•</span>
                <span>Musyrif: {settings.musyrifName}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">Tanggal: {today}</span>
              </DialogDescription>
            </div>

          </div>

          {/* Quick Notice */}
          <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-[#0070BA] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aturan Otomasi 1 Pesan/Hari:</strong> Setiap wali santri hanya dikirimi 1 pesan rekapitulasi mutaba'ah per hari yang merangkum seluruh sesi setoran (Ziyadah + Muroja'ah) hari ini. Santri yang sudah dikirimi pesan tidak akan dikirimi ulang secara otomatis.
            </p>
          </div>
        </DialogHeader>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-b border-red-100'
                : 'bg-amber-50 text-amber-800 border-b border-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Info className="w-4 h-4 text-amber-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Batch Progress Bar */}
        {batchProgress && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1">
              <span>Mengirim pesan ({batchProgress.current}/{batchProgress.total}): {batchProgress.currentName}...</span>
              <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#0070BA] h-full transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-blue-700 mt-1">Jeda aman 1.5 detik per pesan agar ramah antrian gateway.</p>
          </div>
        )}

        {/* Filter Tabs & Stats Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between bg-white text-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterTab === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              Belum ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('sent')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterTab === 'sent'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              Sudah ({sentCount})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-500">
            <span>Tanpa No. HP: <strong className="text-slate-700">{noPhoneCount}</strong></span>
          </div>
        </div>

        {/* Content Body: List Santri */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada santri dalam daftar ini.</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua laporan telah sesuai dengan filter yang dipilih.</p>
            </div>
          ) : (
            filteredList.map((santri) => {
              const isSentToday = santri.lastDailyReportSentDate === today;
              const hasPhone = santri.parentPhone && santri.parentPhone.trim().length > 5;
              const isSending = sendingId === santri.id;
              const todayRecords = storageService.getTodaySetoranForSantri(santri.id);
              const linesToday = todayRecords.reduce((acc, r) => acc + r.totalLines, 0) || santri.linesCompletedToday;

              return (
                <div
                  key={santri.id}
                  className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  {/* Info Santri & Wali */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {santri.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{santri.name}</span>
                        <span className="text-xs text-slate-400">NIS: {santri.nis}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span>Wali: <strong className="text-slate-700">{santri.parentName || 'Ayah/Bunda'}</strong></span>
                        <span>•</span>
                        <span>WA: <strong className={hasPhone ? 'text-slate-800' : 'text-red-500 font-medium'}>
                          {hasPhone ? santri.parentPhone : 'Belum diisi'}
                        </strong></span>
                        <button
                          type="button"
                          onClick={() => setEditingWaliSantri(santri)}
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0070BA] hover:underline ml-1"
                          title="Edit nama atau no WA wali santri"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      {/* Capaian Hari Ini */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          linesToday >= santri.dailyTargetLines
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : linesToday > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {linesToday >= santri.dailyTargetLines ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          Setoran Hari Ini: {linesToday}/{santri.dailyTargetLines} Baris
                        </span>
                        {todayRecords.length > 0 && (
                          <span className="text-[11px] text-slate-500">
                            ({todayRecords.length} sesi)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Laporan Hari Ini & Actions */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
                    {/* Status Badge */}
                    <div className="text-right mr-1">
                      {isSentToday ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Terkirim {santri.lastDailyReportSentTime || 'Hari ini'}</span>
                        </div>
                      ) : hasPhone ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Siap Kirim</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>No. WA Kosong</span>
                        </div>
                      )}
                    </div>

                    {/* Preview Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedPreviewSantri(santri)}
                      className="h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-lg"
                      title="Lihat pesan yang akan dikirim"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>

                    {/* Send / Resend Button */}
                    {isSentToday ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!hasPhone || isSending || Boolean(batchProgress?.isRunning)}
                        onClick={() => handleSendSingle(santri, true)}
                        className="h-9 px-3 text-xs font-semibold text-slate-600 hover:text-[#0070BA] border-slate-200 rounded-lg"
                        title="Kirim ulang laporan hari ini"
                      >
                        {isSending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        )}
                        Kirim Ulang
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={!hasPhone || isSending || Boolean(batchProgress?.isRunning)}
                        onClick={() => handleSendSingle(santri, false)}
                        className="h-9 px-3.5 text-xs font-semibold bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-2xs"
                      >
                        {isSending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1" />
                        )}
                        Kirim WA
                      </Button>
                    )}

                    {/* Fallback Direct WA link */}
                    {hasPhone && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const msg = waGatewayService.buildDailyProgressMessage(santri);
                          waGatewayService.openDirectWA(santri.parentPhone, msg);
                        }}
                        className="h-9 w-9 p-0 text-slate-400 hover:text-emerald-600 rounded-lg"
                        title="Buka langsung di WhatsApp Web / App"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Preview Drawer / Submodal if selected */}
        {selectedPreviewSantri && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0070BA]" />
                <span className="text-xs font-bold text-slate-900">
                  Preview Pesan WhatsApp untuk Wali: {selectedPreviewSantri.name} ({selectedPreviewSantri.parentPhone || 'No WA Kosong'})
                </span>
              </div>
              <button
                onClick={() => setSelectedPreviewSantri(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Tutup Preview [×]
              </button>
            </div>
            <pre className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {waGatewayService.buildDailyProgressMessage(selectedPreviewSantri)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Terkirim: <strong className="text-emerald-600 font-semibold">{sentCount}</strong></span>
            <span>•</span>
            <span>Belum: <strong className="text-amber-600 font-semibold">{pendingCount}</strong></span>
            <span>•</span>
            <span>Total: <strong>{santriList.length} Santri</strong></span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={Boolean(batchProgress?.isRunning)}
              className="text-xs font-semibold h-9 sm:h-10 px-4 border-slate-200 rounded-lg justify-center"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={handleSendBatch}
              disabled={pendingCount === 0 || Boolean(batchProgress?.isRunning)}
              className="text-xs font-semibold h-9 sm:h-10 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg shadow-xs justify-center"
            >
              {batchProgress?.isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Mengirim ({batchProgress.current}/{batchProgress.total})...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Kirim ke Semua Wali yang Belum ({pendingCount})
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modal Edit Kontak Wali Santri */}
    <EditWaliModal
      isOpen={Boolean(editingWaliSantri)}
      onClose={() => setEditingWaliSantri(null)}
      santri={editingWaliSantri}
      onSuccess={() => onDataRefresh?.()}
    />
    </>
  );
};
