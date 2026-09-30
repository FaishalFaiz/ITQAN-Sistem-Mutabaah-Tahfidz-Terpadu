import type { Santri, SetoranRecord } from '../components/dashboard/types';
import { storageService, getTodayDateKey } from './storageService';

export interface SendResult {
  success: boolean;
  message: string;
  provider?: string;
  error?: string;
  fallbackUrl?: string;
  notConfigured?: boolean;
  alreadySentToday?: boolean;
}

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
      storageService.addWALog({
        recipientName: 'Wali Santri',
        recipientPhone: phone,
        messageType: 'setoran',
        status: 'fallback_opened',
        statusText: 'Dibuka via wa.me (WhatsApp Web/App)',
        snippet: text.slice(0, 100) + '...',
      });
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
    const config = storageService.getWAGatewayConfig();
    const template = record.type === 'ziyadah' ? config.templateZiyadah : config.templateMurojaah;

    const gradeLabel = {
      mumtaz: 'Mumtaz (Lancar Sekali - 100%)',
      jayyid: 'Jayyid (Lancar Bersyarat - Cukup Baik)',
      iadah: "I'adah (Perlu Pengulangan / Pendampingan)",
    }[record.grade];

    const now = new Date(record.createdAt);
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    let statusNote = '';
    if (record.grade === 'iadah') {
      statusNote = `⚠️ *Catatan Khusus Musyrif:*\nAnanda perlu melancarkan kembali ayat ini sebelum melanjutkan ke halaman berikutnya. Mohon Ayah/Bunda mengingatkan muroja'ah ba'da maghrib di rumah.`;
    } else if (record.notes) {
      statusNote = `💬 *Catatan Musyrif:* ${record.notes}`;
    }

    return this.formatMessage(template, {
      nama: santri.name,
      nis: santri.nis,
      wali: santri.parentName || 'Ayah/Bunda',
      jenis: record.type === 'ziyadah' ? 'Ziyadah (Hafalan Baru)' : "Muroja'ah (Pengulangan)",
      surah: record.surahName,
      juz: record.juz,
      halaman: record.pageStart === record.pageEnd ? record.pageStart : `${record.pageStart}–${record.pageEnd}`,
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
   * Kirim pesan melalui WhatsApp Gateway yang dikonfigurasi pengguna
   */
  async sendMessage(
    recipientPhone: string,
    recipientName: string,
    message: string,
    messageType: 'setoran' | 'broadcast' | 'test' | 'daily_report' = 'setoran'
  ): Promise<SendResult> {
    const config = storageService.getWAGatewayConfig();
    const cleanPhone = this.normalizePhoneNumber(recipientPhone);
    const fallbackUrl = this.getDirectWALink(recipientPhone, message);

    // Jika endpoint belum diisi sama sekali
    if (!config.endpointUrl || !config.endpointUrl.trim()) {
      return {
        success: false,
        notConfigured: true,
        message: 'Endpoint WhatsApp Gateway belum dikonfigurasi di Pengaturan.',
        fallbackUrl,
      };
    }

    try {
      let response: Response;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.provider === 'fonnte') {
        headers['Authorization'] = config.apiKey;
        response = await fetch(config.endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            target: cleanPhone,
            message,
            countryCode: '62',
          }),
        });
      } else if (config.provider === 'waha') {
        if (config.apiKey) {
          headers['X-Api-Key'] = config.apiKey;
        }
        response = await fetch(config.endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            chatId: `${cleanPhone}@c.us`,
            text: message,
            session: 'default',
          }),
        });
      } else if (config.provider === 'wablas') {
        headers['Authorization'] = config.apiKey;
        response = await fetch(config.endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            phone: cleanPhone,
            message,
          }),
        });
      } else {
        // Custom Provider
        if (config.apiKey) {
          headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
        response = await fetch(config.endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            phone: cleanPhone,
            message,
            recipientName,
            senderNumber: config.senderNumber,
          }),
        });
      }

      if (response.ok) {
        storageService.addWALog({
          recipientName,
          recipientPhone: cleanPhone,
          messageType,
          status: 'success',
          statusText: `Terkirim via ${config.provider.toUpperCase()} Gateway (HTTP ${response.status})`,
          snippet: message.slice(0, 100) + '...',
        });

        return {
          success: true,
          provider: config.provider,
          message: `Berhasil terkirim via ${config.provider.toUpperCase()} Gateway.`,
        };
      } else {
        const errText = await response.text().catch(() => 'Unknown error');
        storageService.addWALog({
          recipientName,
          recipientPhone: cleanPhone,
          messageType,
          status: 'failed',
          statusText: `Gagal HTTP ${response.status}: ${errText.slice(0, 100)}`,
          snippet: message.slice(0, 100) + '...',
        });

        return {
          success: false,
          error: `Gateway merespon HTTP ${response.status}: ${errText}`,
          message: `Pengiriman gateway gagal. Silakan gunakan tautan langsung WhatsApp.`,
          fallbackUrl,
        };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Koneksi ke gateway gagal (Network / CORS)';
      storageService.addWALog({
        recipientName,
        recipientPhone: cleanPhone,
        messageType,
        status: 'failed',
        statusText: `Gagal koneksi: ${errorMessage}`,
        snippet: message.slice(0, 100) + '...',
      });

      return {
        success: false,
        error: errorMessage,
        message: `Koneksi gateway tidak dapat dihubungi (${errorMessage}). Gunakan Direct WhatsApp.`,
        fallbackUrl,
      };
    }
  },

  /**
   * Kirim pesan uji coba untuk memverifikasi pengaturan Gateway
   */
  async sendTestMessage(targetPhone: string): Promise<SendResult> {
    const testMessage = 
      `*TES KONEKSI WHATSAPP GATEWAY ITQAN*\n\n` +
      `Alhamdulillah, konfigurasi WhatsApp Gateway pada Sistem Mutaba'ah ITQAN berhasil terhubung dengan baik.\n\n` +
      `Waktu Uji: ${new Date().toLocaleString('id-ID')}\n` +
      `_Pesan otomatis verifikasi sistem._`;

    return this.sendMessage(targetPhone, 'Musyrif (Test)', testMessage, 'test');
  },

  /**
   * Menyusun pesan Laporan Harian (Daily Digest) untuk dikirim 1x per hari ke wali santri
   */
  buildDailyProgressMessage(santri: Santri): string {
    const config = storageService.getWAGatewayConfig();
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
      rincianSesi = `_Belum ada riwayat setoran masuk hari ini._`;
    } else {
      rincianSesi = todayRecords
        .map((r, idx) => {
          const typeTag = r.type === 'ziyadah' ? 'Ziyadah (Baru)' : "Muroja'ah (Ulang)";
          const gradeStr =
            r.grade === 'mumtaz'
              ? 'Mumtaz ⭐'
              : r.grade === 'jayyid'
              ? 'Jayyid'
              : "I'adah ⚠️";
          const pageRange = r.pageStart === r.pageEnd ? `Hal. ${r.pageStart}` : `Hal. ${r.pageStart}–${r.pageEnd}`;
          let entry = `${idx + 1}. *[${typeTag}]* ${r.surahName} (${pageRange}, ${r.totalLines} baris) • *${gradeStr}*`;
          if (r.notes && r.notes.trim()) {
            entry += `\n   ↳ _Catatan: ${r.notes}_`;
          }
          return entry;
        })
        .join('\n');
    }

    // Status harian
    let statusHarian = '';
    if (linesToday >= santri.dailyTargetLines) {
      statusHarian = '✅ TERCAPAI (Target Terpenuhi)';
    } else if (linesToday > 0) {
      statusHarian = `⚠️ BELUM TERCAPAI (Kurang ${santri.dailyTargetLines - linesToday} Baris)`;
    } else {
      statusHarian = '⚪ BELUM SETOR HARI INI';
    }

    // Status Pacing kurikulum 30 Juz
    const remainingLines = Math.max(0, (santri.totalLinesTarget || 9060) - (santri.totalLinesMemorized || 0));
    let statusPacing = '';
    if (linesToday >= santri.dailyTargetLines) {
      statusPacing = '✅ On Track (Sesuai timeline akselerasi 3 tahun)';
    } else {
      statusPacing = '⚠️ Pacing Menurun (Disarankan menambah muroja\'ah mandiri)';
    }

    // Catatan Musyrif
    let catatanMusyrif = '';
    const hasIadah = todayRecords.some((r) => r.grade === 'iadah');
    if (hasIadah) {
      catatanMusyrif = `⚠️ *Pesan Musyrif untuk Wali:*\nAnanda memiliki ayat yang perlu diulang (i'adah) hari ini. Mohon berkenan mendampingi muroja'ah santai di rumah selama 15-20 menit ba'da maghrib agar besok lebih lancar.`;
    } else if (todayRecords.length > 0 && linesToday >= santri.dailyTargetLines) {
      catatanMusyrif = `✨ *Catatan Musyrif:*\nAlhamdulillah ananda sangat fokus dan bersemangat pada sesi mutaba'ah hari ini. Terus berikan apresiasi kepada ananda di rumah.`;
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
      musyrif: settings.musyrifName || 'Ust. Abdullah',
      halaqoh: santri.halaqahName || settings.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq',
    });
  },

  /**
   * Kirim 1 Laporan Harian untuk 1 santri ke nomor wali via WhatsApp Gateway
   * Menegakkan aturan 1 pesan per hari per wali santri jika diaktifkan.
   */
  async sendDailyReport(santri: Santri, force = false): Promise<SendResult> {
    const config = storageService.getWAGatewayConfig();
    const today = getTodayDateKey();

    if (!santri.parentPhone || !santri.parentPhone.trim()) {
      return {
        success: false,
        message: `Nomor WhatsApp Wali untuk ${santri.name} belum terdaftar.`,
      };
    }

    // Cek pembatasan 1 pesan per hari
    if (config.limitOneMessagePerDay && !force && santri.lastDailyReportSentDate === today) {
      return {
        success: false,
        alreadySentToday: true,
        message: `Laporan harian untuk wali ${santri.name} SUDAH terkirim hari ini (${santri.lastDailyReportSentTime || 'Hari ini'}). Gunakan "Kirim Ulang" jika memang ingin mengirim ulang.`,
      };
    }

    const message = this.buildDailyProgressMessage(santri);
    const recipientName = santri.parentName ? `${santri.parentName} (Wali ${santri.name})` : `Wali ${santri.name}`;
    const result = await this.sendMessage(santri.parentPhone, recipientName, message, 'daily_report');

    // Jika sukses terkirim atau fallback dibuka, tandai sudah terkirim hari ini
    if (result.success || result.fallbackUrl) {
      storageService.markDailyReportSent(santri.id);
    }

    return result;
  },

  /**
   * Kirim Laporan Harian secara Batch ke seluruh santri halaqah via Fonnte Gateway
   * Menggunakan jeda 1.5 detik per pesan agar ramah rate-limit WhatsApp & Fonnte.
   */
  async sendBatchDailyReports(
    santriList: Santri[],
    options?: {
      forceResend?: boolean;
      onProgress?: (index: number, total: number, santri: Santri, result: SendResult) => void;
    }
  ): Promise<{ total: number; sent: number; skippedAlreadySent: number; failed: number }> {
    const today = getTodayDateKey();
    const config = storageService.getWAGatewayConfig();
    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < santriList.length; i++) {
      const santri = santriList[i];

      // Jika dibatasi 1 pesan per hari dan sudah terkirim hari ini (dan tidak dipaksa kirim ulang)
      if (config.limitOneMessagePerDay && !options?.forceResend && santri.lastDailyReportSentDate === today) {
        skippedCount++;
        options?.onProgress?.(i + 1, santriList.length, santri, {
          success: false,
          alreadySentToday: true,
          message: 'Dilewati: Sudah terkirim hari ini.',
        });
        continue;
      }

      // Jika nomor HP wali kosong
      if (!santri.parentPhone || !santri.parentPhone.trim()) {
        failedCount++;
        options?.onProgress?.(i + 1, santriList.length, santri, {
          success: false,
          message: 'Nomor WhatsApp wali tidak tersedia.',
        });
        continue;
      }

      const result = await this.sendDailyReport(santri, options?.forceResend ?? false);
      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }

      options?.onProgress?.(i + 1, santriList.length, santri, result);

      // Delay 1.5s per request untuk keamanan antrian gateway Fonnte
      if (i < santriList.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    return {
      total: santriList.length,
      sent: sentCount,
      skippedAlreadySent: skippedCount,
      failed: failedCount,
    };
  },
};
