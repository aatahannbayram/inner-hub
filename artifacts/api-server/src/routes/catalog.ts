import { Router } from "express";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import Mux from "@mux/mux-node";
import { db } from "@workspace/db";
import {
  coursesTable,
  enrollmentsTable,
  eventRegistrationsTable,
  eventsTable,
  lessonsTable,
  modulesTable,
  progressTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  ensureCourseVideoColumns,
  ensureLiveSessionColumns,
  ensureUserMembershipColumns,
} from "../lib/ensureSchema";
import { spendPasses } from "../lib/passes";
import { sendTransactionalMail } from "../lib/mail/transport";
import { getUserSettingsPrefs } from "./settings";
import { createNotification } from "./notifications";

const router = Router();

function audienceOk(audience: string | null | undefined, persona: string | null | undefined) {
  const a = audience || "all";
  if (a === "all") return true;
  return persona === a;
}

function courseNeedsPass(course: { format: string; passCost: number }) {
  if (course.format === "vod") return 0;
  return Math.max(0, course.passCost ?? 1);
}

function parseRoom(raw: unknown): "mine" | "all" {
  return raw === "mine" ? "mine" : "all";
}

function resolveCourseFormat(raw: unknown, fallback = "vod"): string {
  if (raw === "vod" || raw === "live" || raw === "hybrid") return raw;
  return fallback;
}

function resolveCoursePassCost(format: string, passCost: unknown, provided: boolean): number {
  if (format === "vod") return 0;
  if (provided && Number.isFinite(Number(passCost))) return Math.max(0, Number(passCost));
  return 1;
}

function resolveEventFormat(raw: unknown, fallback = "in_person"): string {
  if (raw === "online" || raw === "in_person" || raw === "hybrid") return raw;
  return fallback;
}

function resolveEventPassCost(passCost: unknown, provided: boolean): number {
  if (provided && Number.isFinite(Number(passCost))) return Math.max(0, Number(passCost));
  return 1;
}

function isPassError(err: unknown): boolean {
  return err instanceof Error && err.message === "Yetersiz Circle Pass";
}

async function loadUserPersona(userId: number): Promise<string | null> {
  await ensureUserMembershipColumns();
  const [user] = await db
    .select({ persona: usersTable.persona })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user?.persona ?? null;
}

let muxClient: Mux | null = null;
function getMux(): Mux {
  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!tokenId || !tokenSecret) {
      throw new Error("Mux yapılandırılmamış (MUX_TOKEN_ID/MUX_TOKEN_SECRET eksik)");
    }
    muxClient = new Mux({ tokenId, tokenSecret });
  }
  return muxClient;
}

async function ensureDemoContent() {
  if (process.env.NODE_ENV === "production") return;
  await ensureLiveSessionColumns();

  const [eventRow] = await db.select({ id: eventsTable.id }).from(eventsTable).limit(1);
  if (!eventRow) {
    await db.insert(eventsTable).values([
      {
        title: "AI & Girişimcilik Zirvesi",
        description:
          "Türkiye'nin önde gelen yapay zeka girişimcileri ve yatırımcılarıyla networking ve panel oturumları.",
        location: "Nidakule Levent, İstanbul",
        startAt: new Date("2026-09-15T10:00:00"),
        endAt: new Date("2026-09-15T18:00:00"),
        isPublished: true,
        format: "in_person",
        audience: "all",
        passCost: 1,
      },
      {
        title: "Networking Kahvaltısı",
        description: "Küçük grup, derin konuşmalar. Tema: B2B satış ve uluslararasılaşma.",
        location: "Online (Zoom)", // UI'da lang="en" ile uppercase; TR İ bozulmasın
        startAt: new Date("2026-08-05T09:00:00"),
        endAt: new Date("2026-08-05T11:00:00"),
        isPublished: true,
        format: "online",
        meetUrl: "https://meet.inner.digital/networking",
        audience: "all",
        passCost: 1,
      },
      {
        title: "Fundraising Workshop",
        description: "Seed ve Series A süreçleri, pitch deck ve yatırımcı görüşme teknikleri.",
        location: "Kolektif House Maslak",
        startAt: new Date("2026-08-20T14:00:00"),
        endAt: new Date("2026-08-20T17:00:00"),
        isPublished: true,
        format: "hybrid",
        audience: "founder",
        passCost: 1,
      },
    ]);
  } else {
    // Mevcut demo başlıklarındaki em dash'i temizle (tarih sütunu ayı zaten gösterir)
    await db
      .update(eventsTable)
      .set({ title: "Networking Kahvaltısı" })
      .where(eq(eventsTable.title, "Networking Kahvaltısı — Ağustos"));
    await db
      .update(eventsTable)
      .set({ title: "AI & Girişimcilik Zirvesi" })
      .where(eq(eventsTable.title, "AI & Girişimcilik Zirvesi — Eylül"));
  }

  const [courseRow] = await db.select({ id: coursesTable.id }).from(coursesTable).limit(1);
  if (!courseRow) {
    await db.insert(coursesTable).values([
      {
        title: "HR Teknolojileri 101",
        description:
          "İnsan kaynakları süreçlerini dijitalleştirin. HRIS, ATS ve çalışan deneyimi platformları.",
        term: 1,
        order: 1,
        isPublished: true,
        format: "vod",
        audience: "all",
        passCost: 0,
      },
      {
        title: "Yapay Zeka ile İK Yönetimi",
        description:
          "GPT, ML ve otomasyon araçlarıyla İK süreçlerinizi geleceğe hazırlayın.",
        term: 1,
        order: 2,
        isPublished: true,
        format: "vod",
        audience: "all",
        passCost: 0,
      },
    ]);
  }
}

