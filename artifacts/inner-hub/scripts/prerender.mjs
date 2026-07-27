import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const templatePath = path.join(root, "dist/index.html");
const serverEntryPath = path.join(root, "dist/server/entry-server.js");

const template = await readFile(templatePath, "utf-8");
const { render } = await import(serverEntryPath);

/** Artifact SEO shell - keep in sync with src/content/artifacts */
const ARTIFACTS = [
  {
    slug: "inner-hub-neden-davetiye",
    title: "Neden davetiye ile giriş? · inner.hub",
    description:
      "inner.hub neden açık başvuru değil de davetiye kullanır? Kapalı çember, erken sinyal ve güven temelli üyelik.",
    type: "article",
    ogImage: "https://inner.digital/posters/gathering.jpg",
    publishedAt: "2026-07-20",
    answer:
      "inner.hub davetiye ile girilir çünkü çember kalabalık değil uyum ister. Üyeler içeriden önerilir, özenle değerlendirilir ve kişisel olarak davet edilir.",
  },
  {
    slug: "istanbul-gathering-2026",
    title: "İstanbul gathering · Eylül 2026 · inner.hub",
    description:
      "İlk inner.hub buluşması: otuz dört kişi, iki gün, bir çember. İstanbul, Eylül 2026 kısa video özeti.",
    type: "video.other",
    ogImage: "https://inner.digital/posters/courses-hero.jpg",
    publishedAt: "2026-07-22",
    answer:
      "İlk inner.hub gathering İstanbul’da, Eylül 2026’da. Otuz dört kişi, iki gün, bir çember - birçoklarının ilki.",
    video: {
      contentUrl:
        "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
      thumbnail: "https://inner.digital/posters/gathering.jpg",
      durationSeconds: 18,
    },
  },
  {
    slug: "kapali-cember-deal-flow",
    title: "Kapalı çember deal flow’u nasıl hızlandırır? · inner.hub",
    description:
      "Davetiye ile girilen kurucu-yatırımcı ağlarında deal flow neden daha hızlı ve kaliteli ilerler?",
    type: "article",
    ogImage: "https://inner.digital/posters/capital-events.jpg",
    publishedAt: "2026-07-18",
    answer:
      "Kapalı çemberde deal flow hızlanır çünkü her bağlantı önceden filtrelenmiş güvene dayanır.",
  },
  {
    slug: "istanbul-ai-kurucu-agi",
    title: "İstanbul’dan global AI kurucu ağı nasıl kurulur? · inner.hub",
    description:
      "İstanbul neden AI kurucuları için erken buluşma noktası olabilir? inner.hub’ın yerel derinlik + global erişim stratejisi.",
    type: "article",
    ogImage: "https://inner.digital/posters/match-hero.jpg",
    publishedAt: "2026-07-16",
    answer:
      "İstanbul’dan global bir AI kurucu ağı, yerel derinlik ve seçici davetiye ile kurulur.",
  },
  {
    slug: "gathering-vs-konferans",
    title: "Gathering ile konferans arasındaki fark nedir? · inner.hub",
    description:
      "inner.hub gathering’i bir konferans değildir. Kapalı oda, seçili katılımcı, iş üreten format.",
    type: "article",
    ogImage: "https://inner.digital/posters/gathering.jpg",
    publishedAt: "2026-07-14",
    answer:
      "Gathering, konferans değildir: biletli sahne yerine davetiye ile girilen kapalı bir çalışma odasıdır.",
  },
  {
    slug: "aeo-icin-net-cevaplar",
    title: "AEO nedir? Cevap motorları için nasıl yazılır? · inner.hub",
    description:
      "AEO (Answer Engine Optimization) nedir, SEO’dan farkı nedir? Net cevap, FAQ şeması ve uzun form içerik.",
    type: "article",
    ogImage: "https://inner.digital/posters/perks-ambient.jpg",
    publishedAt: "2026-07-12",
    answer:
      "AEO, içeriği cevap motorları için optimize etmektir. Net ilk cevap, FAQ ve uzun gövde ile yapılır.",
  },
];

