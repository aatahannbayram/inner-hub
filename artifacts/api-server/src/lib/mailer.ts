import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

type NewInvitationRequest = {
  name: string;
  email: string;
  role?: string | null;
  linkedin?: string | null;
  whoYouAre: string;
  link?: string | null;
  whoIntroduced?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  investor: "Yatırımcı",
  founder: "Girişimci",
  company: "Şirket",
};

export async function notifyNewInvitationRequest(req: NewInvitationRequest) {
  const mailer = getTransporter();
  if (!mailer) {
    logger.info("SMTP not configured, skipping invitation request email notification");
    return;
  }

  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER!;
  const lines = [
    `İsim: ${req.name}`,
    `Email: ${req.email}`,
    req.role ? `Kimlik: ${ROLE_LABELS[req.role] ?? req.role}` : null,
    req.linkedin ? `LinkedIn: ${req.linkedin}` : null,
    `Kim: ${req.whoYouAre}`,
    req.link ? `Link: ${req.link}` : null,
    req.whoIntroduced ? `Kim tanıttı: ${req.whoIntroduced}` : null,
  ].filter(Boolean);

  try {
    await mailer.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `inner.hub — Yeni üyelik talebi: ${req.name}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    logger.error({ err }, "Failed to send invitation request notification email");
  }
}
