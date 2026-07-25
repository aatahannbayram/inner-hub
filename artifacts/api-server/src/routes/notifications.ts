import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";

const router = Router();

export type NotifKind = "match" | "event" | "capital" | "request" | "signal";

/** Eski DB'lerde title/kind yoksa ekle (idempotent). */
async function ensureNotificationColumns() {
  await db.execute(sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text`);
  await db.execute(sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS kind text`);
}

async function ensureWelcomeNotifications(userId: number) {
  const [row] = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .limit(1);
  if (row) return;

  await db.insert(notificationsTable).values([
    {
      userId,
      title: "inner·hub'a hoş geldin",
      body: "Topluluk chat, etkinlikler ve kurslar canlı. Profilini tamamlamayı unutma.",
      kind: "signal",
      isRead: false,
    },
    {
      userId,
      title: "Etkinlikler seni bekliyor",
      body: "Yaklaşan networking ve workshop’lara Etkinlikler’den kayıt olabilirsin.",
      kind: "event",
      isRead: false,
    },
  ]);
}

function mapRow(n: {
  id: number;
  body: string;
  isRead: boolean;
  createdAt: Date;
  title?: string | null;
  kind?: string | null;
}) {
  const kind = (n.kind as NotifKind | null) ?? "signal";
  return {
    id: n.id,
    title: (n.title && n.title.trim()) || "Bildirim",
    body: n.body,
    kind: ["match", "event", "capital", "request", "signal"].includes(kind) ? kind : "signal",
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

/** Diğer route'lardan bildirim oluşturmak için. */
export async function createNotification(input: {
  userId: number;
  title: string;
  body: string;
  kind?: NotifKind;
}) {
  try {
    await ensureNotificationColumns();
    await db.insert(notificationsTable).values({
      userId: input.userId,
      title: input.title,
      body: input.body,
      kind: input.kind ?? "signal",
      isRead: false,
    });
  } catch {
    // Bildirim yazılamasa ana işlemi bozma
  }
}

// ─── GET /api/notifications ──────────────────────────────────────────────────
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    await ensureNotificationColumns();
    const userId = req.user!.id;
    await ensureWelcomeNotifications(userId);

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    const notifications = rows.map(mapRow);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Bildirimler yüklenemedi" });
  }
});

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
    res.json({ unreadCount: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İşlem başarısız" });
  }
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz bildirim" });
      return;
    }

    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)));

    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

    res.json({ id, isRead: true, unreadCount: Number(n) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İşlem başarısız" });
  }
});

export default router;
