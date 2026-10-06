import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka atau string capaian juz agar rapi dan tidak membingungkan:
 * - Menghilangkan desimal trailing .0 yang tidak perlu, misal: 1.0 -> 1 Juz, 30.0 -> 30 Juz
 * - Jika berupa bilangan bulat (1, 30), tampilkan "1 Juz", "30 Juz"
 * - Jika ada bagian desimal bermakna (misal 1.5, 2.3), tampilkan "1.5 Juz", "2.3 Juz"
 * - Jika string input sudah ada kata "Juz" (misal "1.0 Juz" atau "30.0 Juz"), bersihkan desimalnya menjadi "1 Juz" / "30 Juz"
 */
export function formatJuz(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0 Juz';

  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return '0 Juz';
    const rounded = Math.round(val * 10) / 10;
    return `${rounded} Juz`;
  }

  const str = String(val).trim();
  if (!str) return '0 Juz';

  // Hapus desimal .0 atau .00 yang tidak perlu baik di dalam teks maupun sebelum akhiran "Juz"
  const cleaned = str
    .replace(/(\d+)\.0+(?=\s*Juz|\b)/gi, '$1')
    .replace(/(\d+\.\d*?)0+(?=\s*Juz|\b)/gi, '$1');

  // Jika hasil hanya berupa angka (misal "1" atau "1.5"), tambahkan akhiran " Juz"
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return `${cleaned} Juz`;
  }

  return cleaned;
}
