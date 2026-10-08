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

/**
 * Konversi nama string menjadi URL slug yang ramah SEO dan manusia (kebab-case)
 * Contoh: "Muhammad Fatih Robbani" -> "muhammad-fatih-robbani"
 * Contoh: "Ja'far bin Abi Thalib" -> "jafar-bin-abi-thalib"
 * Contoh: "M. Farhan Al-Ayyubi" -> "m-farhan-al-ayyubi"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Buat slug unik untuk santri berdasarkan nama (dan NIS jika ada santri dengan nama sama)
 */
export function getSantriSlug<T extends { id: string; name: string; nis?: string }>(
  santri: T,
  allSantri: T[] = []
): string {
  const base = slugify(santri.name);
  if (!base) return santri.nis?.toLowerCase() || santri.id || 'santri';

  if (allSantri && allSantri.length > 0) {
    const duplicates = allSantri.filter((s) => s.id !== santri.id && slugify(s.name) === base);
    if (duplicates.length > 0 && santri.nis) {
      return `${base}-${santri.nis.toLowerCase()}`;
    }
  }

  return base;
}

/**
 * Temukan santri dari daftar berdasarkan URL param (bisa berupa slug nama, NIS, ataupun ID/UUID lama)
 */
export function findSantriByParam<T extends { id: string; name: string; nis?: string }>(
  santriList: T[],
  param: string | undefined | null
): T | undefined {
  if (!param || !santriList || santriList.length === 0) return undefined;
  const decoded = decodeURIComponent(param).trim().toLowerCase();

  // 1. Prioritas utama: Pencocokan slug nama santri
  const bySlug = santriList.find((s) => {
    const slug = slugify(s.name);
    return slug === decoded || (s.nis && `${slug}-${s.nis.toLowerCase()}` === decoded);
  });
  if (bySlug) return bySlug;

  // 2. Pencocokan NIS
  const byNis = santriList.find((s) => s.nis && s.nis.toLowerCase() === decoded);
  if (byNis) return byNis;

  // 3. Pencocokan ID / UUID asli (kompatibilitas backward jika user membuka link lama)
  const byId = santriList.find((s) => {
    if (s.id === param || s.id.toLowerCase() === decoded) return true;
    const cleanS = s.id.replace(/-/g, '').toLowerCase();
    const cleanP = decoded.replace(/-/g, '').toLowerCase();
    return cleanS === cleanP;
  });
  if (byId) return byId;

  // 4. Fallback: Pencocokan alfanumerik longgar jika ada perbedaan tanda baca kecil
  const cleanTarget = decoded.replace(/[^a-z0-9]/g, '');
  if (cleanTarget.length >= 3) {
    const byLoose = santriList.find(
      (s) => s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget
    );
    if (byLoose) return byLoose;
  }

  return undefined;
}
