import { useEffect } from "react";

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

const SITE = "https://inner.digital";

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
    const canonical = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta(
      "property",
      "og:type",
      type === "article" ? "article" : type === "video.other" ? "video.other" : "website",
    );
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);

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
