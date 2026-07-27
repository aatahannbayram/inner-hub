import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  orgMembershipsTable,
  organizationsTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureOrgLegalCampaignSchema, ensureUserMembershipColumns } from "../lib/ensureSchema";
import { slugifyOrg } from "../lib/identity";

const router = Router();

function mapOrg(o: typeof organizationsTable.$inferSelect) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    domain: o.domain,
    logoUrl: o.logoUrl,
    type: o.type,
    verified: o.verified,
    createdAt: o.createdAt.toISOString(),
  };
}

/** GET /api/orgs/mine */
router.get("/orgs/mine", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const rows = await db
      .select({
        membership: orgMembershipsTable,
        org: organizationsTable,
      })
      .from(orgMembershipsTable)
      .innerJoin(organizationsTable, eq(organizationsTable.id, orgMembershipsTable.orgId))
      .where(eq(orgMembershipsTable.userId, userId));

    const [me] = await db
      .select({ primaryOrgId: usersTable.primaryOrgId })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.json({
      primaryOrgId: me?.primaryOrgId ?? null,
      orgs: rows.map((r) => ({
        ...mapOrg(r.org),
        membershipRole: r.membership.role,
        membershipTitle: r.membership.title,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Organizasyonlar yüklenemedi" });
  }
});

/** POST /api/orgs — şirket oluştur */
router.post("/orgs", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const { name, domain, logoUrl, type } = req.body ?? {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Şirket adı gerekli" });
      return;
    }
    let slug = slugifyOrg(name.trim());
    const [taken] = await db
      .select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, slug))
      .limit(1);
    if (taken) slug = `${slug}-${userId}`;

    const orgType =
      type === "company" || type === "fund" || type === "studio" || type === "startup"
        ? type
        : "startup";

    const [org] = await db
      .insert(organizationsTable)
      .values({
        name: name.trim().slice(0, 80),
        slug,
        domain: typeof domain === "string" ? domain.trim().slice(0, 120) || null : null,
        logoUrl: typeof logoUrl === "string" ? logoUrl.trim().slice(0, 500) || null : null,
        type: orgType,
        createdByUserId: userId,
      })
      .returning();

    await db.insert(orgMembershipsTable).values({
      orgId: org!.id,
      userId,
      role: "owner",
    });
    await db
      .update(usersTable)
      .set({ primaryOrgId: org!.id, company: org!.name })
      .where(eq(usersTable.id, userId));

    res.status(201).json({ org: mapOrg(org!) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Organizasyon oluşturulamadı" });
  }
});

/** PATCH /api/orgs/:id */
router.patch("/orgs/:id", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const orgId = Number(req.params.id);
    const userId = req.user!.id;
    if (!Number.isFinite(orgId)) {
      res.status(400).json({ error: "Geçersiz org" });
      return;
    }
    const [mem] = await db
      .select()
      .from(orgMembershipsTable)
      .where(
        and(
          eq(orgMembershipsTable.orgId, orgId),
          eq(orgMembershipsTable.userId, userId),
        ),
      )
      .limit(1);
    if (!mem || (mem.role !== "owner" && mem.role !== "admin")) {
      res.status(403).json({ error: "Yetki yok" });
      return;
    }
    const { name, domain, logoUrl, type } = req.body ?? {};
    const patch: Partial<typeof organizationsTable.$inferInsert> = {};
    if (typeof name === "string" && name.trim()) patch.name = name.trim().slice(0, 80);
    if (domain !== undefined) patch.domain = typeof domain === "string" ? domain.trim() || null : null;
    if (logoUrl !== undefined)
      patch.logoUrl = typeof logoUrl === "string" ? logoUrl.trim() || null : null;
    if (type === "company" || type === "fund" || type === "studio" || type === "startup") {
      patch.type = type;
    }
    const [org] = await db
      .update(organizationsTable)
      .set(patch)
      .where(eq(organizationsTable.id, orgId))
      .returning();
    res.json({ org: org ? mapOrg(org) : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Güncellenemedi" });
  }
});

/** POST /api/orgs/:id/join — slug veya id ile katıl (MVP: açık join) */
router.post("/orgs/:id/join", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const raw = String(req.params.id);
    const asId = Number(raw);
    const [org] = Number.isFinite(asId)
      ? await db.select().from(organizationsTable).where(eq(organizationsTable.id, asId)).limit(1)
      : await db.select().from(organizationsTable).where(eq(organizationsTable.slug, raw)).limit(1);
    if (!org) {
      res.status(404).json({ error: "Organizasyon bulunamadı" });
      return;
    }
    const [existing] = await db
      .select()
      .from(orgMembershipsTable)
      .where(and(eq(orgMembershipsTable.orgId, org.id), eq(orgMembershipsTable.userId, userId)))
      .limit(1);
    if (!existing) {
      await db.insert(orgMembershipsTable).values({
        orgId: org.id,
        userId,
        role: "member",
        title: typeof req.body?.title === "string" ? req.body.title.slice(0, 80) : null,
      });
    }
    await db
      .update(usersTable)
      .set({ primaryOrgId: org.id, company: org.name })
      .where(eq(usersTable.id, userId));
    res.json({ org: mapOrg(org), joined: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Katılım başarısız" });
  }
});

/** GET /api/orgs/:id/members */
router.get("/orgs/:id/members", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const orgId = Number(req.params.id);
    if (!Number.isFinite(orgId)) {
      res.status(400).json({ error: "Geçersiz org" });
      return;
    }
    const rows = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        handle: usersTable.handle,
        title: usersTable.title,
        avatarUrl: usersTable.avatarUrl,
        avatarStyle: usersTable.avatarStyle,
        email: usersTable.email,
        membershipRole: orgMembershipsTable.role,
        membershipTitle: orgMembershipsTable.title,
      })
      .from(orgMembershipsTable)
      .innerJoin(usersTable, eq(usersTable.id, orgMembershipsTable.userId))
      .where(eq(orgMembershipsTable.orgId, orgId));

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1);

    res.json({
      org: org ? mapOrg(org) : null,
      members: rows.map((r) => ({
        id: r.userId,
        name: r.name,
        handle: r.handle,
        title: r.membershipTitle || r.title,
        membershipRole: r.membershipRole,
        avatarUrl: r.avatarUrl,
        avatarStyle: r.avatarStyle,
        seed: r.handle || r.email,
      })),
      count: rows.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Üyeler yüklenemedi" });
  }
});

/** GET /api/orgs/search?q= */
router.get("/orgs/search", requireAuth, async (req, res) => {
  try {
    await ensureOrgLegalCampaignSchema();
    const q = String(req.query.q ?? "").trim().toLowerCase();
    if (q.length < 2) {
      res.json({ orgs: [] });
      return;
    }
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(sql`lower(${organizationsTable.name}) like ${`%${q}%`}`)
      .limit(20);
    res.json({ orgs: rows.map(mapOrg) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Arama başarısız" });
  }
});

export default router;
