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
  return (
    process.env.RESEND_FROM?.replace(/^.*<([^>]+)>.*$/, "$1").trim() ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    "noreply@mail.inner.digital"
  );
}

export function mailFromHeader(): string {
  const explicit = process.env.RESEND_FROM?.trim();
  if (explicit?.includes("<")) return explicit;
  const name = process.env.MAIL_FROM_NAME ?? "inner hub";
  const addr = explicit || mailFromAddress();
  return `"${name.replace(/"/g, "")}" <${addr}>`;
}

export function mailReplyTo(): string {
  return process.env.MAIL_REPLY_TO ?? "support@inner.digital";
}

function mailDomain(): string {
  const from = mailFromAddress();
  const at = from.lastIndexOf("@");
  return at >= 0 ? from.slice(at + 1) : "inner.digital";
}

export function resendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || undefined;
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
 * - Resend API öncelikli (yüksek itibarlı transactional)
 * - Yoksa Hostinger SMTP fallback
 * - multipart text + html, stable From / Reply-To
 *
 * Not: List-Unsubscribe / One-Click eklemiyoruz (transactional abonelik değildir).
 */
export type MailResult = { ok: boolean; error?: string; provider?: "resend" | "smtp" };

async function sendViaResend(
  mail: OutboundMail,
  messageId: string,
  apiKey: string,
): Promise<MailResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFromHeader(),
      to: [mail.to],
      reply_to: mailReplyTo(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      headers: {
        "Message-ID": messageId,
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
        "X-Inner-Mail-Kind": mail.kind ?? "transactional",
      },
      tags: mail.kind
        ? [{ name: "kind", value: mail.kind.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) }]
        : undefined,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!res.ok) {
    const errMsg = body.message || body.name || `Resend HTTP ${res.status}`;
    logger.error({ kind: mail.kind, to: mail.to, status: res.status, body }, "Resend mail failed");
    return { ok: false, error: errMsg, provider: "resend" };
  }

  logger.info(
    { kind: mail.kind, to: mail.to, messageId, resendId: body.id },
    "Transactional mail sent via Resend",
  );
  return { ok: true, provider: "resend" };
}

async function sendViaSmtp(mail: OutboundMail, messageId: string): Promise<MailResult> {
  const transport = getMailTransporter();
  if (!transport) {
    return {
      ok: false,
      error: "Mail yapılandırılmamış (RESEND_API_KEY veya SMTP_HOST/SMTP_USER/SMTP_PASS)",
      provider: "smtp",
    };
  }

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
      "X-Inner-Mail-Kind": mail.kind ?? "transactional",
    },
  });
  logger.info({ kind: mail.kind, to: mail.to, messageId }, "Transactional mail sent via SMTP");
  return { ok: true, provider: "smtp" };
}

export async function sendTransactionalMail(mail: OutboundMail): Promise<MailResult> {
  const domain = mailDomain();
  const messageId = `<${Date.now()}.${randomBytes(8).toString("hex")}@${domain}>`;
  const apiKey = resendApiKey();

  try {
    if (apiKey) {
      const resendResult = await sendViaResend(mail, messageId, apiKey);
      if (resendResult.ok) return resendResult;
      logger.warn(
        { kind: mail.kind, to: mail.to, error: resendResult.error },
        "Resend failed — trying SMTP fallback",
      );
      const smtpResult = await sendViaSmtp(mail, messageId);
      if (smtpResult.ok) return smtpResult;
      return {
        ok: false,
        error: `Resend: ${resendResult.error}; SMTP: ${smtpResult.error}`,
        provider: "resend",
      };
    }

    const smtpResult = await sendViaSmtp(mail, messageId);
    if (!smtpResult.ok && smtpResult.error?.includes("yapılandırılmamış")) {
      logger.info({ kind: mail.kind, to: mail.to }, "Mail not configured — skipped");
    }
    return smtpResult;
  } catch (err) {
    logger.error({ err, kind: mail.kind, to: mail.to }, "Transactional mail failed");
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
