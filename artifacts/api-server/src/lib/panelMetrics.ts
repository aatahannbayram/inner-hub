import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  channelsTable,
  eventsTable,
  messagesTable,
  usersTable,
} from "@workspace/db/schema";
import { isDirectoryMember } from "./directoryMembers";

export const PULSE_MIN_MESSAGES_7D = Number(process.env.PULSE_MIN_MESSAGES_7D ?? 20);
export const PULSE_MIN_ACTIVE_MEMBERS_7D = Number(process.env.PULSE_MIN_ACTIVE_MEMBERS_7D ?? 5);
export const MATCH_MIN_COMPLETE_PROFILES = Number(process.env.MATCH_MIN_COMPLETE_PROFILES ?? 3);

export type PulseChannelStat = {
  id: number;
  name: string;
  messages7d: number;
  activeMembers7d: number;
  sample: string | null;
};

export type PulseSnapshot = {
  weekAgoIso: string;
  nowIso: string;
  messages7d: number;
  activeMembers7d: number;
  totalMembers: number;
  channels: PulseChannelStat[];
  sufficient: boolean;
  contextText: string;
};

export function parseSkills(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* csv */
  }
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isCompleteProfile(u: {
  bio?: string | null;
  title?: string | null;
  company?: string | null;
  skills?: unknown;
}): boolean {
  const bio = (u.bio ?? "").trim();
  const title = (u.title ?? "").trim();
  const company = (u.company ?? "").trim();
  const skills = parseSkills(u.skills);
  return bio.length >= 20 && (title.length > 0 || company.length > 0 || skills.length > 0);
}

export async function getPulseSnapshot(): Promise<PulseSnapshot> {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86_400_000);

  const channels = await db.select().from(channelsTable);
  const channelStats: PulseChannelStat[] = [];

  for (const ch of channels) {
    const [{ n: messages7d }] = await db
      .select({ n: count() })
      .from(messagesTable)
      .where(and(eq(messagesTable.channelId, ch.id), gte(messagesTable.createdAt, weekAgo)));
    const active = await db
      .selectDistinct({ userId: messagesTable.userId })
      .from(messagesTable)
      .where(and(eq(messagesTable.channelId, ch.id), gte(messagesTable.createdAt, weekAgo)));
    const samples = await db
      .select({ body: messagesTable.body })
      .from(messagesTable)
      .where(and(eq(messagesTable.channelId, ch.id), gte(messagesTable.createdAt, weekAgo)))
      .orderBy(desc(messagesTable.createdAt))
      .limit(3);

    channelStats.push({
      id: ch.id,
      name: ch.name,
      messages7d: Number(messages7d),
      activeMembers7d: active.length,
      sample: samples[0]?.body?.slice(0, 120) ?? null,
    });
  }

  channelStats.sort((a, b) => b.messages7d - a.messages7d);

  const [{ n: messages7d }] = await db
    .select({ n: count() })
    .from(messagesTable)
    .where(gte(messagesTable.createdAt, weekAgo));

  const activeRows = await db
    .selectDistinct({ userId: messagesTable.userId })
    .from(messagesTable)
    .where(gte(messagesTable.createdAt, weekAgo));

  const [{ n: totalMembers }] = await db
    .select({ n: count() })
    .from(usersTable)
    .where(isNull(usersTable.deletedAt));

  const messagesCount = Number(messages7d);
  const activeMembers7d = activeRows.length;
  const sufficient =
    messagesCount >= PULSE_MIN_MESSAGES_7D && activeMembers7d >= PULSE_MIN_ACTIVE_MEMBERS_7D;

  const topChannels = channelStats.filter((c) => c.messages7d > 0).slice(0, 6);
  const contextLines = [
    `Tarih aralığı: ${weekAgo.toISOString().slice(0, 10)} — ${new Date(now).toISOString().slice(0, 10)}`,
    `Son 7 gün: ${messagesCount} mesaj, ${activeMembers7d} aktif üye, ${Number(totalMembers)} toplam üye.`,
    ...topChannels.map(
      (c) =>
        `#${c.name}: ${c.messages7d} mesaj, ${c.activeMembers7d} aktif` +
        (c.sample ? ` · örnek: "${c.sample.replace(/\s+/g, " ").slice(0, 80)}"` : ""),
    ),
  ];

  return {
    weekAgoIso: weekAgo.toISOString(),
    nowIso: new Date(now).toISOString(),
    messages7d: messagesCount,
    activeMembers7d,
    totalMembers: Number(totalMembers),
    channels: channelStats,
    sufficient,
    contextText: contextLines.join("\n"),
  };
}

export type DirectoryMemberRow = {
  id: number;
  name: string;
  handle: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  skills: string[];
  persona: string | null;
  avatarUrl: string | null;
};

export async function listMatchableMembers(excludeUserId?: number): Promise<DirectoryMemberRow[]> {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      handle: usersTable.handle,
      title: usersTable.title,
      company: usersTable.company,
      bio: usersTable.bio,
      skills: usersTable.skills,
      persona: usersTable.persona,
      avatarUrl: usersTable.avatarUrl,
      isSystem: usersTable.isSystem,
      linkedin: usersTable.linkedin,
      linkedinId: usersTable.linkedinId,
    })
    .from(usersTable)
    .where(isNull(usersTable.deletedAt));

  return rows
    .filter((u) => (excludeUserId == null ? true : u.id !== excludeUserId))
    .filter((u) =>
      isDirectoryMember({
        email: u.email,
        name: u.name,
        bio: u.bio,
        company: u.company,
        title: u.title,
        linkedin: u.linkedin,
        linkedinId: u.linkedinId,
        avatarUrl: u.avatarUrl,
        persona: u.persona,
        isSystem: u.isSystem,
      }),
    )
    .filter(isCompleteProfile)
    .map((u) => ({
      id: u.id,
      name: u.name,
      handle: u.handle,
      title: u.title,
      company: u.company,
      bio: u.bio,
      skills: parseSkills(u.skills),
      persona: u.persona,
      avatarUrl: u.avatarUrl,
    }));
}

export function scoreMemberMatch(
  me: { skills?: string[]; persona?: string | null; title?: string | null; company?: string | null },
  other: DirectoryMemberRow,
): number {
  const mySkills = new Set((me.skills ?? []).map((s) => s.toLowerCase()));
  let overlap = 0;
  for (const s of other.skills) if (mySkills.has(s.toLowerCase())) overlap += 1;
  let score = 55 + Math.min(30, overlap * 8);
  if (me.persona && other.persona && me.persona !== other.persona) score += 5;
  if (me.company && other.company && me.company !== other.company) score += 3;
  if (other.title) score += 2;
  if (other.bio && other.bio.length > 80) score += 3;
  return Math.min(98, Math.max(50, score));
}

export async function getEventsSummary() {
  const now = new Date();
  const upcoming = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.isPublished, true), gte(eventsTable.startAt, now)))
    .orderBy(eventsTable.startAt)
    .limit(20);

  const featured = upcoming[0] ?? null;
  return {
    upcomingCount: upcoming.length,
    featuredEvent: featured
      ? {
          id: featured.id,
          title: featured.title,
          description: featured.description,
          location: featured.location,
          startAt: featured.startAt instanceof Date ? featured.startAt.toISOString() : featured.startAt,
          endAt: featured.endAt instanceof Date ? featured.endAt.toISOString() : featured.endAt,
          passCost: featured.passCost,
          format: featured.format,
        }
      : null,
  };
}
