import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { capitalDealsTable, capitalSpvsTable } from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ensureVaultCapitalSchema } from "../lib/ensureSchema";

const router = Router();

const STAGES = new Set(["Pitch", "Due Diligence", "Term Sheet", "Kapandı"]);
const SECTORS = new Set(["AI/ML", "B2B SaaS", "Fintech", "HR Tech", "E-ticaret", "DeepTech"]);

function parseList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === "string");
  } catch {
    /* fallthrough */
  }
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

function daysAgo(d: Date): number {
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

function mapDeal(d: typeof capitalDealsTable.$inferSelect) {
  return {
    id: d.id,
    company: d.company,
    tagline: d.tagline ?? "",
    stage: d.stage,
    sector: d.sector,
    raise: d.raise ?? "",
    valuation: d.valuation ?? "",
    founders: parseList(d.founders),
    leadInvestor: d.leadInvestor ?? undefined,
    round: d.round ?? "",
    score: d.score,
    tags: parseList(d.tags),
    updatedDays: daysAgo(d.updatedAt),
    spv: d.hasSpv,
  };
}

function normalizeDealBody(body: any) {
  const company = typeof body?.company === "string" ? body.company.trim().slice(0, 120) : "";
  const tagline = typeof body?.tagline === "string" ? body.tagline.trim().slice(0, 240) : "";
  const stage = typeof body?.stage === "string" && STAGES.has(body.stage) ? body.stage : "Pitch";
  const sector = typeof body?.sector === "string" && SECTORS.has(body.sector) ? body.sector : "B2B SaaS";
  const raise = typeof body?.raise === "string" ? body.raise.trim().slice(0, 40) : "";
  const valuation = typeof body?.valuation === "string" ? body.valuation.trim().slice(0, 40) : "";
  const round = typeof body?.round === "string" ? body.round.trim().slice(0, 40) : "";
  const leadInvestor =
    typeof body?.leadInvestor === "string" ? body.leadInvestor.trim().slice(0, 120) : "";
  const founders = Array.isArray(body?.founders)
    ? body.founders
        .filter((f: unknown) => typeof f === "string")
        .map((f: string) => f.trim())
        .filter(Boolean)
        .slice(0, 8)
    : typeof body?.founders === "string"
      ? body.founders
          .split(",")
          .map((f: string) => f.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t: unknown) => typeof t === "string").slice(0, 12)
    : typeof body?.tags === "string"
      ? body.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
          .slice(0, 12)
      : [];
  const scoreRaw = Number(body?.score);
  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : 50;
  const hasSpv = Boolean(body?.spv ?? body?.hasSpv);

  return {
    company,
    tagline: tagline || null,
    stage,
    sector,
    raise: raise || null,
    valuation: valuation || null,
    round: round || null,
    leadInvestor: leadInvestor || null,
    founders: JSON.stringify(founders),
    tags: JSON.stringify(tags),
    score,
    hasSpv,
  };
}

async function ensureCapitalSeed() {
  const [deal] = await db.select({ id: capitalDealsTable.id }).from(capitalDealsTable).limit(1);
  if (!deal) {
    await db.insert(capitalDealsTable).values([
      {
        company: "Hipo",
        tagline: "B2B SaaS işe alım platformu",
        stage: "Term Sheet",
        sector: "B2B SaaS",
        raise: "$500K",
        valuation: "$3.2M",
        founders: JSON.stringify(["Zeynep Arslan", "Mert Demir"]),
        leadInvestor: "Berk Yılmaz",
        round: "Pre-seed",
        score: 91,
        tags: JSON.stringify(["revenue", "10+ müşteri"]),
        hasSpv: true,
      },
      {
        company: "Dopigo",
        tagline: "DevOps otomasyon altyapısı",
        stage: "Due Diligence",
        sector: "DeepTech",
        raise: "$1.2M",
        valuation: "$6M",
        founders: JSON.stringify(["Selin Çelik"]),
        round: "Seed",
        score: 84,
        tags: JSON.stringify(["teknik", "açık kaynak"]),
      },
      {
        company: "Pazarama AI",
        tagline: "E-ticaret için AI büyüme motoru",
        stage: "Pitch",
        sector: "AI/ML",
        raise: "$300K",
        valuation: "$1.8M",
        founders: JSON.stringify(["Ozan Kırmızı"]),
        round: "Pre-seed",
        score: 76,
        tags: JSON.stringify(["traction", "MVP hazır"]),
      },
      {
        company: "PayCore",
        tagline: "KOBİ'ler için gömülü finans altyapısı",
        stage: "Due Diligence",
        sector: "Fintech",
        raise: "$800K",
        valuation: "$4.5M",
        founders: JSON.stringify(["Deniz Alp", "Ayşe Kaya"]),
        round: "Seed",
        score: 88,
        tags: JSON.stringify(["lisanslı", "B2B"]),
      },
      {
        company: "TalentOS",
        tagline: "AI destekli performans yönetim sistemi",
        stage: "Kapandı",
        sector: "HR Tech",
        raise: "$250K",
        valuation: "$1.5M",
        founders: JSON.stringify(["Ayşe Kaya"]),
        leadInvestor: "Berk Yılmaz",
        round: "Pre-seed",
        score: 95,
        tags: JSON.stringify(["kapalı", "inner portföy"]),
        hasSpv: true,
      },
      {
        company: "NeuralRoute",
        tagline: "Lojistik için route optimizasyon AI",
        stage: "Pitch",
        sector: "AI/ML",
        raise: "$600K",
        valuation: "$3M",
        founders: JSON.stringify(["Yeni kurucu"]),
        round: "Seed",
        score: 71,
        tags: JSON.stringify(["erken", "prototip"]),
      },
    ]);
  }

  const [spv] = await db.select({ id: capitalSpvsTable.id }).from(capitalSpvsTable).limit(1);
  if (!spv) {
    await db.insert(capitalSpvsTable).values([
      {
        name: "inner·capital SPV #1 — TalentOS",
        target: "₺750K",
        raised: "₺680K",
        pct: 91,
        participants: 8,
        closing: "15 Tem 2026",
        sector: "HR Tech",
      },
      {
        name: "inner·capital SPV #2 — Hipo",
        target: "₺1.5M",
        raised: "₺420K",
        pct: 28,
        participants: 4,
        closing: "30 Ağu 2026",
        sector: "B2B SaaS",
      },
    ]);
  }
}

