import { and, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { passLedgerTable, passWalletsTable, usersTable } from "@workspace/db/schema";
import { ensurePassSchema } from "./ensureSchema";

export const MONTHLY_PASS_GRANT = 3;

function monthlyRefId(userId: number, yearMonth?: string): string {
  const ym =
    yearMonth ??
    `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
  return `monthly:${userId}:${ym}`;
}

/** Aktif üyelere ayda 3 pass; refId `monthly:{userId}:{YYYY-MM}` ile idempotent. */
export async function monthlyPassGrant(
  userId: number,
  yearMonth?: string,
): Promise<{ granted: boolean; balance: number; skipped?: string }> {
  await ensurePassSchema();
  const [user] = await db
    .select({
      id: usersTable.id,
      membershipStatus: usersTable.membershipStatus,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return { granted: false, balance: 0, skipped: "user_not_found" };
  if (user.membershipStatus !== "active") {
    return { granted: false, balance: await getPassBalance(userId), skipped: "not_active" };
  }

  const refId = monthlyRefId(userId, yearMonth);
  const [existing] = await db
    .select({ id: passLedgerTable.id })
    .from(passLedgerTable)
    .where(and(eq(passLedgerTable.userId, userId), eq(passLedgerTable.refId, refId)))
    .limit(1);
  if (existing) {
    return { granted: false, balance: await getPassBalance(userId), skipped: "already_granted" };
  }

  const balance = await creditPasses({
    userId,
    amount: MONTHLY_PASS_GRANT,
    reason: "monthly_grant",
    refType: "membership",
    refId,
  });
  return { granted: true, balance };
}

/** Tüm aktif üyelere bu ayın monthly grant'ını uygular. */
export async function monthlyPassGrantAll(yearMonth?: string): Promise<{
  eligible: number;
  granted: number;
  skipped: number;
}> {
  const active = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.membershipStatus, "active"));

  let granted = 0;
  let skipped = 0;
  for (const row of active) {
    const result = await monthlyPassGrant(row.id, yearMonth);
    if (result.granted) granted += 1;
    else skipped += 1;
  }
  return { eligible: active.length, granted, skipped };
}

export async function getOrCreateWallet(userId: number) {
  await ensurePassSchema();
  const [existing] = await db
    .select()
    .from(passWalletsTable)
    .where(eq(passWalletsTable.userId, userId))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(passWalletsTable)
    .values({ userId, balance: 0 })
    .returning();
  return created!;
}

export async function getPassBalance(userId: number): Promise<number> {
  const w = await getOrCreateWallet(userId);
  return w.balance;
}

export async function creditPasses(input: {
  userId: number;
  amount: number;
  reason: string;
  refType?: string;
  refId?: string;
}): Promise<number> {
  if (input.amount <= 0) throw new Error("amount must be positive");
  await ensurePassSchema();
  await getOrCreateWallet(input.userId);
  await db.insert(passLedgerTable).values({
    userId: input.userId,
    delta: input.amount,
    reason: input.reason,
    refType: input.refType ?? null,
    refId: input.refId ?? null,
  });
  await db.execute(sql`
    UPDATE pass_wallets
    SET balance = balance + ${input.amount}, updated_at = now()
    WHERE user_id = ${input.userId}
  `);
  return getPassBalance(input.userId);
}

/** Harcama; yetersiz bakiyede hata. Aynı ref için tekrar harcamaz. */
export async function spendPasses(input: {
  userId: number;
  amount: number;
  reason: string;
  refType: string;
  refId: string;
}): Promise<number> {
  if (input.amount <= 0) return getPassBalance(input.userId);
  await ensurePassSchema();

  const [existingSpend] = await db
    .select({ id: passLedgerTable.id })
    .from(passLedgerTable)
    .where(
      and(
        eq(passLedgerTable.userId, input.userId),
        eq(passLedgerTable.reason, input.reason),
        eq(passLedgerTable.refType, input.refType),
        eq(passLedgerTable.refId, input.refId),
      ),
    )
    .limit(1);
  if (existingSpend) return getPassBalance(input.userId);

  const bal = await getPassBalance(input.userId);
  if (bal < input.amount) {
    throw new Error("Yetersiz Circle Pass");
  }

  await db.insert(passLedgerTable).values({
    userId: input.userId,
    delta: -input.amount,
    reason: input.reason,
    refType: input.refType,
    refId: input.refId,
  });
  await db.execute(sql`
    UPDATE pass_wallets
    SET balance = balance - ${input.amount}, updated_at = now()
    WHERE user_id = ${input.userId}
  `);
  return getPassBalance(input.userId);
}
