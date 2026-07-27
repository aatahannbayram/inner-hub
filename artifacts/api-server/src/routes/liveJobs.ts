import { Router } from "express";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  coursesTable,
  enrollmentsTable,
  eventRegistrationsTable,
  eventsTable,
  liveNotifyLogTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAdmin, requireAuth } from "../lib/auth";
import { ensureLiveSessionColumns, ensureStageSchema } from "../lib/ensureSchema";
import { notifyLiveSession } from "../lib/mail";
import { createNotification } from "./notifications";

const router = Router();

type RefType = "course" | "event";
type Channel = "email" | "inapp" | "both";
type ReminderKind = "t24h" | "t15m";

async function alreadyLogged(refType: RefType, refId: number, kind: string): Promise<boolean> {
  const [row] = await db
    .select({ id: liveNotifyLogTable.id })
    .from(liveNotifyLogTable)
    .where(
      and(
        eq(liveNotifyLogTable.refType, refType),
        eq(liveNotifyLogTable.refId, refId),
        eq(liveNotifyLogTable.kind, kind),
      ),
    )
    .limit(1);
  return Boolean(row);
}

async function logNotify(refType: RefType, refId: number, kind: string) {
  try {
    await db.insert(liveNotifyLogTable).values({ refType, refId, kind });
  } catch {
    // unique index — başka worker yazmış olabilir
  }
}

async function recipientsFor(refType: RefType, refId: number) {
  if (refType === "course") {
    const rows = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(enrollmentsTable)
      .innerJoin(usersTable, eq(usersTable.id, enrollmentsTable.userId))
      .where(eq(enrollmentsTable.courseId, refId));
    return rows;
  }
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
    })
    .from(eventRegistrationsTable)
    .innerJoin(usersTable, eq(usersTable.id, eventRegistrationsTable.userId))
    .where(eq(eventRegistrationsTable.eventId, refId));
  return rows;
}

async function loadSession(refType: RefType, refId: number) {
  if (refType === "course") {
    const [row] = await db.select().from(coursesTable).where(eq(coursesTable.id, refId)).limit(1);
    if (!row) return null;
    return {
      title: row.title,
      startsAt: row.startsAt,
      meetUrl: row.meetUrl,
      format: row.format,
    };
  }
  const [row] = await db.select().from(eventsTable).where(eq(eventsTable.id, refId)).limit(1);
  if (!row) return null;
  return {
    title: row.title,
    startsAt: row.startAt,
    meetUrl: row.meetUrl,
    format: row.format,
  };
}

async function notifyUsers(opts: {
  refType: RefType;
  refId: number;
  channel: Channel;
  title: string;
  startsAt: Date | null;
  meetUrl: string | null;
  logKind: string;
  notifKind: "course" | "event_live";
  emailLead: string;
}) {
  if (await alreadyLogged(opts.refType, opts.refId, opts.logKind)) {
    return { skipped: true, sent: 0 };
  }

  const users = await recipientsFor(opts.refType, opts.refId);
  let sent = 0;

  for (const u of users) {
    if (opts.channel === "email" || opts.channel === "both") {
      await notifyLiveSession({
        name: u.name,
        email: u.email,
        sessionTitle: opts.title,
        startsAt: opts.startsAt,
        meetUrl: opts.meetUrl,
        refType: opts.refType,
        lead: opts.emailLead,
      });
    }
    if (opts.channel === "inapp" || opts.channel === "both") {
      await createNotification({
        userId: u.id,
        title: opts.title,
        body: opts.emailLead,
        kind: opts.notifKind,
      });
    }
    sent += 1;
  }

  await logNotify(opts.refType, opts.refId, opts.logKind);
  return { skipped: false, sent };
}

function jobAuthorized(req: { headers: Record<string, unknown>; user?: { role?: string } }): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers["x-job-secret"];
  if (secret && typeof header === "string" && header === secret) return true;
  if (req.user?.role === "admin") return true;
  return false;
}