async function progressPctForUser(userId: number, courseId: number): Promise<number> {
  const modules = await db
    .select({ id: modulesTable.id })
    .from(modulesTable)
    .where(eq(modulesTable.courseId, courseId));
  if (modules.length === 0) return 0;

  const moduleIds = modules.map((m) => m.id);
  const lessons = await db
    .select({ id: lessonsTable.id })
    .from(lessonsTable)
    .where(inArray(lessonsTable.moduleId, moduleIds));
  if (lessons.length === 0) return 0;

  const lessonIds = lessons.map((l) => l.id);
  const [done] = await db
    .select({ n: count() })
    .from(progressTable)
    .where(
      and(
        eq(progressTable.userId, userId),
        eq(progressTable.completed, true),
        inArray(progressTable.lessonId, lessonIds),
      ),
    );

  return Math.round(((done?.n ?? 0) / lessons.length) * 100);
}

type LessonWithState = {
  id: number;
  title: string;
  durationSeconds: number | null;
  videoUrl: string | null;
  isCompleted: boolean;
  isLocked: boolean;
};

async function courseModulesForUser(
  userId: number,
  courseId: number,
  isEnrolled: boolean,
): Promise<{ id: number; title: string; lessons: LessonWithState[] }[]> {
  const mods = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, courseId))
    .orderBy(asc(modulesTable.order));
  if (mods.length === 0) return [];

  const moduleIds = mods.map((m) => m.id);
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(inArray(lessonsTable.moduleId, moduleIds))
    .orderBy(asc(lessonsTable.order));

  const lessonIds = lessons.map((l) => l.id);
  const completedIds = new Set<number>();
  if (lessonIds.length > 0) {
    const done = await db
      .select({ lessonId: progressTable.lessonId })
      .from(progressTable)
      .where(
        and(
          eq(progressTable.userId, userId),
          eq(progressTable.completed, true),
          inArray(progressTable.lessonId, lessonIds),
        ),
      );
    done.forEach((d) => completedIds.add(d.lessonId));
  }

  return mods.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: lessons
      .filter((l) => l.moduleId === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        durationSeconds: l.durationSeconds ?? null,
        videoUrl: l.videoUrl,
        isCompleted: completedIds.has(l.id),
        isLocked: !isEnrolled,
      })),
  }));
}

function progressPctFromModules(modules: { lessons: LessonWithState[] }[]): number {
  const allLessons = modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) return 0;
  const done = allLessons.filter((l) => l.isCompleted).length;
  return Math.round((done / allLessons.length) * 100);
}

