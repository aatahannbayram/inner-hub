import { appBaseUrl, mailPhysicalAddress } from "./transport";
import { escapeHtml, firstName, renderInnerEmailLayout } from "./layout";

export type ApplicantMailContext = {
  name: string;
  email: string;
  roleLabel?: string | null;
  /** Onay mailinde: üretilen kişiye özel kod (self-register) */
  inviteCode?: string | null;
  /** Onay + provision: şifre belirleme linki (hesap hazır) */
  setPasswordUrl?: string | null;
};

function roleLine(roleLabel?: string | null): string {
  if (!roleLabel) return "";
  return `<p style="margin:16px 0 0;">Başvuru kapısı: <strong style="color:#F4F1EC;font-weight:500;">${escapeHtml(roleLabel)}</strong></p>`;
}

export function invitationReceivedMail(ctx: ApplicantMailContext) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const subject = "inner hub · talebin elimize ulaştı";
  const text = [
    `Merhaba ${name},`,
    "",
    "Talebin az önce elimize ulaştı — teşekkürler, zaman ayırdığın için.",
    "",
    "inner·hub davetiye usulüyle ilerliyor; her başvuruyu ekip olarak tek tek okuyoruz, otomatik onay yok. Bu da biraz zaman alabiliyor, ama her satırı gerçekten okuduğumuz anlamına geliyor.",
    "",
    "Şimdi ne olacak:",
    "1) Başvurun ekibe düştü, sırada inceleme bekliyor.",
    "2) Karar çıkınca — olumlu ya da olumsuz — yine bu adrese, bu e-postadan yazacağız.",
    "3) Onaylanırsa kişisel davet kodun ve panele kayıt adımları aynı iletide olacak.",
    "",
    "Şimdilik senden ek bir şey gerekmiyor. Aklına takılan olursa: support@inner.digital",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: "Talebin elimize ulaştı. İncelemeyi bitirince yine buradan yazacağız.",
    eyebrow: "Davetiye · alındı",
    title: `${name}, talebin elimizde.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, talebin az önce elimize ulaştı — zaman ayırdığın için teşekkürler.</p>
      <p style="margin:0 0 20px;">inner·hub davetiye usulüyle ilerliyor; her başvuruyu ekip olarak tek tek okuyoruz, otomatik onay yok. Bu biraz zaman alabilir, ama her satırın gerçekten okunduğu anlamına geliyor.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-collapse:separate;">
        <tr>
          <td style="width:22px;padding:0 10px 14px 0;vertical-align:top;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;color:#18FF85;">01</td>
          <td style="padding:0 0 14px;vertical-align:top;font-size:14px;color:rgba(244,241,236,0.72);">Başvurun ekibe düştü, sırada inceleme bekliyor.</td>
        </tr>
        <tr>
          <td style="width:22px;padding:0 10px 14px 0;vertical-align:top;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;color:#18FF85;">02</td>
          <td style="padding:0 0 14px;vertical-align:top;font-size:14px;color:rgba(244,241,236,0.72);">Karar çıkınca — olumlu ya da olumsuz — yine <strong style="color:#F4F1EC;font-weight:500;">bu e-postaya</strong> yazacağız.</td>
        </tr>
        <tr>
          <td style="width:22px;padding:0 10px 0 0;vertical-align:top;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;color:#18FF85;">03</td>
          <td style="padding:0;vertical-align:top;font-size:14px;color:rgba(244,241,236,0.72);">Onaylanırsa kişisel davet kodun ve panele kayıt adımları aynı iletide olacak.</td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:rgba(244,241,236,0.45);">Şimdilik ek bir şey gerekmiyor. Aklına takılan olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
      ${roleLine(ctx.roleLabel)}
    `,
    cta: { label: "inner.digital", href: appUrl },
    footerNote: "Bu ileti, yaptığın davet talebine yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "invite.received" as const };
}

