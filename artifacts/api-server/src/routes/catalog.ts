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
} from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ensureCourseVideoColumns } from "../lib/ensureSchema";
import { createNotification } from "./notifications";

const router = Router();

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
    await ensureCourseVideoColumns();
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
      rows.map(async (c) => {
        const isEnrolled = enrolledIds.has(c.id);
        const modules = await courseModulesForUser(userId, c.id, isEnrolled);
        return {
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          term: c.term,
          order: c.order,
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

// ─── GET /api/admin/courses ───────────────────────────────────────────────────
// Admin yönetim görünümü: yayında olmayan (taslak) kurslar da dahil.
router.get("/admin/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureDemoContent();
    await ensureCourseVideoColumns();
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(coursesTable)
      .orderBy(asc(coursesTable.order), desc(coursesTable.createdAt));

    const courses = await Promise.all(
      rows.map(async (c) => ({
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        term: c.term,
        order: c.order,
        isPublished: c.isPublished,
        modules: await courseModulesForUser(userId, c.id, true),
      })),
    );

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurslar yüklenemedi" });
  }
});

// ─── POST /api/courses (admin) ───────────────────────────────────────────────
router.post("/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, term, order, isPublished } = req.body ?? {};
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Başlık gerekli" });
      return;
    }
    const [course] = await db
      .insert(coursesTable)
      .values({
        title,
        description: typeof description === "string" ? description : null,
        term: Number.isFinite(term) ? term : 1,
        order: Number.isFinite(order) ? order : 0,
        isPublished: isPublished === true,
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
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId)) {
      res.status(400).json({ error: "Geçersiz kurs" });
      return;
    }
    const { title, description, term, order, isPublished } = req.body ?? {};
    const patch: Partial<typeof coursesTable.$inferInsert> = {};
    if (typeof title === "string") patch.title = title;
    if (typeof description === "string") patch.description = description;
    if (Number.isFinite(term)) patch.term = term;
    if (Number.isFinite(order)) patch.order = order;
    if (typeof isPublished === "boolean") patch.isPublished = isPublished;

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
