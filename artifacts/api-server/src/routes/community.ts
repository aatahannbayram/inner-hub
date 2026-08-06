import { Router } from "express";
import { asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { perksTable, usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { resolveAvatarUrl } from "../lib/identity";
import { ensureUserMembershipColumns, ensureKnownMemberProfileFixes, once } from "../lib/ensureSchema";
import { isDirectoryMember } from "../lib/directoryMembers";
import { isDecorativeLabel } from "../lib/displayLabel";

const router = Router();

/** Eski DB'lerde eksik perk kolonlarını ekle (idempotent). */
const ensurePerkColumns = once(async () => {
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS category text`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS badge text`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS code text`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS how_to text`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS expires_at timestamp`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS source text DEFAULT 'partner'`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS org_id integer`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS campaign_id integer`);
});

/** Boş katalogda üyelik değeri görünsün diye seed (prod dahil, yalnızca count=0). */
async function ensurePerksSeed() {
  const [row] = await db.select({ id: perksTable.id }).from(perksTable).limit(1);
  if (row) return;

  await db.insert(perksTable).values([
    {
      brand: "Monolite",
      title: "Monolite İlk Ay Ücretsiz!",
      description:
        "Sunumlarınızı, etkinliklerinizi ve eğitimlerinizi Monolite ile profesyonel biçimde yönetin.",
      howTo:
        "Kodu kopyalayıp Monolite kayıt ekranında “Promo / Invite” alanına yapıştırın. İlk faturalandırma döneminde ücret alınmaz.",
      category: "Yazılım",
      badge: "1 Ay Ücretsiz",
      code: "INNER-MONOLITE",
      ctaUrl: "https://monolite.io",
      featured: true,
      order: 1,
      expiresAt: new Date("2026-12-31"),
      isActive: true,
    },
    {
      brand: "iyigo",
      title: "İyigo 2 Ay Ücretsiz",
      description:
        "Enocta'nın yeni iştiraki olan iyigo ile kurumsal öğrenme deneyimini keşfedin.",
      howTo: "Partner sayfasından “inner·hub” seçeneğini işaretleyin; aktivasyon 24 saat içinde e-postanıza gelir.",
      category: "Eğitim",
      badge: "2 Ay Ücretsiz",
      code: "INNER-IYIGO",
      ctaUrl: "https://iyigo.com",
      order: 2,
      isActive: true,
    },
    {
      brand: "Salary Insights",
      title: "Kurumsal Maaş Raporu %15 İndirimli",
      description: "10.000'den fazla pozisyon verisi ile sektör karşılaştırması.",
      howTo: "Checkout’ta davet kodunu girin. Rapor PDF olarak anında indirilir.",
      category: "Finans",
      badge: "%15 İndirim",
      code: "INNER15",
      ctaUrl: "https://salaryinsights.com",
      order: 3,
      isActive: true,
    },
    {
      brand: "Dermolisa",
      title: "Kozmetik Ürünlerinde %30 İndirim",
      description: "Seçili dünya markalarında üyeye özel indirim.",
      howTo: "Sepette kodu uygulayın. Kampanya stokla sınırlıdır.",
      category: "Yaşam",
      badge: "%30 İndirim",
      code: "INNER30",
      ctaUrl: "https://dermolisa.com",
      order: 4,
      isActive: true,
    },
    {
      brand: "Notion",
      title: "Notion Plus 6 Ay Ücretsiz",
      description: "Startup planına dahil tüm özellikler, 6 ay ücretsiz.",
      howTo: "Notion Startup formunda inner·hub e-postanızla başvurun.",
      category: "Yazılım",
      badge: "6 Ay Ücretsiz",
      code: null,
      ctaUrl: "https://www.notion.so",
      featured: true,
      order: 5,
      isActive: true,
    },
    {
      brand: "AWS",
      title: "AWS Activate — $1.000 Kredi",
      description: "Seçili startuplara özel $1.000 kredi ve teknik destek.",
      howTo: "Org ID’nizi panel üzerinden iletin; Activate kodu 3–5 iş gününde gelir.",
      category: "Yazılım",
      badge: "$1.000 Kredi",
      code: null,
      ctaUrl: "https://aws.amazon.com/activate",
      order: 6,
      isActive: true,
    },
    {
      brand: "Wise Business",
      title: "Wise Business İlk Yıl Ücretsiz",
      description: "Uluslararası para transferi; ilk yıl kart ücreti yok.",
      howTo: "Wise Business kayıt linkinden ilerleyin; referans alanına kodu yazın.",
      category: "Finans",
      badge: "1 Yıl Ücretsiz",
      code: "INNERWISE",
      ctaUrl: "https://wise.com/business",
      order: 7,
      isActive: true,
    },
    {
      brand: "Maven",
      title: "Maven Cohort Kurslarında %20 İndirim",
      description: "Canlı cohort kurslarında üyeye özel indirim.",
      howTo: "Kurs checkout sayfasında kodu girin. Tek seferlik kullanım.",
      category: "Eğitim",
      badge: "%20 İndirim",
      code: "INNERMAVEN",
      ctaUrl: "https://maven.com",
      order: 8,
      isActive: true,
    },
  ]);
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toLocaleUpperCase("tr-TR");
}

// ─── GET /api/perks ───────────────────────────────────────────────────────────
router.get("/perks", requireAuth, async (_req, res) => {
  try {
    await ensurePerkColumns();
    await ensurePerksSeed();

    const rows = await db
      .select()
      .from(perksTable)
      .where(eq(perksTable.isActive, true))
      .orderBy(asc(perksTable.order), asc(perksTable.id));

    res.json({
      perks: rows.map((p) => ({
        id: p.id,
        brand: p.brand,
        title: p.title,
        description: p.description ?? "",
        howTo: p.howTo ?? "Partner sitesinde inner·hub üyeliğinizi belirtin.",
        category: p.category ?? "Yazılım",
        logoUrl: p.logoUrl,
        badge: p.badge ?? p.brand,
        code: p.code,
        partnerUrl: p.ctaUrl,
        featured: p.featured,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString().slice(0, 10) : undefined,
        source: (p as { source?: string }).source === "campaign" ? "campaign" : "partner",
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ayrıcalıklar yüklenemedi" });
  }
});

// ─── GET /api/members ─────────────────────────────────────────────────────────
router.get("/members", requireAuth, async (_req, res) => {
  try {
    await ensureUserMembershipColumns();
    await ensureKnownMemberProfileFixes();
    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        title: usersTable.title,
        company: usersTable.company,
        bio: usersTable.bio,
        linkedin: usersTable.linkedin,
        avatarUrl: usersTable.avatarUrl,
        avatarStyle: usersTable.avatarStyle,
        handle: usersTable.handle,
        email: usersTable.email,
        persona: usersTable.persona,
        role: usersTable.role,
        linkedinId: usersTable.linkedinId,
        skills: usersTable.skills,
      })
      .from(usersTable)
      .where(isNull(usersTable.deletedAt))
      .orderBy(asc(usersTable.name));

    const listed = rows.filter((u) =>
      isDirectoryMember({
        email: u.email,
        name: u.name,
        bio: u.bio,
        company: u.company,
        title: u.title,
        linkedin: u.linkedin,
        linkedinId: u.linkedinId,
        avatarUrl: u.avatarUrl,
        persona: u.persona,
      }),
    );

    res.json({
      members: listed.map((u) => {
        const title = isDecorativeLabel(u.title) ? null : u.title?.trim() || null;
        const company = u.company?.trim() || null;
        let skills: string[] = [];
        if (u.skills) {
          try {
            const parsed = JSON.parse(u.skills);
            if (Array.isArray(parsed)) {
              skills = parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
            }
          } catch {
            skills = u.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }
        const tags = [...skills, u.persona]
          .filter((t): t is string => Boolean(t && String(t).trim()))
          .map((t) => String(t).trim())
          .filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)
          .slice(0, 6);

        return {
          id: u.id,
          name: u.name,
          initials: initialsFromName(u.name),
          title: title ?? (u.role === "admin" ? "Admin" : ""),
          company: company ?? "",
          bio: u.bio ?? "",
          tags,
          linkedin: u.linkedin,
          linkedinConnected: Boolean(u.linkedinId),
          avatarUrl: resolveAvatarUrl(u),
          persona: u.persona,
          isAvailable: false,
        };
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Üyeler yüklenemedi" });
  }
});

export default router;