export function invitationApprovedMail(ctx: ApplicantMailContext) {
  const appUrl = appBaseUrl();
  const setPasswordUrl = ctx.setPasswordUrl?.trim() || "";
  const inviteCode = ctx.inviteCode?.trim() || "";
  const panelUrl = setPasswordUrl
    ? setPasswordUrl
    : inviteCode
      ? `${appUrl}/panel?invite=${encodeURIComponent(inviteCode)}&email=${encodeURIComponent(ctx.email)}`
      : `${appUrl}/panel`;
  const name = firstName(ctx.name);
  const subject = setPasswordUrl
    ? "inner hub · hesabın hazır · şifreni belirle"
    : "inner hub · davetin onaylandı · panele gir";

  if (setPasswordUrl) {
    const text = [
      `Merhaba ${name},`,
      "",
      "Davet talebin onaylandı. Hesabın hazır.",
      "",
      "Şifreni belirlemek için bu bağlantıyı aç (7 gün geçerli):",
      setPasswordUrl,
      "",
      "Şifreyi belirledikten sonra e-posta + şifre ile panele girersin.",
      "Sorun: support@inner.digital",
      "",
      "inner hub",
      appUrl,
    ].join("\n");

    const html = renderInnerEmailLayout({
      appUrl,
      preheader: "Hesabın hazır. Şifreni belirle ve panele gir.",
      eyebrow: "Davetiye · hesap hazır",
      title: "Hesabın hazır.",
      bodyHtml: `
        <p style="margin:0 0 18px;">Merhaba ${escapeHtml(name)}, başvurun onaylandı. Üye hesabın oluşturuldu — şimdi şifreni belirlemen yeterli.</p>
        <p style="margin:0 0 8px;font-size:14px;color:rgba(244,241,236,0.72);">Sonraki adımlar:</p>
        <ol style="margin:0 0 16px;padding-left:18px;color:rgba(244,241,236,0.72);line-height:1.55;">
          <li style="margin:0 0 8px;">Aşağıdaki <strong style="color:#F4F1EC;font-weight:500;">Şifreyi belirle</strong> butonuna bas</li>
          <li style="margin:0 0 8px;">Yeni şifreni yaz (en az 8 karakter)</li>
          <li style="margin:0;">Panele gir — e-posta + şifre yeter</li>
        </ol>
        <p style="margin:0;font-size:13px;color:rgba(244,241,236,0.45);">Bağlantı 7 gün geçerlidir. Sorun: <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
        ${roleLine(ctx.roleLabel)}
      `,
      cta: { label: "Şifreyi belirle", href: setPasswordUrl },
      footerNote: "Bu ileti, davet talebinin onaylanması üzerine otomatik gönderildi.",
    });

    return { subject, text, html, kind: "invite.approved" as const };
  }

  const text = [
    `Merhaba ${name},`,
    "",
    "Davet talebin onaylandı. Çembere hoş geldin.",
    "",
    `Panele git (kayıt): ${panelUrl}`,
    inviteCode ? `Davet kodun: ${inviteCode}` : null,
    "",
    "1) Yukarıdaki linki aç — e-posta ve davet kodu otomatik dolu gelir",
    "2) Şifreni belirle, adını yaz",
    "3) Kayıt ol",
    "",
    "Kayıttan sonra girişlerde sadece e-posta ve şifre yeter; kod gerekmez.",
    "Link açılmazsa kodu elle girebilirsin. Sorun: support@inner.digital",
    "",
    "inner hub",
    appUrl,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const primaryCta = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr>
          <td style="border-radius:0;background:#18FF85;">
            <a href="${escapeHtml(panelUrl)}"
               style="display:inline-block;background:#18FF85;color:#0A0A0A;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:16px 28px;border:0;font-weight:600;">
              Panele git · kayıt ol&nbsp;&nbsp;↗
            </a>
          </td>
        </tr>
      </table>`;

  const codeHtml = inviteCode
    ? `
      ${primaryCta}
      <p style="margin:0 0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(244,241,236,0.45);">Davet kodun · tek kullanımlık</p>
      <p style="margin:0 0 20px;padding:16px 18px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:20px;letter-spacing:0.14em;color:#F4F1EC;">
        ${escapeHtml(inviteCode)}
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:rgba(244,241,236,0.72);">Sonraki adımlar:</p>
      <ol style="margin:0 0 16px;padding-left:18px;color:rgba(244,241,236,0.72);line-height:1.55;">
        <li style="margin:0 0 8px;">Yukarıdaki <strong style="color:#F4F1EC;font-weight:500;">Panele git</strong> butonuna bas — e-posta ve kod otomatik dolar</li>
        <li style="margin:0 0 8px;">Şifreni belirle, adını yaz</li>
        <li style="margin:0;">Kayıt ol, içeri gir</li>
      </ol>
      <p style="margin:0;font-size:13px;color:rgba(244,241,236,0.45);">Buton açılmazsa kodu elle girebilirsin. Kayıttan sonra girişlerde kod gerekmez. Sorun: <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
    `
    : `
      ${primaryCta}
      <p style="margin:0;">Panele gidip hesabını oluştur. Davet kodu için <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a> yaz.</p>
    `;

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: inviteCode
      ? `Davetin onaylandı. Panele git · kod: ${inviteCode}`
      : "Davetin onaylandı. Panele geçebilirsin.",
    eyebrow: "Davetiye · onay",
    title: "Çembere hoş geldin.",
    bodyHtml: `
      <p style="margin:0 0 18px;">Merhaba ${escapeHtml(name)}, başvurun onaylandı. inner·hub artık senin için açık.</p>
      ${codeHtml}
      ${roleLine(ctx.roleLabel)}
    `,
    cta: { label: "Panele git · kayıt ol", href: panelUrl },
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
  organizationDescription?: string | null;
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
    payload.organizationDescription ? `Kurum açıklaması: ${payload.organizationDescription}` : null,
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
      ${payload.organization ? `<p style="margin:0 0 8px;">Kurum: ${escapeHtml(payload.organization)}</p>` : ""}
      ${payload.organizationDescription ? `<p style="margin:0;color:#B8B4AC;">${escapeHtml(payload.organizationDescription)}</p>` : ""}
    `,
    cta: { label: "Başvuruları aç", href: requestsUrl },
    footerNote: "İç bildirim; yalnızca ekip adresine gider.",
  });

  return { subject, text, html, kind: "admin.new_request" as const };
}

