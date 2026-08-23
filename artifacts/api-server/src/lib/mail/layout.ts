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

/** Self-hosted strip — perks ambient. Live on prod. */
const MAIL_BANNER_PATH = "/posters/perks-ambient.jpg";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName.trim() || "Merhaba";
}

type LayoutInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
  appUrl: string;
  /** Optional override; default `${appUrl}/mail/banner.jpg`. Pass null to hide. */
  bannerUrl?: string | null;
  /** Lifecycle maillerinde List-Unsubscribe ile aynı URL */
  unsubscribeUrl?: string;
  physicalAddress?: string;
};

/**
 * Table-based, inline-CSS layout — email client safe.
 * “Glass” is simulated (no backdrop-filter): dark atmosphere,
 * frosted card surface, inset highlight, soft green wash.
 * One small self-hosted banner image (not embedded video).
 */
export function renderInnerEmailLayout(input: LayoutInput): string {
  const {
    preheader,
    eyebrow,
    title,
    bodyHtml,
    cta,
    footerNote = "Bu ileti inner·hub başvuru sürecinle ilgili otomatik bir bilgilendirmedir.",
    appUrl,
    bannerUrl,
    unsubscribeUrl,
    physicalAddress,
  } = input;

  const imageSrc =
    bannerUrl === null
      ? null
      : escapeHtml(bannerUrl ?? `${appUrl.replace(/\/$/, "")}${MAIL_BANNER_PATH}`);

  const bannerBlock = imageSrc
    ? `
                <tr>
                  <td style="padding:0;line-height:0;font-size:0;border-bottom:1px solid ${LINE_SOFT};">
                    <a href="${escapeHtml(appUrl)}" style="display:block;text-decoration:none;">
                      <img src="${imageSrc}"
                           width="560"
                           alt="inner hub"
                           style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </a>
                  </td>
                </tr>`
    : "";

  const ctaBlock = cta
    ? `
      <tr>
        <td style="padding:28px 0 4px;">
          <a href="${escapeHtml(cta.href)}"
             style="display:inline-block;background:${BONE};color:${INK};font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-decoration:none;padding:14px 22px;border:0;">
            ${escapeHtml(cta.label)}&nbsp;&nbsp;↗
          </a>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${INK_DEEP};color:${BONE};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK_DEEP};">
    <tr>
      <td align="center" style="padding:40px 16px;background:${ATMOSPHERE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
          <tr>
            <td align="center" style="padding:0 0 18px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:120px;height:2px;background-color:${GREEN};opacity:0.35;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="max-width:560px;margin:0 auto;background:${GLASS};border:1px solid ${LINE};border-collapse:separate;">
                <tr>
                  <td style="height:1px;line-height:1px;font-size:0;background:${HIGHLIGHT};">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:26px 28px 18px;border-bottom:1px solid ${LINE_SOFT};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1;color:${BONE};">
                          inner<span style="display:inline-block;width:9px;height:9px;background:${GREEN};margin:0 3px 2px;vertical-align:middle;"></span>hub
                        </td>
                        <td align="right" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">
                          private circle
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${bannerBlock}
                <tr>
                  <td style="padding:32px 28px 36px;background:${GLASS};">
                    <p style="margin:0 0 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">
                      ${escapeHtml(eyebrow)}
                    </p>
                    <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;font-weight:400;font-style:italic;color:${BONE};">
                      ${escapeHtml(title)}
                    </h1>
                    <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${MUTED};">
                      ${bodyHtml}
                    </div>
                    ${ctaBlock}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 24px;border-top:1px solid ${LINE_SOFT};background:#101310;">
                    <p style="margin:0 0 10px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${FAINT};">
                      ${escapeHtml(footerNote)}
                    </p>
                    <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;letter-spacing:0.04em;color:${FAINT};">
                      <a href="${escapeHtml(appUrl)}" style="color:${BONE};text-decoration:none;text-transform:none;">inner.digital</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:support@inner.digital" style="color:${MUTED};text-decoration:none;text-transform:none;">support@inner.digital</a>
                    </p>
                    ${
                      unsubscribeUrl
                        ? `<p style="margin:12px 0 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:${FAINT};">
                      Haftalık özetlerden çıkmak için
                      <a href="${escapeHtml(unsubscribeUrl)}" style="color:${BONE};text-decoration:underline;">aboneliği durdur</a>.
                      ${physicalAddress ? `<br/>${escapeHtml(physicalAddress)}` : ""}
                    </p>`
                        : physicalAddress
                          ? `<p style="margin:12px 0 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.45;color:${FAINT};">${escapeHtml(physicalAddress)}</p>`
                          : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 8px 0;">
              <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${FAINT};">
                İstanbul → Global
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
