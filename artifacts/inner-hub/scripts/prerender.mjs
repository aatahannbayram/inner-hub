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
  out = upsertMetaInHtml(
    out,
    "name",
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  out = upsertCanonical(out, canonical);
  out = upsertMetaInHtml(out, "property", "og:site_name", "inner.hub");
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
    title: "inner.hub | İstanbul’da davetli kurucu ağı",
    description:
      "inner.hub (inner.digital): İstanbul merkezli davetli üyelik. Kurucular, mühendisler ve yatırımcılar Eylül 2026 gathering’inden önce erken buluşur. 34 koltuk. Davetiye isteyin.",
    canonical: "https://inner.digital/",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://inner.digital/#org",
        name: "inner.hub",
        alternateName: ["inner hub", "inner.digital"],
        url: "https://inner.digital",
        logo: "https://inner.digital/inner-og.png",
        email: "support@inner.digital",
        description:
          "İstanbul merkezli davetli kurucu, mühendis ve yatırımcı ağı. innerdigital.com IT/pazarlama şirketinden bağımsızdır.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "İstanbul",
          addressCountry: "TR",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "inner.hub",
        url: "https://inner.digital",
        inLanguage: "tr",
        publisher: { "@id": "https://inner.digital/#org" },
      },
    ],
  }),
);

pages.push(
  writePage("invitation/index.html", "/invitation", {
    title: "Davetiye iste | inner.hub",
    description:
      "inner.hub davetiyesi: İstanbul’daki davetli kurucu ağına kişisel erişim. Uygunsa e-postanıza kod gelir. Açık başvuru üyelik garantisi vermez.",
    canonical: "https://inner.digital/invitation",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Davetiye iste",
      url: "https://inner.digital/invitation",
    },
  }),
);

pages.push(
  writePage("en/index.html", "/en", {
    title: "inner.hub | Invite-only founder network in İstanbul",
    description:
      "inner.hub (inner.digital) is an invite-only circle in İstanbul for founders, engineers, and investors. 34 founding seats. First gathering: September 2026. Request an invitation.",
    canonical: "https://inner.digital/en",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "inner.hub",
      url: "https://inner.digital/en",
      inLanguage: "en",
      publisher: { "@id": "https://inner.digital/#org" },
    },
  }),
);

pages.push(
  writePage("en/invitation/index.html", "/en/invitation", {
    title: "Request an invitation | inner.hub",
    description:
      "Request an inner.hub invitation: personal access to an invite-only founder circle in İstanbul. If it fits, your code arrives by email.",
    canonical: "https://inner.digital/en/invitation",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Request an invitation",
      url: "https://inner.digital/en/invitation",
      inLanguage: "en",
    },
  }),
);

pages.push(
  writePage("en/privacy/index.html", "/en/privacy", {
    title: "Privacy Policy · inner.hub",
    description: "How inner.hub collects, uses, and protects your personal data.",
    canonical: "https://inner.digital/en/privacy",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Privacy Policy",
      url: "https://inner.digital/en/privacy",
      inLanguage: "en",
    },
  }),
);

pages.push(
  writePage("privacy/index.html", "/privacy", {
    title: "Gizlilik Politikası · inner.hub",
    description: "inner.hub kişisel verilerinizi nasıl topluyor, kullanıyor ve koruyor.",
    canonical: "https://inner.digital/privacy",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Gizlilik Politikası",
      url: "https://inner.digital/privacy",
    },
  }),
);

pages.push(
  writePage("sss/index.html", "/sss", {
    title: "SSS | inner.hub nedir, nasıl üye olunur?",
    description:
      "inner.hub nedir, davetiye nasıl alınır, İstanbul gathering ne zaman? inner.digital, innerdigital.com IT şirketinden bağımsız bir davetli kurucu ağıdır.",
    canonical: "https://inner.digital/sss",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "inner.hub nedir?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "inner.hub (inner.digital), İstanbul merkezli davetli bir kurucu, mühendis ve yatırımcı ağıdır. innerdigital.com adlı IT şirketinden bağımsızdır.",
          },
        },
        {
          "@type": "Question",
          name: "Nasıl üye olunur?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Davetiye ile. inner.digital/invitation üzerinden talep bırakılır; uyarsa kişisel kod e-postaya gelir.",
          },
        },
      ],
    },
  }),
);

pages.push(
  writePage("en/sss/index.html", "/en/sss", {
    title: "FAQ | What is inner.hub and how do I join?",
    description:
      "What is inner.hub, how do invitations work, when is the İstanbul gathering? inner.digital is an invite-only founder circle — not InnerDigital, the IT company.",
    canonical: "https://inner.digital/en/sss",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: "inner.hub FAQ",
      url: "https://inner.digital/en/sss",
    },
  }),
);

pages.push(
  writePage("haberler/index.html", "/haberler", {
    title: "Haberler | inner.hub davetiye, gathering ve üyelik",
    description:
      "inner.hub haberleri: davetiye ile üyelik, İstanbul gathering (Eylül 2026) ve kapalı çember deal flow üzerine yazı ve video.",
    canonical: "https://inner.digital/haberler",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Haberler | inner.hub",
        url: "https://inner.digital/haberler",
      },
    ],
  }),
);

