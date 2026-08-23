import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { AutoplayVideo } from "@/components/AutoplayVideo";
import { SitePublicShell } from "@/components/SitePublicShell";
import { useLocale, useT } from "@/i18n";
import { useSeo, breadcrumbJsonLd } from "@/lib/seo";
import { getArtifact } from "@/content/artifacts";
import { artifactAbsoluteUrl, artifactPath, artifactsIndexPath } from "@/content/artifacts/types";
import NotFound from "@/pages/not-found";

export default function ArtifactDetailPage() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ slug?: string }>();
  const artifact = params.slug ? getArtifact(params.slug) : undefined;
  const copy = artifact ? (locale === "en" ? artifact.en : artifact.tr) : null;
  const isVideo = Boolean(artifact?.kind === "video" && artifact.video);
  const indexPath = artifactsIndexPath();

  const jsonLd = useMemo(() => {
    if (!artifact || !copy) return undefined;
    const url = artifactAbsoluteUrl(artifact.slug);
    const articleLd = {
      "@context": "https://schema.org",
      "@type": isVideo ? "VideoObject" : "Article",
      headline: copy.title,
      name: copy.title,
      description: copy.description,
      datePublished: artifact.publishedAt,
      dateModified: artifact.updatedAt ?? artifact.publishedAt,
      author: {
        "@type": "Organization",
        name: artifact.author.name,
        url: artifact.author.url ?? "https://inner.digital",
      },
      publisher: {
        "@type": "Organization",
        name: "inner.hub",
        url: "https://inner.digital",
        logo: {
          "@type": "ImageObject",
          url: "https://inner.digital/inner-logo.png",
        },
      },
      mainEntityOfPage: url,
      image: [`https://inner.digital${artifact.coverImage}`],
      ...(isVideo && artifact.video
        ? {
            contentUrl: artifact.video.src,
            embedUrl: url,
            thumbnailUrl: `https://inner.digital${artifact.video.thumbnail}`,
            uploadDate: artifact.publishedAt,
            duration: `PT${artifact.video.durationSeconds}S`,
          }
        : {
            articleBody: [copy.answer, ...copy.body].join("\n\n"),
            wordCount: [copy.answer, ...copy.body].join(" ").split(/\s+/).length,
          }),
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: copy.title,
          acceptedAnswer: { "@type": "Answer", text: copy.answer },
        },
        ...(copy.faq ?? []).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      ],
    };
    return [
      breadcrumbJsonLd([
        { name: "inner.hub", path: "/" },
        { name: t("artifacts.nav"), path: indexPath },
        { name: copy.title, path: artifactPath(artifact.slug) },
      ]),
      articleLd,
      faqLd,
    ];
  }, [artifact, copy, isVideo, t, indexPath]);

  useSeo({
    title: copy?.title ?? t("artifacts.metaTitle"),
    description: copy?.description ?? t("artifacts.metaDescription"),
    canonicalPath: artifact ? artifactPath(artifact.slug) : indexPath,
    ogImage: artifact ? `https://inner.digital${artifact.coverImage}` : undefined,
    type: isVideo ? "video.other" : "article",
    jsonLd,
    noIndex: !artifact,
  });

  if (!artifact || !copy) return <NotFound />;

  return (
    <SitePublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-0">
        <Link
          href={indexPath}
          className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45 transition-colors hover:text-[var(--bone-fixed)]"
        >
          <ArrowLeft className="size-3" />
          {t("artifacts.back")}
        </Link>

        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
          {isVideo ? t("artifacts.video") : t("artifacts.article")}
          <span className="mx-2 text-white/20">·</span>
          <time dateTime={artifact.publishedAt}>
            {new Date(artifact.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>

        <h1
          className="font-display font-serif italic text-3xl leading-[1.15] sm:text-4xl md:text-5xl"
        >
          {copy.title}
        </h1>

        <p className="mt-6 border-l-2 border-[var(--inner-green)] pl-4 text-base leading-relaxed text-white/75 sm:text-lg">
          {copy.answer}
        </p>

        <div className="mt-10 overflow-hidden border border-white/10 bg-black/40">
          {isVideo && artifact.video ? (
            <AutoplayVideo
              src={artifact.video.src}
              poster={artifact.video.thumbnail}
              label={t("artifacts.video")}
            />
          ) : (
            <img
              src={artifact.coverImage}
              alt={artifact.coverAlt}
              className="aspect-[16/9] w-full object-cover"
            />
          )}
        </div>

        <div className="mt-10 space-y-5 text-[15px] leading-[1.7] text-white/65 sm:text-base">
          {copy.body.map((para, i) => (
            <p key={`${artifact.slug}-p-${i}`}>{para}</p>
          ))}
        </div>

        {copy.faq && copy.faq.length > 0 && (
          <section className="mt-12 border-t border-white/10 pt-10">
            <h2 className="mb-6 font-display font-serif italic text-2xl">{t("artifacts.faqTitle")}</h2>
            <dl className="space-y-6">
              {copy.faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-white/50">{f.q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-white/65">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {copy.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
            {copy.tags.map((tag) => (
              <li
                key={tag}
                className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 flex flex-col gap-3 border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">{t("artifacts.ctaHint")}</p>
          <a
            href="/invitation"
            className="inline-flex items-center justify-center gap-2 bg-[var(--bone-fixed)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-fixed)]"
          >
            {t("publicNav.requestInvitation")}
            <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
          </a>
        </div>
      </article>
    </SitePublicShell>
  );
}
