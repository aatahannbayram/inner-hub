import { Router } from "express";
import { and, asc, desc, eq, ilike, isNull, or } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@workspace/db";
import {
  coursesTable,
  eventsTable,
  faqTable,
  organizationsTable,
  perksTable,
  stageProductsTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import {
  ensureLiveSessionColumns,
  ensureOrgLegalCampaignSchema,
  ensureStageSchema,
  ensureUserMembershipColumns,
} from "../lib/ensureSchema";
import { isDirectoryMember } from "../lib/directoryMembers";

const router = Router();

export type SearchHit = {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
};

const NAV_SHORTCUTS: SearchHit[] = [
  { id: "nav-dash", kind: "page", title: "Dashboard", subtitle: "Ana panel", href: "/panel", score: 0 },
  { id: "nav-chat", kind: "page", title: "Topluluk / Chat", subtitle: "Sohbet", href: "/panel/chat", score: 0 },
  { id: "nav-courses", kind: "page", title: "Kurslar", subtitle: "VOD ve canlı", href: "/panel/courses", score: 0 },
  { id: "nav-events", kind: "page", title: "Etkinlikler", subtitle: "Gathering & online", href: "/panel/events", score: 0 },
  { id: "nav-members", kind: "page", title: "Üyeler", subtitle: "Çember", href: "/panel/members", score: 0 },
  { id: "nav-perks", kind: "page", title: "Ayrıcalıklar", subtitle: "Perks & kampanyalar", href: "/panel/perks", score: 0 },
  { id: "nav-stage", kind: "page", title: "Stage", subtitle: "Ürün oylama", href: "/panel/stage", score: 0 },
  { id: "nav-org", kind: "page", title: "Organizasyon", subtitle: "Şirket odası", href: "/panel/org", score: 0 },
  { id: "nav-match", kind: "page", title: "Match", subtitle: "Eşleşme", href: "/panel/match", score: 0 },
  { id: "nav-capital", kind: "page", title: "Capital", subtitle: "Deal flow", href: "/panel/capital", score: 0 },
  { id: "nav-signal", kind: "page", title: "Signal", subtitle: "Haftalık sinyal", href: "/panel/signal", score: 0 },
  { id: "nav-vault", kind: "page", title: "Vault", subtitle: "Belgeler", href: "/panel/vault", score: 0 },
  { id: "nav-membership", kind: "page", title: "Üyelik / Circle Pass", subtitle: "Ödeme", href: "/panel/membership", score: 0 },
  { id: "nav-profile", kind: "page", title: "Profil", subtitle: "Hesabın", href: "/panel/profile", score: 0 },
  { id: "nav-settings", kind: "page", title: "Ayarlar", subtitle: "Tercihler", href: "/panel/settings", score: 0 },
  { id: "nav-id", kind: "page", title: "inner·id", subtitle: "Kimlik kartı", href: "/panel/id", score: 0 },
  { id: "nav-faq", kind: "page", title: "SSS", subtitle: "Yardım", href: "/panel/faq", score: 0 },
];

function norm(q: string) {
  return q.trim().toLowerCase();
}

function scoreText(q: string, ...fields: (string | null | undefined)[]): number {
  const nq = norm(q);
  if (!nq) return 0;
  let best = 0;
  for (const f of fields) {
    if (!f) continue;
    const t = f.toLowerCase();
    if (t === nq) best = Math.max(best, 100);
    else if (t.startsWith(nq)) best = Math.max(best, 80);
    else if (t.includes(nq)) best = Math.max(best, 55);
    else {
      const parts = nq.split(/\s+/).filter(Boolean);
      const hit = parts.filter((p) => t.includes(p)).length;
      if (hit) best = Math.max(best, 30 + hit * 10);
    }
  }
  return best;
}

function like(q: string) {
  return `%${q.replace(/[%_]/g, "")}%`;
}

async function gatherHits(q: string, locale: "tr" | "en"): Promise<SearchHit[]> {
  await Promise.all([
    ensureUserMembershipColumns(),
    ensureLiveSessionColumns(),
    ensureStageSchema(),
    ensureOrgLegalCampaignSchema(),
  ]);

  const pattern = like(q);
  const hits: SearchHit[] = [];

  for (const nav of NAV_SHORTCUTS) {
    const s = scoreText(
      q,
      nav.title,
      nav.subtitle,
      nav.href,
      locale === "en" ? nav.title : undefined,
    );
    if (s > 0) hits.push({ ...nav, score: s + 5 });
  }

  const members = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      title: usersTable.title,
      company: usersTable.company,
      handle: usersTable.handle,
      skills: usersTable.skills,
      persona: usersTable.persona,
      avatarUrl: usersTable.avatarUrl,
      avatarStyle: usersTable.avatarStyle,
      email: usersTable.email,
      bio: usersTable.bio,
      linkedin: usersTable.linkedin,
      linkedinId: usersTable.linkedinId,
    })
    .from(usersTable)
    .where(
      and(
        isNull(usersTable.deletedAt),
        or(
          ilike(usersTable.name, pattern),
          ilike(usersTable.company, pattern),
          ilike(usersTable.title, pattern),
          ilike(usersTable.handle, pattern),
          ilike(usersTable.skills, pattern),
          ilike(usersTable.persona, pattern),
        ),
      ),
    )
    .limit(24);

  for (const m of members) {
    if (!isDirectoryMember(m)) continue;
    const s = scoreText(q, m.name, m.company, m.title, m.handle, m.persona, m.skills);
    hits.push({
      id: `member-${m.id}`,
      kind: "member",
      title: m.name,
      subtitle: [m.title, m.company].filter(Boolean).join(" · ") || undefined,
      href: `/panel/members`,
      score: s,
    });
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.isPublished, true),
        or(ilike(coursesTable.title, pattern), ilike(coursesTable.description, pattern), ilike(coursesTable.category, pattern)),
      ),
    )
    .orderBy(asc(coursesTable.order))
    .limit(10);

  for (const c of courses) {
    hits.push({
      id: `course-${c.id}`,
      kind: "course",
      title: c.title,
      subtitle: [c.format, c.category].filter(Boolean).join(" · "),
      href: `/panel/courses`,
      score: scoreText(q, c.title, c.description, c.category, c.format),
    });
  }

  const events = await db
    .select()
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.isPublished, true),
        or(ilike(eventsTable.title, pattern), ilike(eventsTable.description, pattern), ilike(eventsTable.location, pattern)),
      ),
    )
    .orderBy(desc(eventsTable.startAt))
    .limit(10);

  for (const e of events) {
    hits.push({
      id: `event-${e.id}`,
      kind: "event",
      title: e.title,
      subtitle: e.location || e.format || undefined,
      href: `/panel/events`,
      score: scoreText(q, e.title, e.description, e.location, e.format),
    });
  }

  const perks = await db
    .select()
    .from(perksTable)
    .where(
      and(
        eq(perksTable.isActive, true),
        or(
          ilike(perksTable.brand, pattern),
          ilike(perksTable.title, pattern),
          ilike(perksTable.description, pattern),
          ilike(perksTable.category, pattern),
        ),
      ),
    )
    .limit(10);

  for (const p of perks) {
    hits.push({
      id: `perk-${p.id}`,
      kind: "perk",
      title: `${p.brand} · ${p.title}`,
      subtitle: p.category || p.badge || undefined,
      href: `/panel/perks`,
      score: scoreText(q, p.brand, p.title, p.description, p.category),
    });
  }

  try {
    const products = await db
      .select()
      .from(stageProductsTable)
      .where(
        and(
          eq(stageProductsTable.status, "published"),
          or(ilike(stageProductsTable.title, pattern), ilike(stageProductsTable.pitch, pattern)),
        ),
      )
      .limit(8);
    for (const p of products) {
      hits.push({
        id: `stage-${p.id}`,
        kind: "stage",
        title: p.title,
        subtitle: p.pitch.slice(0, 80),
        href: `/panel/stage`,
        score: scoreText(q, p.title, p.pitch),
      });
    }
  } catch {
    /* stage tablo yoksa */
  }

  try {
    const orgs = await db
      .select()
      .from(organizationsTable)
      .where(or(ilike(organizationsTable.name, pattern), ilike(organizationsTable.slug, pattern), ilike(organizationsTable.domain, pattern)))
      .limit(8);
    for (const o of orgs) {
      hits.push({
        id: `org-${o.id}`,
        kind: "org",
        title: o.name,
        subtitle: o.type,
        href: `/panel/org`,
        score: scoreText(q, o.name, o.slug, o.domain, o.type),
      });
    }
  } catch {
    /* */
  }

  try {
    const faqs = await db
      .select()
      .from(faqTable)
      .where(or(ilike(faqTable.question, pattern), ilike(faqTable.answer, pattern), ilike(faqTable.category, pattern)))
      .limit(8);
    for (const f of faqs) {
      hits.push({
        id: `faq-${f.id}`,
        kind: "faq",
        title: f.question,
        subtitle: f.category,
        href: `/panel/faq`,
        score: scoreText(q, f.question, f.answer, f.category),
      });
    }
  } catch {
    /* */
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.filter((h) => h.score > 0).slice(0, 40);
}

