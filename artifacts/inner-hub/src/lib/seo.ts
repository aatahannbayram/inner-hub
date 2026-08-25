import { useEffect } from "react";
import { localizedPath, stripLocalePrefix } from "@/i18n/localePath";

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  type?: "website" | "article" | "video.other";
  jsonLd?: JsonLd;
  noIndex?: boolean;
};

export const SITE = "https://inner.digital";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#org`,
    name: "inner.hub",
    legalName: "inner hub",
    alternateName: ["inner hub", "inner.digital"],
    url: SITE,
    logo: `${SITE}/inner-og.png`,
    image: `${SITE}/inner-og.png`,
    email: "support@inner.digital",
    description:
      "İstanbul merkezli davetli kurucu, mühendis ve yatırımcı ağı. innerdigital.com IT/pazarlama şirketinden bağımsızdır.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
    areaServed: ["TR", "Worldwide"],
    knowsAbout: [
      "founder network",
      "invite-only membership",
      "AI founders",
      "angel investors",
      "closed circle",
    ],
  };
}

export function websiteJsonLd(locale: "tr" | "en", description: string) {
  const url = locale === "en" ? `${SITE}/en` : SITE;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: "inner.hub",
    alternateName: ["inner hub", "inner.digital"],
    url,
    inLanguage: locale === "en" ? "en" : "tr",
    description,
    publisher: { "@id": `${SITE}/#org` },
  };
}

export function faqPageJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertHreflang(hreflang: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "alternate";
    el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: JsonLd) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function toAbsolute(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** Client-side SEO/AEO head - prerender + SPA route değişimleri için. */
export function useSeo({
  title,
  description,
  canonicalPath,
  ogImage = "https://inner.digital/inner-og.png",
  type = "website",
  jsonLd,
  noIndex = false,
}: SeoProps) {
  const json = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title.includes("inner") ? title : `${title} · inner.hub`;
    const canonical = toAbsolute(canonicalPath);
    const bare = stripLocalePrefix(
      canonicalPath.startsWith("http")
        ? new URL(canonicalPath).pathname
        : canonicalPath.startsWith("/")
          ? canonicalPath
          : `/${canonicalPath}`,
    );
    const trUrl = toAbsolute(localizedPath(bare, "tr"));
    const enUrl = toAbsolute(localizedPath(bare, "en"));

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    upsertLink("canonical", canonical);

    upsertHreflang("tr", trUrl);
    upsertHreflang("en", enUrl);
    upsertHreflang("x-default", trUrl);

    upsertMeta("property", "og:site_name", "inner.hub");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta(
      "property",
      "og:type",
      type === "article" ? "article" : type === "video.other" ? "video.other" : "website",
    );
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:locale", canonical.includes("/en") ? "en_US" : "tr_TR");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    if (json) upsertJsonLd("ih-jsonld", JSON.parse(json) as JsonLd);
  }, [title, description, canonicalPath, ogImage, type, json, noIndex]);
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE}${item.path}`,
    })),
  };
}
