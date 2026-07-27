/**
 * WhatsApp Cloud API / Twilio için şablon altyapısı.
 * Credential yoksa no-op; liveJobs e-posta + in-app ile devam eder.
 */

export type WhatsAppTemplateId =
  | "live_session_t24h"
  | "live_session_t15m"
  | "pass_low_balance"
  | "profile_nudge";

const TEMPLATES: Record<
  WhatsAppTemplateId,
  { name: string; bodyTr: string; bodyEn: string }
> = {
  live_session_t24h: {
    name: "live_session_t24h",
    bodyTr: "Merhaba {{1}}, {{2}} yarın {{3}} başlıyor. Meet: {{4}} · inner·hub",
    bodyEn: "Hi {{1}}, {{2}} starts tomorrow at {{3}}. Meet: {{4}} · inner·hub",
  },
  live_session_t15m: {
    name: "live_session_t15m",
    bodyTr: "{{1}}, {{2}} 15 dk içinde başlıyor. Katıl: {{3}}",
    bodyEn: "{{1}}, {{2}} starts in 15 min. Join: {{3}}",
  },
  pass_low_balance: {
    name: "pass_low_balance",
    bodyTr: "Circle Pass bakiyen {{1}}. Canlı oturum için +1 Pass ekleyebilirsin: {{2}}",
    bodyEn: "Your Circle Pass balance is {{1}}. Add +1 Pass for live sessions: {{2}}",
  },
  profile_nudge: {
    name: "profile_nudge",
    bodyTr: "{{1}}, profilin %{{2}} tamam. Üniversite / Behance ekleyerek eşleşmeyi güçlendir: {{3}}",
    bodyEn: "{{1}}, your profile is {{2}}% complete. Add university / Behance: {{3}}",
  },
};

export function getWhatsAppTemplate(id: WhatsAppTemplateId, locale: "tr" | "en" = "tr") {
  const t = TEMPLATES[id];
  return {
    templateName: t.name,
    body: locale === "en" ? t.bodyEn : t.bodyTr,
  };
}

export function fillTemplate(body: string, vars: string[]): string {
  let out = body;
  vars.forEach((v, i) => {
    out = out.replaceAll(`{{${i + 1}}}`, v);
  });
  return out;
}

/** Meta / Twilio gönderimi - env yoksa false döner. */
export async function sendWhatsAppTemplate(input: {
  toE164: string;
  templateId: WhatsAppTemplateId;
  vars: string[];
  locale?: "tr" | "en";
}): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneId) {
    console.info(
      "[whatsapp] skip (no WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)",
      input.templateId,
      fillTemplate(getWhatsAppTemplate(input.templateId, input.locale).body, input.vars),
    );
    return false;
  }

  const tpl = getWhatsAppTemplate(input.templateId, input.locale ?? "tr");
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.toE164.replace(/\D/g, ""),
      type: "template",
      template: {
        name: tpl.templateName,
        language: { code: input.locale === "en" ? "en" : "tr" },
        components: [
          {
            type: "body",
            parameters: input.vars.map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[whatsapp] send failed", res.status, err);
    return false;
  }
  return true;
}

export { TEMPLATES as WHATSAPP_TEMPLATES };