// ─── GET /api/events ─────────────────────────────────────────────────────────
router.get("/events", requireAuth, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    await ensureDemoContent();
    const userId = req.user!.id;
    const persona = await loadUserPersona(userId);
    const room = parseRoom(req.query.room);

    const rows = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.isPublished, true))
      .orderBy(asc(eventsTable.startAt));

    const visible = rows.filter((e) => {
      if (!audienceOk(e.audience, persona)) return false;
      // room=mine: yalnızca persona'ya özel veya all (audienceOk zaten bunu yapar)
      // room=all: aynı audience filtresi (üyeye açık tüm odalar)
      if (room === "mine") {
        return e.audience === "all" || e.audience === persona;
      }
      return true;
    });

    const regs = await db
      .select()
      .from(eventRegistrationsTable)
      .where(eq(eventRegistrationsTable.userId, userId));
    const mySet = new Set(regs.map((r) => r.eventId));

    const counts = await db
      .select({
        eventId: eventRegistrationsTable.eventId,
        n: count(),
      })
      .from(eventRegistrationsTable)
      .groupBy(eventRegistrationsTable.eventId);
    const countMap = new Map(counts.map((c) => [c.eventId, Number(c.n)]));

    const now = Date.now();
    res.json({
      events: visible.map((e) => {
        const isRegistered = mySet.has(e.id);
        return {
          id: e.id,
          title: e.title,
          description: e.description ?? "",
          location: e.location ?? "",
          startAt: e.startAt.toISOString(),
          endAt: e.endAt?.toISOString() ?? e.startAt.toISOString(),
          isPast: e.startAt.getTime() < now,
          isPublished: e.isPublished,
          format: e.format ?? "in_person",
          audience: e.audience ?? "all",
          meetUrl: isRegistered ? (e.meetUrl ?? null) : null,
          passCost: e.passCost ?? 1,
          capacity: 0,
          registered: countMap.get(e.id) ?? 0,
          isRegistered,
        };
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlikler yüklenemedi" });
  }
});

// ─── POST /api/events/:id/register ───────────────────────────────────────────
router.post("/events/:id/register", requireAuth, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const eventId = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(eventId)) {
      res.status(400).json({ error: "Geçersiz etkinlik" });
      return;
    }

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.id, eventId), eq(eventsTable.isPublished, true)))
      .limit(1);
    if (!event) {
      res.status(404).json({ error: "Etkinlik bulunamadı" });
      return;
    }
    if (event.startAt.getTime() < Date.now()) {
      res.status(400).json({ error: "Geçmiş etkinliğe kayıt olunamaz" });
      return;
    }

    const persona = await loadUserPersona(userId);
    if (!audienceOk(event.audience, persona)) {
      res.status(403).json({ error: "Bu etkinlik senin odan için değil" });
      return;
    }

    const [existing] = await db
      .select()
      .from(eventRegistrationsTable)
      .where(
        and(
          eq(eventRegistrationsTable.userId, userId),
          eq(eventRegistrationsTable.eventId, eventId),
        ),
      )
      .limit(1);

    if (!existing) {
      const passCost = Math.max(0, event.passCost ?? 1);
      if (passCost > 0) {
        await spendPasses({
          userId,
          amount: passCost,
          reason: "spend_event",
          refType: "event",
          refId: String(eventId),
        });
      }
      await db.insert(eventRegistrationsTable).values({ userId, eventId });
      await createNotification({
        userId,
        title: "Etkinlik kaydı onaylandı",
        body: `${event.title} için kaydın alındı.`,
        kind: "event",
        href: "/panel/events",
      });
    }

    res.json({
      eventId,
      isRegistered: true,
      meetUrl: event.meetUrl ?? null,
      passCost: event.passCost ?? 1,
    });
  } catch (err: any) {
    if (isPassError(err)) {
      res.status(402).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message ?? "Kayıt başarısız" });
  }
});

// ─── DELETE /api/events/:id/register ─────────────────────────────────────────
router.delete("/events/:id/register", requireAuth, async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(eventId)) {
      res.status(400).json({ error: "Geçersiz etkinlik" });
      return;
    }

    await db
      .delete(eventRegistrationsTable)
      .where(
        and(
          eq(eventRegistrationsTable.userId, userId),
          eq(eventRegistrationsTable.eventId, eventId),
        ),
      );

    res.json({ eventId, isRegistered: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İptal başarısız" });
  }
});

