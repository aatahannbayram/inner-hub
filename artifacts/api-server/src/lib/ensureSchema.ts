import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

/**
 * Her route handler'da tekrar tekrar ALTER/CREATE çalıştırmamak için
 * process başına bir kere memoize eder. Startup'ta zaten hepsi bir kez
 * çalışıyor (bkz. index.ts); route'lardaki çağrılar sadece "startup
 * başarısız olduysa on-demand retry" güvenlik ağı, her istek için tekrar
 * DB round-trip yapmamalı. Başarısız olursa bir sonraki çağrıda retry edilir.
 */
export function once(fn: () => Promise<void>): () => Promise<void> {
  let inFlight: Promise<void> | null = null;
  return () => {
    if (!inFlight) {
      inFlight = fn().catch((err) => {
        inFlight = null;
        throw err;
      });
    }
    return inFlight;
  };
}

/** Prod/eski DB'lerde profil kolonlarını idempotent ekle. */
export const ensureUserProfileColumns = once(async () => {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS handle text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website_logo_url text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_logo_url text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_logo_url text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS visibility text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings_prefs text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id text`);
  await db.execute(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS users_linkedin_id_uidx ON users (linkedin_id) WHERE linkedin_id IS NOT NULL`,
  );
});

/** Prod/eski DB'lerde ders video süresi kolonunu idempotent ekle. */
export const ensureCourseVideoColumns = once(async () => {
  await db.execute(sql`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_seconds integer`);
});

/** Kurs + etkinlik canlı alanları. */
export const ensureLiveSessionColumns = once(async () => {
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
});

/** Üye persona + membership alanları. */
export const ensureUserMembershipColumns = once(async () => {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS persona text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_plan text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_period_end timestamp`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_style text DEFAULT 'lorelei'`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_org_id integer`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS university text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS behance text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_opt_in text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamp`);
});

/** Org + hukuki + kampanya + kurs kategori. */
export const ensureOrgLegalCampaignSchema = once(async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS organizations (
      id serial PRIMARY KEY,
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      domain text,
      logo_url text,
      type text NOT NULL DEFAULT 'startup',
      created_by_user_id integer REFERENCES users(id),
      verified boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS org_memberships (
      id serial PRIMARY KEY,
      org_id integer NOT NULL REFERENCES organizations(id),
      user_id integer NOT NULL REFERENCES users(id),
      role text NOT NULL DEFAULT 'member',
      title text,
      created_at timestamp NOT NULL DEFAULT now(),
      UNIQUE (org_id, user_id)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS legal_documents (
      id serial PRIMARY KEY,
      slug text NOT NULL,
      version text NOT NULL,
      locale text NOT NULL DEFAULT 'tr',
      title text NOT NULL,
      body_markdown text NOT NULL,
      published_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS legal_documents_slug_ver_locale
      ON legal_documents (slug, version, locale)
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS legal_acceptances (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      document_id integer NOT NULL REFERENCES legal_documents(id),
      version text NOT NULL,
      accepted_at timestamp NOT NULL DEFAULT now(),
      ip text,
      user_agent text
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS legal_acceptances_user_doc
      ON legal_acceptances (user_id, document_id, version)
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id serial PRIMARY KEY,
      org_id integer NOT NULL REFERENCES organizations(id),
      created_by_user_id integer NOT NULL REFERENCES users(id),
      title text NOT NULL,
      pitch text NOT NULL,
      cta_url text NOT NULL,
      code text,
      category text DEFAULT 'Eğitim',
      status text NOT NULL DEFAULT 'draft',
      perk_id integer,
      starts_at timestamp,
      ends_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS source text DEFAULT 'partner'`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS org_id integer`);
  await db.execute(sql`ALTER TABLE perks ADD COLUMN IF NOT EXISTS campaign_id integer`);
  await db.execute(sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS category text DEFAULT 'business'`);
  await db.execute(sql`UPDATE courses SET category = 'business' WHERE category IS NULL`);
});

/** Circle Pass cüzdan + ledger. */
export const ensurePassSchema = once(async () => {
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
});

/** Stage ürün + oy. */
export const ensureStageSchema = once(async () => {
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
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS image_url text`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS product_hunt_url text`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS product_hunt_id text`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS ph_votes_count integer`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS ph_synced_at timestamp`);
  await db.execute(sql`ALTER TABLE stage_products ADD COLUMN IF NOT EXISTS youtube_url text`);
});

/** Tanışma talepleri + FAQ kategori kolonu. */
export const ensureMatchAndFaqSchema = once(async () => {
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
});

/** Vault + Capital tabloları. */
export const ensureVaultCapitalSchema = once(async () => {
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
});

/** Talent board ilanları. */
export const ensureTalentSchema = once(async () => {
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
});

/** inner·api anahtarları — plaintext hiçbir zaman saklanmaz, yalnızca hash. */
export const ensureApiKeysSchema = once(async () => {
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
});

/** Public site analytics beacons (Framer-style admin). */
export const ensureAnalyticsEventsSchema = once(async () => {
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
});

/** Şifre sıfırlama token'ları — yalnızca hash saklanır. */
export const ensurePasswordResetSchema = once(async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id),
      token_hash text NOT NULL,
      expires_at timestamp NOT NULL,
      used_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_hash_uidx
      ON password_reset_tokens (token_hash)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx
      ON password_reset_tokens (user_id)
  `);
});

/** Onay sonrası kişiye özel davet kodları. */
export const ensureInviteCodesSchema = once(async () => {
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
});

/**
 * Kurum logolarını DB'de (base64 data URL) önbelleğe alır. Hostinger birden
 * fazla Node worker'ı paylaşımsız yerel diskle çalıştırdığından, dosya
 * sistemine yazılan bir logo başka bir worker'da 404 dönebiliyordu — DB
 * tüm worker'lar arasında paylaşılan tek gerçek kaynak.
 */
export const ensureOrgLogoCacheSchema = once(async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS org_logo_cache (
      domain text PRIMARY KEY,
      data_url text,
      fetched_at timestamp NOT NULL DEFAULT now()
    )
  `);
});
