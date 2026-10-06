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
  const [activeSantri, setActiveSantri] = React.useState<Santri | null>(santri);
  const [activeType, setActiveType] = React.useState<'setor' | 'detail' | null>(type);

  React.useEffect(() => {
    if (santri) setActiveSantri(santri);
    if (type) setActiveType(type);
  }, [santri, type]);

  const isOpen = Boolean(type && santri);
  const displaySantri = santri || activeSantri;
  const displayType = type || activeType;

  if (!displaySantri || !displayType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`w-[95vw] ${
          displayType === 'setor' ? 'max-w-lg' : 'max-w-2xl'
        } max-h-[92vh] overflow-y-auto p-4 sm:p-5 rounded-2xl border-slate-200 shadow-xl bg-white focus:outline-none`}
      >
        <DialogHeader className="pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center font-bold text-sm shrink-0 border border-[#0070BA]/20">
              {displaySantri.avatarInitials || displaySantri.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-bold text-slate-900 truncate">
                  {displayType === 'setor' ? `Setoran: ${displaySantri.name}` : `Detail: ${displaySantri.name}`}
                </DialogTitle>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  NIS {displaySantri.nis}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>
                  Target Harian: <b className="text-slate-800 font-semibold">{displaySantri.dailyTargetLines} Baris</b>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Hafalan: <b className="text-slate-800 font-semibold">{displaySantri.juzAchieved}</b>
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-2">
          {displayType === 'setor' ? (
            <FastSetoranForm
              santri={displaySantri}
              onSuccess={onClose}
              onCancel={onClose}
              onSaveSetor={(lines) => onSaveSetor && onSaveSetor(displaySantri.id, lines)}
            />
          ) : (
            <div className="space-y-4 pt-1">
              <PacingCard
                santriName={displaySantri.name}
                nis={displaySantri.nis}
                totalLinesMemorized={displaySantri.totalLinesMemorized}
                totalLinesTarget={displaySantri.totalLinesTarget}
                daysRemaining={650}
                dailyTargetLines={displaySantri.dailyTargetLines}
                linesCompletedToday={displaySantri.linesCompletedToday}
                status={displaySantri.status === 'tercapai' ? 'on_track' : 'behind'}
              />

              <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs space-y-1.5">
                <span className="font-bold text-foreground block">Riwayat Setoran Terakhir</span>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Surah: <b className="text-foreground">{displaySantri.lastSurah}</b></span>
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
