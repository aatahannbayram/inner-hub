// API server ayrı bir origin'de çalışıyor (Railway); Hostinger sadece statik dosya sunuyor.
// Build zamanında VITE_API_BASE_URL verilmezse (yerel dev), Vite proxy'si /api'yi yönlendirir.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