// ─── GET /api/admin/events ───────────────────────────────────────────────────
router.get("/admin/events", requireAuth, requireAdmin, async (_req, res) => {
  try {
    await ensureLiveSessionColumns();
    await ensureDemoContent();

    const rows = await db.select().from(eventsTable).orderBy(asc(eventsTable.startAt));

    const counts = await db
      .select({
        eventId: eventRegistrationsTable.eventId,
        n: count(),
      })
      .from(eventRegistrationsTable)
      .groupBy(eventRegistrationsTable.eventId);
    const countMap = new Map(counts.map((c) => [c.eventId, Number(c.n)]));

    const now = Date.now();
    res.json({
      events: rows.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? "",
        location: e.location ?? "",
        startAt: e.startAt.toISOString(),
        endAt: e.endAt?.toISOString() ?? e.startAt.toISOString(),
        isPast: e.startAt.getTime() < now,
        isPublished: e.isPublished,
        format: e.format ?? "in_person",
        audience: e.audience ?? "all",
        meetUrl: e.meetUrl ?? null,
        passCost: e.passCost ?? 1,
        registered: countMap.get(e.id) ?? 0,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlikler yüklenemedi" });
  }
});

// ─── POST /api/events (admin) ────────────────────────────────────────────────
router.post("/events", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const {
      title,
      description,
      location,
      startAt,
      endAt,
      format,
      meetUrl,
      audience,
      passCost,
      isPublished,
    } = req.body ?? {};

    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Başlık gerekli" });
      return;
    }
    const start = startAt ? new Date(startAt) : null;
    if (!start || Number.isNaN(start.getTime())) {
      res.status(400).json({ error: "Geçerli startAt gerekli" });
      return;
    }
    const end = endAt ? new Date(endAt) : null;
    if (endAt && (!end || Number.isNaN(end.getTime()))) {
      res.status(400).json({ error: "Geçersiz endAt" });
      return;
    }

    const resolvedFormat = resolveEventFormat(format);
    const [event] = await db
      .insert(eventsTable)
      .values({
        title,
        description: typeof description === "string" ? description : null,
        location: typeof location === "string" ? location : null,
        startAt: start,
        endAt: end,
        format: resolvedFormat,
        meetUrl: typeof meetUrl === "string" ? meetUrl : null,
        audience: typeof audience === "string" && audience ? audience : "all",
        passCost: resolveEventPassCost(passCost, passCost !== undefined && passCost !== null),
        isPublished: isPublished === true,
      })
      .returning();

    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlik oluşturulamadı" });
  }
});

// ─── PATCH /api/events/:id (admin) ───────────────────────────────────────────
router.patch("/events/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) {
      res.status(400).json({ error: "Geçersiz etkinlik" });
      return;
    }

    const {
      title,
      description,
      location,
      startAt,
      endAt,
      format,
      meetUrl,
      audience,
      passCost,
      isPublished,
    } = req.body ?? {};

    const patch: Partial<typeof eventsTable.$inferInsert> = {};
    if (typeof title === "string") patch.title = title;
    if (typeof description === "string") patch.description = description;
    if (typeof location === "string") patch.location = location;
    if (startAt !== undefined) {
      const start = new Date(startAt);
      if (Number.isNaN(start.getTime())) {
        res.status(400).json({ error: "Geçersiz startAt" });
        return;
      }
      patch.startAt = start;
    }
    if (endAt !== undefined) {
      if (endAt === null) {
        patch.endAt = null;
      } else {
        const end = new Date(endAt);
        if (Number.isNaN(end.getTime())) {
          res.status(400).json({ error: "Geçersiz endAt" });
          return;
        }
        patch.endAt = end;
      }
    }
    if (format !== undefined) patch.format = resolveEventFormat(format);
    if (meetUrl !== undefined) patch.meetUrl = typeof meetUrl === "string" ? meetUrl : null;
    if (typeof audience === "string") patch.audience = audience || "all";
    if (passCost !== undefined) {
      patch.passCost = resolveEventPassCost(passCost, true);
    }
    if (typeof isPublished === "boolean") patch.isPublished = isPublished;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Güncellenecek alan yok" });
      return;
    }

    const [event] = await db
      .update(eventsTable)
      .set(patch)
      .where(eq(eventsTable.id, eventId))
      .returning();
    if (!event) {
      res.status(404).json({ error: "Etkinlik bulunamadı" });
      return;
    }
    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlik güncellenemedi" });
  }
});

