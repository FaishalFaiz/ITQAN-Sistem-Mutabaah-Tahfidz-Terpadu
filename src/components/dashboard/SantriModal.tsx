import React from 'react';
import type { Santri } from './types';
import { FastSetoranForm } from '../halaqah/FastSetoranForm';
import { PacingCard } from '../visualization/PacingCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="w-[96vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-slate-200 shadow-xl bg-white focus:outline-none">
        <DialogHeader className="pb-2.5 border-b border-slate-100 text-left">
          <DialogTitle className="text-base font-bold text-slate-900 pr-6">
            {type === 'setor' ? `Setoran: ${santri.name}` : `Detail: ${santri.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-1">


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