export function passwordResetMail(ctx: { name: string; email: string; resetUrl: string }) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const subject = "inner hub · şifre sıfırlama";
  const text = [
    `Merhaba ${name},`,
    "",
    "Hesabın için şifre sıfırlama talebi aldık.",
    "",
    "Yeni şifreni belirlemek için bu bağlantıyı aç (1 saat geçerli):",
    ctx.resetUrl,
    "",
    "Bu talebi sen yapmadıysan bu iletiyi yok sayabilirsin. Şifren değişmez.",
    "",
    "inner hub",
    appUrl,
  ].join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: "Şifreni sıfırlamak için bağlantı · 1 saat geçerli.",
    eyebrow: "Hesap · şifre sıfırlama",
    title: `${name}, şifreni yenile.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, hesabın için şifre sıfırlama talebi aldık.</p>
      <p style="margin:0 0 12px;">Aşağıdaki düğmeyle yeni şifreni belirleyebilirsin. Bağlantı <strong style="color:#F4F1EC;font-weight:500;">1 saat</strong> geçerlidir.</p>
      <p style="margin:0;font-size:13px;color:rgba(244,241,236,0.45);">Bu talebi sen yapmadıysan bu iletiyi yok say. Şifren değişmez.</p>
    `,
    cta: { label: "Şifreyi sıfırla", href: ctx.resetUrl },
    footerNote: "Bu ileti, şifre sıfırlama talebine yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "auth.password_reset" as const };
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

function sectionLabel(label: string): string {
  return `<p style="margin:28px 0 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(244,241,236,0.45);">${escapeHtml(label)}</p>`;
}