/** POST /api/admin/live/notify — kayıtlı kullanıcılara anlık bildirim */
router.post("/admin/live/notify", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    await ensureStageSchema();

    const { refType, refId, channel } = req.body as {
      refType?: RefType;
      refId?: number;
      channel?: Channel;
    };

    if (refType !== "course" && refType !== "event") {
      res.status(400).json({ error: "refType course veya event olmalı" });
      return;
    }
    const id = Number(refId);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Geçersiz refId" });
      return;
    }
    const ch: Channel =
      channel === "email" || channel === "inapp" || channel === "both" ? channel : "both";

    const session = await loadSession(refType, id);
    if (!session) {
      res.status(404).json({ error: "Oturum bulunamadı" });
      return;
    }

    const notifKind = refType === "course" ? "course" : "event_live";
    const result = await notifyUsers({
      refType,
      refId: id,
      channel: ch,
      title: session.title,
      startsAt: session.startsAt,
      meetUrl: session.meetUrl,
      logKind: `manual:${ch}`,
      notifKind,
      emailLead: `${session.title} canlı oturumu için hatırlatma.`,
    });

    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Bildirim gönderilemedi" });
  }
});

/**
 * POST /api/jobs/live-reminders
 * X-Job-Secret: CRON_SECRET veya admin oturumu.
 * T-24h → e-posta, T-15m → in-app.
 */
router.post("/jobs/live-reminders", async (req, res) => {
  try {
    if (!jobAuthorized(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await ensureLiveSessionColumns();
    await ensureStageSchema();

    const now = Date.now();
    const windowMs = 12 * 60 * 1000; // ±12 dk tolerans

    type Target = {
      refType: RefType;
      refId: number;
      title: string;
      startsAt: Date;
      meetUrl: string | null;
      reminder: ReminderKind;
    };

    const targets: Target[] = [];

    // Canlı / hybrid kurslar
    const courses = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.isPublished, true),
          inArray(coursesTable.format, ["live", "hybrid"]),
          sql`${coursesTable.startsAt} IS NOT NULL`,
        ),
      );

    for (const c of courses) {
      if (!c.startsAt) continue;
      const delta = c.startsAt.getTime() - now;
      if (Math.abs(delta - 24 * 60 * 60 * 1000) <= windowMs) {
        targets.push({
          refType: "course",
          refId: c.id,
          title: c.title,
          startsAt: c.startsAt,
          meetUrl: c.meetUrl,
          reminder: "t24h",
        });
      } else if (Math.abs(delta - 15 * 60 * 1000) <= windowMs) {
        targets.push({
          refType: "course",
          refId: c.id,
          title: c.title,
          startsAt: c.startsAt,
          meetUrl: c.meetUrl,
          reminder: "t15m",
        });
      }
    }

    // Online / hybrid etkinlikler
    const events = await db
      .select()
      .from(eventsTable)
      .where(
        and(
          eq(eventsTable.isPublished, true),
          inArray(eventsTable.format, ["online", "hybrid"]),
          gte(eventsTable.startAt, new Date(now - windowMs)),
          lte(eventsTable.startAt, new Date(now + 25 * 60 * 60 * 1000)),
        ),
      );

    for (const e of events) {
      const delta = e.startAt.getTime() - now;
      if (Math.abs(delta - 24 * 60 * 60 * 1000) <= windowMs) {
        targets.push({
          refType: "event",
          refId: e.id,
          title: e.title,
          startsAt: e.startAt,
          meetUrl: e.meetUrl,
          reminder: "t24h",
        });
      } else if (Math.abs(delta - 15 * 60 * 1000) <= windowMs) {
        targets.push({
          refType: "event",
          refId: e.id,
          title: e.title,
          startsAt: e.startAt,
          meetUrl: e.meetUrl,
          reminder: "t15m",
        });
      }
    }

    const results: Array<{ refType: RefType; refId: number; kind: string; sent: number; skipped: boolean }> =
      [];

    for (const t of targets) {
      const logKind = t.reminder;
      const channel: Channel = t.reminder === "t24h" ? "email" : "inapp";
      const notifKind = t.refType === "course" ? "course" : "event_live";
      const lead =
        t.reminder === "t24h"
          ? `${t.title} yaklaşık 24 saat içinde başlıyor.`
          : `${t.title} yaklaşık 15 dakika içinde başlıyor.`;

      const result = await notifyUsers({
        refType: t.refType,
        refId: t.refId,
        channel,
        title: t.title,
        startsAt: t.startsAt,
        meetUrl: t.meetUrl,
        logKind,
        notifKind,
        emailLead: lead,
      });

      results.push({
        refType: t.refType,
        refId: t.refId,
        kind: logKind,
        sent: result.sent,
        skipped: result.skipped,
      });
    }

    res.json({ ok: true, processed: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Job başarısız" });
  }
});

export default router;
