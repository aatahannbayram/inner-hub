import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { capitalDealsTable, capitalSpvsTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureVaultCapitalSchema } from "../lib/ensureSchema";

const router = Router();

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
      deals: deals.map((d) => ({
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
      })),
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

export default router;
