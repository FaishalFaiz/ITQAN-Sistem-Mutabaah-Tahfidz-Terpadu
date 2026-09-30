import React from 'react';
import type { Santri } from './types';
import { FastSetoranForm } from '../halaqah/FastSetoranForm';
import { PacingCard } from '../visualization/PacingCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SantriModalProps {
  type: 'setor' | 'detail' | null;
  santri: Santri | null;
  onClose: () => void;
  onSaveSetor?: (santriId: string, linesAdded: number) => void;
}

export const SantriModal: React.FC<SantriModalProps> = ({
  type,
  santri,
  onClose,
  onSaveSetor,
}) => {
  if (!type || !santri) return null;

  return (
    <Dialog open={Boolean(type && santri)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {type === 'setor' ? `Input Setoran: ${santri.name}` : `Detail Capaian: ${santri.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            NIS: {santri.nis} • Capaian Saat Ini: {santri.juzAchieved} • Wali: {santri.parentName || '-'} ({santri.parentPhone || 'No WA belum ada'})
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          {type === 'setor' ? (
            <div>
              <FastSetoranForm 
                santri={santri} 
                onSuccess={onClose} 
                onSaveSetor={(lines) => onSaveSetor && onSaveSetor(santri.id, lines)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <PacingCard
                santriName={santri.name}
                nis={santri.nis}
                totalLinesMemorized={santri.totalLinesMemorized}
                totalLinesTarget={santri.totalLinesTarget}
                daysRemaining={650}
                dailyTargetLines={santri.dailyTargetLines}
                linesCompletedToday={santri.linesCompletedToday}
                status={santri.status === 'tercapai' ? 'on_track' : 'behind'}
              />

              <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs space-y-1.5">
                <span className="font-bold text-foreground block">Riwayat Setoran Terakhir</span>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Surah: <b className="text-foreground">{santri.lastSurah}</b></span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mumtaz (Lancar Sekali)
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Disimak oleh: Ust. Abdullah</span>
                  <span>Waktu: 07:15 WIB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
