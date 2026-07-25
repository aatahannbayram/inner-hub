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

/** Tanışma talepleri + FAQ kategori kolonu. */
export async function ensureMatchAndFaqSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS introduction_requests (
      id serial PRIMARY KEY,
      from_user_id integer NOT NULL REFERENCES users(id),
      target_name text NOT NULL,
      target_company text,
      match_type text,
      reason text,
      score integer,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`ALTER TABLE faq ADD COLUMN IF NOT EXISTS category text`);
  await db.execute(sql`UPDATE faq SET category = 'Genel' WHERE category IS NULL`);
}
