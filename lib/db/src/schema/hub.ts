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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerkSchema = createInsertSchema(perksTable).omit({ id: true, createdAt: true });
export const selectPerkSchema = createSelectSchema(perksTable);
export type Perk = typeof perksTable.$inferSelect;

// ─── BİLDİRİMLER ──────────────────────────────────────────────────────────────
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notificationsTable.$inferSelect;

// ─── SSS ──────────────────────────────────────────────────────────────────────
export const faqTable = pgTable("faq", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0).notNull(),
});

export type FAQ = typeof faqTable.$inferSelect;

// ─── SESSIONS (auth) ──────────────────────────────────────────────────────────
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
