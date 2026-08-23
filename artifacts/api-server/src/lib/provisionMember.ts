import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  passLedgerTable,
  passwordResetTokensTable,
  usersTable,
} from "@workspace/db/schema";
import {
  ensurePasswordResetSchema,
  ensureUserMembershipColumns,
} from "./ensureSchema";
import {
  normalizeEmail,
  personaFromInviteRequest,
  profileSeedFromInviteRequest,
} from "./inviteCodes";
import { appBaseUrl } from "./mail/transport";
import { creditPasses } from "./passes";

const SET_PASSWORD_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün — ilk kurulum
const WELCOME_PASS_GRANT = 3;

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type ProvisionMemberResult = {
  userId: number;
  created: boolean;
  setPasswordUrl: string | null;
};

/**
 * Başvuru onayında üye hesabı oluşturur (email yoksa).
 * Şifre yok → set-password token üretir. Circle Pass başlangıç grant'ı (idempotent).
 */
export async function provisionMemberFromApplication(input: {
  name: string;
  email: string;
  invitationRequestId: number;
  applicationId?: number | null;
}): Promise<ProvisionMemberResult> {
  await ensureUserMembershipColumns();
  await ensurePasswordResetSchema();

  const email = normalizeEmail(input.email);
  const [existing] = await db
    .select({
      id: usersTable.id,
      passwordHash: usersTable.passwordHash,
      membershipStatus: usersTable.membershipStatus,
      deletedAt: usersTable.deletedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  let userId: number;
  let created = false;
  let needsPasswordSetup = false;

  if (existing && !existing.deletedAt) {
    userId = existing.id;
    needsPasswordSetup = !existing.passwordHash;
    if (!existing.membershipStatus || existing.membershipStatus !== "active") {
      await db
        .update(usersTable)
        .set({
          membershipStatus: "active",
          membershipPlan: "member",
        })
        .where(eq(usersTable.id, userId));
    }
  } else if (existing?.deletedAt) {
    // Soft-deleted hesap: geri aç, şifre yoksa set-password
    const persona = await personaFromInviteRequest(input.invitationRequestId);
    const seed = await profileSeedFromInviteRequest(input.invitationRequestId);
    await db
      .update(usersTable)
      .set({
        deletedAt: null,
        name: input.name.trim() || email.split("@")[0] || "Üye",
        persona: persona ?? undefined,
        bio: seed.bio,
        company: seed.company,
        linkedin: seed.linkedin,
        website: seed.website,
        title: seed.title,
        membershipPlan: "member",
        membershipStatus: "active",
      })
      .where(eq(usersTable.id, existing.id));
    userId = existing.id;
    created = true;
    needsPasswordSetup = !existing.passwordHash;
  } else {
    const persona = await personaFromInviteRequest(input.invitationRequestId);
    const seed = await profileSeedFromInviteRequest(input.invitationRequestId);

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        name: input.name.trim() || email.split("@")[0] || "Üye",
        passwordHash: null,
        persona: persona ?? undefined,
        bio: seed.bio,
        company: seed.company,
        linkedin: seed.linkedin,
        website: seed.website,
        title: seed.title,
        membershipPlan: "member",
        membershipStatus: "active",
        profileCompletionPct: 0,
      })
      .returning({ id: usersTable.id });

    userId = user!.id;
    created = true;
    needsPasswordSetup = true;
  }

  // Circle Pass entitlement stub — ledger ref ile idempotent
  const refId =
    input.applicationId != null
      ? `application:${input.applicationId}`
      : `invitation:${input.invitationRequestId}`;
  try {
    const [already] = await db
      .select({ id: passLedgerTable.id })
      .from(passLedgerTable)
      .where(and(eq(passLedgerTable.userId, userId), eq(passLedgerTable.refId, refId)))
      .limit(1);
    if (!already) {
      await creditPasses({
        userId,
        amount: WELCOME_PASS_GRANT,
        reason: "membership_welcome",
        refType: "application",
        refId,
      });
    }
  } catch (err) {
    console.warn("[provisionMember] pass grant skipped", err);
  }

  let setPasswordUrl: string | null = null;
  if (needsPasswordSetup) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + SET_PASSWORD_TTL_MS);

    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokensTable.userId, userId),
          isNull(passwordResetTokensTable.usedAt),
        ),
      );

    await db.insert(passwordResetTokensTable).values({
      userId,
      tokenHash,
      expiresAt,
    });

    setPasswordUrl = `${appBaseUrl()}/panel?reset=${encodeURIComponent(rawToken)}`;
  }

  return { userId, created, setPasswordUrl };
}