// ─── POST /api/admin/events/:id/notify ───────────────────────────────────────
router.post("/admin/events/:id/notify", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) {
      res.status(400).json({ error: "Geçersiz etkinlik" });
      return;
    }

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);
    if (!event) {
      res.status(404).json({ error: "Etkinlik bulunamadı" });
      return;
    }

    const sendEmail = req.body?.email === true || req.body?.sendEmail === true;
    const customBody =
      typeof req.body?.body === "string" && req.body.body.trim()
        ? req.body.body.trim()
        : `${event.title} yakında başlıyor.${event.meetUrl ? ` Bağlantı: ${event.meetUrl}` : ""}`;

    const regs = await db
      .select({
        userId: eventRegistrationsTable.userId,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(eventRegistrationsTable)
      .innerJoin(usersTable, eq(usersTable.id, eventRegistrationsTable.userId))
      .where(eq(eventRegistrationsTable.eventId, eventId));

    let notified = 0;
    let emailed = 0;
    for (const r of regs) {
      await createNotification({
        userId: r.userId,
        title: "Canlı etkinlik hatırlatması",
        body: customBody,
        kind: "event_live",
        href: "/panel/events",
      });
      notified += 1;

      if (sendEmail) {
        const prefs = await getUserSettingsPrefs(r.userId);
        if (prefs.notifEmail && prefs.notifEvents) {
          const ok = await sendTransactionalMail({
            to: r.email,
            subject: `inner·hub: ${event.title}`,
            text: customBody,
            html: `<p>${customBody.replace(/</g, "&lt;")}</p>`,
            kind: "event_live",
          });
          if (ok) emailed += 1;
        }
      }
    }

    res.json({ eventId, notified, emailed, totalRegistered: regs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Bildirim gönderilemedi" });
  }
});

// ─── GET /api/courses ────────────────────────────────────────────────────────
router.get("/courses", requireAuth, async (req, res) => {
  try {
    await ensureDemoContent();
    await ensureCourseVideoColumns();
    await ensureLiveSessionColumns();
    const userId = req.user!.id;
    const persona = await loadUserPersona(userId);
    const room = parseRoom(req.query.room);

    const rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .orderBy(asc(coursesTable.order), desc(coursesTable.createdAt));

    const visible = rows.filter((c) => {
      if (!audienceOk(c.audience, persona)) return false;
      if (room === "mine") {
        return c.audience === "all" || c.audience === persona;
      }
      return true;
    });

    const enrollments = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.userId, userId));
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));

    const courses = await Promise.all(
      visible.map(async (c) => {
        const isEnrolled = enrolledIds.has(c.id);
        const modules = await courseModulesForUser(userId, c.id, isEnrolled);
        const format = c.format ?? "vod";
        return {
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          term: c.term,
          order: c.order,
          format,
          startsAt: c.startsAt?.toISOString() ?? null,
          endsAt: c.endsAt?.toISOString() ?? null,
          meetUrl: isEnrolled ? (c.meetUrl ?? null) : null,
          audience: c.audience ?? "all",
          passCost: courseNeedsPass({ format, passCost: c.passCost ?? 0 }),
          category: (c as { category?: string }).category ?? "business",
          isEnrolled,
          progressPct: isEnrolled ? progressPctFromModules(modules) : 0,
          modules,
        };
      }),
    );

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurslar yüklenemedi" });
  }
});

// ─── POST /api/courses/:id/enroll ────────────────────────────────────────────
router.post("/courses/:id/enroll", requireAuth, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const courseId = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(courseId)) {
      res.status(400).json({ error: "Geçersiz kurs" });
      return;
    }

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(and(eq(coursesTable.id, courseId), eq(coursesTable.isPublished, true)))
      .limit(1);
    if (!course) {
      res.status(404).json({ error: "Kurs bulunamadı" });
      return;
    }

    const persona = await loadUserPersona(userId);
    if (!audienceOk(course.audience, persona)) {
      res.status(403).json({ error: "Bu kurs senin odan için değil" });
      return;
    }

    const [existing] = await db
      .select()
      .from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseId)))
      .limit(1);

    if (!existing) {
      const need = courseNeedsPass({
        format: course.format ?? "vod",
        passCost: course.passCost ?? 0,
      });
      if (need > 0) {
        await spendPasses({
          userId,
          amount: need,
          reason: "spend_course",
          refType: "course",
          refId: String(courseId),
        });
      }
      await db.insert(enrollmentsTable).values({ userId, courseId });
      await createNotification({
        userId,
        title: "Kursa kayıt oldun",
        body: `${course.title} kursuna kaydın tamamlandı.`,
        kind: "course",
        href: "/panel/courses",
      });
    }

    res.json({
      courseId,
      isEnrolled: true,
      meetUrl: course.meetUrl ?? null,
      progressPct: await progressPctForUser(userId, courseId),
    });
  } catch (err: any) {
    if (isPassError(err)) {
      res.status(402).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message ?? "Kayıt başarısız" });
  }
});

