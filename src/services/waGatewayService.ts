import type { Santri, SetoranRecord } from '../components/dashboard/types';
import { storageService } from './storageService';

export const waGatewayService = {
  /**
   * Normalisasi nomor telepon ke format internasional Indonesia (62xxx)
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('+62')) {
      cleaned = cleaned.slice(1);
    } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  },

  /**
   * Membuat tautan langsung ke WhatsApp Web / Mobile (wa.me)
   */
  getDirectWALink(phone: string, text: string): string {
    const clean = this.normalizePhoneNumber(phone);
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Buka WhatsApp Web / Mobile langsung di tab baru
   */
  openDirectWA(phone: string, text: string): void {
    const url = this.getDirectWALink(phone, text);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },

  /**
   * Format template pesan dengan mengganti variabel {variabel}
   */
  formatMessage(template: string, vars: Record<string, string | number>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }
    return result;
  },

  /**
   * Buat pesan setoran untuk wali santri berdasarkan record setoran
   */
  buildSetoranMessage(record: SetoranRecord, santri: Santri): string {
    const config = storageService.getWATemplateConfig();
    const template = record.type === 'ziyadah' ? config.templateZiyadah : config.templateMurojaah;

    const gradeLabel = {
      mumtaz: 'Mumtaz (Lancar)',
      jayyid: 'Jayyid (Cukup)',
      iadah: "I'adah (Perlu Diulang)",
    }[record.grade];

    const now = new Date(record.createdAt);
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    let statusNote = '';
    if (record.grade === 'iadah') {
      statusNote = `\n⚠️ *Catatan:* Perlu dimuroja'ah kembali ba'da maghrib di rumah agar lancar.`;
    } else if (record.notes) {
      statusNote = `\n💬 *Catatan:* ${record.notes}`;
    }

    return this.formatMessage(template, {
      nama: santri.name,
      nis: santri.nis,
      wali: santri.parentName || 'Ayah/Bunda',
      jenis: record.type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah",
      surah: record.surahName,
      juz: record.juz,
      halaman: record.pageStart === record.pageEnd ? `Hal. ${record.pageStart}` : `Hal. ${record.pageStart}–${record.pageEnd}`,
      barisAwal: record.lineStart,
      barisAkhir: record.lineEnd,
      baris: record.totalLines,
      nilai: gradeLabel,
      capaianJuz: santri.juzAchieved,
      waktu: timeStr,
      tanggal: dateStr,
      musyrif: record.musyrif,
      catatan: statusNote,
      statusCatatan: statusNote,
    });
  },

  /**
   * Buat pesan laporan progres harian santri
   */
  buildDailyProgressMessage(santri: Santri): string {
    const config = storageService.getWATemplateConfig();
    const settings = storageService.getHalaqahSettings();
    const todayRecords = storageService.getTodaySetoranForSantri(santri.id);

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const linesToday = todayRecords.reduce((acc, r) => acc + r.totalLines, 0) || santri.linesCompletedToday;
    const estPagesToday = (linesToday / 15).toFixed(1);

    // Format rincian sesi harian
    let rincianSesi = '';
    if (todayRecords.length === 0) {
      rincianSesi = `_Belum ada setoran hari ini._`;
    } else {
      rincianSesi = todayRecords
        .map((r, idx) => {
          const typeTag = r.type === 'ziyadah' ? 'Ziyadah' : "Muroja'ah";
          const gradeStr =
            r.grade === 'mumtaz'
              ? 'Lancar'
              : r.grade === 'jayyid'
              ? 'Cukup'
              : "Perlu Diulang";
          const pageRange = r.pageStart === r.pageEnd ? `Hal. ${r.pageStart}` : `Hal. ${r.pageStart}–${r.pageEnd}`;
          let entry = `${idx + 1}. [${typeTag}] ${r.surahName} (${pageRange}) • *${gradeStr}*`;
          if (r.notes && r.notes.trim()) {
            entry += `\n   Catatan: ${r.notes}`;
          }
          return entry;
        })
        .join('\n');
    }

    // Status harian
    let statusHarian = '';
    if (linesToday >= santri.dailyTargetLines) {
      statusHarian = '✅ Tercapai';
    } else if (linesToday > 0) {
      statusHarian = `Kurang ${santri.dailyTargetLines - linesToday} baris`;
    } else {
      statusHarian = 'Belum setor';
    }

    // Status Pacing kurikulum 30 Juz
    const remainingLines = Math.max(0, (santri.totalLinesTarget || 9060) - (santri.totalLinesMemorized || 0));
    let statusPacing = '';
    if (linesToday >= santri.dailyTargetLines) {
      statusPacing = 'Sesuai Target';
    } else {
      statusPacing = 'Perlu ditingkatkan';
    }

    // Catatan Muhaffizh
    let catatanMusyrif = '';
    const hasIadah = todayRecords.some((r) => r.grade === 'iadah');
    if (hasIadah) {
      catatanMusyrif = `\n💬 *Pesan Muhaffizh:* Mohon dibantu muroja'ah di rumah ba'da maghrib agar hafalan ananda makin lancar.`;
    } else if (todayRecords.length > 0 && linesToday >= santri.dailyTargetLines) {
      catatanMusyrif = `\n💬 *Pesan Muhaffizh:* Alhamdulillah setoran ananda hari ini sangat baik dan lancar.`;
    }

    return this.formatMessage(config.templateDailyProgress, {
      nama: santri.name,
      nis: santri.nis,
      wali: santri.parentName || 'Ayah/Bunda',
      tanggal: dateStr,
      targetHarian: santri.dailyTargetLines,
      tercapaiHariIni: linesToday,
      halamanHariIni: estPagesToday,
      statusHarian,
      rincianSesi,
      totalHafalan: `${santri.juzAchieved} (${santri.totalLinesMemorized || 0} Baris)`,
      sisaTarget: remainingLines,
      statusPacing,
      catatanMusyrif,
      musyrif: settings.musyrifName || 'Muhaffizh Halaqoh',
      halaqoh: santri.halaqahName || settings.halaqahName || 'Halaqoh Tahfidz',
    });
  },
};
