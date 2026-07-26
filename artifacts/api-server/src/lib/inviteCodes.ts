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
): Promise<{ ok: true; id: number; code: string } | { ok: false; error: string }> {
  await ensureInviteCodesSchema();

  if (typeof inviteCode !== "string" || !inviteCode.trim()) {
    return { ok: false, error: "Davet kodu zorunlu" };
  }

  const code = normalizeInviteCode(inviteCode);
  const email = normalizeEmail(registeringEmail);

  // Opsiyonel master kod (yalnızca ops / acil) — email bağısız
  const master = process.env.INVITE_PASSCODE?.trim();
  if (master && inviteCode.trim() === master) {
    return { ok: true, id: -1, code: master };
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

  return { ok: true, id: row.id, code: row.code };
}

export async function consumeInviteCode(inviteCodeId: number, userId: number) {
  if (inviteCodeId < 0) return; // master passcode
  await db
    .update(inviteCodesTable)
    .set({ usedAt: new Date(), usedByUserId: userId })
    .where(and(eq(inviteCodesTable.id, inviteCodeId), isNull(inviteCodesTable.usedAt)));
}
