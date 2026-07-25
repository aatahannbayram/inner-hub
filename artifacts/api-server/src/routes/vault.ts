import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, vaultDocumentsTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureVaultCapitalSchema } from "../lib/ensureSchema";
import {
  deleteVaultFile,
  isAllowedVaultMime,
  readVaultFile,
  saveVaultFile,
  vaultMaxBytes,
} from "../lib/vaultStorage";

const router = Router();

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === "string").slice(0, 12);
  } catch {
    /* fallthrough */
  }
  return raw.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12);
}

function daysAgo(d: Date): number {
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

function mapDoc(
  doc: typeof vaultDocumentsTable.$inferSelect,
  author: string,
  mine: boolean,
) {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.docType,
    access: doc.access as "özel" | "davetli" | "topluluk",
    author,
    tags: parseTags(doc.tags),
    excerpt: doc.excerpt ?? "",
    updatedDays: daysAgo(doc.updatedAt),
    pages: doc.pages ?? undefined,
    views: doc.views,
    mine,
    hasFile: Boolean(doc.fileKey),
    fileName: doc.fileName ?? null,
    mimeType: doc.mimeType ?? null,
    sizeBytes: doc.sizeBytes ?? null,
  };
}

function canAccess(
  doc: typeof vaultDocumentsTable.$inferSelect,
  userId: number,
): boolean {
  if (doc.userId === userId) return true;
  if (doc.access === "özel") return false;
  return true; // topluluk | davetli → üyeler (auth zaten var)
}

async function ensureVaultSeed(adminUserId: number) {
  const [row] = await db.select({ id: vaultDocumentsTable.id }).from(vaultDocumentsTable).limit(1);
  if (row) {
    // Mevcut demo başlıklarındaki em dash temizliği
    await db
      .update(vaultDocumentsTable)
      .set({ title: "Pre-seed Yatırımcı Pitch Deck" })
      .where(eq(vaultDocumentsTable.title, "Pre-seed Yatırımcı Pitch Deck — inner·hub"));
    await db
      .update(vaultDocumentsTable)
      .set({ title: "The Mom Test · Okuma Notları" })
      .where(eq(vaultDocumentsTable.title, "The Mom Test — Okuma Notları"));
    return;
  }

  await db.insert(vaultDocumentsTable).values([
    {
      userId: adminUserId,
      title: "Pre-seed Yatırımcı Pitch Deck",
      docType: "Pitch Deck",
      access: "davetli",
      excerpt:
        "inner·hub'ın 2026 yatırım turu için hazırlanan pitch deck özeti. Problem, çözüm, GTM ve finansallar.",
      tags: JSON.stringify(["yatırım", "topluluk", "SaaS"]),
      pages: 18,
      views: 24,
    },
    {
      userId: adminUserId,
      title: "Türkiye B2B SaaS Pazar Analizi Q2 2026",
      docType: "Araştırma",
      access: "topluluk",
      excerpt: "Türkiye B2B SaaS ekosisteminde büyüme trendleri ve rekabet haritası özeti.",
      tags: JSON.stringify(["pazar", "B2B", "SaaS"]),
      pages: 22,
      views: 41,
    },
    {
      userId: adminUserId,
      title: "The Mom Test · Okuma Notları",
      docType: "Not",
      access: "topluluk",
      excerpt: "Müşteri görüşmesi için actionable framework notları.",
      tags: JSON.stringify(["kitap", "ürün"]),
      views: 67,
    },
    {
      userId: adminUserId,
      title: "AWS Activate Başvuru Şablonu",
      docType: "Şablon",
      access: "topluluk",
      excerpt: "AWS Activate başvurusu için doldurulmuş şablon özeti.",
      tags: JSON.stringify(["AWS", "kredi"]),
      pages: 4,
      views: 89,
    },
  ]);
}

// ─── GET /api/vault ──────────────────────────────────────────────────────────
router.get("/vault", requireAuth, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const userId = req.user!.id;
    let adminId = userId;
    const [admin] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);
    if (admin) adminId = admin.id;
    await ensureVaultSeed(adminId);

    const rows = await db
      .select({
        doc: vaultDocumentsTable,
        authorName: usersTable.name,
      })
      .from(vaultDocumentsTable)
      .innerJoin(usersTable, eq(vaultDocumentsTable.userId, usersTable.id))
      .orderBy(desc(vaultDocumentsTable.updatedAt));

    const documents = rows
      .filter(({ doc }) => canAccess(doc, userId))
      .map(({ doc, authorName }) => mapDoc(doc, authorName, doc.userId === userId));

    res.json({ documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Vault yüklenemedi" });
  }
});

