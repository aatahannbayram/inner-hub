import { appBaseUrl } from "./transport";
import { escapeHtml, firstName, renderInnerEmailLayout } from "./layout";

export type ApplicantMailContext = {
  name: string;
  email: string;
  roleLabel?: string | null;
  /** Onay mailinde zorunlu: üretilen kişiye özel kod */
  inviteCode?: string | null;
};

function roleLine(roleLabel?: string | null): string {
  if (!roleLabel) return "";
  return `<p style="margin:16px 0 0;">Başvuru kapısı: <strong style="color:#F4F1EC;font-weight:500;">${escapeHtml(roleLabel)}</strong></p>`;
}

export function invitationReceivedMail(ctx: ApplicantMailContext) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const subject = "inner hub · davet talebin alındı";
  const text = [
    `Merhaba ${name},`,
    "",
    "Davet talebin bize ulaştı. Ekibimiz başvurunu inceliyor; kısa süre içinde bu e-postaya dönüş yapacağız.",
    "",
    "Onaylanırsa: kişisel davet kodun + panel kayıt linki bu adrese gelir.",
    "Panel adresi (şimdilik bekleyebilirsin): " + `${appUrl}/panel`,
    "",
    "Bu süreçte ek bir şey yapman gerekmiyor. Sorun olursa: support@inner.digital",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: "Davet talebin alındı. Onayda kod ve panel linki bu adrese gelir.",
    eyebrow: "Davetiye · alındı",
    title: `${name}, talebin bizde.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Davet talebin kayda geçti. inner·hub davetiye ile ilerler; her başvuruyu tek tek okuyoruz.</p>
      <p style="margin:0 0 12px;">İnceleme bitince <strong style="color:#F4F1EC;font-weight:500;">bu e-postaya</strong> yazacağız. Onaylanırsa kişisel davet kodun ve panele kayıt adımı aynı iletiyle gelir.</p>
      <p style="margin:0;font-size:13px;color:rgba(244,241,236,0.45);">Şimdilik beklemen yeterli. Panel: <a href="${escapeHtml(appUrl)}/panel" style="color:#F4F1EC;">${escapeHtml(appUrl)}/panel</a> (kod olmadan kayıt olamazsın).</p>
      ${roleLine(ctx.roleLabel)}
    `,
    cta: { label: "inner.digital", href: appUrl },
    footerNote: "Bu ileti, yaptığın davet talebine yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "invite.received" as const };
}

export function invitationApprovedMail(ctx: ApplicantMailContext) {
  const appUrl = appBaseUrl();
  const panelUrl = `${appUrl}/panel`;
  const name = firstName(ctx.name);
  const inviteCode = ctx.inviteCode?.trim() || "";
  const subject = "inner hub · davetin onaylandı · panele gir";

  const text = [
    `Merhaba ${name},`,
    "",
    "Davet talebin onaylandı. Çembere hoş geldin.",
    "",
    "Panele nasıl girersin:",
    `1) Aç: ${panelUrl}`,
    "2) Kayıt ol: bu e-posta + şifre + davet kodu",
    inviteCode ? `3) Davet kodun: ${inviteCode}` : "3) Davet kodun için support@inner.digital yaz",
    "",
    "Kayıt olduktan sonra sonraki girişlerde sadece e-posta ve şifre yeter. Kod gerekmez.",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const codeHtml = inviteCode
    ? `
      <ol style="margin:0 0 16px;padding-left:18px;color:rgba(244,241,236,0.72);line-height:1.55;">
        <li style="margin:0 0 8px;"><a href="${escapeHtml(panelUrl)}" style="color:#F4F1EC;">${escapeHtml(panelUrl)}</a> adresini aç</li>
        <li style="margin:0 0 8px;"><strong style="color:#F4F1EC;font-weight:500;">Bu e-posta</strong> (${escapeHtml(ctx.email)}) ile kayıt ol</li>
        <li style="margin:0;">Davet kodunu gir:</li>
      </ol>
      <p style="margin:0 0 16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:18px;letter-spacing:0.12em;color:#F4F1EC;">
        ${escapeHtml(inviteCode)}
      </p>
      <p style="margin:0 0 12px;font-size:13px;color:rgba(244,241,236,0.45);">Kod sana özel ve tek kullanımlık. Kayıttan sonra girişlerde gerekmez. Sorun olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
    `
    : `
      <p style="margin:0 0 12px;">Panele gidip hesabını oluştur. Davet kodu için <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a> yaz.</p>
    `;

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: inviteCode
      ? `Davetin onaylandı. Kod: ${inviteCode}. Panele kayıt ol.`
      : "Davetin onaylandı. Panele geçebilirsin.",
    eyebrow: "Davetiye · onay",
    title: "Çembere hoş geldin.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, başvurun onaylandı. inner·hub artık senin için açık.</p>
      ${codeHtml}
      ${roleLine(ctx.roleLabel)}
    `,
    cta: { label: "Panele git ve kayıt ol", href: panelUrl },
    footerNote: "Bu ileti, davet talebinin onaylanması üzerine otomatik gönderildi.",
  });

  return { subject, text, html, kind: "invite.approved" as const };
}

export function invitationRejectedMail(ctx: ApplicantMailContext) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const subject = "inner hub · davet talebi hakkında";
  const text = [
    `Merhaba ${name},`,
    "",
    "Bu turda davet talebini olumlu sonuçlandıramadık. Bu nihai bir kapı kapanması değil; çember bilerek yavaş büyüyor.",
    "",
    "Soruların için: support@inner.digital",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: "Bu turda talebini olumlu sonuçlandıramadık.",
    eyebrow: "Davetiye · bilgilendirme",
    title: "Bu turda yer açamadık.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}. Başvurunu dikkatle okuduk; bu dönemde çembere yeni bir yer açamıyoruz.</p>
      <p style="margin:0;">Bu karar nihai bir yasak değil; inner·hub bilerek yavaş büyür. İleride yeniden yazabilirsin. Sorun olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
    `,
    cta: { label: "inner.digital", href: appUrl },
    footerNote: "Bu ileti, davet talebinin sonucu hakkında otomatik gönderildi.",
  });

  return { subject, text, html, kind: "invite.rejected" as const };
}

