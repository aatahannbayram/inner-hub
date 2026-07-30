import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["member", "admin"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  /** DiceBear stil anahtarı (lorelei | shapes | notionists | …) */
  avatarStyle: text("avatar_style").default("lorelei"),
  role: roleEnum("role").default("member").notNull(),
  /** Davet personası: founder | investor | builder | company */
  persona: text("persona"),
  membershipPlan: text("membership_plan"),
  membershipStatus: text("membership_status"),
  membershipPeriodEnd: timestamp("membership_period_end"),
  bio: text("bio"),
  title: text("title"),
  company: text("company"),
  /** Birincil organizasyon */
  primaryOrgId: integer("primary_org_id"),
  university: text("university"),
  behance: text("behance"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  phone: text("phone"),
  whatsappOptIn: text("whatsapp_opt_in"),
  handle: text("handle"),
  github: text("github"),
  website: text("website"),
  twitter: text("twitter"),
  skills: text("skills"),
  visibility: text("visibility").default("members"),
  settingsPrefs: text("settings_prefs"),
  profileCompletionPct: integer("profile_completion_pct").default(0).notNull(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  linkedinId: text("linkedin_id").unique(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(usersTable);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
