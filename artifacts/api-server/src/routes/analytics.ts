import { Router } from "express";
import { and, count, countDistinct, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  usersTable,
  messagesTable,
  channelsTable,
  eventRegistrationsTable,
  enrollmentsTable,
  applicationsTable,
  introductionRequestsTable,
  analyticsEventsTable,
} from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ensureAnalyticsEventsSchema } from "../lib/ensureSchema";
import { fetchGa4WebReport, gaPublicMeta } from "../lib/ga4";

const router = Router();

const MONTH_LABELS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const WEEK_LABELS_TR = ["3H", "2H", "GH", "Bu"];

const collectHits = new Map<string, { n: number; reset: number }>();

function rateLimitCollect(ip: string, limit = 120): boolean {
  const now = Date.now();
  const row = collectHits.get(ip);
  if (!row || now > row.reset) {
    collectHits.set(ip, { n: 1, reset: now + 60_000 });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}

function deviceFromUa(ua: string | undefined): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|iphone|android/.test(s)) return "mobile";
  return "desktop";
}

function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let p = raw.trim().slice(0, 512);
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.startsWith("/panel") || p.startsWith("/requests")) return null;
  return p;
}

function hostLabel(ref: string | null | undefined): string {
  if (!ref) return "(direct)";
  try {
    const u = new URL(ref);
    if (!u.hostname || u.hostname.includes("inner.digital")) return "(direct)";
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "(direct)";
  }
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fillDaily(
  rangeDays: number,
  rows: { day: string; visitors: number; views: number }[],
): { date: string; visitors: number; views: number }[] {
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: { date: string; visitors: number; views: number }[] = [];
  const now = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const hit = map.get(key);
    out.push({
      date: key,
      visitors: hit?.visitors ?? 0,
      views: hit?.views ?? 0,
    });
  }
  return out;
}

// ─── POST /api/analytics/collect ──────────────────────────────────────────────
// Public beacon — gtag ile aynı page_view’ları first-party saklar (Framer paneli).
router.post("/analytics/collect", async (req, res) => {
  try {
    const ip = String(req.headers["x-forwarded-for"] ?? req.ip ?? "unknown").split(",")[0].trim();
    if (!rateLimitCollect(ip)) {
      res.status(429).json({ ok: false });
      return;
    }

    const rawBody =
      typeof req.body === "string"
        ? (JSON.parse(req.body || "{}") as Record<string, unknown>)
        : ((req.body ?? {}) as Record<string, unknown>);

    const path = normalizePath(rawBody.path);
    if (!path) {
      res.status(204).end();
      return;
    }

    const sessionId =
      typeof rawBody.sessionId === "string" && rawBody.sessionId.length >= 8
        ? rawBody.sessionId.slice(0, 64)
        : null;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId required" });
      return;
    }

    const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"].slice(0, 400) : null;
    const title = typeof rawBody.title === "string" ? rawBody.title.slice(0, 200) : null;
    const referrer = typeof rawBody.referrer === "string" ? rawBody.referrer.slice(0, 500) : null;
    const locale = typeof rawBody.locale === "string" ? rawBody.locale.slice(0, 12) : null;
    const eventName =
      typeof rawBody.event === "string" && rawBody.event.length < 40
        ? rawBody.event
        : "page_view";

    await ensureAnalyticsEventsSchema();
    await db.insert(analyticsEventsTable).values({
      eventName,
      path,
      title,
      referrer,
      sessionId,
      locale,
      device: deviceFromUa(ua ?? undefined),
      userAgent: ua,
    });

    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "collect failed" });
  }
});