function itemCard(title: string, meta: string, body: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;border-collapse:separate;">
      <tr>
        <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.03);">
          <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.3;color:#F4F1EC;">${escapeHtml(title)}</p>
          <p style="margin:0 0 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(244,241,236,0.45);">${escapeHtml(meta)}</p>
          <p style="margin:0;font-size:13px;line-height:1.55;color:rgba(244,241,236,0.72);">${escapeHtml(body)}</p>
        </td>
      </tr>
    </table>`;
}

export type DigestMatchItem = {
  name: string;
  company: string;
  matchType: string;
  score: number;
  why: string;
};

export type DigestEventItem = {
  title: string;
  when: string;
  location?: string | null;
};

export type DigestDealItem = {
  company: string;
  stage: string;
  note: string;
};

export function weeklyDigestMail(ctx: {
  name: string;
  matches: DigestMatchItem[];
  events: DigestEventItem[];
  deals: DigestDealItem[];
  unsubscribeUrl: string;
  weekLabel: string;
}) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const matchCount = ctx.matches.length;
  const subject = matchCount > 0 ? `inner hub · bu hafta · ${matchCount} eşleşme` : "inner hub · bu hafta";

  const matchHtml = ctx.matches.length
    ? sectionLabel("Eşleşmeler") +
      ctx.matches
        .map((m) =>
          itemCard(
            m.name,
            `${m.matchType} · %${m.score}${m.company ? ` · ${m.company}` : ""}`,
            m.why,
          ),
        )
        .join("")
    : "";

  const eventHtml = ctx.events.length
    ? sectionLabel("Takvim") +
      ctx.events
        .map((e) => itemCard(e.title, e.when, e.location?.trim() || "inner hub"))
        .join("")
    : "";

  const dealHtml = ctx.deals.length
    ? sectionLabel("Capital") +
      ctx.deals.map((d) => itemCard(d.company, d.stage, d.note)).join("")
    : "";

  const textLines = [
    `Merhaba ${name},`,
    "",
    `inner hub · ${ctx.weekLabel}`,
    "",
    ctx.matches.length
      ? [
          "Eşleşmeler",
          ...ctx.matches.map(
            (m) => `· ${m.name}${m.company ? ` (${m.company})` : ""} — ${m.matchType} · %${m.score}\n  ${m.why}`,
          ),
          "",
        ].join("\n")
      : "",
    ctx.events.length
      ? ["Takvim", ...ctx.events.map((e) => `· ${e.title} — ${e.when}${e.location ? ` · ${e.location}` : ""}`), ""].join(
          "\n",
        )
      : "",
    ctx.deals.length ? ["Capital", ...ctx.deals.map((d) => `· ${d.company} — ${d.stage}\n  ${d.note}`), ""].join("\n") : "",
    `Panel: ${appUrl}/panel`,
    `Abonelikten çık: ${ctx.unsubscribeUrl}`,
    "",
    "inner hub",
  ].filter(Boolean);

  const html = renderInnerEmailLayout({
    appUrl,
    preheader:
      matchCount > 0
        ? `Bu hafta ${matchCount} eşleşme ve çember notları.`
        : "Bu haftanın çember notları.",
    eyebrow: `Haftalık not · ${ctx.weekLabel}`,
    title: `${name}, bu hafta.`,
    bodyHtml: `
      <p style="margin:0 0 8px;">Çemberden seçilmiş, sana özel bir özet. Tek mail, Pazartesi.</p>
      ${matchHtml}${eventHtml}${dealHtml}
    `,
    cta: { label: "Panele git", href: `${appUrl}/panel` },
    footerNote: "Bu ileti, açık olan haftalık digest tercihine göre gönderildi.",
    unsubscribeUrl: ctx.unsubscribeUrl,
    physicalAddress: mailPhysicalAddress(),
  });

  return {
    subject,
    text: textLines.join("\n"),
    html,
    kind: "weekly.digest" as const,
    category: "lifecycle" as const,
    unsubscribeUrl: ctx.unsubscribeUrl,
  };
}

export function matchIntroReceivedMail(ctx: {
  name: string;
  targetName: string;
  matchType?: string | null;
}) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const subject = "inner hub · tanışma talebin alındı";
  const typeLine = ctx.matchType ? `Tür: ${ctx.matchType}` : null;
  const text = [
    `Merhaba ${name},`,
    "",
    `${ctx.targetName} için tanışma talebin inner ekibine iletildi.`,
    typeLine,
    "",
    "Kısa sürede dönüş yapılır. Durumu paneldeki Match sayfasından takip edebilirsin.",
    `${appUrl}/panel/match`,
    "",
    "inner hub",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: `${ctx.targetName} için talebin ekibe düştü.`,
    eyebrow: "Match · tanışma",
    title: "Talebin alındı.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, ${escapeHtml(ctx.targetName)} için tanışma talebin inner ekibine iletildi.</p>
      <p style="margin:0;">Warm intro sürecini ekip yürütür; senin ekstra bir adımın yok. Durum
      <a href="${escapeHtml(`${appUrl}/panel/match`)}" style="color:#F4F1EC;">Match</a> sayfasında görünür.</p>
    `,
    cta: { label: "Match'i aç", href: `${appUrl}/panel/match` },
    footerNote: "Bu ileti, yaptığın tanışma talebine yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "match.intro_received" as const };
}

