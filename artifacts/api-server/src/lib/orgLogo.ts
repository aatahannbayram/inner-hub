import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";
import { ensureOrgLogoCacheSchema } from "./ensureSchema";

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

async function fetchLogoBytes(domain: string): Promise<{ buf: Buffer; contentType: string } | null> {
  // logo.clearbit.com kalıcı olarak DNS çözümlenmiyor (servis kapandı) — aday listesinden çıkarıldı.
  const candidates = [
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
      const ct = (res.headers.get("content-type") ?? "image/png").split(";")[0]?.trim() || "image/png";
      if (ct.includes("text/html")) continue;
      const ab = await res.arrayBuffer();
      if (ab.byteLength < 80 || ab.byteLength > 2_000_000) continue;
      return { buf: Buffer.from(ab), contentType: ct };
    } catch (err) {
      logger.debug({ err, url }, "org logo candidate failed");
    }
  }
  return null;
}

/**
 * Kurum logosunu getirir + DB'de base64 data URL olarak önbelleğe alır.
 * Yerel diske yazmıyoruz: Hostinger paylaşımsız disklere sahip birden fazla
 * worker çalıştırabiliyor, bu da "yaz başarılı ama farklı worker'da oku 404"
 * durumuna yol açıyordu. DB tüm worker'lar arasında paylaşılan tek kaynak.
 */
export async function resolveAndCacheOrgLogo(
  domainRaw: string | null | undefined,
): Promise<{ domain: string; logoPath: string } | null> {
  const domain = normalizeDomain(domainRaw);
  if (!domain) return null;

  await ensureOrgLogoCacheSchema();

  const cached = await db.execute(
    sql`SELECT data_url FROM org_logo_cache WHERE domain = ${domain} LIMIT 1`,
  );
  const cachedRow = cached.rows[0] as { data_url: string | null } | undefined;
  if (cachedRow?.data_url) {
    return { domain, logoPath: cachedRow.data_url };
  }

  const fetched = await fetchLogoBytes(domain);
  if (!fetched) return null; // Bulunamadı — kalıcı olarak önbelleğe alma, sonraki istekte tekrar dene.

  const dataUrl = `data:${fetched.contentType};base64,${fetched.buf.toString("base64")}`;
  await db.execute(sql`
    INSERT INTO org_logo_cache (domain, data_url, fetched_at)
    VALUES (${domain}, ${dataUrl}, now())
    ON CONFLICT (domain) DO UPDATE SET data_url = EXCLUDED.data_url, fetched_at = now()
  `);

  return { domain, logoPath: dataUrl };
}
