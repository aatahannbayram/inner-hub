import { randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import { inviteCodesTable } from "@workspace/db/schema";
import { ensureInviteCodesSchema } from "./ensureSchema";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateInviteCode(): string {
  const bytes = randomBytes(8);
  let raw = "";
  for (let i = 0; i < 8; i++) {
    raw += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** "ab12-cd34" / "ab12cd34" → "AB12-CD34" */
export function normalizeInviteCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return raw.trim().toUpperCase();
}

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

/**
 * Onayda çağrılır: kullanılmamış kod varsa onu döner, yoksa yeni üretir.
 * Email başvuru adresiyle bağlanır.
 */
export async function issueInviteCodeForApproval(input: {
  email: string;
  invitationRequestId: number;
  applicationId?: number | null;
}): Promise<string> {
  await ensureInviteCodesSchema();
  const email = normalizeEmail(input.email);

  const [existing] = await db
    .select()
    .from(inviteCodesTable)
    .where(
      and(
        eq(inviteCodesTable.invitationRequestId, input.invitationRequestId),
        isNull(inviteCodesTable.usedAt),
      ),
    )
    .limit(1);

  if (existing) {
    if (input.applicationId && !existing.applicationId) {
      await db
        .update(inviteCodesTable)
        .set({ applicationId: input.applicationId })
        .where(eq(inviteCodesTable.id, existing.id));
    }
    return existing.code;
  }

  let code = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.insert(inviteCodesTable).values({
        code,
        email,
        invitationRequestId: input.invitationRequestId,
        applicationId: input.applicationId ?? null,
        expiresAt: new Date(Date.now() + DEFAULT_TTL_MS),
      });
      return code;
    } catch {
      code = generateInviteCode();
    }
  }
  throw new Error("Davet kodu üretilemedi");
}

/** Red durumunda henüz kullanılmamış kodları geçersiz kıl. */
export async function revokeUnusedInviteCodes(invitationRequestId: number) {
  await ensureInviteCodesSchema();
  await db
    .update(inviteCodesTable)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(inviteCodesTable.invitationRequestId, invitationRequestId),
        isNull(inviteCodesTable.usedAt),
      ),
    );
}

/**
 * Kayıt doğrulama: kod + email eşleşmeli, kullanılmamış, süresi dolmamış.
 * Başarılı insert sonrası `consumeInviteCode` çağır.
 */
export async function validateInviteCodeForEmail(
  inviteCode: unknown,
  registeringEmail: string,
): Promise<
  | { ok: true; id: number; code: string; invitationRequestId: number | null }
  | { ok: false; error: string }
> {
  await ensureInviteCodesSchema();

  if (typeof inviteCode !== "string" || !inviteCode.trim()) {
    return { ok: false, error: "Davet kodu zorunlu" };
  }

  const code = normalizeInviteCode(inviteCode);
  const email = normalizeEmail(registeringEmail);

  // Opsiyonel master kod (yalnızca ops / acil) — email bağısız
  const master = process.env.INVITE_PASSCODE?.trim();
  if (master && inviteCode.trim() === master) {
    return { ok: true, id: -1, code: master, invitationRequestId: null };
  }

  const [row] = await db
    .select()
    .from(inviteCodesTable)
    .where(eq(inviteCodesTable.code, code))
    .limit(1);

  if (!row) {
    return { ok: false, error: "Geçersiz davet kodu" };
  }
  if (row.usedAt) {
    return { ok: false, error: "Bu davet kodu daha önce kullanılmış" };
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "Bu davet kodunun süresi dolmuş" };
  }
  if (normalizeEmail(row.email) !== email) {
    return {
      ok: false,
      error: "Davet kodu bu e-posta adresi için değil. Başvurudaki e-posta ile kayıt ol.",
    };
  }

  return {
    ok: true,
    id: row.id,
    code: row.code,
    invitationRequestId: row.invitationRequestId ?? null,
  };
}

const PERSONAS = new Set(["founder", "investor", "builder", "company"]);

/** Davet başvurusundaki role → users.persona */
export async function personaFromInviteRequest(
  invitationRequestId: number | null | undefined,
): Promise<string | null> {
  if (invitationRequestId == null || invitationRequestId < 0) return null;
  const { invitationRequestsTable } = await import("@workspace/db/schema");
  const [inv] = await db
    .select({ role: invitationRequestsTable.role })
    .from(invitationRequestsTable)
    .where(eq(invitationRequestsTable.id, invitationRequestId))
    .limit(1);
  const raw = (inv?.role ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "operator") return "builder";
  if (PERSONAS.has(raw)) return raw;
  return null;
}

