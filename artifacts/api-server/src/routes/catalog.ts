import { Router } from "express";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  coursesTable,
  enrollmentsTable,
  eventRegistrationsTable,
  eventsTable,
  lessonsTable,
  modulesTable,
  progressTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { createNotification } from "./notifications";

const router = Router();

async function ensureDemoContent() {
  if (process.env.NODE_ENV === "production") return;

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
      },
      {
        title: "Networking Kahvaltısı",
        description: "Küçük grup, derin konuşmalar. Tema: B2B satış ve uluslararasılaşma.",
        location: "Online (Zoom)", // UI'da lang="en" ile uppercase; TR İ bozulmasın
        startAt: new Date("2026-08-05T09:00:00"),
        endAt: new Date("2026-08-05T11:00:00"),
        isPublished: true,
      },
      {
        title: "Fundraising Workshop",
        description: "Seed ve Series A süreçleri, pitch deck ve yatırımcı görüşme teknikleri.",
        location: "Kolektif House Maslak",
        startAt: new Date("2026-08-20T14:00:00"),
        endAt: new Date("2026-08-20T17:00:00"),
        isPublished: true,
      },
    ]);
  } else {
    // Mevcut demo başlıklarındaki em dash'i temizle (tarih sütunu ayı zaten gösterir)
    await db
      .update(eventsTable)
      .set({ title: "Networking Kahvaltısı" })
      .where(eq(eventsTable.title, "Networking Kahvaltısı — Ağustos"));
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
      },
      {
        title: "Yapay Zeka ile İK Yönetimi",
        description:
          "GPT, ML ve otomasyon araçlarıyla İK süreçlerinizi geleceğe hazırlayın.",
        term: 1,
        order: 2,
        isPublished: true,
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

// ─── GET /api/events ─────────────────────────────────────────────────────────
router.get("/events", requireAuth, async (req, res) => {
  try {
    await ensureDemoContent();
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.isPublished, true))
      .orderBy(asc(eventsTable.startAt));

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
      events: rows.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? "",
        location: e.location ?? "",
        startAt: e.startAt.toISOString(),
        endAt: e.endAt?.toISOString() ?? e.startAt.toISOString(),
        isPast: e.startAt.getTime() < now,
        isPublished: e.isPublished,
        capacity: 0,
        registered: countMap.get(e.id) ?? 0,
        isRegistered: mySet.has(e.id),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlikler yüklenemedi" });
  }
});

// ─── POST /api/events/:id/register ───────────────────────────────────────────
router.post("/events/:id/register", requireAuth, async (req, res) => {
  try {
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
      await db.insert(eventRegistrationsTable).values({ userId, eventId });
      await createNotification({
        userId,
        title: "Etkinlik kaydı onaylandı",
        body: `${event.title} için kaydın alındı.`,
        kind: "event",
      });
    }

    res.json({ eventId, isRegistered: true });
  } catch (err: any) {
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

// ─── GET /api/courses ────────────────────────────────────────────────────────
router.get("/courses", requireAuth, async (req, res) => {
  try {
    await ensureDemoContent();
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .orderBy(asc(coursesTable.order), desc(coursesTable.createdAt));

    const enrollments = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.userId, userId));
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));

    const courses = await Promise.all(
      rows.map(async (c) => ({
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        term: c.term,
        order: c.order,
        isEnrolled: enrolledIds.has(c.id),
        progressPct: enrolledIds.has(c.id) ? await progressPctForUser(userId, c.id) : 0,
      })),
    );

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurslar yüklenemedi" });
  }
});

// ─── POST /api/courses/:id/enroll ────────────────────────────────────────────
router.post("/courses/:id/enroll", requireAuth, async (req, res) => {
  try {
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

    const [existing] = await db
      .select()
      .from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseId)))
      .limit(1);

    if (!existing) {
      await db.insert(enrollmentsTable).values({ userId, courseId });
      await createNotification({
        userId,
        title: "Kursa kayıt oldun",
        body: `${course.title} kursuna kaydın tamamlandı.`,
        kind: "signal",
      });
    }

    res.json({
      courseId,
      isEnrolled: true,
      progressPct: await progressPctForUser(userId, courseId),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kayıt başarısız" });
  }
});

export default router;