pages.push(
  writePage("en/haberler/index.html", "/en/haberler", {
    title: "News | inner.hub invitations, gathering, membership",
    description:
      "inner.hub news: invitation-only membership, the İstanbul gathering (September 2026), and how a closed circle compounds deal flow.",
    canonical: "https://inner.digital/en/haberler",
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "News | inner.hub",
      url: "https://inner.digital/en/haberler",
      inLanguage: "en",
    },
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
  pages.push(
    writePage(`en/haberler/${a.slug}/index.html`, `/en/haberler/${a.slug}`, {
      title: a.title,
      description: a.description,
      canonical: `https://inner.digital/en/haberler/${a.slug}`,
      ogType: a.type,
      ogImage: a.ogImage,
      jsonLd: [articleLd, faqLd],
    }),
  );
}

// ─── Panel shell stubs ──────────────────────────────────────────────────────
// /panel/* rotaları tamamen client-side (auth arkasında); SSR içerik gerekmez.
// Ama bazı statik hosting katmanları (SPA fallback/rewrite kuralı olmayan)
// bilinmeyen path'lere gerçek bir dosya bulamayınca 404 döner. Her panel
// rotası için ham (boş #root) index.html şablonundan bir kopya yazarak,
// rewrite kuralına bağlı kalmadan doğrudan disk üzerinden çözülmesini
// sağlıyoruz - client JS yüklenir yüklenmez gerçek içeriği hydrate eder.
const PANEL_ROUTES = [
  "/panel",
  "/panel/chat",
  "/panel/courses/admin",
  "/panel/courses",
  "/panel/events/admin",
  "/panel/events",
  "/panel/stage",
  "/panel/members",
  "/panel/org",
  "/panel/perks",
  "/panel/signal",
  "/panel/match",
  "/panel/capital",
  "/panel/vault",
  "/panel/pulse",
  "/panel/id",
  "/panel/api",
  "/panel/profile",
  "/panel/faq",
  "/panel/membership",
  "/panel/payment/success",
  "/panel/applications",
  "/panel/haberler",
  "/panel/analytics",
  "/panel/settings",
];

function writePanelShell(relativeOut) {
  const html = injectHead(template, {
    title: "inner.hub panel",
    description: "inner.hub üye paneli.",
    canonical: `https://inner.digital${relativeOut === "panel/index.html" ? "/panel" : "/" + relativeOut.replace(/\/index\.html$/, "")}`,
    ogType: "website",
    ogImage: "https://inner.digital/inner-og.png",
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "inner.hub panel" },
  }).replace(
    /<meta name="robots"[^>]*>/i,
    '<meta name="robots" content="noindex, nofollow" />',
  );
  const outPath = path.join(root, "dist", relativeOut);
  return mkdir(path.dirname(outPath), { recursive: true }).then(() =>
    writeFile(outPath, html, "utf-8").then(() => relativeOut),
  );
}

const panelPages = await Promise.all(
  PANEL_ROUTES.map((route) => writePanelShell(`${route.slice(1)}/index.html`)),
);

const written = await Promise.all(pages);
console.log(`Prerendered ${written.length} pages:\n  ${written.join("\n  ")}`);
console.log(`Panel shell stubs: ${panelPages.length}\n  ${panelPages.join("\n  ")}`);

const SITE = "https://inner.digital";
const today = "2026-08-25";
function altPair(trPath, enPath) {
  const tr = `${SITE}${trPath}`;
  const en = `${SITE}${enPath}`;
  return `    <xhtml:link rel="alternate" hreflang="tr" href="${tr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${tr}"/>`;
}
function urlTag(trPath, enPath, { lastmod = today, changefreq = "monthly", priority = "0.7" } = {}) {
  const loc = `${SITE}${trPath}`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${altPair(trPath, enPath)}
  </url>
  <url>
    <loc>${SITE}${enPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${altPair(trPath, enPath)}
  </url>`;
}

const sitemapUrls = [
  urlTag("/", "/en", { changefreq: "weekly", priority: "1.0" }),
  urlTag("/invitation", "/en/invitation", { changefreq: "monthly", priority: "0.95" }),
  urlTag("/sss", "/en/sss", { changefreq: "monthly", priority: "0.9" }),
  urlTag("/haberler", "/en/haberler", { changefreq: "weekly", priority: "0.9" }),
  urlTag("/privacy", "/en/privacy", { changefreq: "yearly", priority: "0.3" }),
  ...ARTIFACTS.map((a) =>
    urlTag(`/haberler/${a.slug}`, `/en/haberler/${a.slug}`, {
      // lastmod: rebuild günü — indeks kuyruğunu tazelemek için
      lastmod: today,
      changefreq: "monthly",
      priority: "0.8",
    }),
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapUrls.join("\n")}
</urlset>
`;

await writeFile(path.join(root, "dist", "sitemap.xml"), sitemap, "utf-8");
await writeFile(path.join(root, "public", "sitemap.xml"), sitemap, "utf-8");
console.log("Wrote dist/sitemap.xml + public/sitemap.xml (TR+EN, hreflang)");
