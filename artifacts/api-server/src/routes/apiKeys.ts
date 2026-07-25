import crypto from "node:crypto";
import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { apiKeysTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureApiKeysSchema } from "../lib/ensureSchema";

const router = Router();

function generateKey(): { plaintext: string; prefix: string; hash: string } {
  const raw = crypto.randomBytes(24).toString("base64url"); // ~32 karakter, URL-güvenli
  const plaintext = `ih_live_${raw}`;
  const prefix = plaintext.slice(0, 15); // "ih_live_" + ilk 7 karakter — teşhis için yeterli, geri kalanı asla saklanmaz
  const hash = crypto.createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, prefix, hash };
}

// ─── GET /api/api-keys ────────────────────────────────────────────────────────
router.get("/api-keys", requireAuth, async (req, res) => {
  try {
    await ensureApiKeysSchema();
    const rows = await db
      .select({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        keyPrefix: apiKeysTable.keyPrefix,
        createdAt: apiKeysTable.createdAt,
        lastUsedAt: apiKeysTable.lastUsedAt,
      })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, req.user!.id))
      .orderBy(desc(apiKeysTable.createdAt));

    res.json({
      keys: rows.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: `${k.keyPrefix}…`,
        createdAt: k.createdAt.toISOString(),
        lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Anahtarlar yüklenemedi" });
  }
});

// ─── POST /api/api-keys ───────────────────────────────────────────────────────
// Plaintext anahtar yalnızca bu cevapta döner — sunucu bir daha göstermez.
router.post("/api-keys", requireAuth, async (req, res) => {
  try {
    await ensureApiKeysSchema();
    const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 60) : "";
    if (!name) {
      res.status(400).json({ error: "Anahtar adı gerekli" });
      return;
    }

    const existing = await db
      .select({ id: apiKeysTable.id })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, req.user!.id));
    if (existing.length >= 10) {
      res.status(400).json({ error: "En fazla 10 anahtar oluşturabilirsin" });
      return;
    }

    const { plaintext, prefix, hash } = generateKey();
    const [row] = await db
      .insert(apiKeysTable)
      .values({ userId: req.user!.id, name, keyPrefix: prefix, keyHash: hash })
      .returning({ id: apiKeysTable.id, createdAt: apiKeysTable.createdAt });

    res.status(201).json({
      key: plaintext,
      id: row.id,
      name,
      prefix: `${prefix}…`,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Anahtar oluşturulamadı" });
  }
});

// ─── DELETE /api/api-keys/:id ─────────────────────────────────────────────────
router.delete("/api-keys/:id", requireAuth, async (req, res) => {
  try {
    await ensureApiKeysSchema();
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz anahtar" });
      return;
    }
    const deleted = await db
      .delete(apiKeysTable)
      .where(and(eq(apiKeysTable.id, id), eq(apiKeysTable.userId, req.user!.id)))
      .returning({ id: apiKeysTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Anahtar bulunamadı" });
      return;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Anahtar silinemedi" });
  }
});

export default router;
