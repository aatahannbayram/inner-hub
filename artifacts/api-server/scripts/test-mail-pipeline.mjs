/**
 * Sends transactional preview templates via Resend (preferred) or Hostinger SMTP.
 *
 * Usage (repo root):
 *   node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs
 *   node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs --to you@example.com
 *
 * Prefers RESEND_API_KEY; falls back to SMTP_HOST/USER/PASS.
 */
import { createTransport } from "nodemailer";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const previewDir = join(__dirname, "../../inner-hub/public/mail-preview");

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const resendKey = process.env.RESEND_API_KEY?.trim();
const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT) || 587;
const fromRaw = process.env.RESEND_FROM || process.env.MAIL_FROM || user;
const fromName = process.env.MAIL_FROM_NAME || "inner hub";
const fromAddr = fromRaw?.includes("<")
  ? fromRaw.replace(/^.*<([^>]+)>.*$/, "$1").trim()
  : fromRaw;
const fromHeader = fromRaw?.includes("<") ? fromRaw : `"${fromName}" <${fromAddr}>`;
const replyTo = process.env.MAIL_REPLY_TO || "support@inner.digital";
const to = argValue("--to") || process.env.TEST_TO || process.env.NOTIFY_EMAIL;

if (!resendKey && (!host || !user || !pass)) {
  console.error("Eksik yapılandırma: RESEND_API_KEY veya SMTP_HOST/SMTP_USER/SMTP_PASS gerekli.");
  process.exit(1);
}
if (!fromAddr) {
  console.error("MAIL_FROM, RESEND_FROM veya SMTP_USER gerekli.");
  process.exit(1);
}
if (!to) {
  console.error("Alıcı yok: --to veya NOTIFY_EMAIL / TEST_TO ayarla.");
  process.exit(1);
}

const domain = fromAddr.includes("@") ? fromAddr.split("@")[1] : "inner.digital";

const samples = [
  { file: "01-received.html", subject: "inner hub · davet talebin alındı", kind: "invite.received" },
  { file: "02-approved.html", subject: "inner hub · davetin onaylandı", kind: "invite.approved" },
  { file: "03-rejected.html", subject: "inner hub · davet talebi hakkında", kind: "invite.rejected" },
  { file: "04-admin-new.html", subject: "inner hub · yeni üyelik talebi: Ata Han", kind: "admin.new_request" },
];

async function sendResend({ subject, text, html, kind, messageId }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromHeader,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
      headers: {
        "Message-ID": messageId,
        "Auto-Submitted": "auto-generated",
        "X-Inner-Mail-Kind": kind,
      },
      tags: [{ name: "kind", value: kind.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) }],
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || body.name || `Resend HTTP ${res.status}`);
  }
  return body.id;
}

async function sendSmtp(transport, { subject, text, html, kind, messageId }) {
  await transport.sendMail({
    from: fromHeader,
    to,
    replyTo,
    subject,
    text,
    html,
    messageId,
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Inner-Mail-Kind": kind,
    },
  });
}

let smtpTransport = null;
if (resendKey) {
  console.log("Provider: Resend →", to);
} else {
  smtpTransport = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  console.log("SMTP verify…");
  await smtpTransport.verify();
  console.log("Provider: SMTP →", to);
}

for (const s of samples) {
  const path = join(previewDir, s.file);
  if (!existsSync(path)) {
    console.error("Preview eksik:", path, "(önce generate-mail-preview.mjs çalıştır)");
    process.exit(1);
  }
  const html = readFileSync(path, "utf8");
  const text = `${s.subject}\n\n(HTML sürümü için modern bir istemci kullan.)\n\ninner hub`;
  const messageId = `<${Date.now()}.${randomBytes(6).toString("hex")}@${domain}>`;
  const payload = {
    subject: `[TEST] ${s.subject}`,
    text,
    html,
    kind: s.kind,
    messageId,
  };
  if (resendKey) {
    const id = await sendResend(payload);
    console.log("sent", s.kind, id ?? "");
  } else {
    await sendSmtp(smtpTransport, payload);
    console.log("sent", s.kind);
  }
}

console.log(
  "Bitti. Inbox + Spam kontrol et; Gmail’de ‘Orijinali göster’ ile SPF/DKIM/DMARC bak (Resend selector beklenir).",
);
