/** Soft E.164-ish phone check — digit count ≥10, max 40 chars. */

export function normalizePhone(
  raw: unknown,
): { ok: true; phone: string } | { ok: false; error: string } {
  if (typeof raw !== "string") {
    return { ok: false, error: "Telefon zorunlu" };
  }
  const phone = raw.trim().slice(0, 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return { ok: false, error: "Geçerli bir telefon gir (en az 10 rakam)" };
  }
  return { ok: true, phone };
}

export function isValidPhone(raw: unknown): boolean {
  return normalizePhone(raw).ok;
}
