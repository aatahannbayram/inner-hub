import { Router } from "express";
import { and, count, countDistinct, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  usersTable,
  messagesTable,
  channelsTable,
  eventRegistrationsTable,
  enrollmentsTable,
  applicationsTable,
  introductionRequestsTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";

const router = Router();

const MONTH_LABELS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const WEEK_LABELS_TR = ["3H", "2H", "GH", "Bu"];

// ─── GET /api/analytics ───────────────────────────────────────────────────────
// Gerçek toplulukk sayaçları — sahte büyüme eğrisi/gelir yok. Veri yoksa `empty: true`.
router.get("/analytics", requireAuth, async (req, res) => {
  try {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * 86_400_000);
    const twoWeeksAgo = new Date(now - 14 * 86_400_000);
    const isAdmin = req.user!.role === "admin";

    const [{ n: membersCount }] = await db.select({ n: count() }).from(usersTable);

    const [{ n: messagesThisWeek }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(gte(messagesTable.createdAt, weekAgo));
    const [{ n: messagesLastWeek }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(and(gte(messagesTable.createdAt, twoWeeksAgo), lt(messagesTable.createdAt, weekAgo)));

    const [{ n: eventRegistrationsTotal }] = await db.select({ n: count() }).from(eventRegistrationsTable);
    const [{ n: eventRegistrationsThisWeek }] = await db
      .select({ n: count() })
      .from(eventRegistrationsTable)
      .where(gte(eventRegistrationsTable.registeredAt, weekAgo));

    const [{ n: courseEnrollmentsTotal }] = await db.select({ n: count() }).from(enrollmentsTable);
    const [{ n: courseEnrollmentsThisWeek }] = await db
      .select({ n: count() })
      .from(enrollmentsTable)
      .where(gte(enrollmentsTable.joinedAt, weekAgo));

    const [{ n: matchIntroductionsTotal }] = await db.select({ n: count() }).from(introductionRequestsTable);
    const [{ n: matchIntroductionsThisMonth }] = await db
      .select({ n: count() })
      .from(introductionRequestsTable)
      .where(gte(introductionRequestsTable.createdAt, new Date(now - 30 * 86_400_000)));

    let applicationsPending: number | null = null;
    if (isAdmin) {
      const [{ n }] = await db
        .select({ n: count() })
        .from(applicationsTable)
        .where(eq(applicationsTable.status, "pending"));
      applicationsPending = Number(n);
    }

    // Üye büyümesi — son 6 ay, kümülatif gerçek sayım (users.created_at)
    const memberGrowth: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const boundary = new Date(now);
      boundary.setDate(1);
      boundary.setMonth(boundary.getMonth() - i + 1);
      boundary.setHours(0, 0, 0, 0);
      const [{ n }] = await db
        .select({ n: count() })
        .from(usersTable)
        .where(lt(usersTable.createdAt, boundary));
      const labelDate = new Date(now);
      labelDate.setMonth(labelDate.getMonth() - i);
      memberGrowth.push({ month: MONTH_LABELS_TR[labelDate.getMonth()], total: Number(n) });
    }
    const membersAtMonthStart = memberGrowth.length >= 2 ? memberGrowth[memberGrowth.length - 2].total : 0;
    const newMembersThisMonth = Number(membersCount) - membersAtMonthStart;

    // Haftalık katılım — son 4 hafta, gerçek: aktif üye (distinct mesaj yazan), mesaj, kayıt
    const weeklyActivity: { week: string; activeMembers: number; messages: number; registrations: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 7 * 86_400_000);
      const end = new Date(now - i * 7 * 86_400_000);
      const [{ n: msgs }] = await db
        .select({ n: count() })
        .from(messagesTable)
        .where(and(gte(messagesTable.createdAt, start), lt(messagesTable.createdAt, end)));
      const [{ n: active }] = await db
        .select({ n: countDistinct(messagesTable.userId) })
        .from(messagesTable)
        .where(and(gte(messagesTable.createdAt, start), lt(messagesTable.createdAt, end)));
      const [{ n: regs }] = await db
        .select({ n: count() })
        .from(eventRegistrationsTable)
        .where(and(gte(eventRegistrationsTable.registeredAt, start), lt(eventRegistrationsTable.registeredAt, end)));
      weeklyActivity.push({
        week: WEEK_LABELS_TR[3 - i],
        activeMembers: Number(active),
        messages: Number(msgs),
        registrations: Number(regs),
      });
    }

    // En aktif üyeler — son 30 gün mesaj katkısına göre
    const monthAgo = new Date(now - 30 * 86_400_000);
    const topMembersRaw = await db
      .select({
        name: usersTable.name,
        handle: usersTable.handle,
        createdAt: usersTable.createdAt,
        contributions: count(),
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(gte(messagesTable.createdAt, monthAgo))
      .groupBy(usersTable.id, usersTable.name, usersTable.handle, usersTable.createdAt)
      .orderBy(desc(count()))
      .limit(5);

    const topMembers = await Promise.all(
      topMembersRaw.map(async (m) => {
        const [{ n: eventsCount }] = await db
          .select({ n: count() })
          .from(eventRegistrationsTable)
          .innerJoin(usersTable, eq(eventRegistrationsTable.userId, usersTable.id))
          .where(eq(usersTable.name, m.name));
        return {
          name: m.name,
          handle: m.handle,
          contributions: Number(m.contributions),
          events: Number(eventsCount),
          joinedAt: m.createdAt.toISOString(),
        };
      }),
    );

    // Kanal aktivitesi — mesaj sayısı + benzersiz katılımcı
    const channels = await db.select().from(channelsTable);
    const channelActivity = (
      await Promise.all(
        channels.map(async (ch) => {
          const [{ n: messages }] = await db
            .select({ n: count() })
            .from(messagesTable)
            .where(eq(messagesTable.channelId, ch.id));
          const [{ n: members }] = await db
            .select({ n: countDistinct(messagesTable.userId) })
            .from(messagesTable)
            .where(eq(messagesTable.channelId, ch.id));
          return { name: ch.name, messages: Number(messages), members: Number(members) };
        }),
      )
    )
      .filter((c) => c.messages > 0)
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 6);

    const empty =
      Number(membersCount) <= 1 &&
      Number(messagesThisWeek) === 0 &&
      Number(eventRegistrationsTotal) === 0 &&
      Number(courseEnrollmentsTotal) === 0;

    res.json({
      membersCount: Number(membersCount),
      newMembersThisMonth,
      messagesThisWeek: Number(messagesThisWeek),
      messagesLastWeek: Number(messagesLastWeek),
      eventRegistrationsTotal: Number(eventRegistrationsTotal),
      eventRegistrationsThisWeek: Number(eventRegistrationsThisWeek),
      courseEnrollmentsTotal: Number(courseEnrollmentsTotal),
      courseEnrollmentsThisWeek: Number(courseEnrollmentsThisWeek),
      matchIntroductionsTotal: Number(matchIntroductionsTotal),
      matchIntroductionsThisMonth: Number(matchIntroductionsThisMonth),
      applicationsPending,
      memberGrowth,
      weeklyActivity,
      topMembers,
      channelActivity,
      empty,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Analitik yüklenemedi" });
  }
});

export default router;
