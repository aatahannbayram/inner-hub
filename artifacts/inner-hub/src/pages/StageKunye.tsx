import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Check, Copy, ExternalLink, FileText, Globe, Play, Rocket, Share2, Star, ThumbsUp } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { apiUrl } from "@/lib/api";
import { useSeo } from "@/lib/seo";
import { useT, useLocale } from "@/i18n";

type KunyeProduct = {
  id: number;
  title: string;
  url: string;
  pitch: string;
  votes: number;
  featured: boolean;
  imageUrl: string | null;
  productHuntUrl: string | null;
  phVotesCount: number | null;
  youtubeUrl: string | null;
  youtubeThumbnail: string | null;
  demoUrl?: string | null;
  pitchDeckUrl?: string | null;
  tags?: string[];
  lookingFor?: string | null;
  authorName: string | null;
  authorHandle: string | null;
  createdAt: string;
};

export default function StageKunyePage() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [product, setProduct] = useState<KunyeProduct | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(apiUrl(`/api/public/stage/${id}`))
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 404) {
          setStatus("missing");
          return;
        }
        if (!res.ok || !json.product) {
          setStatus("error");
          return;
        }
        setProduct(json.product as KunyeProduct);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cover = product?.imageUrl || product?.youtubeThumbnail || null;
  const submittedAt = product
    ? new Date(product.createdAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const pitchPreview = product?.pitch?.replace(/\s+/g, " ").trim().slice(0, 160) ?? "";
  const kunyeLabel =
    typeof window !== "undefined"
      ? window.location.host + window.location.pathname
      : `inner.digital/s/${id}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: product?.title ?? t("stage.kunye"),
        text: pitchPreview,
        url: window.location.href,
      });
    } catch {
      await copy();
    }
  };
  useSeo({
    title: product?.title ?? t("stage.kunye"),
    description: pitchPreview || t("stage.kunyeHint"),
    canonicalPath: Number.isFinite(id) && id > 0 ? `/s/${id}` : "/s",
    ogImage: cover ?? undefined,
    type: "website",
    noIndex: status !== "ok",
  });

  return (
    <div className="min-h-svh bg-[var(--ink-fixed)] text-[var(--bone-fixed)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <FadeIn>
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex">
              <Lockup suffix="stage" className="text-[var(--bone-fixed)]" fontSize="1.05rem" />
            </Link>
            <Link
              href="/panel/stage"
              className="font-mono text-label uppercase tracking-widest text-white/55 underline underline-offset-2 hover:text-white"
            >
              {t("stage.openInStage")}
            </Link>
          </div>
        </FadeIn>

        {status === "loading" && (
          <p className="font-mono text-label uppercase tracking-widest text-white/45">
            {t("stage.kunyeLoading")}
          </p>
        )}

        {(status === "missing" || status === "error") && (
          <div className="border border-white/10 p-8 text-center">
            <p className="font-mono text-label uppercase tracking-widest text-white/55">
              {t("stage.kunyeNotFound")}
            </p>
          </div>
        )}

        {status === "ok" && product && (
          <FadeIn>
            <article className="overflow-hidden border border-white/10 bg-white/[0.04] lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
              {cover && (
                <div className="relative aspect-video overflow-hidden bg-black lg:aspect-auto lg:min-h-full">
                  <img src={cover} alt="" className="size-full object-cover" />
                  {product.youtubeUrl && (
                    <a
                      href={product.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                      aria-label={t("stage.watchVideo")}
                    >
                      <span className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white">
                        <Play className="size-5 translate-x-0.5 fill-current" />
                      </span>
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex-1 space-y-5 p-5 sm:p-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                      {t("stage.kunyeHint")}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-white/30">{kunyeLabel}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h1 className="font-serif text-2xl text-[var(--bone-fixed)]" style={{ fontWeight: 600 }}>
                        {product.title}
                      </h1>
                      {product.featured && (
                        <span className="inline-flex items-center gap-1 border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)]">
                          <Star className="size-2.5 fill-current" />
                          {t("stage.featuredBadge")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-white/50">
                      {product.authorHandle ? `@${product.authorHandle}` : product.authorName}
                      {" · "}
                      {t("stage.submittedOn", { date: submittedAt })}
                    </p>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">{product.pitch}</p>

                  {(product.tags?.length || product.lookingFor) && (
                    <div className="space-y-2">
                      {product.lookingFor ? (
                        <p className="text-xs text-white/55">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                            {t("stage.lookingForLabel")}
                          </span>
                          <span className="mt-1 block text-sm text-white/80">{product.lookingFor}</span>
                        </p>
                      ) : null}
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/55"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                      {t("stage.linksSection")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:border-white/35"
                      >
                        <Globe className="size-3.5" />
                        {t("stage.openWebsite")}
                      </a>
                      {product.demoUrl && (
                        <a
                          href={product.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:border-white/35"
                        >
                          <Rocket className="size-3.5" />
                          {t("stage.openDemo")}
                        </a>
                      )}
                      {product.pitchDeckUrl && (
                        <a
                          href={product.pitchDeckUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:border-white/35"
                        >
                          <FileText className="size-3.5" />
                          {t("stage.openPitchDeck")}
                        </a>
                      )}
                      {product.productHuntUrl && (
                        <a
                          href={product.productHuntUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-[#DA552F]/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#DA552F]"
                        >
                          {product.phVotesCount != null
                            ? t("stage.phVotes", { n: product.phVotesCount })
                            : t("stage.openPh")}
                        </a>
                      )}
                      {product.youtubeUrl && (
                        <a
                          href={product.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80"
                        >
                          <Play className="size-3.5" />
                          {t("stage.watchVideo")}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50">
                    <ThumbsUp className="size-3.5" />
                    {product.votes}
                  </div>
                </div>
                <div className="grid gap-2 border-t border-white/10 p-4 sm:p-5">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border border-[var(--bone-fixed)] bg-[var(--bone-fixed)] px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--ink-fixed)]"
                  >
                    {t("stage.visitProduct")}
                    <ExternalLink className="size-3.5" />
                  </a>
                  {product.pitchDeckUrl && (
                    <a
                      href={product.pitchDeckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-white/15 px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] hover:border-white/35"
                    >
                      {t("stage.openPitchDeck")}
                      <FileText className="size-3.5" />
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {canShare && (
                      <button
                        type="button"
                        onClick={() => void share()}
                        className="flex items-center justify-center gap-1.5 border border-white/15 px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] hover:border-white/35"
                      >
                        <Share2 className="size-3.5" />
                        {t("stage.share")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void copy()}
                      className={[
                        "flex items-center justify-center gap-1.5 border border-white/15 px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] hover:border-white/35",
                        canShare ? "" : "col-span-2",
                      ].join(" ")}
                    >
                      {copied ? t("stage.linkCopied") : t("stage.copyLink")}
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                  <Link
                    href={`/panel/stage?urun=${product.id}`}
                    className="flex items-center justify-center border border-white/15 px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] hover:border-white/35"
                  >
                    {t("stage.openInStage")}
                  </Link>
                </div>
              </div>
            </article>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
