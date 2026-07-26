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
    "Davet talebin bize ulaştı. Ekibimiz başvurunu inceliyor; kısa süre içinde dönüş yapacağız.",
    "",
    "Bu süreçte ek bir şey yapman gerekmiyor. Sorun olursa: support@inner.digital",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: "Davet talebin alındı. Ekibimiz kısa süre içinde dönüş yapacak.",
    eyebrow: "Davetiye · alındı",
    title: `${name}, talebin bizde.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Davet talebin başarıyla kayda geçti. inner·hub davetiye ile ilerler; her başvuruyu tek tek okuyoruz.</p>
      <p style="margin:0;">İnceleme tamamlanınca bu adrese yazılı olarak haber vereceğiz. Bu arada ek bir adım gerekmiyor.</p>
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
  const subject = "inner hub · davetin onaylandı";

  const text = [
    `Merhaba ${name},`,
    "",
    "Davet talebin onaylandı. Çembere hoş geldin.",
    "",
    inviteCode ? `Davet kodun: ${inviteCode}` : "Davet kodun için support@inner.digital yaz.",
    `Panele git, kayıt ol (aynı e-posta + davet kodu): ${panelUrl}`,
    "",
    "Kayıt olduktan sonra sonraki girişlerde kod gerekmez.",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const codeHtml = inviteCode
    ? `
      <p style="margin:0 0 12px;">Panele gidip <strong style="color:#F4F1EC;font-weight:500;">bu başvurudaki e-posta</strong> ile kayıt ol. Davet kodun:</p>
      <p style="margin:0 0 16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:18px;letter-spacing:0.12em;color:#F4F1EC;">
        ${escapeHtml(inviteCode)}
      </p>
      <p style="margin:0 0 12px;font-size:13px;color:rgba(244,241,236,0.45);">Kod sana özel ve tek kullanımlık. Kayıttan sonra girişlerde gerekmez. Sorun olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
    `
    : `
      <p style="margin:0 0 12px;">Panele gidip hesabını oluşturabilirsin. Davet kodu için <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a> yaz.</p>
    `;

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: inviteCode
      ? `Davetin onaylandı. Kodun: ${inviteCode}`
      : "Davetin onaylandı. Panele geçebilirsin.",
    eyebrow: "Davetiye · onay",
    title: "Çembere hoş geldin.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, başvurun onaylandı. inner·hub artık senin için açık.</p>
      ${codeHtml}
      ${roleLine(ctx.roleLabel)}
    `,
    cta: { label: "Panele git", href: panelUrl },
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
