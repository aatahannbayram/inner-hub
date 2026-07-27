import { and, eq, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  legalAcceptancesTable,
  legalDocumentsTable,
  orgMembershipsTable,
  organizationsTable,
  usersTable,
} from "@workspace/db/schema";
import { ensureOrgLegalCampaignSchema, ensureUserMembershipColumns } from "./ensureSchema";

const AVATAR_STYLES = ["lorelei", "shapes", "notionists", "avataaars", "bottts"] as const;
export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export function isAvatarStyle(v: unknown): v is AvatarStyle {
  return typeof v === "string" && (AVATAR_STYLES as readonly string[]).includes(v);
}

/** Deterministik DiceBear URL (CDN). */
export function dicebearAvatarUrl(seed: string, style: string = "lorelei"): string {
  const safe = (seed || "inner").trim() || "inner";
  const st = isAvatarStyle(style) ? style : "lorelei";
  return `https://api.dicebear.com/9.x/${st}/svg?seed=${encodeURIComponent(safe)}&backgroundType=gradientLinear`;
}

export function resolveAvatarUrl(user: {
  avatarUrl?: string | null;
  avatarStyle?: string | null;
  handle?: string | null;
  email?: string | null;
  name?: string | null;
  id?: number;
}): string {
  if (user.avatarUrl && user.avatarUrl.trim()) return user.avatarUrl.trim();
  const seed = user.handle || user.email || user.name || `u${user.id ?? 0}`;
  return dicebearAvatarUrl(seed, user.avatarStyle ?? "lorelei");
}

export function slugifyOrg(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "org";
}

export async function getPrimaryOrgForUser(userId: number) {
  await ensureOrgLegalCampaignSchema();
  await ensureUserMembershipColumns();
  const [user] = await db
    .select({ primaryOrgId: usersTable.primaryOrgId })
    .from(usersTable)
    .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)))
    .limit(1);
  if (!user?.primaryOrgId) {
    const [mem] = await db
      .select({ orgId: orgMembershipsTable.orgId })
      .from(orgMembershipsTable)
      .where(eq(orgMembershipsTable.userId, userId))
      .limit(1);
    if (!mem) return null;
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, mem.orgId))
      .limit(1);
    return org ?? null;
  }
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, user.primaryOrgId))
    .limit(1);
  return org ?? null;
}

const LEGAL_SEED = [
  {
    slug: "terms",
    version: "2026-07-1",
    locale: "tr",
    title: "Kullanım Koşulları",
    bodyMarkdown: `# Kullanım Koşulları

inner·hub davetli bir üyelik platformudur. Hesabınızı yalnızca size verilen davet ile kullanabilirsiniz.

## Hesap
- Bilgilerinizin doğruluğundan siz sorumlusunuz.
- Hesabınızı başkalarıyla paylaşamazsınız.

## İçerik
- Üye içerikleri topluluk kurallarına uygun olmalıdır.
- Telif ihlali yasaktır.

## Ödemeler
- Üyelik ve Circle Pass satın alımları Stripe üzerinden işlenir.
- İade politikası support@inner.digital üzerinden yönetilir.

Bu metin bilgilendirme amaçlı bir şablondur; güncel hukuki metin yönetim tarafından yayınlanır.
`,
  },
  {
    slug: "privacy",
    version: "2026-07-1",
    locale: "tr",
    title: "Gizlilik Politikası",
    bodyMarkdown: `# Gizlilik Politikası

inner·hub, üyelik, eşleşme ve bildirim hizmetleri için gerekli kişisel verileri işler.

- İletişim: e-posta, isteğe bağlı telefon / WhatsApp
- Profil: ad, unvan, şirket, sosyal bağlantılar
- Ödeme: Stripe üzerinden; kart verisi saklanmaz

Haklarınız için support@inner.digital yazabilirsiniz.
`,
  },
  {
    slug: "kvkk",
    version: "2026-07-1",
    locale: "tr",
    title: "KVKK Aydınlatma Metni",
    bodyMarkdown: `# KVKK Aydınlatma Metni

6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu inner·hub'dır.

İşlenen veriler: kimlik, iletişim, işlem güvenliği, üyelik ve işlem bilgileri.
Amaç: üyelik yönetimi, canlı oturumlar, eşleşme, bildirimler, faturalama.

Başvuru: support@inner.digital
`,
  },
  {
    slug: "community",
    version: "2026-07-1",
    locale: "tr",
    title: "Topluluk Kuralları",
    bodyMarkdown: `# Topluluk Kuralları

- Saygı ve güven esastır.
- Spam, nefret söylemi ve izinsiz satış yasaktır.
- Gizli deal / pitch bilgilerini dışarı sızdırmayın.
- İhlalde hesap askıya alınabilir.
`,
  },
];

export async function ensureLegalDocumentsSeeded() {
  await ensureOrgLegalCampaignSchema();
  for (const doc of LEGAL_SEED) {
    const [existing] = await db
      .select({ id: legalDocumentsTable.id })
      .from(legalDocumentsTable)
      .where(
        and(
          eq(legalDocumentsTable.slug, doc.slug),
          eq(legalDocumentsTable.version, doc.version),
          eq(legalDocumentsTable.locale, doc.locale),
        ),
      )
      .limit(1);
    if (!existing) {
      await db.insert(legalDocumentsTable).values(doc);
    }
  }
}

export async function userHasAcceptedLatestLegal(userId: number, locale = "tr") {
  await ensureLegalDocumentsSeeded();
  const docs = await db
    .select()
    .from(legalDocumentsTable)
    .where(eq(legalDocumentsTable.locale, locale));
  // her slug için en son version (seed tek version)
  const bySlug = new Map<string, (typeof docs)[0]>();
  for (const d of docs) {
    const prev = bySlug.get(d.slug);
    if (!prev || d.publishedAt > prev.publishedAt) bySlug.set(d.slug, d);
  }
  for (const doc of bySlug.values()) {
    const [acc] = await db
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
    if (!acc) return { ok: false as const, missing: doc };
  }
  return { ok: true as const };
}
