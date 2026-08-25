export type ProfileLink = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  featured: boolean;
  scheduledFrom?: string | null;
  scheduledTo?: string | null;
  icon?: string | null;
};

const MAX_LINKS = 12;
const MAX_FEATURED = 2;
const MAX_LABEL = 48;
const MAX_URL = 500;

function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function parseIso(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
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
  let featuredCount = 0;

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
    const sortOrder =
      typeof rec.sortOrder === "number" && Number.isFinite(rec.sortOrder)
        ? Math.max(0, Math.min(999, Math.floor(rec.sortOrder)))
        : out.length;
    let featured = rec.featured === true;
    if (featured) {
      if (featuredCount >= MAX_FEATURED) featured = false;
      else featuredCount += 1;
    }
    const scheduledFrom = parseIso(rec.scheduledFrom);
    const scheduledTo = parseIso(rec.scheduledTo);
    const icon =
      typeof rec.icon === "string" && rec.icon.trim()
        ? rec.icon.trim().slice(0, 40)
        : null;
    out.push({
      id,
      label,
      url: url.slice(0, MAX_URL),
      sortOrder,
      featured,
      scheduledFrom,
      scheduledTo,
      icon,
    });
  }

  out.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  return out.map((l, i) => ({ ...l, sortOrder: i }));
}

/** Public card: only links active for `now` (schedule window). Featured first. */
export function publicProfileLinks(
  links: ProfileLink[],
  now = new Date(),
): ProfileLink[] {
  const t = now.getTime();
  const active = links.filter((l) => {
    if (l.scheduledFrom) {
      const from = Date.parse(l.scheduledFrom);
      if (!Number.isNaN(from) && t < from) return false;
    }
    if (l.scheduledTo) {
      const to = Date.parse(l.scheduledTo);
      if (!Number.isNaN(to) && t > to) return false;
    }
    return true;
  });
  return [...active].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
  });
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

export const PROFILE_LINKS_MAX = MAX_LINKS;
export const PROFILE_LINKS_MAX_FEATURED = MAX_FEATURED;
