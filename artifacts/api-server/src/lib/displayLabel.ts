/** Salt tire/nokta süslemeleri (-------- → cleanDisplayText sonrası ········). */
export function isDecorativeLabel(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  return /^[\s·.\-_—–―•]+$/u.test(t);
}
