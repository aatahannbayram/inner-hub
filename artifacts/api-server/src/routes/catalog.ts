import { Router } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { coursesTable, eventsTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";

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
        title: "Networking Kahvaltısı — Ağustos",
        description: "Küçük grup, derin konuşmalar. Tema: B2B satış ve uluslararasılaşma.",
        location: "Online (Zoom)",
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

// ─── GET /api/catalog/events ─────────────────────────────────────────────────
router.get("/events", requireAuth, async (_req, res) => {
  try {
    await ensureDemoContent();
    const rows = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.isPublished, true))
      .orderBy(asc(eventsTable.startAt));

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
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Etkinlikler yüklenemedi" });
  }
});

// ─── GET /api/catalog/courses ────────────────────────────────────────────────
router.get("/courses", requireAuth, async (_req, res) => {
  try {
    await ensureDemoContent();
    const rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .orderBy(asc(coursesTable.order), desc(coursesTable.createdAt));

    res.json({
      courses: rows.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        term: c.term,
        order: c.order,
        progressPct: 0,
        isEnrolled: false,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kurslar yüklenemedi" });
  }
});

export default router;
