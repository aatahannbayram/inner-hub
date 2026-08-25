/** Soft phone check — digit count ≥10, max 40 (mirrors API). */

export function isValidPhone(raw: string): boolean {
  const digits = raw.trim().replace(/\D/g, "");
  return digits.length >= 10 && raw.trim().length <= 40;
}

export function normalizePhoneInput(raw: string): string {
  return raw.trim().slice(0, 40);
}