// ─── GET /api/capital ────────────────────────────────────────────────────────
router.get("/capital", requireAuth, async (_req, res) => {
  try {
    await ensureVaultCapitalSchema();
    await ensureCapitalSeed();

    const deals = await db.select().from(capitalDealsTable).orderBy(desc(capitalDealsTable.score));
    const spvs = await db.select().from(capitalSpvsTable).orderBy(desc(capitalSpvsTable.pct));

    res.json({
      deals: deals.map(mapDeal),
      spvs: spvs.map((s) => ({
        id: s.id,
        name: s.name,
        target: s.target,
        raised: s.raised,
        pct: s.pct,
        participants: s.participants,
        closing: s.closing ?? "",
        sector: s.sector ?? "",
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Capital yüklenemedi" });
  }
});

// ─── POST /api/capital/deals ─────────────────────────────────────────────────
router.post("/capital/deals", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const data = normalizeDealBody(req.body);
    if (!data.company) {
      res.status(400).json({ error: "Şirket adı zorunlu" });
      return;
    }

    const [inserted] = await db
      .insert(capitalDealsTable)
      .values({ ...data, updatedAt: new Date() })
      .returning();

    res.status(201).json({ deal: mapDeal(inserted) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Deal kaydedilemedi" });
  }
});

// ─── PATCH /api/capital/deals/:id ────────────────────────────────────────────
router.patch("/capital/deals/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [existing] = await db
      .select()
      .from(capitalDealsTable)
      .where(eq(capitalDealsTable.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Deal bulunamadı" });
      return;
    }

    const patch: Partial<typeof capitalDealsTable.$inferInsert> = { updatedAt: new Date() };
    if (typeof req.body?.company === "string" && req.body.company.trim()) {
      patch.company = req.body.company.trim().slice(0, 120);
    }
    if (typeof req.body?.tagline === "string") {
      patch.tagline = req.body.tagline.trim().slice(0, 240) || null;
    }
    if (typeof req.body?.stage === "string" && STAGES.has(req.body.stage)) {
      patch.stage = req.body.stage;
    }
    if (typeof req.body?.sector === "string" && SECTORS.has(req.body.sector)) {
      patch.sector = req.body.sector;
    }
    if (typeof req.body?.raise === "string") patch.raise = req.body.raise.trim().slice(0, 40) || null;
    if (typeof req.body?.valuation === "string") {
      patch.valuation = req.body.valuation.trim().slice(0, 40) || null;
    }
    if (typeof req.body?.round === "string") patch.round = req.body.round.trim().slice(0, 40) || null;
    if (typeof req.body?.leadInvestor === "string") {
      patch.leadInvestor = req.body.leadInvestor.trim().slice(0, 120) || null;
    }
    if (req.body?.founders !== undefined) {
      const founders = Array.isArray(req.body.founders)
        ? req.body.founders.filter((f: unknown) => typeof f === "string")
        : String(req.body.founders)
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
      patch.founders = JSON.stringify(founders.slice(0, 8));
    }
    if (req.body?.tags !== undefined) {
      const tags = Array.isArray(req.body.tags)
        ? req.body.tags.filter((t: unknown) => typeof t === "string")
        : String(req.body.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      patch.tags = JSON.stringify(tags.slice(0, 12));
    }
    if (req.body?.score !== undefined) {
      const scoreRaw = Number(req.body.score);
      if (Number.isFinite(scoreRaw)) patch.score = Math.max(0, Math.min(100, Math.round(scoreRaw)));
    }
    if (req.body?.spv !== undefined || req.body?.hasSpv !== undefined) {
      patch.hasSpv = Boolean(req.body?.spv ?? req.body?.hasSpv);
    }

    const [updated] = await db
      .update(capitalDealsTable)
      .set(patch)
      .where(eq(capitalDealsTable.id, id))
      .returning();

    res.json({ deal: mapDeal(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Deal güncellenemedi" });
  }
});

// ─── DELETE /api/capital/deals/:id ───────────────────────────────────────────
router.delete("/capital/deals/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureVaultCapitalSchema();
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [existing] = await db
      .select({ id: capitalDealsTable.id })
      .from(capitalDealsTable)
      .where(eq(capitalDealsTable.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Deal bulunamadı" });
      return;
    }

    await db.delete(capitalDealsTable).where(eq(capitalDealsTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Deal silinemedi" });
  }
});

export default router;
