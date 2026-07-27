import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

/** Public site page_view / event beacons — Framer-tarzı admin analytics. */
export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    eventName: text("event_name").notNull().default("page_view"),
    path: text("path").notNull(),
    title: text("title"),
    referrer: text("referrer"),
    sessionId: text("session_id").notNull(),
    locale: text("locale"),
    device: text("device"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("analytics_events_created_idx").on(t.createdAt),
    index("analytics_events_path_idx").on(t.path),
    index("analytics_events_session_idx").on(t.sessionId),
  ],
);

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEventsTable).omit({
  id: true,
  createdAt: true,
});
export const selectAnalyticsEventSchema = createSelectSchema(analyticsEventsTable);
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
