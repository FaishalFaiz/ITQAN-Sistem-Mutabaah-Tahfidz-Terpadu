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
      let targetUrl = config.endpointUrl.trim();

      // Jika berjalan di browser development lokal, arahkan ke proxy untuk mencegah blokir CORS browser
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        if (config.provider === 'fonnte' && targetUrl.startsWith('https://api.fonnte.com')) {
          targetUrl = targetUrl.replace('https://api.fonnte.com', '/api-fonnte');
        } else if (config.provider === 'wablas' && targetUrl.startsWith('https://kudus.wablas.com')) {
          targetUrl = targetUrl.replace('https://kudus.wablas.com', '/api-wablas');
        }
      }

      let response: Response;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.provider === 'fonnte') {
        headers['Authorization'] = config.apiKey.trim();
        response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          credentials: 'omit',
          body: JSON.stringify({
            target: cleanPhone,
            message,
            countryCode: '62',
          }),
        });
      } else if (config.provider === 'waha') {
        if (config.apiKey && config.apiKey.trim()) {
          headers['X-Api-Key'] = config.apiKey.trim();
        }
        response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          credentials: 'omit',
          body: JSON.stringify({
            chatId: `${cleanPhone}@c.us`,
            text: message,
            session: 'default',
          }),
        });
      } else if (config.provider === 'wablas') {
        headers['Authorization'] = config.apiKey.trim();
        response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          credentials: 'omit',
          body: JSON.stringify({
            phone: cleanPhone,
            message,
          }),
        });
      } else {
        // Custom Provider
        if (config.apiKey && config.apiKey.trim()) {
          headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
        }
        response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          credentials: 'omit',
          body: JSON.stringify({
            phone: cleanPhone,
            message,
            recipientName,
            senderNumber: config.senderNumber,
          }),
        });
      }

      const responseText = await response.text().catch(() => '');
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {}

      // Fonnte mengembalikan status: false di dalam JSON meski HTTP status 200 bila token/device invalid
      const isFonnteError =
        config.provider === 'fonnte' &&
        parsedData &&
        (parsedData.status === false || parsedData.status === 'false');

      if (response.ok && !isFonnteError) {
        storageService.addWALog({
          recipientName,
          recipientPhone: cleanPhone,
          messageType,
          status: 'success',
          statusText: `Terkirim via ${config.provider.toUpperCase()} (Otomatis)`,
          snippet: message.slice(0, 100) + '...',
        });

        return {
          success: true,
          provider: config.provider,
          message: `Berhasil terkirim via ${config.provider.toUpperCase()}.`,
        };
      } else {
        const errorDetail =
          parsedData?.reason ||
          parsedData?.message ||
          parsedData?.error ||
          responseText.slice(0, 120) ||
          `HTTP ${response.status}`;

        storageService.addWALog({
          recipientName,
          recipientPhone: cleanPhone,
          messageType,
          status: 'failed',
          statusText: `Gagal kirim: ${errorDetail}`,
          snippet: message.slice(0, 100) + '...',
        });

        return {
          success: false,
          error: errorDetail,
          message: `Pengiriman otomatis belum berhasil (${errorDetail}). Silakan kirim langsung via WhatsApp Web/Aplikasi.`,
          fallbackUrl,
        };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Koneksi pengiriman terputus';
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
        message: `Koneksi pengiriman belum terhubung. Anda dapat membuka dan mengirim via WhatsApp langsung.`,
        fallbackUrl,
      };
    }
  },

  /**
   * Kirim pesan uji coba untuk memverifikasi pengaturan WhatsApp
   */
  async sendTestMessage(targetPhone: string): Promise<SendResult> {
    const testMessage = 
      `*UJI COBA PENGIRIMAN WHATSAPP ITQAN*\n\n` +
      `Alhamdulillah, layanan kirim WhatsApp pada Sistem Mutaba'ah ITQAN berhasil terhubung dengan baik.\n\n` +
      `Waktu Uji: ${new Date().toLocaleString('id-ID')}\n` +
      `_Pesan otomatis verifikasi sistem._`;

    return this.sendMessage(targetPhone, 'Muhaffizh (Test)', testMessage, 'test');
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

    // Format rincian sesi harian (ringkas & jelas untuk orang tua)
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
