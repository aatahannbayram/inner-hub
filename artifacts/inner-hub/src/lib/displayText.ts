/**
 * Kullanıcıya görünen başlık/metinlerdeki em/en dash'i sadeleştirir.
 * "Başlık - Alt" → "Başlık · Alt" (veya stripSuffix ile yalnızca sol taraf).
 * Salt tire/nokta süslemeleri (········) boş sayılır.
 */
export function isDecorativeLabel(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  return /^[\s·.\-_—–―•]+$/u.test(t);
}

export function cleanDisplayText(text: string, opts?: { stripSuffix?: boolean }): string {
  if (!text) return text;
  if (isDecorativeLabel(text)) return "";
  if (opts?.stripSuffix) {
    return text.replace(/\s*[--―]\s*.+$/u, "").trim();
  }
  return text.replace(/\s*[--―]\s*/g, " · ").trim();
}
