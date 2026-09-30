import React, { useRef, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HalaqahQuickFocusProps {
  santriList: Santri[];
  onSetor: (santri: Santri) => void;
  onDetail: (santri: Santri) => void;
}

export const HalaqahQuickFocus: React.FC<HalaqahQuickFocusProps> = ({
  santriList,
  onSetor,
  onDetail,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Santri yang butuh perhatian prioritas (tidak tercapai atau belum setor)
  const priorityList = santriList.filter(
    (s) => s.status === 'tidak_tercapai' || s.status === 'belum_setor'
  );

  // Total lines accomplished today across all santri
  const totalLinesToday = santriList.reduce((acc, s) => acc + s.linesCompletedToday, 0);
  const totalTargetLines = santriList.reduce((acc, s) => acc + s.dailyTargetLines, 0);
  const progressPercent = Math.min(100, Math.round((totalLinesToday / (totalTargetLines || 1)) * 100));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.focus-queue-item',
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [priorityList.length]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Antrean & Prioritas Setoran Halaqoh Hari Ini */}
      <Card className="lg:col-span-2 flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">
              Fokus Halaqoh: Antrean Perlu Setoran
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-xs">
            {priorityList.length} Santri Tertunda
          </Badge>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {priorityList.length === 0 ? (
              <div className="py-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                MasyaAllah! Seluruh santri telah menuntaskan target setoran hari ini.
              </div>
            ) : (
              priorityList.map((s) => (
                <div
                  key={s.id}
                  className="focus-queue-item flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-background border border-border text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {s.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-foreground truncate">{s.name}</span>
                        {s.status === 'tidak_tercapai' ? (
                          <Badge variant="iadah" className="gap-1 text-[10px] shrink-0">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            Kurang {s.dailyTargetLines - s.linesCompletedToday} baris
                          </Badge>
                        ) : (
                          <Badge variant="jayyid" className="gap-1 text-[10px] shrink-0">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Belum Setor
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                        {s.juzAchieved} • Terakhir: {s.lastSurah}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      onClick={() => onDetail(s)}
                      className="text-xs font-semibold h-9 px-3.5 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                      Lihat Profil
                    </Button>
                    <Button
                      onClick={() => onSetor(s)}
                      className="text-xs font-semibold h-9 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs rounded-lg"
                    >
                      Simak Setor
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Prioritas bimbingan musyrif sesi aktif ini</span>
            <span className="font-semibold text-foreground">Total Rombel: {santriList.length} Santri</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Target Baris Halaqoh Hari Ini (Ringkasan Kemajuan Kelompok) */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">
              Pencapaian Halaqoh Hari Ini
            </CardTitle>
          </div>
          <span className="text-xs font-bold text-emerald-700">{progressPercent}%</span>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
                <span>Total Baris Terkumpul</span>
                <span className="font-bold text-foreground">{totalLinesToday} / {totalTargetLines} Baris</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-muted" />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1.5 text-muted-foreground border border-border/50">
              <div className="flex justify-between">
                <span>Rata-rata Baris / Santri:</span>
                <b className="text-foreground">{(totalLinesToday / (santriList.length || 1)).toFixed(1)} Baris</b>
              </div>
              <div className="flex justify-between">
                <span>Kesesuaian Target:</span>
                <b className="text-emerald-700">On-Track Sesuai Target</b>
              </div>
              <div className="flex justify-between">
                <span>Santri Selesai:</span>
                <b className="text-foreground">{santriList.length - priorityList.length} dari {santriList.length} Santri</b>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-border text-[11px] text-muted-foreground">
            Target harian otomatis beradaptasi dengan kecepatan halaqoh
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
