import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../inner-hub/public/mail-preview");

const INK = "#0A0A0A";
const INK_DEEP = "#050505";
const ATMOSPHERE = "#0B100E";
const GLASS = "#121614";
const BONE = "#F4F1EC";
const GREEN = "#18FF85";
const MUTED = "rgba(244,241,236,0.55)";
const FAINT = "rgba(244,241,236,0.35)";
const LINE = "rgba(255,255,255,0.12)";
const LINE_SOFT = "rgba(255,255,255,0.08)";
const HIGHLIGHT = "rgba(255,255,255,0.14)";
const APP = "https://inner.digital";

function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout({ preheader, eyebrow, title, bodyHtml, cta, footerNote }) {
  const banner = `${APP}/posters/perks-ambient.jpg`;
  const ctaBlock = cta
    ? `<tr><td style="padding:28px 0 4px;"><a href="${esc(cta.href)}" style="display:inline-block;background:${BONE};color:${INK};font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.08em;text-decoration:none;padding:14px 22px;">${esc(cta.label)}&nbsp;&nbsp;↗</a></td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="dark only"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${INK_DEEP};color:${BONE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK_DEEP};"><tr>
<td align="center" style="padding:40px 16px;background:${ATMOSPHERE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
<tr><td align="center" style="padding:0 0 18px;"><table cellpadding="0" cellspacing="0"><tr><td style="width:120px;height:2px;background-color:${GREEN};opacity:0.35;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:${GLASS};border:1px solid ${LINE};border-collapse:separate;">
<tr><td style="height:1px;line-height:1px;font-size:0;background:${HIGHLIGHT};">&nbsp;</td></tr>
<tr><td style="padding:26px 28px 18px;border-bottom:1px solid ${LINE_SOFT};">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-family:Georgia,serif;font-size:26px;color:${BONE};">inner<span style="display:inline-block;width:9px;height:9px;background:${GREEN};margin:0 3px 2px;vertical-align:middle;"></span>hub</td>
<td align="right" style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">private circle</td>
</tr></table></td></tr>
<tr><td style="padding:0;line-height:0;font-size:0;border-bottom:1px solid ${LINE_SOFT};">
<a href="${APP}" style="display:block;text-decoration:none;">
<img src="${banner}" width="560" alt="inner hub" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none;" />
</a>
</td></tr>
<tr><td style="padding:32px 28px 36px;background:${GLASS};">
<p style="margin:0 0 14px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">${esc(eyebrow)}</p>
<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:32px;line-height:1.15;font-weight:400;font-style:italic;color:${BONE};">${esc(title)}</h1>
<div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${MUTED};">${bodyHtml}</div>
${ctaBlock}
</td></tr>
<tr><td style="padding:18px 28px 24px;border-top:1px solid ${LINE_SOFT};background:#101310;">
<p style="margin:0 0 10px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${FAINT};">${esc(footerNote)}</p>
<p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.04em;color:${FAINT};">
<a href="${APP}" style="color:${BONE};text-decoration:none;text-transform:none;">inner.digital</a> · <a href="mailto:support@inner.digital" style="color:${MUTED};text-decoration:none;text-transform:none;">support@inner.digital</a>
</p></td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:20px 8px 0;"><p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${FAINT};">İstanbul → Global</p></td></tr>
</table>
</td></tr></table></body></html>`;
}

