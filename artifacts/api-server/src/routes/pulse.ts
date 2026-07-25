import { Router } from "express";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  channelsTable,
  messagesTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";

const router = Router();

const TOPIC_RULES: { topic: string; category: "teknoloji" | "iş" | "yatırım" | "kültür"; keywords: string[] }[] = [
  { topic: "Claude / AI", category: "teknoloji", keywords: ["claude", "gpt", "openai", "llm", "ai"] },
  { topic: "Cursor", category: "teknoloji", keywords: ["cursor"] },
  { topic: "Yatırım / Seed", category: "yatırım", keywords: ["seed", "pre-seed", "yatırım", "investor", "valuation"] },
  { topic: "AWS / Altyapı", category: "iş", keywords: ["aws", "activate", "infra"] },
  { topic: "Ürün / Mom Test", category: "kültür", keywords: ["mom test", "müşteri", "ürün"] },
  { topic: "SaaS", category: "iş", keywords: ["saas", "churn", "arr", "mrr"] },
];

// ─── GET /api/pulse ──────────────────────────────────────────────────────────
router.get("/pulse", requireAuth, async (_req, res) => {
  try {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * 86_400_000);
    const twoWeeksAgo = new Date(now - 14 * 86_400_000);

    const channels = await db.select().from(channelsTable);
    const channelStats = await Promise.all(
      channels.map(async (ch) => {
        const [{ n: messages }] = await db
          .select({ n: count() })
          .from(messagesTable)
          .where(eq(messagesTable.channelId, ch.id));
        const weekMsgs = await db
          .select({ body: messagesTable.body })
          .from(messagesTable)
          .where(and(eq(messagesTable.channelId, ch.id), gte(messagesTable.createdAt, weekAgo)))
          .limit(200);
        const active = await db
          .selectDistinct({ userId: messagesTable.userId })
          .from(messagesTable)
          .where(and(eq(messagesTable.channelId, ch.id), gte(messagesTable.createdAt, weekAgo)));

        return {
          name: ch.name,
          messages: Number(messages),
          activeMembers: active.length,
          trending: weekMsgs[0]?.body?.slice(0, 48) || "henüz mesaj yok",
        };
      }),
    );
    channelStats.sort((a, b) => b.messages - a.messages);

    const [{ n: weekMessageCount }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(gte(messagesTable.createdAt, weekAgo));

    const [{ n: memberCount }] = await db.select({ n: count() }).from(usersTable);

    const contributors = await db
      .select({
        name: usersTable.name,
        contributions: count(),
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(gte(messagesTable.createdAt, weekAgo))
      .groupBy(usersTable.id, usersTable.name)
      .orderBy(desc(count()))
      .limit(5);

    const weekBodies = await db
      .select({ body: messagesTable.body, createdAt: messagesTable.createdAt })
      .from(messagesTable)
      .where(gte(messagesTable.createdAt, twoWeeksAgo))
      .limit(500);

    const thisWeekText = weekBodies
      .filter((m) => m.createdAt >= weekAgo)
      .map((m) => m.body.toLowerCase())
      .join("\n");
    const lastWeekText = weekBodies
      .filter((m) => m.createdAt < weekAgo)
      .map((m) => m.body.toLowerCase())
      .join("\n");

    const trends = TOPIC_RULES.map((rule) => {
      const mentions = rule.keywords.reduce((sum, kw) => {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return sum + (thisWeekText.match(re)?.length ?? 0);
      }, 0);
      const prev = rule.keywords.reduce((sum, kw) => {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return sum + (lastWeekText.match(re)?.length ?? 0);
      }, 0);
      const delta = prev === 0 ? (mentions > 0 ? 100 : 0) : Math.round(((mentions - prev) / prev) * 100);
      return { topic: rule.topic, mentions, delta, category: rule.category };
    })
      .filter((t) => t.mentions > 0)
      .sort((a, b) => b.mentions - a.mentions);

    // Son 4 haftalık aktivite
    const weekly: { label: string; activity: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 7 * 86_400_000);
      const end = new Date(now - i * 7 * 86_400_000);
      const [{ n }] = await db
        .select({ n: count() })
        .from(messagesTable)
        .where(and(gte(messagesTable.createdAt, start), sql`${messagesTable.createdAt} < ${end}`));
      const labels = ["3H", "2H", "GH", "Bu"];
      weekly.push({ label: labels[3 - i], activity: Number(n) });
    }
    const maxAct = Math.max(1, ...weekly.map((w) => w.activity));
    const weeklyNorm = weekly.map((w) => ({
      label: w.label,
      activity: Math.max(8, Math.round((w.activity / maxAct) * 100)),
      raw: w.activity,
    }));

    res.json({
      totalMessages: Number(weekMessageCount),
      activeMembers: Number(memberCount),
      weeklyActivity: weeklyNorm[3]?.activity ?? 0,
      trends,
      channels: channelStats.slice(0, 6),
      weekly: weeklyNorm.map(({ label, activity }) => ({ label, activity })),
      topContributors: contributors.map((c) => ({
        name: c.name,
        contributions: Number(c.contributions),
        streak: Math.min(30, Number(c.contributions)),
      })),
      empty: Number(weekMessageCount) === 0 && trends.length === 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Pulse yüklenemedi" });
  }
});

export default router;
