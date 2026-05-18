import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Supabase'te TEXT olarak saklanan fiyat alanlarını güvenli biçimde
 * tamsayıya çevirir. Boş string, null, undefined ya da NaN durumlarında
 * her zaman 0 döner — toplama/biçimlendirme işlemlerinde patlama olmaz.
 */
export function parsePriceText(
  priceText: string | null | undefined
): number {
  if (priceText == null) return 0
  const trimmed = String(priceText).trim()
  if (trimmed === "") return 0
  const parsed = parseInt(trimmed, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Aynı güvenli parse mantığı + Türk Lirası formatı.
 */
export function formatPriceText(
  priceText: string | null | undefined
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(parsePriceText(priceText))
}
