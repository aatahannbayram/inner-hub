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
    CREATE INDEX IF NOT EXISTS profile_card_events_handle_created_idx
      ON profile_card_events (handle, created_at)
  `);
  ensured = true;
}

export async function recordCardEvent(
  handle: string,
  eventType: CardEventType,
  linkKey?: string | null,
) {
  await ensureProfileCardEventsSchema();
  const h = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  if (!h) return;
  const key = linkKey?.trim().slice(0, 80) || null;
  await db.execute(sql`
    INSERT INTO profile_card_events (handle, event_type, link_key)
    VALUES (${h}, ${eventType}, ${key})
  `);
}

export type CardStats = {
  views7d: number;
  vcards7d: number;
  links7d: number;
  qr7d: number;
  shares7d: number;
  viewsTotal: number;
};

export async function getCardStatsForHandle(handle: string): Promise<CardStats> {
  await ensureProfileCardEventsSchema();
  const h = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  if (!h) {
    return { views7d: 0, vcards7d: 0, links7d: 0, qr7d: 0, shares7d: 0, viewsTotal: 0 };
  }

  const weekRaw = await db.execute(sql`
    SELECT event_type, COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h}
      AND created_at >= now() - interval '7 days'
    GROUP BY event_type
  `);
  const weekRows = (
    Array.isArray(weekRaw) ? weekRaw : (weekRaw as { rows?: unknown[] }).rows ?? []
  ) as { event_type: string; n: number }[];

  const totalRaw = await db.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM profile_card_events
    WHERE handle = ${h} AND event_type = 'view'
  `);
  const totalRows = (
    Array.isArray(totalRaw) ? totalRaw : (totalRaw as { rows?: unknown[] }).rows ?? []
  ) as { n: number }[];

  const counts: Record<string, number> = {};
  for (const row of weekRows) {
    counts[row.event_type] = Number(row.n) || 0;
  }

  return {
    views7d: counts.view ?? 0,
    vcards7d: counts.vcard ?? 0,
    links7d: counts.link ?? 0,
    qr7d: counts.qr ?? 0,
    shares7d: counts.share ?? 0,
    viewsTotal: Number(totalRows[0]?.n) || 0,
  };
}
