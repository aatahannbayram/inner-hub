import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * Onay sonrası üretilen kişiye özel davet kodları.
 * Kayıt: code + başvuru email’i eşleşmeli; kullanıldıktan sonra geçersiz.
 */
export const inviteCodesTable = pgTable(
  "invite_codes",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    email: text("email").notNull(),
    invitationRequestId: integer("invitation_request_id").notNull(),
    applicationId: integer("application_id"),
    usedAt: timestamp("used_at"),
    usedByUserId: integer("used_by_user_id").references(() => usersTable.id),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("invite_codes_code_uidx").on(t.code)],
);

export const insertInviteCodeSchema = createInsertSchema(inviteCodesTable).omit({
  id: true,
  createdAt: true,
});
export const selectInviteCodeSchema = createSelectSchema(inviteCodesTable);
export type InviteCode = typeof inviteCodesTable.$inferSelect;
export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