function upsertMetaInHtml(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["']\\s+content=["'][^"']*["']\\s*/?>`, "i");
  const tag = meta(attr, key, content);
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const re = /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i;
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function injectHead(html, { title, description, canonical, ogType, ogImage, jsonLd }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = upsertMetaInHtml(out, "name", "description", description);
  out = upsertMetaInHtml(out, "name", "robots", "index, follow");
  out = upsertCanonical(out, canonical);
  out = upsertMetaInHtml(out, "property", "og:title", title);
  out = upsertMetaInHtml(out, "property", "og:description", description);
  out = upsertMetaInHtml(out, "property", "og:type", ogType);
  out = upsertMetaInHtml(out, "property", "og:url", canonical);
  out = upsertMetaInHtml(out, "property", "og:image", ogImage);
  out = upsertMetaInHtml(out, "name", "twitter:card", "summary_large_image");
  out = upsertMetaInHtml(out, "name", "twitter:title", title);
  out = upsertMetaInHtml(out, "name", "twitter:description", description);
  out = upsertMetaInHtml(out, "name", "twitter:image", ogImage);

  const ld = `<script type="application/ld+json" id="ih-jsonld">${JSON.stringify(jsonLd)}</script>`;
  out = out.replace(/<script type="application\/ld\+json" id="ih-jsonld">[\s\S]*?<\/script>\s*/i, "");
  out = out.replace("</head>", `    ${ld}\n  </head>`);
  return out;
}

function meta(attr, key, content) {
  return `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replaceAll('"', "&quot;");
}

function writePage(relativeOut, url, seo) {
  const appHtml = render(url);
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      'Prerender failed: expected placeholder \'<div id="root"></div>\' not found in built index.html.',
    );
  }
  let html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );
  html = injectHead(html, seo);
  const outPath = path.join(root, "dist", relativeOut);
  return mkdir(path.dirname(outPath), { recursive: true }).then(() =>
    writeFile(outPath, html, "utf-8").then(() => relativeOut),
  );
}

const pages = [];

pages.push(
  writePage("index.html", "/", {
    title: "inner.hub - the inner circle",
    description:
      "A private circle of founders, builders, and investors. İstanbul → global. What comes next starts here.",
    canonical: "https://inner.digital/",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "inner.hub",
      url: "https://inner.digital",
    },
  }),
);

pages.push(
  writePage("invitation/index.html", "/invitation", {
    title: "Davetiye · inner.hub",
    description: "inner.hub davetiye talebi - kapalı çember için kişisel erişim.",
    canonical: "https://inner.digital/invitation",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Davetiye",
      url: "https://inner.digital/invitation",
    },
  }),
);

pages.push(
  writePage("haberler/index.html", "/haberler", {
    title: "Haberler · inner.hub",
    description:
      "inner.hub haberler: davetiye, gathering ve çember üzerine yazılar ile video haberler.",
    canonical: "https://inner.digital/haberler",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Haberler · inner.hub",
        url: "https://inner.digital/haberler",
      },
    ],
  }),
);

for (const a of ARTIFACTS) {
  const url = `/haberler/${a.slug}`;
  const canonical = `https://inner.digital${url}`;
  const articleLd =
    a.type === "video.other"
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: a.title.replace(" · inner.hub", ""),
          description: a.description,
          thumbnailUrl: a.video.thumbnail,
          contentUrl: a.video.contentUrl,
          uploadDate: a.publishedAt,
          duration: `PT${a.video.durationSeconds}S`,
        }
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title.replace(" · inner.hub", ""),
          description: a.description,
          datePublished: a.publishedAt,
          image: [a.ogImage],
          author: { "@type": "Organization", name: "inner hub" },
        };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: a.title.replace(" · inner.hub", ""),
        acceptedAnswer: { "@type": "Answer", text: a.answer },
      },
    ],
  };

  pages.push(
    writePage(`haberler/${a.slug}/index.html`, url, {
      title: a.title,
      description: a.description,
      canonical,
      ogType: a.type,
      ogImage: a.ogImage,
      jsonLd: [articleLd, faqLd],
    }),
  );
}

const written = await Promise.all(pages);
console.log(`Prerendered ${written.length} pages:\n  ${written.join("\n  ")}`);
