import {
  pgTable, serial, text, timestamp, boolean, integer, pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable, applicationStatusEnum } from "./users";

// ─── BAŞVURULAR ───────────────────────────────────────────────────────────────
export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  invitationRequestId: integer("invitation_request_id"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  term: integer("term").notNull().default(1),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export const selectApplicationSchema = createSelectSchema(applicationsTable);
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

// ─── KURSLAR ──────────────────────────────────────────────────────────────────
export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  term: integer("term").default(1).notNull(),
  order: integer("order").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  /** vod | live | hybrid */
  format: text("format").default("vod").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  meetUrl: text("meet_url"),
  /** all | founder | investor | company | builder */
  audience: text("audience").default("all").notNull(),
  /** Canlı oturum Pass maliyeti (genelde 0 veya 1) */
  passCost: integer("pass_cost").default(0).notNull(),
  /** business | product | art | craft | capital | ops */
  category: text("category").default("business").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => coursesTable.id).notNull(),
  title: text("title").notNull(),
  order: integer("order").default(0).notNull(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modulesTable.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  order: integer("order").default(0).notNull(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  courseId: integer("course_id").references(() => coursesTable.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const progressTable = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessonsTable.id).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export const selectCourseSchema = createSelectSchema(coursesTable);
export type Course = typeof coursesTable.$inferSelect;

// ─── ETKİNLİKLER ──────────────────────────────────────────────────────────────
export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  isPublished: boolean("is_published").default(false).notNull(),
  /** online | in_person | hybrid */
  format: text("format").default("in_person").notNull(),
  meetUrl: text("meet_url"),
  audience: text("audience").default("all").notNull(),
  passCost: integer("pass_cost").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistrationsTable = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  eventId: integer("event_id").references(() => eventsTable.id).notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export const selectEventSchema = createSelectSchema(eventsTable);
export type Event = typeof eventsTable.$inferSelect;

// ─── TOPLULUK CHAT ────────────────────────────────────────────────────────────
export const channelsTable = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").references(() => channelsTable.id).notNull(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type Message = typeof messagesTable.$inferSelect;

// ─── AYRICALIKLAR ─────────────────────────────────────────────────────────────
export const perksTable = pgTable("perks", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  ctaUrl: text("cta_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  category: text("category"),
  badge: text("badge"),
  code: text("code"),
  howTo: text("how_to"),
  featured: boolean("featured").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  /** partner | campaign */
  source: text("source").default("partner").notNull(),
  orgId: integer("org_id"),
  campaignId: integer("campaign_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerkSchema = createInsertSchema(perksTable).omit({ id: true, createdAt: true });
export const selectPerkSchema = createSelectSchema(perksTable);
export type Perk = typeof perksTable.$inferSelect;

// ─── BİLDİRİMLER ──────────────────────────────────────────────────────────────
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  title: text("title"),
  body: text("body").notNull(),
  kind: text("kind"),
  /** Panel içi hedef yol, örn. /panel/events */
  href: text("href"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notificationsTable.$inferSelect;

// ─── SSS ──────────────────────────────────────────────────────────────────────
export const faqTable = pgTable("faq", {
  id: serial("id").primaryKey(),
  category: text("category").default("Genel").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0).notNull(),
});

export type FAQ = typeof faqTable.$inferSelect;

// ─── TANİŞMA TALEPLERİ ────────────────────────────────────────────────────────
export const introductionRequestsTable = pgTable("introduction_requests", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => usersTable.id).notNull(),
  targetName: text("target_name").notNull(),
  targetCompany: text("target_company"),
  matchType: text("match_type"),
  reason: text("reason"),
  score: integer("score"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IntroductionRequest = typeof introductionRequestsTable.$inferSelect;

// ─── VAULT ────────────────────────────────────────────────────────────────────
export const vaultDocumentsTable = pgTable("vault_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  docType: text("doc_type").notNull(),
  access: text("access").default("topluluk").notNull(),
  excerpt: text("excerpt"),
  tags: text("tags"),
  pages: integer("pages"),
  views: integer("views").default(0).notNull(),
  fileKey: text("file_key"),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VaultDocument = typeof vaultDocumentsTable.$inferSelect;

// ─── CAPITAL ──────────────────────────────────────────────────────────────────
export const capitalDealsTable = pgTable("capital_deals", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  tagline: text("tagline"),
  stage: text("stage").notNull(),
  sector: text("sector").notNull(),
  raise: text("raise"),
  valuation: text("valuation"),
  founders: text("founders"),
  leadInvestor: text("lead_investor"),
  round: text("round"),
  score: integer("score").default(0).notNull(),
  tags: text("tags"),
  hasSpv: boolean("has_spv").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const capitalSpvsTable = pgTable("capital_spvs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  target: text("target").notNull(),
  raised: text("raised").notNull(),
  pct: integer("pct").default(0).notNull(),
  participants: integer("participants").default(0).notNull(),
  closing: text("closing"),
  sector: text("sector"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CapitalDeal = typeof capitalDealsTable.$inferSelect;
export type CapitalSpv = typeof capitalSpvsTable.$inferSelect;

// ─── TALENT BOARD ─────────────────────────────────────────────────────────────
export const talentPostsTable = pgTable("talent_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  postType: text("post_type").notNull(), // arıyor | sunuyor
  role: text("role").notNull(),
  description: text("description").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TalentPost = typeof talentPostsTable.$inferSelect;

// ─── SESSIONS (auth) ──────────────────────────────────────────────────────────
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;

// ─── INNER·API ANAHTARLARI ────────────────────────────────────────────────────
export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export type ApiKey = typeof apiKeysTable.$inferSelect;

// ─── CIRCLE PASS ──────────────────────────────────────────────────────────────
export const passWalletsTable = pgTable("pass_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passLedgerTable = pgTable("pass_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  refType: text("ref_type"),
  refId: text("ref_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PassWallet = typeof passWalletsTable.$inferSelect;
export type PassLedger = typeof passLedgerTable.$inferSelect;

// ─── INNER·STAGE ──────────────────────────────────────────────────────────────
export const stageProductsTable = pgTable("stage_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  pitch: text("pitch").notNull(),
  status: text("status").default("published").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stageVotesTable = pgTable("stage_votes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => stageProductsTable.id).notNull(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StageProduct = typeof stageProductsTable.$inferSelect;
export type StageVote = typeof stageVotesTable.$inferSelect;

/** Canlı hatırlatma dedupe */
export const liveNotifyLogTable = pgTable("live_notify_log", {
  id: serial("id").primaryKey(),
  refType: text("ref_type").notNull(),
  refId: integer("ref_id").notNull(),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── ORGANİZASYONLAR ──────────────────────────────────────────────────────────
export const organizationsTable = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  logoUrl: text("logo_url"),
  /** startup | company | fund | studio */
  type: text("type").default("startup").notNull(),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orgMembershipsTable = pgTable("org_memberships", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizationsTable.id).notNull(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  /** owner | admin | member */
  role: text("role").default("member").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Organization = typeof organizationsTable.$inferSelect;
export type OrgMembership = typeof orgMembershipsTable.$inferSelect;

// ─── HUKUKİ BELGELER ──────────────────────────────────────────────────────────
export const legalDocumentsTable = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  version: text("version").notNull(),
  locale: text("locale").default("tr").notNull(),
  title: text("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const legalAcceptancesTable = pgTable("legal_acceptances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  documentId: integer("document_id").references(() => legalDocumentsTable.id).notNull(),
  version: text("version").notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});

export type LegalDocument = typeof legalDocumentsTable.$inferSelect;
export type LegalAcceptance = typeof legalAcceptancesTable.$inferSelect;

// ─── FİRMA KAMPANYALARI ───────────────────────────────────────────────────────
export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizationsTable.id).notNull(),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  pitch: text("pitch").notNull(),
  ctaUrl: text("cta_url").notNull(),
  code: text("code"),
  category: text("category").default("Eğitim"),
  status: text("status").default("draft").notNull(),
  perkId: integer("perk_id"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Campaign = typeof campaignsTable.$inferSelect;

