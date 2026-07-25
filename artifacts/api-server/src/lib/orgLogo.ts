import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger";

const LOGO_DIR =
  process.env.ORG_LOGO_DIR || path.resolve(process.cwd(), "data/org-logos");

const CONSUMER_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.com.tr",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "yandex.ru",
  "mail.com",
]);

/** Normalize user input into a bare hostname. */
export function normalizeDomain(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.trim().toLowerCase();
  if (!d) return null;
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
  d = d.replace(/:\d+$/, "");
  if (!d || !d.includes(".") || /\s/.test(d)) return null;
  return d;
}

export function domainFromEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain || CONSUMER_DOMAINS.has(domain)) return null;
  return domain;
}

function safeFileStem(domain: string): string {
  return domain.replace(/[^a-z0-9.-]/gi, "_").slice(0, 120);
}

async function fetchLogoBytes(domain: string): Promise<{ buf: Buffer; ext: string } | null> {
  const candidates = [
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "inner-hub-logo-resolver/1.0" },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("text/html")) continue;
      const ab = await res.arrayBuffer();
      if (ab.byteLength < 80 || ab.byteLength > 2_000_000) continue;
      const ext = ct.includes("png")
        ? "png"
        : ct.includes("jpeg") || ct.includes("jpg")
          ? "jpg"
          : ct.includes("svg")
            ? "svg"
            : ct.includes("webp")
              ? "webp"
              : ct.includes("icon")
                ? "ico"
                : "png";
      return { buf: Buffer.from(ab), ext };
    } catch (err) {
      logger.debug({ err, url }, "org logo candidate failed");
    }
  }
  return null;
}

/**
 * Download + cache org logo. Returns public API path or null.
 */
export async function resolveAndCacheOrgLogo(
  domainRaw: string | null | undefined,
): Promise<{ domain: string; logoPath: string } | null> {
  const domain = normalizeDomain(domainRaw);
  if (!domain) return null;

  await fs.mkdir(LOGO_DIR, { recursive: true });
  const stem = safeFileStem(domain);

  // Reuse existing cache
  const existing = await fs.readdir(LOGO_DIR).catch(() => [] as string[]);
  const hit = existing.find((f) => f.startsWith(`${stem}.`));
  if (hit) {
    return { domain, logoPath: `/api/org-logos/${hit}` };
  }

  const fetched = await fetchLogoBytes(domain);
  if (!fetched) return null;

  const filename = `${stem}.${fetched.ext}`;
  const full = path.join(LOGO_DIR, filename);
  await fs.writeFile(full, fetched.buf);
  return { domain, logoPath: `/api/org-logos/${filename}` };
}

export function orgLogoDir() {
  return LOGO_DIR;
}
