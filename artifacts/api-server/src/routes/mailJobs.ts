import { Router, type Request, type Response } from "express";
import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  capitalDealsTable,
  eventsTable,
  mailSendLogTable,
  usersTable,
} from "@workspace/db/schema";
import { jobAuthorized } from "../lib/jobAuth";
import { logger } from "../lib/logger";
import { isTestOrSystemAccount } from "../lib/directoryMembers";
import { notifyWeeklyDigest } from "../lib/mail";
import { suggestMatches } from "../lib/mail/matchSuggest";
import { wantsEmail } from "../lib/mail/prefs";
import { unsubResultHtml, unsubUrl, verifyUnsubToken } from "../lib/mail/unsub";
import { parseSettingsPrefs, patchUserSettingsPrefs } from "./settings";
import { ensureStageSchema } from "../lib/ensureSchema";

const router = Router();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function istanbulParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  return {
    y: Number(parts.find((p) => p.type === "year")?.value),
    m: Number(parts.find((p) => p.type === "month")?.value),
    d: Number(parts.find((p) => p.type === "day")?.value),
  };
}

function isoWeekKey(now = new Date()): string {
  const { y, m, d } = istanbulParts(now);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekLabel(now = new Date()): string {
  const { y, m, d } = istanbulParts(now);
  const start = new Date(Date.UTC(y, m - 1, d));
  const dayNum = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - (dayNum - 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function formatWhen(at: Date): string {
  return at.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function handleUnsubscribe(req: Request, res: Response) {
  const token =
    (typeof req.query.token === "string" && req.query.token) ||
    (typeof req.body?.token === "string" ? req.body.token : "");
  const parsed = token ? verifyUnsubToken(token) : null;
  if (!parsed) {
    res.status(400).type("html").send(unsubResultHtml({ ok: false, error: "Geçersiz veya süresi dolmuş bağlantı." }));
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, parsed.userId))
    .limit(1);
  if (!user || user.email.trim().toLowerCase() !== parsed.email) {
    res.status(400).type("html").send(unsubResultHtml({ ok: false, error: "Adres eşleşmedi." }));
    return;
  }

  if (parsed.scope === "all") {
    await patchUserSettingsPrefs(user.id, { notifEmail: false, notifDigest: false });
  } else {
    await patchUserSettingsPrefs(user.id, { notifDigest: false });
  }

  res.type("html").send(unsubResultHtml({ ok: true, scope: parsed.scope }));
}

router.get("/mail/unsubscribe", async (req, res) => {
  try {
    await handleUnsubscribe(req, res);
  } catch (err) {
    logger.error({ err }, "mail unsubscribe failed");
    res.status(500).type("html").send(unsubResultHtml({ ok: false, error: "İşlem tamamlanamadı." }));
  }
});

router.post("/mail/unsubscribe", async (req, res) => {
  try {
    await handleUnsubscribe(req, res);
  } catch (err) {
    logger.error({ err }, "mail unsubscribe post failed");
    res.status(500).json({ ok: false });
  }
});

/**
 * POST /api/jobs/weekly-digest
 * X-Job-Secret: CRON_SECRET veya admin oturumu.
 * Pazartesi 08:00 Europe/Istanbul — tek lifecycle mail.
 */
router.post("/jobs/weekly-digest", async (req, res) => {
  try {
    if (!jobAuthorized(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await ensureStageSchema();

    const dryRun = req.body?.dryRun === true || req.query.dryRun === "1";
    const limitRaw = Number(req.body?.limit ?? req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(500, limitRaw) : 500;
    const onlyUserId = Number(req.body?.userId ?? req.query.userId);

    const periodKey = isoWeekKey();
    const label = weekLabel();
    const now = new Date();
    const horizon = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await db
      .select({
        title: eventsTable.title,
        startAt: eventsTable.startAt,
        location: eventsTable.location,
      })
      .from(eventsTable)
      .where(
        and(eq(eventsTable.isPublished, true), gte(eventsTable.startAt, now), lte(eventsTable.startAt, horizon)),
      )
      .orderBy(eventsTable.startAt)
      .limit(3);

    const deals = await db
      .select({
        company: capitalDealsTable.company,
        tagline: capitalDealsTable.tagline,
        stage: capitalDealsTable.stage,
        sector: capitalDealsTable.sector,
        raise: capitalDealsTable.raise,
        score: capitalDealsTable.score,
      })
      .from(capitalDealsTable)
      .orderBy(desc(capitalDealsTable.score), desc(capitalDealsTable.id))
      .limit(2);

    const members = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        persona: usersTable.persona,
        title: usersTable.title,
        company: usersTable.company,
        skills: usersTable.skills,
        bio: usersTable.bio,
        settingsPrefs: usersTable.settingsPrefs,
        isSystem: usersTable.isSystem,
      })
      .from(usersTable)
      .where(and(isNull(usersTable.deletedAt), eq(usersTable.isSystem, false)));

    const pool = members
      .filter((m) => !isTestOrSystemAccount({ email: m.email, name: m.name, isSystem: m.isSystem }))
      .map((m) => {
        const prefs = parseSettingsPrefs(m.settingsPrefs);
        return { ...m, prefs, allowMatch: prefs.allowMatch !== false };
      });

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const sample: Array<{ email: string; matches: number; events: number; deals: number }> = [];

    for (const member of pool) {
      if (Number.isFinite(onlyUserId) && onlyUserId > 0 && member.id !== onlyUserId) continue;
      if (!wantsEmail(member.prefs, "digest")) {
        skipped += 1;
        continue;
      }

      const [already] = await db
        .select({ id: mailSendLogTable.id })
        .from(mailSendLogTable)
        .where(
          and(
            eq(mailSendLogTable.userId, member.id),
            eq(mailSendLogTable.kind, "weekly.digest"),
            eq(mailSendLogTable.periodKey, periodKey),
          ),
        )
        .limit(1);
      if (already) {
        skipped += 1;
        continue;
      }

      const matches = wantsEmail(member.prefs, "match")
        ? suggestMatches(
            {
              id: member.id,
              name: member.name,
              company: member.company,
              title: member.title,
              persona: member.persona,
              skills: member.skills,
              bio: member.bio,
              allowMatch: member.allowMatch,
            },
            pool,
            3,
          )
        : [];

      const eventItems = upcomingEvents.map((e) => ({
        title: e.title,
        when: formatWhen(e.startAt),
        location: e.location,
      }));

      const dealItems = wantsEmail(member.prefs, "capital")
        ? deals.map((d) => ({
            company: d.company,
            stage: d.stage,
            note: d.tagline?.trim() || [d.sector, d.raise].filter(Boolean).join(" · "),
          }))
        : [];

      if (matches.length === 0 && eventItems.length === 0 && dealItems.length === 0) {
        skipped += 1;
        continue;
      }

      if (sample.length < 8) {
        sample.push({
          email: member.email,
          matches: matches.length,
          events: eventItems.length,
          deals: dealItems.length,
        });
      }

      if (dryRun) {
        sent += 1;
        if (sent >= limit) break;
        continue;
      }

      const result = await notifyWeeklyDigest({
        email: member.email,
        name: member.name,
        matches,
        events: eventItems,
        deals: dealItems,
        unsubscribeUrl: unsubUrl(member.id, member.email, "weekly"),
        weekLabel: label,
      });

      if (!result.ok) {
        failed += 1;
        logger.warn({ email: member.email, error: result.error }, "weekly digest send failed");
        continue;
      }

      try {
        await db.insert(mailSendLogTable).values({
          userId: member.id,
          kind: "weekly.digest",
          periodKey,
        });
      } catch {
        // unique — paralel worker
      }
      sent += 1;
      if (sent >= limit) break;
      await sleep(180);
    }

    res.json({
      ok: true,
      dryRun,
      periodKey,
      weekLabel: label,
      sent,
      skipped,
      failed,
      events: upcomingEvents.length,
      sample,
    });
  } catch (err: any) {
    logger.error({ err }, "weekly digest job failed");
    res.status(500).json({ error: err.message ?? "Job başarısız" });
  }
});

export default router;