// ─── GET /api/admin/courses ───────────────────────────────────────────────────
// Admin yönetim görünümü: yayında olmayan (taslak) kurslar da dahil.
router.get("/admin/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureDemoContent();
    await ensureCourseVideoColumns();
    await ensureLiveSessionColumns();
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(coursesTable)
      .orderBy(asc(coursesTable.order), desc(coursesTable.createdAt));

    const courses = await Promise.all(
      rows.map(async (c) => {
        const format = c.format ?? "vod";
        return {
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          term: c.term,
          order: c.order,
          isPublished: c.isPublished,
          format,
          startsAt: c.startsAt?.toISOString() ?? null,
          endsAt: c.endsAt?.toISOString() ?? null,
          meetUrl: c.meetUrl ?? null,
          audience: c.audience ?? "all",
          passCost: c.passCost ?? 0,
          category: (c as { category?: string }).category ?? "business",
          modules: await courseModulesForUser(userId, c.id, true),
        };
      }),
    );

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurslar yüklenemedi" });
  }
});

// ─── POST /api/courses (admin) ───────────────────────────────────────────────
router.post("/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const {
      title,
      description,
      term,
      order,
      isPublished,
      format,
      startsAt,
      endsAt,
      meetUrl,
      audience,
      passCost,
      category,
    } = req.body ?? {};
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Başlık gerekli" });
      return;
    }

    const resolvedFormat = resolveCourseFormat(format);
    const COURSE_CATS = ["business", "product", "art", "craft", "capital", "ops"] as const;
    const resolvedCategory =
      typeof category === "string" && (COURSE_CATS as readonly string[]).includes(category)
        ? category
        : "business";
    let starts: Date | null = null;
    let ends: Date | null = null;
    if (startsAt) {
      starts = new Date(startsAt);
      if (Number.isNaN(starts.getTime())) {
        res.status(400).json({ error: "Geçersiz startsAt" });
        return;
      }
    }
    if (endsAt) {
      ends = new Date(endsAt);
      if (Number.isNaN(ends.getTime())) {
        res.status(400).json({ error: "Geçersiz endsAt" });
        return;
      }
    }

    const [course] = await db
      .insert(coursesTable)
      .values({
        title,
        description: typeof description === "string" ? description : null,
        term: Number.isFinite(term) ? term : 1,
        order: Number.isFinite(order) ? order : 0,
        isPublished: isPublished === true,
        format: resolvedFormat,
        startsAt: starts,
        endsAt: ends,
        meetUrl: typeof meetUrl === "string" ? meetUrl : null,
        audience: typeof audience === "string" && audience ? audience : "all",
        category: resolvedCategory,
        passCost: resolveCoursePassCost(
          resolvedFormat,
          passCost,
          passCost !== undefined && passCost !== null,
        ),
      })
      .returning();
    res.json({ course });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurs oluşturulamadı" });
  }
});

// ─── PATCH /api/courses/:id (admin) ──────────────────────────────────────────
router.patch("/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureLiveSessionColumns();
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId)) {
      res.status(400).json({ error: "Geçersiz kurs" });
      return;
    }
    const {
      title,
      description,
      term,
      order,
      isPublished,
      format,
      startsAt,
      endsAt,
      meetUrl,
      audience,
      passCost,
      category,
    } = req.body ?? {};

    const [existing] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Kurs bulunamadı" });
      return;
    }

    const patch: Partial<typeof coursesTable.$inferInsert> = {};
    if (typeof title === "string") patch.title = title;
    if (typeof description === "string") patch.description = description;
    if (Number.isFinite(term)) patch.term = term;
    if (Number.isFinite(order)) patch.order = order;
    if (typeof isPublished === "boolean") patch.isPublished = isPublished;
    if (format !== undefined) patch.format = resolveCourseFormat(format, existing.format);
    if (startsAt !== undefined) {
      if (startsAt === null) {
        patch.startsAt = null;
      } else {
        const d = new Date(startsAt);
        if (Number.isNaN(d.getTime())) {
          res.status(400).json({ error: "Geçersiz startsAt" });
          return;
        }
        patch.startsAt = d;
      }
    }
    if (endsAt !== undefined) {
      if (endsAt === null) {
        patch.endsAt = null;
      } else {
        const d = new Date(endsAt);
        if (Number.isNaN(d.getTime())) {
          res.status(400).json({ error: "Geçersiz endsAt" });
          return;
        }
        patch.endsAt = d;
      }
    }
    if (meetUrl !== undefined) patch.meetUrl = typeof meetUrl === "string" ? meetUrl : null;
    if (typeof audience === "string") patch.audience = audience || "all";
    const COURSE_CATS = ["business", "product", "art", "craft", "capital", "ops"] as const;
    if (typeof category === "string" && (COURSE_CATS as readonly string[]).includes(category)) {
      patch.category = category;
    }

    const nextFormat = (patch.format as string | undefined) ?? existing.format ?? "vod";
    if (format !== undefined || passCost !== undefined) {
      patch.passCost = resolveCoursePassCost(
        nextFormat,
        passCost !== undefined ? passCost : existing.passCost,
        passCost !== undefined && passCost !== null,
      );
    }

    const [course] = await db
      .update(coursesTable)
      .set(patch)
      .where(eq(coursesTable.id, courseId))
      .returning();
    if (!course) {
      res.status(404).json({ error: "Kurs bulunamadı" });
      return;
    }
    res.json({ course });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurs güncellenemedi" });
  }
});

