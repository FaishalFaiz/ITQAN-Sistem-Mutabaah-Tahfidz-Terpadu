import React from 'react';
import type { Santri } from './types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SantriCardProps {
  santri: Santri;
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const SantriCard: React.FC<SantriCardProps> = ({
  santri,
  onSetor,
  onDetail,
}) => {
  const getStatusDot = () => {
    switch (santri.status) {
      case 'tercapai':
        return 'bg-emerald-500';
      case 'tidak_tercapai':
        return 'bg-red-500';
      case 'belum_setor':
        return 'bg-amber-400';
    }
  };

  const percent = Math.min(100, Math.round((santri.linesCompletedToday / santri.dailyTargetLines) * 100));

  return (
    <Card className="santri-card-item rounded-xl p-4 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Top section: Avatar, Name, "Sekian Juz" */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar with status indicator dot */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 text-brand flex items-center justify-center font-bold text-xs shadow-2xs">
              {santri.avatarInitials}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-card ${getStatusDot()}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {santri.name}
            </h4>
            <p className="text-xs font-semibold text-brand mt-0.5">
              {santri.juzAchieved} <span className="text-muted-foreground font-normal">/ 30 Juz</span>
            </p>
          </div>
        </div>

        {/* Informative Progress Bar for Daily Setoran */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Hari ini</span>
            <span className="font-medium text-foreground">
              {santri.linesCompletedToday} / {santri.dailyTargetLines} Baris
            </span>
          </div>
          <Progress value={percent} className="h-1.5 bg-muted" />
        </div>
      </div>

      {/* Two action buttons side-by-side: "Setor" and "Detail" */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <Button
          size="sm"
          onClick={() => onSetor(santri)}
          className="w-full text-xs font-semibold h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
        >
          Setor
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDetail(santri)}
          className="w-full text-xs font-semibold h-8"
        >
          Detail
        </Button>
      </div>
    </Card>
  );
};
