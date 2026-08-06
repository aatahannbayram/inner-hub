/**
 * Kullanıcıya görünen başlık/metinlerdeki em/en dash ayırıcılarını sadeleştirir.
 * "Başlık - Alt" → "Başlık · Alt" (veya stripSuffix ile yalnızca sol taraf).
 *
 * ÖNEMLİ: Karakter sınıfında `[--―]` KULLANMA — JS’te `-`…`―` aralığı
 * harf/rakamları da yer (başlıklar · · · · olur).
 */

const SEP = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]/; // tire çeşitleri, tek başına

export function isDecorativeLabel(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  // Salt ayırıcı / nokta süsü
  return /^[\s·.•\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]+$/u.test(t);
}

export function cleanDisplayText(text: string, opts?: { stripSuffix?: boolean }): string {
  if (!text) return text;
  if (isDecorativeLabel(text)) return "";

  if (opts?.stripSuffix) {
    // "Başlık - alt açıklama" → "Başlık"
    return text.replace(/\s+[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]\s+.+$/u, "").trim();
  }

  // Yalnızca boşlukla çevrili tire / em dash ayırıcılarını · yap
  return text
    .replace(/\s+[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]\s+/gu, " · ")
    .trim();
}
