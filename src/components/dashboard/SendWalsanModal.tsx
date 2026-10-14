import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import type { Santri, SetoranRecord } from './types';
import { toast } from '@/components/ui/sonner';

export interface WalsanModalData {
  santri: Santri;
  record: SetoranRecord;
  messageText: string;
  waLink: string;
}

interface SendWalsanModalProps {
  data: WalsanModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendWalsanModal: React.FC<SendWalsanModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { santri, record, messageText, waLink } = data;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success('Pesan WhatsApp disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin teks');
    }
  };

  const handleOpenWA = () => {
    if (typeof window !== 'undefined') {
      window.open(waLink, '_blank', 'noopener,noreferrer');
      toast.success('Membuka WhatsApp...', {
        description: `Tujuan: ${santri.parentPhone}`,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg p-5 sm:p-6 rounded-2xl border-slate-200 shadow-xl bg-white focus:outline-none">
        <DialogHeader className="pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-6">
              <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                Setoran Berhasil Dicatat!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Kirim ringkasan laporan mutaba'ah hari ini ke WhatsApp wali santri.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 pt-1 text-xs">
          {/* Ringkasan Setoran Santri */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 truncate">
                {santri.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                NIS {santri.nis}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>Hafalan: <b className="text-slate-800">{record.surahName}</b></span>
              <span>•</span>
              <span>
                Jumlah: <b className="text-slate-800">{record.totalLines} Baris</b> ({record.type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah"})
              </span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
              <span>Wali: <strong className="text-slate-700">{santri.parentName || 'Wali Santri'}</strong></span>
              <span className="font-mono text-slate-700">{santri.parentPhone}</span>
            </div>
          </div>

          {/* Preview Pesan WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#0070BA]" />
                Preview Pesan WhatsApp
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] hover:text-[#005C9E] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
              {messageText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 cursor-pointer"
          >
            Selesai
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenWA}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>Kirim via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
