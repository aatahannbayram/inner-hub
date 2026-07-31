import dns from "node:dns/promises";
import net from "node:net";
import { resolveAndCacheOrgLogo } from "./orgLogo";

/** SSRF guard: reddedilecek özel/loopback/link-local aralıklar. */
function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === undefined || b === undefined) return true;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7));
    return false;
  }
  return true;
}

async function assertPublicHost(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Özel adreslere erişim engellendi");
    return;
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) throw new Error("Host çözümlenemedi");
  for (const r of records) {
    if (isPrivateIp(r.address)) throw new Error("Özel adreslere erişim engellendi");
  }
}

function decodeEntities(s: string): string {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function extractMeta(html: string, prop: "name" | "property", key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+${prop}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${prop}=["']${key}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1]) : null;
}

function extractIconHref(html: string): string | null {
  const patterns = [
    /<link[^>]+rel=["'](?:apple-touch-icon(?:-precomposed)?|icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:apple-touch-icon(?:-precomposed)?|icon|shortcut icon)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return null;
}

/** Yanıt gövdesini text/html ise en fazla `maxBytes` kadar okur, sonra keser. */
async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let out = "";
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    out += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return out;
}

export type LinkPreview = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

/** Kullanıcı tarafından verilen bir URL'den başlık/açıklama/görsel çeker. SSRF korumalı, yönlendirmeleri elle takip eder. */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview> {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    throw new Error("Geçersiz URL");
  }

  let html = "";
  for (let hop = 0; hop < 4; hop++) {
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      throw new Error("Sadece http/https desteklenir");
    }
    await assertPublicHost(target.hostname);

    const res = await fetch(target, {
      signal: AbortSignal.timeout(9000),
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; inner-hub-link-preview/1.0; +https://inner.digital)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      target = new URL(loc, target);
      continue;
    }
    if (!res.ok) throw new Error(`Site yanıt vermedi (${res.status})`);
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) throw new Error("HTML içerik bulunamadı");
    html = await readCapped(res, 300_000);
    break;
  }

  const title =
    extractMeta(html, "property", "og:title") ??
    extractMeta(html, "name", "twitter:title") ??
    extractTitle(html);
  const description =
    extractMeta(html, "property", "og:description") ??
    extractMeta(html, "name", "twitter:description") ??
    extractMeta(html, "name", "description");
  let image =
    extractMeta(html, "property", "og:image") ?? extractMeta(html, "name", "twitter:image");
  if (image) {
    try {
      image = new URL(image, target).toString();
    } catch {
      image = null;
    }
  }
  if (!image) {
    const iconHref = extractIconHref(html);
    if (iconHref) {
      try {
        image = new URL(iconHref, target).toString();
      } catch {
        image = null;
      }
    }
  }
  if (!image) {
    const logo = await resolveAndCacheOrgLogo(target.hostname).catch(() => null);
    image = logo?.logoPath ?? null;
  }

  return {
    title: title?.slice(0, 200) ?? null,
    description: description?.slice(0, 500) ?? null,
    image,
    siteName: extractMeta(html, "property", "og:site_name")?.slice(0, 120) ?? null,
  };
}
