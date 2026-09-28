import React from 'react';
import { X } from 'lucide-react';
import type { Santri } from './types';
import { FastSetoranForm } from '../halaqah/FastSetoranForm';
import { PacingCard } from '../visualization/PacingCard';

interface SantriModalProps {
  type: 'setor' | 'detail' | null;
  santri: Santri | null;
  onClose: () => void;
}

export const SantriModal: React.FC<SantriModalProps> = ({
  type,
  santri,
  onClose,
}) => {
  if (!type || !santri) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {type === 'setor' ? `Input Setoran: ${santri.name}` : `Detail Capaian: ${santri.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              NIS: {santri.nis} • Capaian: {santri.juzAchieved}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {type === 'setor' ? (
            <div>
              <FastSetoranForm onSuccess={onClose} />
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

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block">Riwayat Setoran Terakhir</span>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Surah: <b>{santri.lastSurah}</b></span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mumtaz (Lancar Sekali)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Disimak oleh: Ust. Abdullah</span>
                  <span>Waktu: 07:15 WIB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