/** GET /api/search?q= */
router.get("/search", requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const locale = req.query.locale === "en" ? "en" : "tr";
    if (q.length < 1) {
      res.json({
        query: q,
        results: NAV_SHORTCUTS.slice(0, 8).map((n) => ({ ...n, score: 1 })),
        ai: null,
      });
      return;
    }
    if (q.length > 120) {
      res.status(400).json({ error: "Sorgu çok uzun" });
      return;
    }
    const results = await gatherHits(q, locale);
    res.json({ query: q, results, ai: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Arama başarısız" });
  }
});

/** POST /api/search/ai — yapılandırılmış sonuç + AI sıralama / niyet */
router.post("/search/ai", requireAuth, async (req, res) => {
  try {
    const q = String(req.body?.q ?? "").trim();
    const locale = req.body?.locale === "en" ? "en" : "tr";
    if (q.length < 2) {
      res.status(400).json({ error: "Sorgu gerekli" });
      return;
    }
    const results = await gatherHits(q, locale);

    const fallbackAi = {
      intent: locale === "en" ? "general search" : "genel arama",
      summary:
        locale === "en"
          ? `Found ${results.length} matches across the circle.`
          : `Çemberde ${results.length} sonuç bulundu.`,
      suggestions: results.slice(0, 5).map((r) => ({
        title: r.title,
        href: r.href,
        reason: r.subtitle || r.kind,
      })),
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      res.json({ query: q, results, ai: fallbackAi });
      return;
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const compact = results.slice(0, 20).map((r) => ({
      kind: r.kind,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
    }));

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `inner·hub panel arama asistanısın. Kullanıcı sorgusu: "${q}"
Dil: ${locale}
Aday sonuçlar: ${JSON.stringify(compact)}

Yalnızca JSON:
{
  "intent": "kısa niyet",
  "summary": "1-2 cümle yönlendirme",
  "suggestions": [{"title":"...","href":"/panel/...","reason":"..."}]
}
En fazla 5 suggestion; href'ler adaylardan gelsin. ${locale === "en" ? "English" : "Türkçe"} yaz.`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    let ai = fallbackAi;
    if (jsonMatch) {
      try {
        ai = { ...fallbackAi, ...JSON.parse(jsonMatch[0]) };
      } catch {
        /* keep fallback */
      }
    }

    // AI önerilen href'leri üste taşı
    const preferred = new Set((ai.suggestions ?? []).map((s: { href?: string }) => s.href));
    results.sort((a, b) => {
      const ap = preferred.has(a.href) ? 1 : 0;
      const bp = preferred.has(b.href) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.score - a.score;
    });

    res.json({ query: q, results, ai });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI arama başarısız" });
  }
});

export default router;
