import { createHmac, timingSafeEqual } from "node:crypto";
import { appBaseUrl } from "./transport";

export type UnsubScope = "weekly" | "all";

function unsubSecret(): string {
  return (
    process.env.MAIL_UNSUB_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "dev-unsub-inner"
  );
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export function createUnsubToken(userId: number, email: string, scope: UnsubScope = "weekly"): string {
  const payload = b64url(
    JSON.stringify({
      u: userId,
      e: email.trim().toLowerCase(),
      s: scope,
      iat: Date.now(),
    }),
  );
  const sig = createHmac("sha256", unsubSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function unsubUrl(userId: number, email: string, scope: UnsubScope = "weekly"): string {
  const token = createUnsubToken(userId, email, scope);
  return `${appBaseUrl()}/api/mail/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function verifyUnsubToken(
  token: string,
): { userId: number; email: string; scope: UnsubScope } | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  const expected = createHmac("sha256", unsubSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      u?: number;
      e?: string;
      s?: string;
      iat?: number;
    };
    if (!data.u || !data.e) return null;
    if (data.iat && Date.now() - data.iat > 400 * 24 * 60 * 60 * 1000) return null;
    const scope: UnsubScope = data.s === "all" ? "all" : "weekly";
    return { userId: data.u, email: data.e, scope };
  } catch {
    return null;
  }
}

export function unsubResultHtml(opts: { ok: boolean; scope?: UnsubScope; error?: string }): string {
  const title = opts.ok ? "Abonelik durdu." : "Bağlantı geçersiz.";
  const body = opts.ok
    ? opts.scope === "all"
      ? "inner hub e-postalarını bu adrese artık göndermeyeceğiz. İşlemsel iletiler (şifre, davet) hariç."
      : "Haftalık özeti kapattık. Ayarlardan tekrar açabilirsin."
    : opts.error ?? "Token okunamadı veya süresi doldu.";
  const app = appBaseUrl();
  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>inner hub · ${title}</title></head>
<body style="margin:0;background:#050505;color:#F4F1EC;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td align="center" style="padding:64px 20px;">
      <p style="margin:0 0 12px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(244,241,236,0.4);">inner hub</p>
      <h1 style="margin:0 0 16px;font-size:32px;font-weight:400;font-style:italic;">${title}</h1>
      <p style="margin:0 0 28px;max-width:420px;font-family:Inter,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:rgba(244,241,236,0.6);">${body}</p>
      <a href="${app}/panel/settings" style="display:inline-block;background:#F4F1EC;color:#0A0A0A;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.08em;text-decoration:none;padding:14px 22px;">AYARLAR&nbsp;&nbsp;↗</a>
    </td>
  </tr></table>
</body></html>`;
}