// ─── POST /api/vault ─────────────────────────────────────────────────────────
router.post("/vault", requireAuth, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const userId = req.user!.id;
    const title = typeof req.body?.title === "string" ? req.body.title.trim().slice(0, 200) : "";
    const docType = typeof req.body?.type === "string" ? req.body.type.trim().slice(0, 40) : "Not";
    const access =
      req.body?.access === "özel" || req.body?.access === "davetli" || req.body?.access === "topluluk"
        ? req.body.access
        : "topluluk";
    const excerpt = typeof req.body?.excerpt === "string" ? req.body.excerpt.trim().slice(0, 500) : "";
    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags.filter((t: unknown) => typeof t === "string").slice(0, 12)
      : [];

    if (!title) {
      res.status(400).json({ error: "Başlık zorunlu" });
      return;
    }

    const [inserted] = await db
      .insert(vaultDocumentsTable)
      .values({
        userId,
        title,
        docType,
        access,
        excerpt: excerpt || null,
        tags: JSON.stringify(tags),
        views: 0,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({
      document: mapDoc(inserted, req.user!.name, true),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Belge kaydedilemedi" });
  }
});

// ─── PUT /api/vault/:id/file ─────────────────────────────────────────────────
router.put("/vault/:id/file", requireAuth, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const userId = req.user!.id;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [doc] = await db
      .select()
      .from(vaultDocumentsTable)
      .where(eq(vaultDocumentsTable.id, id))
      .limit(1);
    if (!doc) {
      res.status(404).json({ error: "Belge bulunamadı" });
      return;
    }
    if (doc.userId !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Bu belgeye dosya yükleyemezsiniz" });
      return;
    }

    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({
        error: "Dosya gövdesi gerekli (raw binary)",
        maxBytes: vaultMaxBytes(),
      });
      return;
    }
    if (body.length > vaultMaxBytes()) {
      res.status(413).json({ error: "Dosya en fazla 12 MB olabilir" });
      return;
    }

    const mimeRaw = String(req.headers["content-type"] ?? "application/octet-stream")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const mime = mimeRaw || "application/octet-stream";
    if (!isAllowedVaultMime(mime)) {
      res.status(415).json({ error: "Desteklenmeyen dosya türü" });
      return;
    }

    let fileName = "document.bin";
    const headerName = req.headers["x-filename"];
    if (typeof headerName === "string" && headerName.trim()) {
      try {
        fileName = decodeURIComponent(headerName).trim().slice(0, 180) || fileName;
      } catch {
        fileName = headerName.trim().slice(0, 180);
      }
    }

    await deleteVaultFile(doc.fileKey);
    const saved = await saveVaultFile(userId, fileName, body);

    const [updated] = await db
      .update(vaultDocumentsTable)
      .set({
        fileKey: saved.fileKey,
        fileName,
        mimeType: mime,
        sizeBytes: saved.sizeBytes,
        updatedAt: new Date(),
      })
      .where(eq(vaultDocumentsTable.id, id))
      .returning();

    res.json({
      document: mapDoc(updated, req.user!.name, true),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Dosya yüklenemedi" });
  }
});

// ─── GET /api/vault/:id/file ─────────────────────────────────────────────────
router.get("/vault/:id/file", requireAuth, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const userId = req.user!.id;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [doc] = await db
      .select()
      .from(vaultDocumentsTable)
      .where(eq(vaultDocumentsTable.id, id))
      .limit(1);
    if (!doc || !canAccess(doc, userId)) {
      res.status(404).json({ error: "Belge bulunamadı" });
      return;
    }
    if (!doc.fileKey) {
      res.status(404).json({ error: "Bu belgede dosya yok" });
      return;
    }

    const buffer = await readVaultFile(doc.fileKey);
    await db
      .update(vaultDocumentsTable)
      .set({ views: (doc.views ?? 0) + 1, updatedAt: doc.updatedAt })
      .where(eq(vaultDocumentsTable.id, id));

    const downloadName = (doc.fileName || "vault-file").replace(/[\r\n"]/g, "");
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    );
    res.setHeader("Cache-Control", "private, max-age=60");
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Dosya indirilemedi" });
  }
});

export default router;
