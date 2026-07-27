import { randomBytes } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "../logger";

let transporter: Transporter | null | undefined;

export function getMailTransporter(): Transporter | null {
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
    // Pool + rate limit: burst spam skorunu düşürür
    pool: true,
    maxConnections: 2,
    maxMessages: 20,
    rateDelta: 1000,
    rateLimit: 5,
  });
  return transporter;
}

export function appBaseUrl(): string {
  return (process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "");
}

export function mailFromAddress(): string {
  return process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "noreply@inner.digital";
}

export function mailFromHeader(): string {
  const name = process.env.MAIL_FROM_NAME ?? "inner hub";
  return `"${name.replace(/"/g, "")}" <${mailFromAddress()}>`;
}

export function mailReplyTo(): string {
  return process.env.MAIL_REPLY_TO ?? "support@inner.digital";
}

function mailDomain(): string {
  const from = mailFromAddress();
  const at = from.lastIndexOf("@");
  return at >= 0 ? from.slice(at + 1) : "inner.digital";
}

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Optional headers / tags for logs */
  kind?: string;
};

/**
 * Deliverability-conscious send:
 * - multipart text + html
 * - stable From / Reply-To
 * - Message-ID on our domain
 * - List-Unsubscribe (mailto)
 * - Auto-Submitted for transactional
 */
export type MailResult = { ok: boolean; error?: string };

export async function sendTransactionalMail(mail: OutboundMail): Promise<MailResult> {
  const transport = getMailTransporter();
  if (!transport) {
    logger.info({ kind: mail.kind, to: mail.to }, "SMTP not configured — mail skipped");
    return { ok: false, error: "SMTP yapılandırılmamış (SMTP_HOST/SMTP_USER/SMTP_PASS eksik)" };
  }

  const domain = mailDomain();
  const messageId = `<${Date.now()}.${randomBytes(8).toString("hex")}@${domain}>`;
  const unsubMailto = `mailto:${mailReplyTo()}?subject=${encodeURIComponent("unsubscribe")}`;

  try {
    await transport.sendMail({
      from: mailFromHeader(),
      to: mail.to,
      replyTo: mailReplyTo(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      messageId,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
        "List-Unsubscribe": `<${unsubMailto}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Inner-Mail-Kind": mail.kind ?? "transactional",
      },
    });
    logger.info({ kind: mail.kind, to: mail.to, messageId }, "Transactional mail sent");
    return { ok: true };
  } catch (err) {
    logger.error({ err, kind: mail.kind, to: mail.to }, "Transactional mail failed");
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