export function adminNewRequestMail(payload: {
  name: string;
  email: string;
  role?: string | null;
  organization?: string | null;
  organizationDomain?: string | null;
  organizationLogo?: string | null;
  linkedin?: string | null;
  whoYouAre: string;
  link?: string | null;
  whoIntroduced?: string | null;
}) {
  const appUrl = appBaseUrl();
  const requestsUrl = `${appUrl}/requests`;
  const role = payload.role ?? "·";
  const subject = `inner hub · yeni üyelik talebi: ${payload.name}`;
  const lines = [
    `İsim: ${payload.name}`,
    `Email: ${payload.email}`,
    `Kimlik: ${role}`,
    payload.organization ? `Kurum: ${payload.organization}` : null,
    payload.organizationDomain ? `Domain: ${payload.organizationDomain}` : null,
    payload.linkedin ? `LinkedIn: ${payload.linkedin}` : null,
    `Kim: ${payload.whoYouAre}`,
    payload.link ? `Link: ${payload.link}` : null,
    payload.whoIntroduced ? `Kim tanıttı: ${payload.whoIntroduced}` : null,
    "",
    `İncele: ${requestsUrl}`,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const html = renderInnerEmailLayout({
    appUrl,
    preheader: `Yeni talep: ${payload.name}`,
    eyebrow: "Admin · yeni talep",
    title: payload.name,
    bodyHtml: `
      <p style="margin:0 0 8px;"><strong style="color:#F4F1EC;">${escapeHtml(payload.email)}</strong></p>
      <p style="margin:0 0 16px;">Kapı: ${escapeHtml(role)}</p>
      <p style="margin:0 0 12px;white-space:pre-wrap;">${escapeHtml(payload.whoYouAre)}</p>
      ${payload.organization ? `<p style="margin:0;">Kurum: ${escapeHtml(payload.organization)}</p>` : ""}
    `,
    cta: { label: "Başvuruları aç", href: requestsUrl },
    footerNote: "İç bildirim; yalnızca ekip adresine gider.",
  });

  return { subject, text, html, kind: "admin.new_request" as const };
}

export function liveSessionReminderMail(ctx: {
  name: string;
  sessionTitle: string;
  startsAt?: Date | null;
  meetUrl?: string | null;
  refType: "course" | "event";
  lead?: string;
}) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const when = ctx.startsAt
    ? ctx.startsAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
    : null;
  const panelPath = ctx.refType === "course" ? "/panel/courses" : "/panel/events";
  const panelUrl = `${appUrl}${panelPath}`;
  const subject = `inner hub · canlı hatırlatma: ${ctx.sessionTitle}`;
  const lead =
    ctx.lead?.trim() ||
    `${ctx.sessionTitle} canlı oturumu yaklaşıyor.`;

  const text = [
    `Merhaba ${name},`,
    "",
    lead,
    when ? `Başlangıç: ${when}` : null,
    ctx.meetUrl ? `Katılım: ${ctx.meetUrl}` : `Panel: ${panelUrl}`,
    "",
    "inner hub",
    appUrl,
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: lead,
    eyebrow: "Canlı oturum · hatırlatma",
    title: ctx.sessionTitle,
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px;">${escapeHtml(lead)}</p>
      ${when ? `<p style="margin:0 0 12px;">Başlangıç: <strong style="color:#F4F1EC;font-weight:500;">${escapeHtml(when)}</strong></p>` : ""}
      ${
        ctx.meetUrl
          ? `<p style="margin:0;">Meet linki e-postanın CTA’sında.</p>`
          : `<p style="margin:0;">Detaylar panelde.</p>`
      }
    `,
    cta: {
      label: ctx.meetUrl ? "Canlıya katıl" : "Panele git",
      href: ctx.meetUrl || panelUrl,
    },
    footerNote: "Bu ileti, kayıtlı olduğun canlı oturum için otomatik gönderildi.",
  });

  return { subject, text, html, kind: "live.session_reminder" as const };
}
