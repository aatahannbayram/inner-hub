/** Yapıştırılan metin başında değil de içinde bir http(s) linki taşıyorsa
 *  (ör. "[Ürünüm](https://site.com/x)" gibi zengin metin/markdown) o linki
 *  bulup çıkarır; yoksa metnin tamamını kullanır. Ardından şemayı ve baştaki
 *  eğik çizgileri temizler. */
export function stripUrlScheme(raw: string): string {
  const trimmed = raw.trim();
  const embedded = trimmed.match(/https?:\/\/[^\s)\]"'<>]+/i);
  const candidate = embedded ? embedded[0] : trimmed;
  return candidate.replace(/^https?:\/\//i, "").replace(/^\/+/, "");
}

/** Dosyayı canvas üzerinden JPEG'e sıkıştırıp data URL'e çevirir - ayrı bir
 *  dosya depolama servisi gerekmez. */
export async function compressImageToDataUrl(file: File, maxChars = 280_000): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let w = bitmap.width;
  let h = bitmap.height;
  const maxDim = 1200;
  if (Math.max(w, h) > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  let quality = 0.85;
  let dataUrl = "";
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= maxChars) break;
    if (quality > 0.45) quality -= 0.1;
    else {
      w = Math.max(160, Math.round(w * 0.75));
      h = Math.max(160, Math.round(h * 0.75));
    }
  }
  bitmap.close();
  if (dataUrl.length > maxChars) throw new Error("too_large");
  return dataUrl;
}
