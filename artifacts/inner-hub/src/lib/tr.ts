// Türkçe'de düz toUpperCase()/toLowerCase() YASAK: "İstanbul".toLowerCase()
// === "i̇stanbul" (yanlış, kombine karakter) üretir; "İ"/"I" harfleri
// Türkçe'de dotted/dotless kuralına göre farklı davranır. Locale-aware kullan.

export function toUpperTR(s: string): string {
  return s.toLocaleUpperCase("tr-TR");
}

export function toLowerTR(s: string): string {
  return s.toLocaleLowerCase("tr-TR");
}

export function compareTR(a: string, b: string): number {
  return a.localeCompare(b, "tr");
}

// Mevcut "%0" biçimi Türkçe için DOĞRU — bu yardımcı yalnızca elle string
// birleştirme yapılan (`%${x}`) yerlerde tutarlılık için opsiyoneldir.
export function formatPercentTR(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 }).format(value / 100);
}
