import { and, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { passLedgerTable, passWalletsTable } from "@workspace/db/schema";
import { ensurePassSchema } from "./ensureSchema";

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
