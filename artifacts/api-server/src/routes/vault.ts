import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, vaultDocumentsTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureVaultCapitalSchema } from "../lib/ensureSchema";

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

async function ensureVaultSeed(adminUserId: number) {
  const [row] = await db.select({ id: vaultDocumentsTable.id }).from(vaultDocumentsTable).limit(1);
  if (row) return;

  await db.insert(vaultDocumentsTable).values([
    {
      userId: adminUserId,
      title: "Pre-seed Yatırımcı Pitch Deck — inner·hub",
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
      title: "The Mom Test — Okuma Notları",
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
      .filter((r) => r.doc.access !== "özel" || r.doc.userId === userId)
      .map((r) => ({
        id: r.doc.id,
        title: r.doc.title,
        type: r.doc.docType,
        access: r.doc.access,
        author: r.authorName,
        tags: parseTags(r.doc.tags),
        excerpt: r.doc.excerpt ?? "",
        updatedDays: daysAgo(r.doc.updatedAt),
        pages: r.doc.pages ?? undefined,
        views: r.doc.views,
        mine: r.doc.userId === userId,
      }));

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
      document: {
        id: inserted.id,
        title: inserted.title,
        type: inserted.docType,
        access: inserted.access,
        author: req.user!.name,
        tags,
        excerpt: inserted.excerpt ?? "",
        updatedDays: 0,
        views: 0,
        mine: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Belge kaydedilemedi" });
  }
});

export default router;