export function matchIntroAdminMail(ctx: {
  fromName: string;
  fromEmail: string;
  targetName: string;
  targetCompany?: string | null;
  matchType?: string | null;
  reason?: string | null;
  score?: number | null;
}) {
  const appUrl = appBaseUrl();
  const subject = `inner hub · tanışma talebi: ${ctx.fromName} → ${ctx.targetName}`;
  const text = [
    `Gönderen: ${ctx.fromName} <${ctx.fromEmail}>`,
    `Hedef: ${ctx.targetName}${ctx.targetCompany ? ` · ${ctx.targetCompany}` : ""}`,
    ctx.matchType ? `Tür: ${ctx.matchType}` : null,
    ctx.score != null ? `Skor: ${ctx.score}` : null,
    ctx.reason ? `Gerekçe: ${ctx.reason}` : null,
    "",
    `${appUrl}/panel/applications`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: `${ctx.fromName} → ${ctx.targetName}`,
    eyebrow: "Admin · tanışma talebi",
    title: ctx.targetName,
    bodyHtml: `
      <p style="margin:0 0 8px;"><strong style="color:#F4F1EC;">${escapeHtml(ctx.fromName)}</strong> · ${escapeHtml(ctx.fromEmail)}</p>
      <p style="margin:0 0 12px;">${escapeHtml(ctx.targetName)}${ctx.targetCompany ? ` · ${escapeHtml(ctx.targetCompany)}` : ""}${ctx.matchType ? ` · ${escapeHtml(ctx.matchType)}` : ""}</p>
      ${ctx.reason ? `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(ctx.reason)}</p>` : ""}
    `,
    cta: { label: "Başvuruları aç", href: `${appUrl}/panel/applications` },
    footerNote: "İç bildirim; yalnızca ekip adresine gider.",
  });

  return { subject, text, html, kind: "match.intro_admin" as const };
}

export function eventRegisteredMail(ctx: {
  name: string;
  title: string;
  startsAt?: Date | null;
  location?: string | null;
  meetUrl?: string | null;
}) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const when = ctx.startsAt
    ? ctx.startsAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
    : null;
  const subject = `inner hub · kaydın alındı · ${ctx.title}`;
  const text = [
    `Merhaba ${name},`,
    "",
    `${ctx.title} kaydın alındı.`,
    when ? `Tarih: ${when}` : null,
    ctx.location ? `Yer: ${ctx.location}` : null,
    ctx.meetUrl ? `Katılım: ${ctx.meetUrl}` : `Panel: ${appUrl}/panel/events`,
    "",
    "inner hub",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: `${ctx.title} kaydın alındı.`,
    eyebrow: "Etkinlik · kayıt",
    title: ctx.title,
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, kaydın alındı.</p>
      ${when ? `<p style="margin:0 0 8px;">Tarih: <strong style="color:#F4F1EC;font-weight:500;">${escapeHtml(when)}</strong></p>` : ""}
      ${ctx.location ? `<p style="margin:0;">Yer: ${escapeHtml(ctx.location)}</p>` : ""}
    `,
    cta: {
      label: ctx.meetUrl ? "Katılım linki" : "Etkinlikler",
      href: ctx.meetUrl || `${appUrl}/panel/events`,
    },
    footerNote: "Bu ileti, etkinlik kaydına yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "event.registered" as const };
}

export function courseEnrolledMail(ctx: {
  name: string;
  title: string;
  startsAt?: Date | null;
  meetUrl?: string | null;
}) {
  const appUrl = appBaseUrl();
  const name = firstName(ctx.name);
  const when = ctx.startsAt
    ? ctx.startsAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
    : null;
  const subject = `inner hub · kurs kaydın alındı · ${ctx.title}`;
  const text = [
    `Merhaba ${name},`,
    "",
    `${ctx.title} kursuna kaydın tamamlandı.`,
    when ? `Canlı oturum: ${when}` : null,
    `${appUrl}/panel/courses`,
    "",
    "inner hub",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderInnerEmailLayout({
    appUrl,
    preheader: `${ctx.title} kaydın tamamlandı.`,
    eyebrow: "Kurs · kayıt",
    title: ctx.title,
    bodyHtml: `
      <p style="margin:0 0 12px;">Merhaba ${escapeHtml(name)}, ${escapeHtml(ctx.title)} kursuna kaydın tamamlandı.</p>
      ${when ? `<p style="margin:0;">Canlı oturum: <strong style="color:#F4F1EC;font-weight:500;">${escapeHtml(when)}</strong></p>` : `<p style="margin:0;">İçerik panele düştü; dilediğin zaman açabilirsin.</p>`}
    `,
    cta: { label: "Kursa git", href: `${appUrl}/panel/courses` },
    footerNote: "Bu ileti, kurs kaydına yanıt olarak otomatik gönderildi.",
  });

  return { subject, text, html, kind: "course.enrolled" as const };
}
