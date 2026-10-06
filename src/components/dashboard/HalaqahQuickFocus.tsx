import React, { useRef, useEffect, useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, Clock, BookOpen } from 'lucide-react';
import gsap from 'gsap';
import type { Santri } from './types';
import { storageService } from '../../services/storageService';
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

  // Rekomendasi Giliran Simak Muroja'ah (Smart Queue)
  const smartMurojaahQueue = useMemo(() => {
    const allRecords = storageService.getSetoranRecords();
    const now = new Date().getTime();

    const evaluated = santriList.map((s) => {
      const murojaahRecords = allRecords.filter((r) => r.santriId === s.id && r.type === 'murojaah');
      let daysSinceLast = 999;
      let lastJuz = Math.max(1, Math.floor(parseFloat(s.juzAchieved.replace(/[^0-9.]/g, '')) || 1));

      if (murojaahRecords.length > 0) {
        const sorted = [...murojaahRecords].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastDate = new Date(sorted[0].createdAt).getTime();
        daysSinceLast = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));
        lastJuz = sorted[0].juz || lastJuz;
      }

      return {
        santri: s,
        daysSinceLast,
        suggestedJuz: lastJuz,
      };
    });

    // Urutkan yang paling lama tidak murojaah
    return evaluated.sort((a, b) => b.daysSinceLast - a.daysSinceLast).slice(0, 3);
  }, [santriList]);

  // Total lines accomplished today across all santri
  const totalLinesToday = santriList.reduce((acc, s) => acc + s.linesCompletedToday, 0);
  const totalTargetLines = santriList.reduce((acc, s) => acc + s.dailyTargetLines, 0);
  const progressPercent = Math.min(100, Math.round((totalLinesToday / (totalTargetLines || 1)) * 100));

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.focus-queue-item');
    if (!items || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
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
            {santriList.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-slate-500 bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                Belum ada santri terdaftar di halaqoh ini. Tambahkan santri baru untuk memulai pencatatan target setoran.
              </div>
            ) : priorityList.length === 0 ? (
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

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => onDetail(s)}
                      className="text-xs font-semibold h-9 px-3 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 justify-center"
                    >
                      Lihat Profil
                    </Button>
                    <Button
                      onClick={() => onSetor(s)}
                      className="text-xs font-semibold h-9 px-3 bg-[#0070BA] hover:bg-[#005C9E] active:scale-[0.97] transition-all text-white shadow-2xs rounded-lg justify-center cursor-pointer"
                    >
                      Simak Setor
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rekomendasi Giliran Muroja'ah (Smart Queue) - Desain Konsisten */}
          {smartMurojaahQueue.length > 0 && santriList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0070BA]" />
                  <span className="text-xs font-bold text-foreground">
                    Giliran Simak Muroja'ah Hari Ini
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">Paling lama belum setor ulang</span>
              </div>

              <div className="space-y-2">
                {smartMurojaahQueue.map(({ santri: s, daysSinceLast, suggestedJuz }) => (
                  <div
                    key={`murojaah-${s.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-background border border-border text-[#0070BA] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {s.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-xs text-foreground truncate">{s.name}</span>
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0070BA] border border-blue-200">
                            Fokus Juz {suggestedJuz}
                          </span>
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-2.5 h-2.5 mr-1" />
                            {daysSinceLast >= 30 ? 'Belum Muroja\'ah' : `${daysSinceLast} hari lalu`}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                          {s.juzAchieved} • Terakhir: {s.lastSurah}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => onDetail(s)}
                        className="text-xs font-semibold h-9 px-3 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 justify-center"
                      >
                        Lihat Profil
                      </Button>
                      <Button
                        onClick={() => onSetor(s)}
                        className="text-xs font-semibold h-9 px-3 bg-[#0070BA] hover:bg-[#005C9E] active:scale-[0.97] transition-all text-white shadow-2xs rounded-lg justify-center cursor-pointer"
                      >
                        Simak Muroja'ah
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        </CardContent>
      </Card>
    </div>
  );
};
