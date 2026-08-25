import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { legalAcceptancesTable, legalDocumentsTable, usersTable } from "@workspace/db/schema";
import { requireAuth, destroySession, SESSION_COOKIE } from "../lib/auth";
import {
  ensureLegalDocumentsSeeded,
  userHasAcceptedLatestLegal,
} from "../lib/identity";
import { ensureOrgLegalCampaignSchema, ensureUserMembershipColumns } from "../lib/ensureSchema";

const router = Router();

/** GET /api/legal/pending — kabul edilmemiş belgeler */
router.get("/legal/pending", requireAuth, async (req, res) => {
  try {
    const locale = req.query.locale === "en" ? "en" : "tr";
    await ensureLegalDocumentsSeeded();
    const status = await userHasAcceptedLatestLegal(req.user!.id, locale);
    if (status.ok) {
      res.json({ pending: [] });
      return;
    }
    // Tüm güncel slug'ları döndür
    const docs = await db
      .select()
      .from(legalDocumentsTable)
      .where(eq(legalDocumentsTable.locale, locale))
      .orderBy(desc(legalDocumentsTable.publishedAt));
    const bySlug = new Map<string, (typeof docs)[0]>();
    for (const d of docs) {
      if (!bySlug.has(d.slug)) bySlug.set(d.slug, d);
    }
    const pending = [];
    for (const doc of bySlug.values()) {
      const [acc] = await db
        .select({ id: legalAcceptancesTable.id })
        .from(legalAcceptancesTable)
        .where(
          and(
            eq(legalAcceptancesTable.userId, req.user!.id),
            eq(legalAcceptancesTable.documentId, doc.id),
            eq(legalAcceptancesTable.version, doc.version),
          ),
        )
        .limit(1);
      if (!acc) {
        pending.push({
          id: doc.id,
          slug: doc.slug,
          version: doc.version,
          title: doc.title,
          bodyMarkdown: doc.bodyMarkdown,
        });
      }
    }
    res.json({ pending });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Hukuki belgeler yüklenemedi" });
  }
});

/** POST /api/legal/accept — { documentIds: number[] } veya { acceptAll: true } */
router.post("/legal/accept", requireAuth, async (req, res) => {
  try {
    await ensureLegalDocumentsSeeded();
    const userId = req.user!.id;
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
    const ua = req.headers["user-agent"]?.slice(0, 300) ?? null;
    const locale = req.body?.locale === "en" ? "en" : "tr";

    let docs = await db
      .select()
      .from(legalDocumentsTable)
      .where(eq(legalDocumentsTable.locale, locale));

    if (Array.isArray(req.body?.documentIds) && req.body.documentIds.length) {
      const ids = req.body.documentIds.map(Number).filter(Number.isFinite);
      docs = docs.filter((d) => ids.includes(d.id));
    }

    const bySlug = new Map<string, (typeof docs)[0]>();
    for (const d of docs) {
      const prev = bySlug.get(d.slug);
      if (!prev || d.publishedAt > prev.publishedAt) bySlug.set(d.slug, d);
    }

    let accepted = 0;
    for (const doc of bySlug.values()) {
      const [existing] = await db
        .select({ id: legalAcceptancesTable.id })
        .from(legalAcceptancesTable)
        .where(
          and(
            eq(legalAcceptancesTable.userId, userId),
            eq(legalAcceptancesTable.documentId, doc.id),
            eq(legalAcceptancesTable.version, doc.version),
          ),
        )
        .limit(1);
      if (existing) continue;
      await db.insert(legalAcceptancesTable).values({
        userId,
        documentId: doc.id,
        version: doc.version,
        ip,
        userAgent: ua,
      });
      accepted += 1;
    }
    res.json({ ok: true, accepted });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Onay kaydedilemedi" });
  }
});

/** DELETE /api/account — hesap silme (soft delete + oturum kapat) */
router.delete("/account", requireAuth, async (req, res) => {
  try {
    await ensureUserMembershipColumns();
    await ensureOrgLegalCampaignSchema();
    const userId = req.user!.id;
    const confirm = String(req.body?.confirm ?? "");
    if (confirm !== "DELETE" && confirm !== "SİL") {
      res.status(400).json({ error: "Onay için confirm: DELETE gerekli" });
      return;
    }

    await db
      .update(usersTable)
      .set({
        deletedAt: new Date(),
        email: `deleted+${userId}@inner.invalid`,
        name: "Silinmiş üye",
        avatarUrl: null,
        handle: null,
        passwordHash: null,
        googleId: null,
        phone: null,
        bio: null,
        linkedin: null,
        github: null,
        website: null,
        twitter: null,
        behance: null,
        instagram: null,
        university: null,
        skills: "[]",
        profileLinks: "[]",
      })
      .where(eq(usersTable.id, userId));

    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (sessionId) await destroySession(sessionId);
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Hesap silinemedi" });
  }
});

export default router;
