import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Smartphone, 
  ExternalLink,
  Check,
  Eye,
  Info,
  Edit2,
  Copy
} from 'lucide-react';
import type { Santri } from './types';
import { storageService, getTodayDateKey } from '../../services/storageService';
import { waGatewayService } from '../../services/waGatewayService';
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
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
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

  const handleOpenDirectWA = (santri: Santri) => {
    if (!santri.parentPhone) return;
    const msg = waGatewayService.buildDailyProgressMessage(santri);
    storageService.markDailyReportSent(santri.id);
    setStatusMessage({
      type: 'success',
      text: `Membuka WhatsApp untuk wali ${santri.name} dan status ditandai terkirim.`,
    });
    onDataRefresh?.();
    waGatewayService.openDirectWA(santri.parentPhone, msg);
  };

  const handleCopySingle = (santri: Santri) => {
    const msg = waGatewayService.buildDailyProgressMessage(santri);
    navigator.clipboard.writeText(msg);
    setStatusMessage({
      type: 'success',
      text: `Teks laporan untuk wali ${santri.name} berhasil disalin ke clipboard!`,
    });
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
                <span>Muhaffizh: {settings.musyrifName}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">Tanggal: {today}</span>
              </DialogDescription>
            </div>
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
              className="text-slate-400 hover:text-slate-600 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Filter Tabs & Stats Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between bg-white text-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              Belum Dikirim ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('sent')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterTab === 'sent'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              Sudah Dikirim ({sentCount})
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
              const hasPhone = Boolean(santri.parentPhone && santri.parentPhone.trim().length > 5);
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
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0070BA] hover:underline ml-1 cursor-pointer"
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
                          <span>Belum Dikirim</span>
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
                      className="h-9 px-2.5 sm:px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-lg cursor-pointer"
                      title="Lihat pesan yang akan dikirim"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>

                    {/* Salin Teks Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopySingle(santri)}
                      className="h-9 px-2.5 sm:px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-lg cursor-pointer"
                      title="Salin teks pesan ke clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Salin
                    </Button>

                    {/* Direct WA Button */}
                    {hasPhone ? (
                      isSentToday ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleOpenDirectWA(santri)}
                          className="h-9 px-3 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                          title="Buka WhatsApp untuk kirim ulang"
                        >
                          <span>Kirim Ulang</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleOpenDirectWA(santri)}
                          className="h-9 px-3.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                          title="Buka WhatsApp langsung (wa.me)"
                        >
                          <span>Buka WA (wa.me)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingWaliSantri(santri)}
                        className="h-9 px-3 text-xs font-semibold text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer"
                      >
                        Atur No. HP
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
          <div className="border-t border-slate-200 bg-slate-50 p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0070BA]" />
                <span className="text-xs font-bold text-slate-900">
                  Preview Pesan: {selectedPreviewSantri.name} ({selectedPreviewSantri.parentPhone || 'No WA Kosong'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySingle(selectedPreviewSantri)}
                  className="h-7 text-xs border-slate-300"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Salin Teks
                </Button>
                {selectedPreviewSantri.parentPhone && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleOpenDirectWA(selectedPreviewSantri)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Buka WhatsApp
                  </Button>
                )}
                <button
                  onClick={() => setSelectedPreviewSantri(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                >
                  [× Tutup]
                </button>
              </div>
            </div>
            <pre className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {waGatewayService.buildDailyProgressMessage(selectedPreviewSantri)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Sudah Dikirim: <strong className="text-emerald-600 font-semibold">{sentCount}</strong></span>
            <span>•</span>
            <span>Belum: <strong className="text-amber-600 font-semibold">{pendingCount}</strong></span>
            <span>•</span>
            <span>Total: <strong>{santriList.length} Santri</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg justify-center cursor-pointer"
            >
              Selesai / Tutup
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
