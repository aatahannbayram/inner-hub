import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invitationRequestsTable = pgTable("invitation_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role"),
  linkedin: text("linkedin"),
  whoYouAre: text("who_you_are").notNull(),
  link: text("link"),
  whoIntroduced: text("who_introduced"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvitationRequestSchema = createInsertSchema(
  invitationRequestsTable,
).omit({ id: true, createdAt: true });

export const selectInvitationRequestSchema = createSelectSchema(
  invitationRequestsTable,
);

export type InsertInvitationRequest = z.infer<
  typeof insertInvitationRequestSchema
>;
export type InvitationRequest = typeof invitationRequestsTable.$inferSelect;