// ─── GET /api/analytics/web ───────────────────────────────────────────────────
// Framer-tarzı site analytics · first-party + opsiyonel GA4 Data API sync
router.get("/analytics/web", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rangeDays = Math.min(90, Math.max(7, Number(req.query.range) || 28));
    const since = new Date(Date.now() - rangeDays * 86_400_000);
    await ensureAnalyticsEventsSchema();

    const gaMeta = gaPublicMeta();
    const ga = await fetchGa4WebReport(rangeDays);

    // First-party aggregates (always available; used when GA API not connected)
    const [{ n: views }] = await db
      .select({ n: count() })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.eventName, "page_view"), gte(analyticsEventsTable.createdAt, since)));

    const [{ n: visitors }] = await db
      .select({ n: countDistinct(analyticsEventsTable.sessionId) })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.eventName, "page_view"), gte(analyticsEventsTable.createdAt, since)));

    const dailyRaw = await db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
             COUNT(*)::int AS views,
             COUNT(DISTINCT session_id)::int AS visitors
      FROM analytics_events
      WHERE event_name = 'page_view' AND created_at >= ${since}
      GROUP BY 1
      ORDER BY 1
    `);
    const dailyRows = (Array.isArray(dailyRaw) ? dailyRaw : (dailyRaw as { rows?: unknown[] }).rows ?? []).map(
      (r: any) => ({
        day: String(r.day),
        views: Number(r.views),
        visitors: Number(r.visitors),
      }),
    );

    const topPagesRaw = await db
      .select({
        path: analyticsEventsTable.path,
        views: count(),
      })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.eventName, "page_view"), gte(analyticsEventsTable.createdAt, since)))
      .groupBy(analyticsEventsTable.path)
      .orderBy(desc(count()))
      .limit(8);

    const refRaw = await db
      .select({
        referrer: analyticsEventsTable.referrer,
        visitors: countDistinct(analyticsEventsTable.sessionId),
      })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.eventName, "page_view"), gte(analyticsEventsTable.createdAt, since)))
      .groupBy(analyticsEventsTable.referrer)
      .orderBy(desc(countDistinct(analyticsEventsTable.sessionId)))
      .limit(40);

    const refMap = new Map<string, number>();
    for (const r of refRaw) {
      const label = hostLabel(r.referrer);
      refMap.set(label, (refMap.get(label) ?? 0) + Number(r.visitors));
    }
    const topReferrers = [...refMap.entries()]
      .map(([source, n]) => ({ source, visitors: n }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 8);

    const deviceRaw = await db
      .select({
        device: analyticsEventsTable.device,
        visitors: countDistinct(analyticsEventsTable.sessionId),
      })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.eventName, "page_view"), gte(analyticsEventsTable.createdAt, since)))
      .groupBy(analyticsEventsTable.device)
      .orderBy(desc(countDistinct(analyticsEventsTable.sessionId)));

    const firstParty = {
      visitors: Number(visitors),
      views: Number(views),
      daily: fillDaily(rangeDays, dailyRows),
      topPages: topPagesRaw.map((p) => ({ path: p.path, views: Number(p.views) })),
      topReferrers,
      devices: deviceRaw.map((d) => ({
        device: d.device ?? "unknown",
        visitors: Number(d.visitors),
      })),
    };

    const useGoogle = ga.connected && ga.source === "google";
    const web = useGoogle
      ? {
          visitors: ga.visitors,
          views: ga.views,
          daily: ga.daily.length ? ga.daily : firstParty.daily,
          topPages: ga.topPages.length ? ga.topPages : firstParty.topPages,
          topReferrers: ga.topReferrers.length ? ga.topReferrers : firstParty.topReferrers,
          devices: ga.devices.length ? ga.devices : firstParty.devices,
        }
      : firstParty;

    res.json({
      rangeDays,
      measurementId: gaMeta.measurementId,
      propertyId: gaMeta.propertyId,
      google: {
        connected: useGoogle,
        dataApiReady: gaMeta.dataApiReady,
        error: ga.error ?? null,
        openUrl: gaMeta.measurementId
          ? `https://analytics.google.com/analytics/web/#/p${gaMeta.propertyId ?? ""}/`
          : "https://analytics.google.com/",
      },
      source: useGoogle ? "google" : "first_party",
      ...web,
      firstParty,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Web analitik yüklenemedi" });
  }
});

