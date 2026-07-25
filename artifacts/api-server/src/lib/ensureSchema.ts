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

/** Vault + Capital tabloları. */
export async function ensureVaultCapitalSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vault_documents (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      title text NOT NULL,
      doc_type text NOT NULL,
      access text NOT NULL DEFAULT 'topluluk',
      excerpt text,
      tags text,
      pages integer,
      views integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS file_key text`);
  await db.execute(sql`ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS file_name text`);
  await db.execute(sql`ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS mime_type text`);
  await db.execute(sql`ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS size_bytes integer`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS capital_deals (
      id serial PRIMARY KEY,
      company text NOT NULL,
      tagline text,
      stage text NOT NULL,
      sector text NOT NULL,
      raise text,
      valuation text,
      founders text,
      lead_investor text,
      round text,
      score integer NOT NULL DEFAULT 0,
      tags text,
      has_spv boolean NOT NULL DEFAULT false,
      updated_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS capital_spvs (
      id serial PRIMARY KEY,
      name text NOT NULL,
      target text NOT NULL,
      raised text NOT NULL,
      pct integer NOT NULL DEFAULT 0,
      participants integer NOT NULL DEFAULT 0,
      closing text,
      sector text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
}
