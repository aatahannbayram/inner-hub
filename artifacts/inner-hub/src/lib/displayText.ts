/**
 * Kullanıcıya görünen başlık/metinlerdeki em/en dash'i sadeleştirir.
 * "Başlık - Alt" → "Başlık · Alt" (veya stripSuffix ile yalnızca sol taraf).
 */
export function cleanDisplayText(text: string, opts?: { stripSuffix?: boolean }): string {
  if (!text) return text;
  if (opts?.stripSuffix) {
    return text.replace(/\s*[--―]\s*.+$/u, "").trim();
  }
  return text.replace(/\s*[--―]\s*/g, " · ").trim();
}