const previews = [
  {
    id: "01-received",
    kind: "invite.received",
    subject: "inner hub · davet talebin alındı",
    html: layout({
      preheader: "Davet talebin alındı. Ekibimiz kısa süre içinde dönüş yapacak.",
      eyebrow: "Davetiye · alındı",
      title: "Ata, talebin bizde.",
      bodyHtml: `<p style="margin:0 0 12px;">Davet talebin başarıyla kayda geçti. inner·hub davetiye ile ilerler; her başvuruyu tek tek okuyoruz.</p><p style="margin:0;">İnceleme tamamlanınca bu adrese yazılı olarak haber vereceğiz. Bu arada ek bir adım gerekmiyor.</p><p style="margin:16px 0 0;">Başvuru kapısı: <strong style="color:#F4F1EC;font-weight:500;">Girişimci</strong></p>`,
      cta: { label: "inner.digital", href: APP },
      footerNote: "Bu ileti, yaptığın davet talebine yanıt olarak otomatik gönderildi.",
    }),
  },
  {
    id: "02-approved",
    kind: "invite.approved",
    subject: "inner hub · davetin onaylandı",
    html: layout({
      preheader: "Davetin onaylandı. Panele geçebilirsin.",
      eyebrow: "Davetiye · onay",
      title: "Çembere hoş geldin.",
      bodyHtml: `<p style="margin:0 0 12px;">Merhaba Ata, başvurun onaylandı. inner·hub artık senin için açık.</p>
      <p style="margin:0 0 12px;">Panele gidip <strong style="color:#F4F1EC;font-weight:500;">bu başvurudaki e-posta</strong> ile kayıt ol. Davet kodun:</p>
      <p style="margin:0 0 16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);font-family:ui-monospace,Menlo,monospace;font-size:18px;letter-spacing:0.12em;color:#F4F1EC;">K7MP-3Q9R</p>
      <p style="margin:0 0 12px;font-size:13px;color:rgba(244,241,236,0.45);">Kod sana özel ve tek kullanımlık. Kayıttan sonra girişlerde gerekmez. Sorun olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>
      <p style="margin:16px 0 0;">Başvuru kapısı: <strong style="color:#F4F1EC;font-weight:500;">Girişimci</strong></p>`,
      cta: { label: "Panele git", href: `${APP}/panel` },
      footerNote: "Bu ileti, davet talebinin onaylanması üzerine otomatik gönderildi.",
    }),
  },
  {
    id: "03-rejected",
    kind: "invite.rejected",
    subject: "inner hub · davet talebi hakkında",
    html: layout({
      preheader: "Bu turda talebini olumlu sonuçlandıramadık.",
      eyebrow: "Davetiye · bilgilendirme",
      title: "Bu turda yer açamadık.",
      bodyHtml: `<p style="margin:0 0 12px;">Merhaba Ata. Başvurunu dikkatle okuduk; bu dönemde çembere yeni bir yer açamıyoruz.</p><p style="margin:0;">Bu karar nihai bir yasak değil; inner·hub bilerek yavaş büyür. İleride yeniden yazabilirsin. Sorun olursa <a href="mailto:support@inner.digital" style="color:#F4F1EC;">support@inner.digital</a>.</p>`,
      cta: { label: "inner.digital", href: APP },
      footerNote: "Bu ileti, davet talebinin sonucu hakkında otomatik gönderildi.",
    }),
  },
  {
    id: "04-admin-new",
    kind: "admin.new_request",
    subject: "inner hub · yeni üyelik talebi: Ata Han",
    html: layout({
      preheader: "Yeni talep: Ata Han",
      eyebrow: "Admin · yeni talep",
      title: "Ata Han",
      bodyHtml: `<p style="margin:0 0 8px;"><strong style="color:#F4F1EC;">ata@example.com</strong></p><p style="margin:0 0 16px;">Kapı: Girişimci</p><p style="margin:0 0 12px;">AI ve topluluk kesişiminde çalışıyorum. Çembere erken girmek istiyorum.</p><p style="margin:0;">Kurum: inner</p>`,
      cta: { label: "Başvuruları aç", href: `${APP}/requests` },
      footerNote: "İç bildirim; yalnızca ekip adresine gider.",
    }),
  },
];

mkdirSync(outDir, { recursive: true });
for (const p of previews) writeFileSync(join(outDir, `${p.id}.html`), p.html);

const index = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>inner hub · mail preview</title>
<style>
:root{color-scheme:dark}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#050505;color:#F4F1EC}
header{padding:28px 24px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
h1{margin:0;font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:28px}
p{margin:8px 0 0;color:rgba(244,241,236,.5);font-size:14px}
.grid{display:grid;gap:16px;padding:24px;max-width:1100px;margin:0 auto}
a.card{display:block;border:1px solid rgba(255,255,255,.12);background:#121614;padding:18px 20px;text-decoration:none;color:inherit;box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}
a.card:hover{border-color:rgba(255,255,255,.28)}
.kind{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,241,236,.4)}
.subj{margin-top:8px;font-size:16px}
.dot{display:inline-block;width:8px;height:8px;background:#18FF85;margin-right:8px;vertical-align:middle}
</style></head><body>
<header><h1><span class="dot"></span>inner hub · mail preview</h1>
<p>Glass kart şablonları. Tıklayınca HTML önizleme açılır.</p></header>
<div class="grid">
${previews.map((p) => `<a class="card" href="./${p.id}.html"><div class="kind">${p.kind}</div><div class="subj">${p.subject}</div></a>`).join("")}
</div></body></html>`;

writeFileSync(join(outDir, "index.html"), index);
console.log("Wrote", outDir);