/** Kayıtta / backfill’te profili başvuru metniyle doldur (bio boş kalmasın). */
export async function profileSeedFromInviteRequest(
  invitationRequestId: number | null | undefined,
): Promise<{
  bio?: string;
  company?: string;
  linkedin?: string;
  website?: string;
  title?: string;
  phone?: string;
}> {
  if (invitationRequestId == null || invitationRequestId < 0) return {};
  const { invitationRequestsTable } = await import("@workspace/db/schema");
  const [inv] = await db
    .select({
      whoYouAre: invitationRequestsTable.whoYouAre,
      organization: invitationRequestsTable.organization,
      linkedin: invitationRequestsTable.linkedin,
      link: invitationRequestsTable.link,
      role: invitationRequestsTable.role,
      phone: invitationRequestsTable.phone,
    })
    .from(invitationRequestsTable)
    .where(eq(invitationRequestsTable.id, invitationRequestId))
    .limit(1);
  if (!inv) return {};

  const bio = (inv.whoYouAre ?? "").trim().slice(0, 1600);
  const company = (inv.organization ?? "").trim().slice(0, 120) || undefined;
  const linkedin = (inv.linkedin ?? "").trim().slice(0, 240) || undefined;
  const website = (inv.link ?? "").trim().slice(0, 240) || undefined;
  const phone = (inv.phone ?? "").trim().slice(0, 40) || undefined;
  const role = (inv.role ?? "").trim().toLowerCase();
  const titleByRole: Record<string, string> = {
    founder: "Founder",
    investor: "Investor",
    builder: "Builder",
    operator: "Builder",
    company: "Company",
  };
  const title = titleByRole[role];

  return {
    ...(bio.length >= 8 ? { bio } : {}),
    ...(company ? { company } : {}),
    ...(linkedin ? { linkedin } : {}),
    ...(website ? { website } : {}),
    ...(phone ? { phone } : {}),
    ...(title ? { title } : {}),
  };
}

/**
 * Mevcut üyede boş kalan bio/şirket/linkedin’i davet başvurusundan bir kez doldur.
 * (Eski kayıtlar için; alan doluysa dokunmaz.)
 */
export async function hydrateUserProfileFromInvite(user: {
  id: number;
  email: string;
  bio: string | null;
  company: string | null;
  linkedin: string | null;
  website: string | null;
  title?: string | null;
  phone?: string | null;
  profileCompletionPct: number | null;
}): Promise<{
  id: number;
  email: string;
  bio: string | null;
  company: string | null;
  linkedin: string | null;
  website: string | null;
  title?: string | null;
  phone?: string | null;
  profileCompletionPct: number | null;
} | null> {
  const needsBio = !(user.bio ?? "").trim();
  const needsCompany = !(user.company ?? "").trim();
  const needsLinkedin = !(user.linkedin ?? "").trim();
  const needsWebsite = !(user.website ?? "").trim();
  const needsTitle = !(user.title ?? "").trim();
  const needsPhone = !(user.phone ?? "").trim();
  if (!needsBio && !needsCompany && !needsLinkedin && !needsWebsite && !needsTitle && !needsPhone) {
    return null;
  }

  const { invitationRequestsTable, usersTable } = await import("@workspace/db/schema");

  let invitationRequestId: number | null = null;
  const [codeRow] = await db
    .select({ invitationRequestId: inviteCodesTable.invitationRequestId })
    .from(inviteCodesTable)
    .where(eq(inviteCodesTable.usedByUserId, user.id))
    .limit(1);
  if (codeRow?.invitationRequestId) {
    invitationRequestId = codeRow.invitationRequestId;
  } else {
    const [byEmail] = await db
      .select({ id: invitationRequestsTable.id })
      .from(invitationRequestsTable)
      .where(eq(invitationRequestsTable.email, normalizeEmail(user.email)))
      .limit(1);
    if (byEmail) invitationRequestId = byEmail.id;
  }

  const seed = await profileSeedFromInviteRequest(invitationRequestId);
  if (!seed.bio && !seed.company && !seed.linkedin && !seed.website && !seed.title && !seed.phone) {
    return null;
  }

  const nextBio = needsBio && seed.bio ? seed.bio : user.bio;
  const nextCompany = needsCompany && seed.company ? seed.company : user.company;
  const nextLinkedin = needsLinkedin && seed.linkedin ? seed.linkedin : user.linkedin;
  const nextWebsite = needsWebsite && seed.website ? seed.website : user.website;
  const nextTitle = needsTitle && seed.title ? seed.title : user.title ?? null;
  const nextPhone = needsPhone && seed.phone ? seed.phone : user.phone ?? null;

  if (
    nextBio === user.bio &&
    nextCompany === user.company &&
    nextLinkedin === user.linkedin &&
    nextWebsite === user.website &&
    nextTitle === (user.title ?? null) &&
    nextPhone === (user.phone ?? null)
  ) {
    return null;
  }

  let pct = user.profileCompletionPct ?? 0;
  if (needsBio && (nextBio ?? "").trim().length > 20) pct = Math.min(100, pct + 9);
  if (needsCompany && (nextCompany ?? "").trim()) pct = Math.min(100, pct + 9);
  if (needsTitle && (nextTitle ?? "").trim()) pct = Math.min(100, pct + 9);

  const [updated] = await db
    .update(usersTable)
    .set({
      bio: nextBio,
      company: nextCompany,
      linkedin: nextLinkedin,
      website: nextWebsite,
      title: nextTitle,
      phone: nextPhone,
      profileCompletionPct: pct,
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  return updated ?? null;
}

export async function consumeInviteCode(inviteCodeId: number, userId: number) {
  if (inviteCodeId < 0) return; // master passcode
  await db
    .update(inviteCodesTable)
    .set({ usedAt: new Date(), usedByUserId: userId })
    .where(and(eq(inviteCodesTable.id, inviteCodeId), isNull(inviteCodesTable.usedAt)));
}
