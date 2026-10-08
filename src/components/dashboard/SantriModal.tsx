import React from 'react';
import type { Santri } from './types';
import { FastSetoranForm } from '../halaqah/FastSetoranForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatJuz } from '@/lib/utils';

interface SantriModalProps {
  type: 'setor' | null;
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
  const [cachedSantri, setCachedSantri] = React.useState<Santri | null>(santri);
  const [prevSantri, setPrevSantri] = React.useState(santri);

  if (santri && santri !== prevSantri) {
    setPrevSantri(santri);
    setCachedSantri(santri);
  }

  const isOpen = Boolean(type === 'setor' && santri);
  const displaySantri = santri || cachedSantri;

  if (!displaySantri) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-5 rounded-2xl border-slate-200 shadow-xl bg-white focus:outline-none">
        <DialogHeader className="pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center font-bold text-sm shrink-0 border border-[#0070BA]/20">
              {displaySantri.avatarInitials || displaySantri.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-bold text-slate-900 truncate">
                  Setoran: {displaySantri.name}
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
                  Hafalan: <b className="text-slate-800 font-semibold">{formatJuz(displaySantri.juzAchieved)}</b>
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <FastSetoranForm
            santri={displaySantri}
            onSuccess={onClose}
            onCancel={onClose}
            onSaveSetor={(lines) => onSaveSetor && onSaveSetor(displaySantri.id, lines)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