// ─── POST /api/courses/:id/modules (admin) ───────────────────────────────────
router.post("/courses/:id/modules", requireAuth, requireAdmin, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId)) {
      res.status(400).json({ error: "Geçersiz kurs" });
      return;
    }
    const { title, order } = req.body ?? {};
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Başlık gerekli" });
      return;
    }
    const [course] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId))
      .limit(1);
    if (!course) {
      res.status(404).json({ error: "Kurs bulunamadı" });
      return;
    }
    const [courseModule] = await db
      .insert(modulesTable)
      .values({ courseId, title, order: Number.isFinite(order) ? order : 0 })
      .returning();
    res.json({ module: courseModule });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Modül oluşturulamadı" });
  }
});

// ─── POST /api/modules/:id/lessons (admin) ───────────────────────────────────
router.post("/modules/:id/lessons", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureCourseVideoColumns();
    const moduleId = Number(req.params.id);
    if (!Number.isFinite(moduleId)) {
      res.status(400).json({ error: "Geçersiz modül" });
      return;
    }
    const { title, content, videoUrl, durationSeconds, order } = req.body ?? {};
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Başlık gerekli" });
      return;
    }
    const [courseModule] = await db
      .select({ id: modulesTable.id })
      .from(modulesTable)
      .where(eq(modulesTable.id, moduleId))
      .limit(1);
    if (!courseModule) {
      res.status(404).json({ error: "Modül bulunamadı" });
      return;
    }
    const [lesson] = await db
      .insert(lessonsTable)
      .values({
        moduleId,
        title,
        content: typeof content === "string" ? content : null,
        videoUrl: typeof videoUrl === "string" ? videoUrl : null,
        durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
        order: Number.isFinite(order) ? order : 0,
      })
      .returning();
    res.json({ lesson });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ders oluşturulamadı" });
  }
});

// ─── DELETE /api/lessons/:id (admin) ─────────────────────────────────────────
router.delete("/lessons/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    if (!Number.isFinite(lessonId)) {
      res.status(400).json({ error: "Geçersiz ders" });
      return;
    }
    await db.delete(progressTable).where(eq(progressTable.lessonId, lessonId));
    const [deleted] = await db.delete(lessonsTable).where(eq(lessonsTable.id, lessonId)).returning({ id: lessonsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Ders bulunamadı" });
      return;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ders silinemedi" });
  }
});

// ─── DELETE /api/modules/:id (admin) ─────────────────────────────────────────
router.delete("/modules/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const moduleId = Number(req.params.id);
    if (!Number.isFinite(moduleId)) {
      res.status(400).json({ error: "Geçersiz modül" });
      return;
    }
    const lessonIds = (
      await db.select({ id: lessonsTable.id }).from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId))
    ).map((l) => l.id);
    if (lessonIds.length > 0) {
      await db.delete(progressTable).where(inArray(progressTable.lessonId, lessonIds));
      await db.delete(lessonsTable).where(inArray(lessonsTable.id, lessonIds));
    }
    const [deleted] = await db.delete(modulesTable).where(eq(modulesTable.id, moduleId)).returning({ id: modulesTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Modül bulunamadı" });
      return;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Modül silinemedi" });
  }
});

