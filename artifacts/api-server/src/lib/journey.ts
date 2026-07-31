import type { User } from "@workspace/db/schema";

export type JourneyTaskId =
  | "bio"
  | "avatar"
  | "role"
  | "skills"
  | "linkedin"
  | "visit_members"
  | "visit_signal"
  | "visit_stage";

export type JourneyBadgeId =
  | "first_words"
  | "face_known"
  | "craft"
  | "linked_in"
  | "explorer"
  | "inner_circle";

export type JourneyVisitKey = "members" | "signal" | "stage" | "profile";

export type JourneyPrefs = {
  visited?: Partial<Record<JourneyVisitKey, boolean>>;
  dismissedCard?: boolean;
};

export type JourneyTask = {
  id: JourneyTaskId;
  done: boolean;
  href: string;
  phase: 1 | 2;
};

export type JourneyBadge = {
  id: JourneyBadgeId;
  unlocked: boolean;
};

export type JourneySnapshot = {
  level: number;
  levelLabelKey: string;
  xp: number;
  xpToNext: number;
  completed: number;
  total: number;
  nextTaskId: JourneyTaskId | null;
  tasks: JourneyTask[];
  badges: JourneyBadge[];
  dismissedCard: boolean;
  profileCompletionPct: number;
};

const LEVEL_LABELS = ["journey.level1", "journey.level2", "journey.level3", "journey.level4", "journey.level5"];

function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string");
  } catch {
    /* ignore */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseJourneyPrefs(settingsPrefs: string | null | undefined): JourneyPrefs {
  if (!settingsPrefs) return {};
  try {
    const parsed = JSON.parse(settingsPrefs);
    const j = parsed?.journey;
    if (!j || typeof j !== "object") return {};
    return {
      visited: j.visited && typeof j.visited === "object" ? j.visited : {},
      dismissedCard: j.dismissedCard === true,
    };
  } catch {
    return {};
  }
}

export function mergeJourneyIntoSettingsPrefs(
  settingsPrefs: string | null | undefined,
  journey: JourneyPrefs,
): string {
  let base: Record<string, unknown> = {};
  try {
    base = settingsPrefs ? JSON.parse(settingsPrefs) : {};
    if (!base || typeof base !== "object") base = {};
  } catch {
    base = {};
  }
  const prev = (base.journey as JourneyPrefs | undefined) ?? {};
  base.journey = {
    visited: { ...(prev.visited ?? {}), ...(journey.visited ?? {}) },
    dismissedCard: journey.dismissedCard ?? prev.dismissedCard ?? false,
  };
  return JSON.stringify(base);
}

export function buildJourneySnapshot(user: User, journeyPrefs: JourneyPrefs): JourneySnapshot {
  const skills = parseSkills(user.skills);
  const visited = journeyPrefs.visited ?? {};
  const bioDone = (user.bio ?? "").trim().length > 20;
  const avatarDone = Boolean(user.avatarUrl);
  const roleDone = Boolean((user.title ?? "").trim() && (user.company ?? "").trim());
  const skillsDone = skills.length >= 2;
  const linkedinDone = Boolean((user.linkedin ?? "").trim());
  const membersDone = visited.members === true;
  const signalDone = visited.signal === true;
  const stageDone = visited.stage === true;

  const tasks: JourneyTask[] = [
    { id: "bio", done: bioDone, href: "/panel/profile", phase: 1 },
    { id: "avatar", done: avatarDone, href: "/panel/profile", phase: 1 },
    { id: "role", done: roleDone, href: "/panel/profile", phase: 1 },
    { id: "skills", done: skillsDone, href: "/panel/profile", phase: 1 },
    { id: "linkedin", done: linkedinDone, href: "/panel/id", phase: 1 },
    { id: "visit_members", done: membersDone, href: "/panel/members", phase: 2 },
    { id: "visit_signal", done: signalDone, href: "/panel/signal", phase: 2 },
    { id: "visit_stage", done: stageDone, href: "/panel/stage", phase: 2 },
  ];

  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const level = Math.min(5, Math.max(1, Math.floor(completed / 2) + 1));
  const xp = completed;
  const xpToNext = level >= 5 ? total : level * 2;
  const nextTask = tasks.find((t) => !t.done) ?? null;

  const explorerUnlocked = [membersDone, signalDone, stageDone].filter(Boolean).length >= 2;
  const badges: JourneyBadge[] = [
    { id: "first_words", unlocked: bioDone },
    { id: "face_known", unlocked: avatarDone },
    { id: "craft", unlocked: skillsDone },
    { id: "linked_in", unlocked: linkedinDone },
    { id: "explorer", unlocked: explorerUnlocked },
    { id: "inner_circle", unlocked: (user.profileCompletionPct ?? 0) >= 80 && completed >= 6 },
  ];

  return {
    level,
    levelLabelKey: LEVEL_LABELS[level - 1] ?? LEVEL_LABELS[0],
    xp,
    xpToNext,
    completed,
    total,
    nextTaskId: nextTask?.id ?? null,
    tasks,
    badges,
    dismissedCard: journeyPrefs.dismissedCard === true,
    profileCompletionPct: user.profileCompletionPct ?? 0,
  };
}
