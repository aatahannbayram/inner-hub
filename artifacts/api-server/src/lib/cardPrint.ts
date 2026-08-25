import { encode } from "./uqr.mjs";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function qrModulesPath(
  text: string,
  originX: number,
  originY: number,
  boxSize: number,
): string {
  const result = encode(text, { ecc: "M", border: 1 });
  const cell = boxSize / result.size;
  const parts: string[] = [];
  for (let row = 0; row < result.size; row++) {
    for (let col = 0; col < result.size; col++) {
      if (!result.data[row][col]) continue;
      const x = +(originX + col * cell).toFixed(2);
      const y = +(originY + row * cell).toFixed(2);
      const s = +cell.toFixed(2);
      parts.push(`M${x},${y}h${s}v${s}h-${s}z`);
    }
  }
  return parts.join("");
}

export type PrintCardInput = {
  name: string;
  handle: string;
  title?: string | null;
  company?: string | null;
  profileUrl: string;
};

/** Business-card front · 85×55mm (ISO 7810 ID-1-ish). */
export function renderCardFrontSvg(input: PrintCardInput): string {
  const name = escapeXml(input.name.slice(0, 42));
  const handle = escapeXml(`@${input.handle}`);
  const line2 = escapeXml(
    [input.title, input.company].filter(Boolean).join(" · ").slice(0, 56) || "inner·hub member",
  );
  const qr = qrModulesPath(input.profileUrl, 248, 48, 72);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="55mm" viewBox="0 0 340 220" role="img" aria-label="inner·id card front">
  <rect width="340" height="220" fill="#0A0A0A"/>
  <rect x="0" y="0" width="6" height="220" fill="#18FF85"/>
  <text x="24" y="36" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="0.18em" fill="rgba(244,241,236,0.45)">INNER·ID</text>
  <text x="24" y="88" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="600" fill="#F4F1EC">${name}</text>
  <text x="24" y="116" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="rgba(244,241,236,0.55)">${handle}</text>
  <text x="24" y="140" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="rgba(244,241,236,0.4)">${line2}</text>
  <rect x="244" y="44" width="80" height="80" fill="#F4F1EC"/>
  <path fill="#0A0A0A" d="${qr}"/>
  <text x="24" y="198" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" fill="rgba(244,241,236,0.35)">inner.digital</text>
</svg>`;
}

/** Business-card back — handle + short URL for NFC/print. */
export function renderCardBackSvg(input: PrintCardInput): string {
  const handle = escapeXml(`@${input.handle}`);
  const shortUrl = escapeXml(`inner.digital/@${input.handle}`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="55mm" viewBox="0 0 340 220" role="img" aria-label="inner·id card back">
  <rect width="340" height="220" fill="#F4F1EC"/>
  <rect x="334" y="0" width="6" height="220" fill="#18FF85"/>
  <text x="170" y="88" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="600" fill="#0A0A0A">${handle}</text>
  <text x="170" y="122" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" fill="rgba(10,10,10,0.45)">${shortUrl}</text>
  <text x="170" y="188" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" letter-spacing="0.2em" fill="rgba(10,10,10,0.3)">INNER·HUB</text>
</svg>`;
}

/** Compact embeddable mini-card (~320×96). */
export function renderMiniCardSvg(input: PrintCardInput & { avatarUrl?: string | null }): string {
  const name = escapeXml(input.name.slice(0, 28));
  const handle = escapeXml(`@${input.handle}`);
  const line2 = escapeXml(
    [input.title, input.company].filter(Boolean).join(" · ").slice(0, 40) || "inner·hub",
  );
  const href = escapeXml(input.profileUrl);
  const avatar = input.avatarUrl?.startsWith("https://")
    ? `<image href="${escapeXml(input.avatarUrl)}" x="16" y="20" width="56" height="56" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="16" y="20" width="56" height="56" fill="#E8E4DC"/><text x="44" y="54" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#0A0A0A">${escapeXml(input.name.slice(0, 1))}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="320" height="96" viewBox="0 0 320 96" role="img" aria-label="${name} · inner·id">
  <a href="${href}" target="_blank" rel="noopener">
    <rect width="320" height="96" fill="#0A0A0A"/>
    <rect x="0" y="0" width="4" height="96" fill="#18FF85"/>
    ${avatar}
    <text x="86" y="38" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="600" fill="#F4F1EC">${name}</text>
    <text x="86" y="58" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="rgba(244,241,236,0.55)">${handle}</text>
    <text x="86" y="76" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" fill="rgba(244,241,236,0.35)">${line2}</text>
  </a>
</svg>`;
}
