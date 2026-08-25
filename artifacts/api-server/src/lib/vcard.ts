/** Minimal vCard 3.0 builder (no phone unless explicitly allowed). */

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function absUrl(raw: string | null | undefined, kind?: "linkedin" | "github" | "website" | "instagram" | "twitter"): string | null {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === "linkedin") return `https://linkedin.com/in/${v.replace(/^\/+/, "")}`;
  if (kind === "github") return `https://github.com/${v.replace(/^\/+/, "")}`;
  if (kind === "instagram") return `https://instagram.com/${v.replace(/^@/, "").replace(/^\/+/, "")}`;
  if (kind === "twitter") return `https://x.com/${v.replace(/^@/, "").replace(/^\/+/, "")}`;
  return `https://${v.replace(/^\/+/, "")}`;
}

export type VCardInput = {
  name: string;
  handle: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  photoUrl?: string | null;
  profileUrl: string;
  phone?: string | null;
};

export function buildVCard(input: VCardInput): string {
  const parts = input.name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? input.name;
  const last = parts.slice(1).join(" ");
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(input.name)}`,
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
  ];

  if (input.company?.trim()) lines.push(`ORG:${escapeVCard(input.company.trim())}`);
  if (input.title?.trim()) lines.push(`TITLE:${escapeVCard(input.title.trim())}`);
  if (input.phone?.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCard(input.phone.trim())}`);

  lines.push(`URL:${escapeVCard(input.profileUrl)}`);
  const extras = [
    absUrl(input.website, "website"),
    absUrl(input.linkedin, "linkedin"),
    absUrl(input.github, "github"),
    absUrl(input.twitter, "twitter"),
    absUrl(input.instagram, "instagram"),
  ].filter((u): u is string => Boolean(u));
  for (const u of extras) {
    if (u !== input.profileUrl) lines.push(`URL:${escapeVCard(u)}`);
  }

  if (input.bio?.trim()) lines.push(`NOTE:${escapeVCard(input.bio.trim().slice(0, 500))}`);
  if (input.photoUrl?.trim() && /^https?:\/\//i.test(input.photoUrl.trim())) {
    lines.push(`PHOTO;VALUE=URI:${escapeVCard(input.photoUrl.trim())}`);
  }

  lines.push(`X-SOCIALPROFILE;TYPE=innerhub:${escapeVCard(input.profileUrl)}`);
  lines.push("END:VCARD");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