// ─── DELETE /api/courses/:id (admin) ─────────────────────────────────────────
router.delete("/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId)) {
      res.status(400).json({ error: "Geçersiz kurs" });
      return;
    }
    const moduleIds = (
      await db.select({ id: modulesTable.id }).from(modulesTable).where(eq(modulesTable.courseId, courseId))
    ).map((m) => m.id);
    if (moduleIds.length > 0) {
      const lessonIds = (
        await db.select({ id: lessonsTable.id }).from(lessonsTable).where(inArray(lessonsTable.moduleId, moduleIds))
      ).map((l) => l.id);
      if (lessonIds.length > 0) {
        await db.delete(progressTable).where(inArray(progressTable.lessonId, lessonIds));
        await db.delete(lessonsTable).where(inArray(lessonsTable.id, lessonIds));
      }
      await db.delete(modulesTable).where(inArray(modulesTable.id, moduleIds));
    }
    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.courseId, courseId));
    const [deleted] = await db.delete(coursesTable).where(eq(coursesTable.id, courseId)).returning({ id: coursesTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Kurs bulunamadı" });
      return;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurs silinemedi" });
  }
});

// ─── POST /api/lessons/:id/complete ──────────────────────────────────────────
router.post("/lessons/:id/complete", requireAuth, async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(lessonId)) {
      res.status(400).json({ error: "Geçersiz ders" });
      return;
    }

    const [lesson] = await db
      .select({ id: lessonsTable.id, moduleId: lessonsTable.moduleId })
      .from(lessonsTable)
      .where(eq(lessonsTable.id, lessonId))
      .limit(1);
    if (!lesson) {
      res.status(404).json({ error: "Ders bulunamadı" });
      return;
    }

    const [courseModule] = await db
      .select({ courseId: modulesTable.courseId })
      .from(modulesTable)
      .where(eq(modulesTable.id, lesson.moduleId))
      .limit(1);
    if (!courseModule) {
      res.status(404).json({ error: "Modül bulunamadı" });
      return;
    }

    const [enrollment] = await db
      .select()
      .from(enrollmentsTable)
      .where(
        and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseModule.courseId)),
      )
      .limit(1);
    if (!enrollment) {
      res.status(403).json({ error: "Bu kursa kayıtlı değilsin" });
      return;
    }

    const [existing] = await db
      .select()
      .from(progressTable)
      .where(and(eq(progressTable.userId, userId), eq(progressTable.lessonId, lessonId)))
      .limit(1);

    if (existing) {
      await db
        .update(progressTable)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(progressTable.id, existing.id));
    } else {
      await db.insert(progressTable).values({ userId, lessonId, completed: true, completedAt: new Date() });
    }

    res.json({
      lessonId,
      completed: true,
      progressPct: await progressPctForUser(userId, courseModule.courseId),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İşaretlenemedi" });
  }
});

// ─── POST /api/mux/uploads (admin) ───────────────────────────────────────────
router.post("/mux/uploads", requireAuth, requireAdmin, async (req, res) => {
  try {
    const mux = getMux();
    const appUrl = (process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "");
    const upload = await mux.video.uploads.create({
      cors_origin: appUrl,
      new_asset_settings: { playback_policies: ["public"] },
    });
    res.json({ uploadId: upload.id, uploadUrl: upload.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Mux upload başlatılamadı" });
  }
});

// ─── GET /api/mux/uploads/:id (admin) ────────────────────────────────────────
router.get("/mux/uploads/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const mux = getMux();
    const upload = await mux.video.uploads.retrieve(String(req.params.id));
    if (upload.status === "errored" || upload.status === "cancelled" || upload.status === "timed_out") {
      res.json({ status: "errored" });
      return;
    }
    if (upload.status !== "asset_created" || !upload.asset_id) {
      res.json({ status: "waiting" });
      return;
    }
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    if (asset.status === "errored") {
      res.json({ status: "errored" });
      return;
    }
    if (asset.status !== "ready") {
      res.json({ status: "waiting" });
      return;
    }
    const playbackId = asset.playback_ids?.[0]?.id;
    res.json({
      status: "ready",
      playbackId: playbackId ?? null,
      durationSeconds: asset.duration ? Math.round(asset.duration) : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Mux durumu alınamadı" });
  }
});

export default router;
