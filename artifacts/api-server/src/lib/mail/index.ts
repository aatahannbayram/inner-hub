import { logger } from "../logger";
import { sendTransactionalMail } from "./transport";
import { getUserSettingsPrefs } from "../../routes/settings";
import { wantsEmail } from "./prefs";
import {
  adminNewRequestMail,
  courseEnrolledMail,
  eventRegisteredMail,
  invitationApprovedMail,
  invitationReceivedMail,
  invitationRejectedMail,
  liveSessionReminderMail,
  matchIntroAdminMail,
  matchIntroReceivedMail,
  passwordResetMail,
  weeklyDigestMail,
  type ApplicantMailContext,
  type DigestDealItem,
  type DigestEventItem,
  type DigestMatchItem,
} from "./templates";

export function queueMail(task: Promise<unknown>): void {
  void task.catch((err) => logger.error({ err }, "mail send failed"));
}

const ROLE_LABELS: Record<string, string> = {
  builder: "Builder",
  operator: "Builder",
  investor: "Yatırımcı",
  founder: "Girişimci",
  company: "Şirket",
};

export function roleLabelOf(role?: string | null): string | null {
  if (!role) return null;
  return ROLE_LABELS[role] ?? role;
}

/** Admin inbox — yeni talep (eski davranış). */
export async function notifyNewInvitationRequest(req: {
  name: string;
  email: string;
  role?: string | null;
  linkedin?: string | null;
  whoYouAre: string;
  link?: string | null;
  whoIntroduced?: string | null;
  organization?: string | null;
  organizationDomain?: string | null;
  organizationLogo?: string | null;
  organizationDescription?: string | null;
}) {
  const mail = adminNewRequestMail({
    ...req,
    role: roleLabelOf(req.role) ?? req.role,
  });
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!to) return { ok: false, error: "NOTIFY_EMAIL/SMTP_USER yok" };
  return sendTransactionalMail({ ...mail, to });
}

/** Başvuran: talep alındı. */
export async function notifyApplicantInvitationReceived(ctx: ApplicantMailContext) {
  const mail = invitationReceivedMail({
    ...ctx,
    roleLabel: ctx.roleLabel ?? null,
  });
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

/** Başvuran: onay. */
export async function notifyApplicantInvitationApproved(ctx: ApplicantMailContext) {
  const mail = invitationApprovedMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

/** Başvuran: red. */
export async function notifyApplicantInvitationRejected(ctx: ApplicantMailContext) {
  const mail = invitationRejectedMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

/** Şifre sıfırlama bağlantısı. */
export async function notifyPasswordReset(ctx: {
  name: string;
  email: string;
  resetUrl: string;
}) {
  const mail = passwordResetMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

/** Canlı kurs/etkinlik hatırlatması. */
export async function notifyLiveSession(ctx: {
  name: string;
  email: string;
  sessionTitle: string;
  startsAt?: Date | null;
  meetUrl?: string | null;
  refType: "course" | "event";
  lead?: string;
}) {
  const mail = liveSessionReminderMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

export async function notifyMatchIntroReceived(ctx: {
  userId: number;
  name: string;
  email: string;
  targetName: string;
  matchType?: string | null;
}) {
  const prefs = await getUserSettingsPrefs(ctx.userId);
  if (!wantsEmail(prefs, "match")) return { ok: true, skipped: true as const };
  const mail = matchIntroReceivedMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

export async function notifyMatchIntroAdmin(ctx: {
  fromName: string;
  fromEmail: string;
  targetName: string;
  targetCompany?: string | null;
  matchType?: string | null;
  reason?: string | null;
  score?: number | null;
}) {
  const mail = matchIntroAdminMail(ctx);
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!to) return { ok: false, error: "NOTIFY_EMAIL/SMTP_USER yok" };
  return sendTransactionalMail({ ...mail, to });
}

export async function notifyEventRegistered(ctx: {
  userId: number;
  name: string;
  email: string;
  title: string;
  startsAt?: Date | null;
  location?: string | null;
  meetUrl?: string | null;
}) {
  const prefs = await getUserSettingsPrefs(ctx.userId);
  if (!prefs.notifEmail) return { ok: true, skipped: true as const };
  const mail = eventRegisteredMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

export async function notifyCourseEnrolled(ctx: {
  userId: number;
  name: string;
  email: string;
  title: string;
  startsAt?: Date | null;
  meetUrl?: string | null;
}) {
  const prefs = await getUserSettingsPrefs(ctx.userId);
  if (!prefs.notifEmail) return { ok: true, skipped: true as const };
  const mail = courseEnrolledMail(ctx);
  return sendTransactionalMail({ ...mail, to: ctx.email });
}

export async function notifyWeeklyDigest(ctx: {
  email: string;
  name: string;
  matches: DigestMatchItem[];
  events: DigestEventItem[];
  deals: DigestDealItem[];
  unsubscribeUrl: string;
  weekLabel: string;
}) {
  const mail = weeklyDigestMail(ctx);
  return sendTransactionalMail({
    ...mail,
    to: ctx.email,
    category: "lifecycle",
    unsubscribeUrl: ctx.unsubscribeUrl,
  });
}

export type { ApplicantMailContext, DigestDealItem, DigestEventItem, DigestMatchItem };
