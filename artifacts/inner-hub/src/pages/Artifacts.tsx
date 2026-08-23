import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Play } from "lucide-react";
import { SitePublicShell } from "@/components/SitePublicShell";
import { useLocale, useT } from "@/i18n";
import { useSeo, breadcrumbJsonLd } from "@/lib/seo";
import { listArtifacts } from "@/content/artifacts";
import type { Artifact } from "@/content/artifacts/types";
import { artifactPath, artifactsIndexPath } from "@/content/artifacts/types";

function copyFor(a: Artifact, locale: string) {
  return locale === "en" ? a.en : a.tr;
}

export default function ArtifactsPage() {
  const t = useT();
  const { locale } = useLocale();
  const items = listArtifacts();
  const indexPath = artifactsIndexPath();

  const jsonLd = useMemo(
    () => [
      breadcrumbJsonLd([
        { name: "inner.hub", path: "/" },
        { name: t("artifacts.nav"), path: indexPath },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("artifacts.metaTitle"),
        description: t("artifacts.metaDescription"),
        url: `https://inner.digital${indexPath}`,
        isPartOf: { "@type": "WebSite", name: "inner.hub", url: "https://inner.digital" },
      },
    ],
    [t, indexPath],
  );

  useSeo({
    title: t("artifacts.metaTitle"),
    description: t("artifacts.metaDescription"),
    canonicalPath: indexPath,
    jsonLd,
  });

  return (
    <SitePublicShell>
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:px-10 md:py-20 lg:px-[8%]">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/45">
          {t("artifacts.eyebrow")}
        </p>
        <h1
          className="max-w-2xl font-display font-serif italic text-4xl leading-[1.1] sm:text-5xl md:text-6xl"
        >
          {t("artifacts.title")}
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
          {t("artifacts.subtitle")}
        </p>

        <ul className="mt-14 space-y-0 border-t border-white/10">
          {items.length === 0 ? (
            <li className="py-16 text-sm text-white/45">{t("artifacts.empty")}</li>
          ) : (
            items.map((item) => {
              const copy = copyFor(item, locale);
              return (
                <li key={item.slug} className="border-b border-white/10">
                  <Link
                    href={artifactPath(item.slug)}
                    className="group grid grid-cols-1 gap-5 py-8 transition-colors md:grid-cols-[180px_1fr_auto] md:items-center md:gap-8"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/5 md:aspect-[4/3]">
                      <img
                        src={item.coverImage}
                        alt={item.coverAlt}
                        className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      {item.kind === "video" && (
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--bone-fixed)]">
                          <Play className="size-2.5 fill-current" />
                          {t("artifacts.video")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                        {item.kind === "video" ? t("artifacts.video") : t("artifacts.article")}
                        <span className="mx-2 text-white/20">·</span>
                        <time dateTime={item.publishedAt}>
                          {new Date(item.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </p>
                      <h2 className="text-xl text-[var(--bone-fixed)] transition-colors group-hover:text-white sm:text-2xl">
                        {copy.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/50">{copy.answer}</p>
                    </div>
                    <ArrowUpRight className="hidden size-5 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--inner-green)] md:block" />
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </main>
    </SitePublicShell>
  );
}
