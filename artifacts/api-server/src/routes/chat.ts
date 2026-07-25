import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { channelsTable, messagesTable, usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";

const router = Router();

const DEFAULT_CHANNELS = [
  { name: "genel", description: "Genel topluluk sohbeti", isPublic: true },
  { name: "duyurular", description: "Önemli duyurular ve haberler", isPublic: true },
  { name: "girisimler", description: "Startup haberleri ve milestone paylaşımları", isPublic: true },
  { name: "ai-tools", description: "Yapay zeka araçları ve denemeler", isPublic: true },
  { name: "jobs", description: "İş ve staj fırsatları", isPublic: true },
  { name: "tavsiyeler", description: "Kitap, podcast, araç önerileri", isPublic: true },
] as const;

async function ensureChannelsSeed() {
  const [row] = await db.select({ id: channelsTable.id }).from(channelsTable).limit(1);
  if (row) return;
  await db.insert(channelsTable).values([...DEFAULT_CHANNELS]);
}

function initialsFromName(name: string | null | undefined, email: string): string {
  const base = (name?.trim() || email.split("@")[0] || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

function formatTs(d: Date): string {
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// ─── GET /api/channels ───────────────────────────────────────────────────────
router.get("/channels", requireAuth, async (_req, res) => {
  try {
    await ensureChannelsSeed();
    const rows = await db.select().from(channelsTable).orderBy(asc(channelsTable.id));
    res.json({
      channels: rows.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? "",
        isPublic: c.isPublic,
        type: c.name === "duyurular" ? "announcement" : "text",
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kanallar yüklenemedi" });
  }
});

// ─── GET /api/channels/:id/messages ──────────────────────────────────────────
router.get("/channels/:id/messages", requireAuth, async (req, res) => {
  try {
    const channelId = Number(req.params.id);
    if (!Number.isFinite(channelId)) {
      res.status(400).json({ error: "Geçersiz kanal" });
      return;
    }

    const [channel] = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.id, channelId))
      .limit(1);
    if (!channel) {
      res.status(404).json({ error: "Kanal bulunamadı" });
      return;
    }

    const rows = await db
      .select({
        id: messagesTable.id,
        body: messagesTable.body,
        createdAt: messagesTable.createdAt,
        userId: usersTable.id,
        userName: usersTable.name,
        userEmail: usersTable.email,
        userRole: usersTable.role,
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(eq(messagesTable.channelId, channelId))
      .orderBy(asc(messagesTable.createdAt));

    res.json({
      channelId,
      messages: rows.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        timestamp: formatTs(m.createdAt),
        authorUserId: m.userId,
        authorName: m.userName?.trim() || m.userEmail.split("@")[0],
        authorInitials: initialsFromName(m.userName, m.userEmail),
        authorRole: m.userRole === "admin" ? "admin" : "member",
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Mesajlar yüklenemedi" });
  }
});

// ─── POST /api/channels/:id/messages ─────────────────────────────────────────
router.post("/channels/:id/messages", requireAuth, async (req, res) => {
  try {
    const channelId = Number(req.params.id);
    const userId = req.user!.id;
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

    if (!Number.isFinite(channelId)) {
      res.status(400).json({ error: "Geçersiz kanal" });
      return;
    }
    if (!body || body.length > 4000) {
      res.status(400).json({ error: "Mesaj 1–4000 karakter olmalı" });
      return;
    }

    const [channel] = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.id, channelId))
      .limit(1);
    if (!channel) {
      res.status(404).json({ error: "Kanal bulunamadı" });
      return;
    }

    const [inserted] = await db
      .insert(messagesTable)
      .values({ channelId, userId, body })
      .returning();

    const user = req.user!;
    res.status(201).json({
      message: {
        id: inserted.id,
        body: inserted.body,
        createdAt: inserted.createdAt.toISOString(),
        timestamp: formatTs(inserted.createdAt),
        authorUserId: user.id,
        authorName: user.name?.trim() || user.email.split("@")[0],
        authorInitials: initialsFromName(user.name, user.email),
        authorRole: user.role === "admin" ? "admin" : "member",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Mesaj gönderilemedi" });
  }
});

export default router;
