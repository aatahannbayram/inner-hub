import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  campaignsTable,
  orgMembershipsTable,
  organizationsTable,
  perksTable,
} from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ensureOrgLegalCampaignSchema } from "../lib/ensureSchema";
import { spendPasses } from "../lib/passes";

const router = Router();

async function requireOrgAdmin(userId: number, orgId: number) {
  const [mem] = await db
    .select()
    .from(orgMembershipsTable)
    .where(and(eq(orgMembershipsTable.orgId, orgId), eq(orgMembershipsTable.userId, userId)))
    .limit(1);
  if (!mem || (mem.role !== "owner" && mem.role !== "admin")) return null;
  return mem;
}

/** GET /api/campaigns/mine */
router.get("/campaigns/mine", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const userId = req.user!.id;
    const mems = await db
      .select({ orgId: orgMembershipsTable.orgId })
      .from(orgMembershipsTable)
      .where(eq(orgMembershipsTable.userId, userId));
    const orgIds = mems.map((m) => m.orgId);
    if (!orgIds.length) {
      res.json({ campaigns: [] });
      return;
    }
    const rows = await db
      .select({
        campaign: campaignsTable,
        orgName: organizationsTable.name,
      })
      .from(campaignsTable)
      .innerJoin(organizationsTable, eq(organizationsTable.id, campaignsTable.orgId))
      .where(eq(campaignsTable.createdByUserId, userId))
      .orderBy(desc(campaignsTable.createdAt));

    res.json({
      campaigns: rows.map((r) => ({
        id: r.campaign.id,
        orgId: r.campaign.orgId,
        orgName: r.orgName,
        title: r.campaign.title,
        pitch: r.campaign.pitch,
        ctaUrl: r.campaign.ctaUrl,
        code: r.campaign.code,
        category: r.campaign.category,
        status: r.campaign.status,
        perkId: r.campaign.perkId,
        startsAt: r.campaign.startsAt?.toISOString() ?? null,
        endsAt: r.campaign.endsAt?.toISOString() ?? null,
        createdAt: r.campaign.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kampanyalar yüklenemedi" });
  }
});

/** POST /api/campaigns — 1 Pass ile yayın (status live → perk) */
router.post("/campaigns", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const userId = req.user!.id;
    const { orgId, title, pitch, ctaUrl, code, category, publish } = req.body ?? {};
    const oid = Number(orgId);
    if (!Number.isFinite(oid)) {
      res.status(400).json({ error: "orgId gerekli" });
      return;
    }
    const mem = await requireOrgAdmin(userId, oid);
    if (!mem) {
      res.status(403).json({ error: "Organizasyon yetkisi yok" });
      return;
    }
    if (!title || !pitch || !ctaUrl) {
      res.status(400).json({ error: "title, pitch, ctaUrl gerekli" });
      return;
    }

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, oid))
      .limit(1);
    if (!org) {
      res.status(404).json({ error: "Org yok" });
      return;
    }

    const shouldPublish = publish === true;
    if (shouldPublish) {
      try {
        await spendPasses({
          userId,
          amount: 1,
          reason: "spend_campaign",
          refType: "campaign_draft",
          refId: `pending-${userId}-${Date.now()}`,
        });
      } catch (e: any) {
        if (String(e.message).includes("Yetersiz")) {
          res.status(402).json({ error: "Yetersiz Circle Pass" });
          return;
        }
        throw e;
      }
    }

    const [campaign] = await db
      .insert(campaignsTable)
      .values({
        orgId: oid,
        createdByUserId: userId,
        title: String(title).trim().slice(0, 120),
        pitch: String(pitch).trim().slice(0, 500),
        ctaUrl: String(ctaUrl).trim().slice(0, 400),
        code: typeof code === "string" ? code.trim().slice(0, 40) || null : null,
        category: typeof category === "string" ? category : "Eğitim",
        status: shouldPublish ? "live" : "draft",
      })
      .returning();

    let perkId: number | null = null;
    if (shouldPublish && campaign) {
      const [perk] = await db
        .insert(perksTable)
        .values({
          brand: org.name,
          title: campaign.title,
          description: campaign.pitch,
          logoUrl: org.logoUrl,
          ctaUrl: campaign.ctaUrl,
          category: campaign.category ?? "Eğitim",
          badge: "inner·only",
          code: campaign.code,
          howTo: "Ekosistem kampanyası · yalnızca inner·hub üyelerine özel.",
          featured: true,
          source: "campaign",
          orgId: org.id,
          campaignId: campaign.id,
          isActive: true,
          order: 0,
        })
        .returning();
      perkId = perk?.id ?? null;
      if (perkId) {
        await db
          .update(campaignsTable)
          .set({ perkId })
          .where(eq(campaignsTable.id, campaign.id));
        // Pass harcamasını gerçek campaign id ile sabitle (önceki ref geçiciydi; ledger zaten yazıldı)
      }
    }

    res.status(201).json({
      campaign: {
        id: campaign!.id,
        status: campaign!.status,
        perkId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kampanya oluşturulamadı" });
  }
});

/** POST /api/admin/campaigns/:id/approve — draft → live */
router.post("/admin/campaigns/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const id = Number(req.params.id);
    const [campaign] = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, id))
      .limit(1);
    if (!campaign) {
      res.status(404).json({ error: "Yok" });
      return;
    }
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, campaign.orgId))
      .limit(1);
    if (!org) {
      res.status(404).json({ error: "Org yok" });
      return;
    }
    let perkId = campaign.perkId;
    if (!perkId) {
      const [perk] = await db
        .insert(perksTable)
        .values({
          brand: org.name,
          title: campaign.title,
          description: campaign.pitch,
          logoUrl: org.logoUrl,
          ctaUrl: campaign.ctaUrl,
          category: campaign.category ?? "Eğitim",
          badge: "inner·only",
          code: campaign.code,
          howTo: "Ekosistem kampanyası · yalnızca inner·hub üyelerine özel.",
          featured: true,
          source: "campaign",
          orgId: org.id,
          campaignId: campaign.id,
          isActive: true,
        })
        .returning();
      perkId = perk?.id ?? null;
    }
    await db
      .update(campaignsTable)
      .set({ status: "live", perkId })
      .where(eq(campaignsTable.id, id));
    res.json({ ok: true, perkId });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Onay başarısız" });
  }
});

export default router;
