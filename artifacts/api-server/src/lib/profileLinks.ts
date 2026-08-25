export type ProfileLink = { id: string; label: string; url: string };

const MAX_LINKS = 40;
const MAX_LABEL = 48;
const MAX_URL = 500;

function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function parseProfileLinks(raw: string | null | undefined): ProfileLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sanitizeProfileLinks(parsed);
  } catch {
    return [];
  }
}

export function sanitizeProfileLinks(input: unknown): ProfileLink[] {
  if (!Array.isArray(input)) return [];
  const out: ProfileLink[] = [];
  const seen = new Set<string>();
  for (const row of input) {
    if (out.length >= MAX_LINKS) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const url = normalizeHttpUrl(typeof rec.url === "string" ? rec.url : "");
    if (!url) continue;
    const key = url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const id =
      typeof rec.id === "string" && /^[a-zA-Z0-9_-]{4,24}$/.test(rec.id) ? rec.id : newId();
    const label = typeof rec.label === "string" ? rec.label.trim().slice(0, MAX_LABEL) : "";
    out.push({ id, label, url: url.slice(0, MAX_URL) });
  }
  return out;
}

export function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
