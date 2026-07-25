import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

/** Prod/eski DB'lerde profil kolonlarını idempotent ekle. */
export async function ensureUserProfileColumns() {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS handle text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS visibility text`);
}