// ─── GET /api/analytics ───────────────────────────────────────────────────────
// Gerçek topluluk sayaçları — sahte büyüme eğrisi/gelir yok. Veri yoksa `empty: true`.
router.get("/analytics", requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * 86_400_000);
    const twoWeeksAgo = new Date(now - 14 * 86_400_000);

    const [{ n: membersCount }] = await db.select({ n: count() }).from(usersTable);

    const [{ n: messagesThisWeek }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(gte(messagesTable.createdAt, weekAgo));
    const [{ n: messagesLastWeek }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(and(gte(messagesTable.createdAt, twoWeeksAgo), lt(messagesTable.createdAt, weekAgo)));

    const [{ n: eventRegistrationsTotal }] = await db.select({ n: count() }).from(eventRegistrationsTable);
    const [{ n: eventRegistrationsThisWeek }] = await db
      .select({ n: count() })
      .from(eventRegistrationsTable)
      .where(gte(eventRegistrationsTable.registeredAt, weekAgo));

    const [{ n: courseEnrollmentsTotal }] = await db.select({ n: count() }).from(enrollmentsTable);
    const [{ n: courseEnrollmentsThisWeek }] = await db
      .select({ n: count() })
      .from(enrollmentsTable)
      .where(gte(enrollmentsTable.joinedAt, weekAgo));

    const [{ n: matchIntroductionsTotal }] = await db.select({ n: count() }).from(introductionRequestsTable);
    const [{ n: matchIntroductionsThisMonth }] = await db
      .select({ n: count() })
      .from(introductionRequestsTable)
      .where(gte(introductionRequestsTable.createdAt, new Date(now - 30 * 86_400_000)));

    const [{ n: applicationsPending }] = await db
      .select({ n: count() })
      .from(applicationsTable)
      .where(eq(applicationsTable.status, "pending"));

    const memberGrowth: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const boundary = new Date(now);
      boundary.setDate(1);
      boundary.setMonth(boundary.getMonth() - i + 1);
      boundary.setHours(0, 0, 0, 0);
      const [{ n }] = await db
        .select({ n: count() })
        .from(usersTable)
        .where(lt(usersTable.createdAt, boundary));
      const labelDate = new Date(now);
      labelDate.setMonth(labelDate.getMonth() - i);
      memberGrowth.push({ month: MONTH_LABELS_TR[labelDate.getMonth()], total: Number(n) });
    }
    const membersAtMonthStart = memberGrowth.length >= 2 ? memberGrowth[memberGrowth.length - 2].total : 0;
    const newMembersThisMonth = Number(membersCount) - membersAtMonthStart;

    const weeklyActivity: { week: string; activeMembers: number; messages: number; registrations: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 7 * 86_400_000);
      const end = new Date(now - i * 7 * 86_400_000);
      const [{ n: msgs }] = await db
        .select({ n: count() })
        .from(messagesTable)
        .where(and(gte(messagesTable.createdAt, start), lt(messagesTable.createdAt, end)));
      const [{ n: active }] = await db
        .select({ n: countDistinct(messagesTable.userId) })
        .from(messagesTable)
        .where(and(gte(messagesTable.createdAt, start), lt(messagesTable.createdAt, end)));
      const [{ n: regs }] = await db
        .select({ n: count() })
        .from(eventRegistrationsTable)
        .where(and(gte(eventRegistrationsTable.registeredAt, start), lt(eventRegistrationsTable.registeredAt, end)));
      weeklyActivity.push({
        week: WEEK_LABELS_TR[3 - i],
        activeMembers: Number(active),
        messages: Number(msgs),
        registrations: Number(regs),
      });
    }

    const monthAgo = new Date(now - 30 * 86_400_000);
    const topMembersRaw = await db
      .select({
        name: usersTable.name,
        handle: usersTable.handle,
        createdAt: usersTable.createdAt,
        contributions: count(),
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(gte(messagesTable.createdAt, monthAgo))
      .groupBy(usersTable.id, usersTable.name, usersTable.handle, usersTable.createdAt)
      .orderBy(desc(count()))
      .limit(5);

    const topMembers = await Promise.all(
      topMembersRaw.map(async (m) => {
        const [{ n: eventsCount }] = await db
          .select({ n: count() })
          .from(eventRegistrationsTable)
          .innerJoin(usersTable, eq(eventRegistrationsTable.userId, usersTable.id))
          .where(eq(usersTable.name, m.name));
        return {
          name: m.name,
          handle: m.handle,
          contributions: Number(m.contributions),
          events: Number(eventsCount),
          joinedAt: m.createdAt.toISOString(),
        };
      }),
    );

    const channels = await db.select().from(channelsTable);
    const channelActivity = (
      await Promise.all(
        channels.map(async (ch) => {
          const [{ n: messages }] = await db
            .select({ n: count() })
            .from(messagesTable)
            .where(eq(messagesTable.channelId, ch.id));
          const [{ n: members }] = await db
            .select({ n: countDistinct(messagesTable.userId) })
            .from(messagesTable)
            .where(eq(messagesTable.channelId, ch.id));
          return { name: ch.name, messages: Number(messages), members: Number(members) };
        }),
      )
    )
      .filter((c) => c.messages > 0)
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 6);

    const empty =
      Number(membersCount) <= 1 &&
      Number(messagesThisWeek) === 0 &&
      Number(eventRegistrationsTotal) === 0 &&
      Number(courseEnrollmentsTotal) === 0;

    res.json({
      membersCount: Number(membersCount),
      newMembersThisMonth,
      messagesThisWeek: Number(messagesThisWeek),
      messagesLastWeek: Number(messagesLastWeek),
      eventRegistrationsTotal: Number(eventRegistrationsTotal),
      eventRegistrationsThisWeek: Number(eventRegistrationsThisWeek),
      courseEnrollmentsTotal: Number(courseEnrollmentsTotal),
      courseEnrollmentsThisWeek: Number(courseEnrollmentsThisWeek),
      matchIntroductionsTotal: Number(matchIntroductionsTotal),
      matchIntroductionsThisMonth: Number(matchIntroductionsThisMonth),
      applicationsPending: Number(applicationsPending),
      memberGrowth,
      weeklyActivity,
      topMembers,
      channelActivity,
      empty,
      google: gaPublicMeta(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Analitik yüklenemedi" });
  }
});

export default router;
