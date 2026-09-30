import type { Santri, SetoranRecord } from '../components/dashboard/types';
import { storageService } from './storageService';

export interface SendResult {
  success: boolean;
  message: string;
  provider?: string;
  error?: string;
  fallbackUrl?: string;
  notConfigured?: boolean;
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
    messageType: 'setoran' | 'broadcast' | 'test' = 'setoran'
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
};
