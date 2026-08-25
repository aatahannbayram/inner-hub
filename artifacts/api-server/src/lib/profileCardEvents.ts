import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

let ensured = false;

export type CardEventType = "view" | "vcard" | "link" | "qr" | "share";

export async function ensureProfileCardEventsSchema() {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS profile_card_events (
      id serial PRIMARY KEY,
      handle text NOT NULL,
      event_type text NOT NULL,
      link_key text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    ALTER TABLE profile_card_events ADD COLUMN IF NOT EXISTS referrer text
  `);
  await db.execute(sql`
    ALTER TABLE profile_card_events ADD COLUMN IF NOT EXISTS device text
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS profile_card_events_handle_created_idx
      ON profile_card_events (handle, created_at)
  `);
  ensured = true;
}

export function deviceFromUa(ua: string | undefined | null): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|iphone|android/.test(s)) return "mobile";
  return "desktop";
}

function hostLabel(ref: string | null | undefined): string {
  if (!ref) return "(direct)";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "") || "(direct)";
  } catch {
    return "(direct)";
  }
}

export async function recordCardEvent(
  handle: string,
  eventType: CardEventType,
  opts?: { linkKey?: string | null; referrer?: string | null; userAgent?: string | null },
) {
  await ensureProfileCardEventsSchema();
  const h = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  if (!h) return;
  const key = opts?.linkKey?.trim().slice(0, 80) || null;
  const referrer = opts?.referrer?.trim().slice(0, 500) || null;
  const device = deviceFromUa(opts?.userAgent);
  await db.execute(sql`
    INSERT INTO profile_card_events (handle, event_type, link_key, referrer, device)
    VALUES (${h}, ${eventType}, ${key}, ${referrer}, ${device})
  `);
}

export type CardStats = {
  views7d: number;
  views30d: number;
  vcards7d: number;
  links7d: number;
  qr7d: number;
  shares7d: number;
  viewsTotal: number;
  linkClicks: { key: string; n: number }[];
  devices: { device: string; n: number }[];
  topReferrers: { referrer: string; n: number }[];
};

function emptyStats(): CardStats {
  return {
    views7d: 0,
    views30d: 0,
    vcards7d: 0,
    links7d: 0,
    qr7d: 0,
    shares7d: 0,
    viewsTotal: 0,
    linkClicks: [],
    devices: [],
    topReferrers: [],
  };
}

function asRows<T>(raw: unknown): T[] {
  return (Array.isArray(raw) ? raw : (raw as { rows?: unknown[] }).rows ?? []) as T[];
}

export async function getCardStatsForHandle(handle: string): Promise<CardStats> {
  await ensureProfileCardEventsSchema();
  const h = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  if (!h) return emptyStats();

  const weekRaw = await db.execute(sql`
    SELECT event_type, COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND created_at >= now() - interval '7 days'
    GROUP BY event_type
  `);
  const weekRows = asRows<{ event_type: string; n: number }>(weekRaw);

  const monthViewsRaw = await db.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND event_type = 'view'
      AND created_at >= now() - interval '30 days'
  `);
  const monthViews = asRows<{ n: number }>(monthViewsRaw);

  const totalRaw = await db.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h} AND event_type = 'view'
  `);
  const totalRows = asRows<{ n: number }>(totalRaw);

  const linkRaw = await db.execute(sql`
    SELECT COALESCE(link_key, '(other)') AS key, COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND event_type = 'link'
      AND created_at >= now() - interval '30 days'
    GROUP BY 1
    ORDER BY n DESC
    LIMIT 12
  `);
  const linkRows = asRows<{ key: string; n: number }>(linkRaw);

  const deviceRaw = await db.execute(sql`
    SELECT COALESCE(device, 'unknown') AS device, COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND event_type = 'view'
      AND created_at >= now() - interval '30 days'
    GROUP BY 1
    ORDER BY n DESC
  `);
  const deviceRows = asRows<{ device: string; n: number }>(deviceRaw);

  const refRaw = await db.execute(sql`
    SELECT referrer, COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND event_type = 'view'
      AND created_at >= now() - interval '30 days'
    GROUP BY referrer
    ORDER BY n DESC
    LIMIT 8
  `);
  const refRows = asRows<{ referrer: string | null; n: number }>(refRaw);

  const counts: Record<string, number> = {};
  for (const row of weekRows) {
    counts[row.event_type] = Number(row.n) || 0;
  }

  return {
    views7d: counts.view ?? 0,
    views30d: Number(monthViews[0]?.n) || 0,
    vcards7d: counts.vcard ?? 0,
    links7d: counts.link ?? 0,
    qr7d: counts.qr ?? 0,
    shares7d: counts.share ?? 0,
    viewsTotal: Number(totalRows[0]?.n) || 0,
    linkClicks: linkRows.map((r) => ({ key: r.key, n: Number(r.n) || 0 })),
    devices: deviceRows.map((r) => ({ device: r.device, n: Number(r.n) || 0 })),
    topReferrers: refRows.map((r) => ({
      referrer: hostLabel(r.referrer),
      n: Number(r.n) || 0,
    })),
  };
}
