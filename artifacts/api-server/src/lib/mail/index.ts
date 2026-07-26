import { sendTransactionalMail } from "./transport";
import {
  adminNewRequestMail,
  invitationApprovedMail,
  invitationReceivedMail,
  invitationRejectedMail,
  type ApplicantMailContext,
} from "./templates";

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
}) {
  const mail = adminNewRequestMail({
    ...req,
    role: roleLabelOf(req.role) ?? req.role,
  });
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!to) return false;
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

export type { ApplicantMailContext };
