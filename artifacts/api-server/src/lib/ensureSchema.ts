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
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings_prefs text`);
}

/** Prod/eski DB'lerde ders video süresi kolonunu idempotent ekle. */
export async function ensureCourseVideoColumns() {
  await db.execute(sql`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_seconds integer`);
}

/** Kurs + etkinlik canlı alanları. */
export async function ensureLiveSessionColumns() {
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS format text DEFAULT 'vod'`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS starts_at timestamp`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS ends_at timestamp`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS meet_url text`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS audience text DEFAULT 'all'`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS pass_cost integer DEFAULT 0`);
  await db.execute(sql`UPDATE courses SET format = 'vod' WHERE format IS NULL`);
  await db.execute(sql`UPDATE courses SET audience = 'all' WHERE audience IS NULL`);
  await db.execute(sql`UPDATE courses SET pass_cost = 0 WHERE pass_cost IS NULL`);

  await db.execute(sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS format text DEFAULT 'in_person'`);
  await db.execute(sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS meet_url text`);
  await db.execute(sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS audience text DEFAULT 'all'`);
  await db.execute(sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS pass_cost integer DEFAULT 1`);
  await db.execute(sql`UPDATE events SET format = 'in_person' WHERE format IS NULL`);
  await db.execute(sql`UPDATE events SET audience = 'all' WHERE audience IS NULL`);
  await db.execute(sql`UPDATE events SET pass_cost = 1 WHERE pass_cost IS NULL`);
}

/** Üye persona + membership alanları. */
export async function ensureUserMembershipColumns() {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS persona text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_plan text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_period_end timestamp`);
}

/** Circle Pass cüzdan + ledger. */
export async function ensurePassSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pass_wallets (
      id serial PRIMARY KEY,
      user_id integer NOT NULL UNIQUE REFERENCES users(id),
      balance integer NOT NULL DEFAULT 0,
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pass_ledger (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      delta integer NOT NULL,
      reason text NOT NULL,
      ref_type text,
      ref_id text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS pass_ledger_user_idx ON pass_ledger (user_id)
  `);
}

/** Stage ürün + oy. */
export async function ensureStageSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS stage_products (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      title text NOT NULL,
      url text NOT NULL,
      pitch text NOT NULL,
      status text NOT NULL DEFAULT 'published',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS stage_votes (
      id serial PRIMARY KEY,
      product_id integer NOT NULL REFERENCES stage_products(id),
      user_id integer NOT NULL REFERENCES users(id),
      created_at timestamp NOT NULL DEFAULT now(),
      UNIQUE (product_id, user_id)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS live_notify_log (
      id serial PRIMARY KEY,
      ref_type text NOT NULL,
      ref_id integer NOT NULL,
      kind text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS live_notify_log_uidx
      ON live_notify_log (ref_type, ref_id, kind)
  `);
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

/** Talent board ilanları. */
export async function ensureTalentSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS talent_posts (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      post_type text NOT NULL,
      role text NOT NULL,
      description text NOT NULL,
      tags text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
}

/** inner·api anahtarları — plaintext hiçbir zaman saklanmaz, yalnızca hash. */
export async function ensureApiKeysSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      name text NOT NULL,
      key_prefix text NOT NULL,
      key_hash text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now(),
      last_used_at timestamp
    )
  `);
}

/** Public site analytics beacons (Framer-style admin). */
export async function ensureAnalyticsEventsSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id serial PRIMARY KEY,
      event_name text NOT NULL DEFAULT 'page_view',
      path text NOT NULL,
      title text,
      referrer text,
      session_id text NOT NULL,
      locale text,
      device text,
      user_agent text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events (created_at)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON analytics_events (path)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events (session_id)
  `);
}

/** Onay sonrası kişiye özel davet kodları. */
export async function ensureInviteCodesSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invite_codes (
      id serial PRIMARY KEY,
      code text NOT NULL,
      email text NOT NULL,
      invitation_request_id integer NOT NULL,
      application_id integer,
      used_at timestamp,
      used_by_user_id integer REFERENCES users(id),
      expires_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS invite_codes_code_uidx ON invite_codes (code)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS invite_codes_invitation_request_idx
      ON invite_codes (invitation_request_id)
  `);
}
