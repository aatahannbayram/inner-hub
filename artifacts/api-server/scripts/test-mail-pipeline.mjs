/**
 * Sends one of each transactional template to TEST_TO (or NOTIFY_EMAIL).
 * Usage (from repo root, with SMTP in .env):
 *   node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs
 *   node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs --to you@example.com
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

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT) || 587;
const fromAddr = process.env.MAIL_FROM || user;
const fromName = process.env.MAIL_FROM_NAME || "inner hub";
const replyTo = process.env.MAIL_REPLY_TO || "support@inner.digital";
const to = argValue("--to") || process.env.TEST_TO || process.env.NOTIFY_EMAIL;

if (!host || !user || !pass) {
  console.error("Eksik SMTP: SMTP_HOST / SMTP_USER / SMTP_PASS gerekli.");
  process.exit(1);
}
if (!fromAddr) {
  console.error("MAIL_FROM veya SMTP_USER gerekli.");
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

const transport = createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

console.log("SMTP verify…");
await transport.verify();
console.log("OK, gönderiliyor →", to);

for (const s of samples) {
  const path = join(previewDir, s.file);
  if (!existsSync(path)) {
    console.error("Preview eksik:", path, "(önce generate-mail-preview.mjs çalıştır)");
    process.exit(1);
  }
  const html = readFileSync(path, "utf8");
  const text = `${s.subject}\n\n(HTML sürümü için modern bir istemci kullan.)\n\ninner hub`;
  const messageId = `<${Date.now()}.${randomBytes(6).toString("hex")}@${domain}>`;
  await transport.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to,
    replyTo,
    subject: `[TEST] ${s.subject}`,
    text,
    html,
    messageId,
    headers: {
      "Auto-Submitted": "auto-generated",
      "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>`,
      "X-Inner-Mail-Kind": s.kind,
    },
  });
  console.log("sent", s.kind);
}

console.log("Bitti. Inbox + Spam klasörünü kontrol et; Gmail’de ‘Orijinali göster’ ile SPF/DKIM/DMARC bak.");
