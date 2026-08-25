import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  Play,
  Share2,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { MemberAvatar } from "@/components/panel/MemberAvatar";
import { useT, useLocale } from "@/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

export type StageOverlayProduct = {
  id: number;
  title: string;
  url: string;
  pitch: string;
  votes: number;
  myVote: boolean;
  featured: boolean;
  imageUrl: string | null;
  productHuntUrl: string | null;
  phVotesCount: number | null;
  youtubeUrl: string | null;
  youtubeThumbnail: string | null;
  authorName: string | null;
  authorHandle: string | null;
  createdAt: string;
};

function stageKunyeUrl(id: number): string {
  return `${window.location.origin}/s/${id}`;
}

function youtubeIdFromUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
      if (m) return m[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function ProductHuntMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <circle cx="20" cy="20" r="20" fill="#DA552F" />
      <path
        fill="#fff"
        d="M22.7 12.5h-7.2c-.5 0-.9.4-.9.9v13.2c0 .5.4.9.9.9h2.2c.5 0 .9-.4.9-.9v-3.6h4.1c3.4 0 6.1-2.7 6.1-6.1s-2.7-6.4-6.1-6.4zm-.2 8.5h-3.9v-4.8h3.9c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4z"
      />
    </svg>
  );
}

type OverlayHandlers = {
  onClose: () => void;
  busy?: boolean;
  onVote: (id: number) => void;
  isAdmin?: boolean;
  adminBusy?: boolean;
  onToggleFeatured?: (id: number, next: boolean) => void;
  onRemove?: (id: number) => void;
};

export function StageProductOverlay({
  product,
  ...handlers
}: OverlayHandlers & { product: StageOverlayProduct | null }) {
  return createPortal(
    <AnimatePresence>
      {product ? <StageProductOverlayPanel key={product.id} product={product} {...handlers} /> : null}
    </AnimatePresence>,
    document.body,
  );
}

function StageProductOverlayPanel({
  product,
  onClose,
  busy,
  onVote,
  isAdmin,
  adminBusy,
  onToggleFeatured,
  onRemove,
}: OverlayHandlers & { product: StageOverlayProduct }) {
  const t = useT();
  const { locale } = useLocale();
  const panelRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const kunyeHref = stageKunyeUrl(product.id);
  const kunyeLabel = kunyeHref.replace(/^https?:\/\//, "");

  const ytId = youtubeIdFromUrl(product.youtubeUrl);
  const cover =
    (product.imageUrl && !imgFailed ? product.imageUrl : null) || product.youtubeThumbnail;

  useEffect(() => {
    setPlaying(false);
    setImgFailed(false);
    setExpanded(false);
  }, [product.id]);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (expanded) setExpanded(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, expanded]);

  const copyKunye = async () => {
    try {
      await navigator.clipboard.writeText(kunyeHref);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const shareKunye = async () => {
    try {
      await navigator.share({
        title: product.title,
        text: product.pitch.replace(/\s+/g, " ").trim().slice(0, 140),
        url: kunyeHref,
      });
    } catch {
      await copyKunye();
    }
  };

  const submittedAt = new Date(product.createdAt).toLocaleDateString(
    locale === "tr" ? "tr-TR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const chromeBtn =
    "inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.04] px-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--ink)]/30";

  const media = (cover || ytId) && (
    <div
      className={[
        "relative w-full overflow-hidden bg-black",
        expanded ? "aspect-video lg:aspect-auto lg:min-h-full lg:h-full" : "aspect-video",
      ].join(" ")}
    >
      {playing && ytId ? (
        <iframe
          title={product.title}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      ) : (
        <>
          {cover ? (
            <img
              src={cover}
              alt=""
              className="size-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="size-full bg-[var(--ink)]/[0.06]" />
          )}
          {ytId && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors hover:bg-black/30"
              aria-label={t("stage.watchVideo")}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Play className="size-5 translate-x-0.5 fill-current" />
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );

  const body = (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2
              id="stage-product-title"
              className="font-serif text-2xl text-[var(--ink)] sm:text-[1.75rem] sm:leading-tight"
              style={{ fontWeight: 600 }}
            >
              {product.title}
            </h2>
            {product.featured && (
              <span className="inline-flex items-center gap-1 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--success-ink)]">
                <Star className="size-2.5 fill-current" />
                {t("stage.featuredBadge")}
              </span>
            )}
            {product.productHuntUrl && (
              <span className="inline-flex items-center gap-1 border border-[#DA552F]/35 bg-[#DA552F]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#DA552F]">
                <ProductHuntMark className="size-3 shrink-0" />
                {t("stage.phBadge")}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <MemberAvatar
              seed={product.authorHandle || product.authorName || product.title}
              alt={product.authorName ?? product.authorHandle ?? ""}
              size="sm"
            />
            <p className="min-w-0 text-xs text-[var(--ink-muted)]">
              {product.authorHandle ? (
                <a
                  href={`/u/${product.authorHandle}`}
                  className="underline decoration-[var(--ink)]/20 underline-offset-2 hover:text-[var(--ink)]"
                >
                  @{product.authorHandle}
                </a>
              ) : (
                product.authorName
              )}
              {" · "}
              {t("stage.submittedOn", { date: submittedAt })}
            </p>
          </div>
        </div>
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink-body)] sm:text-[15px]">
        {product.pitch}
      </p>

      {(product.productHuntUrl || product.youtubeUrl) && (
        <div className="flex flex-wrap gap-2">
          {product.productHuntUrl && (
            <a
              href={product.productHuntUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border border-[#DA552F]/30 bg-[#DA552F]/5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#DA552F] transition-colors hover:border-[#DA552F]/50"
            >
              <ProductHuntMark className="size-3.5 shrink-0" />
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
              className="inline-flex items-center gap-1.5 panel-glass px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]"
            >
              <Play className="size-3.5" />
              {t("stage.watchVideo")}
            </a>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="space-y-2 border-t border-[var(--ink)]/[0.08] pt-5">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("stage.adminSection")}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={adminBusy}
              onClick={() => onToggleFeatured?.(product.id, !product.featured)}
              className={[
                "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40",
                product.featured
                  ? "border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
                  : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:border-[var(--ink)]/30",
              ].join(" ")}
            >
              <Star className={product.featured ? "size-3 fill-current" : "size-3"} />
              {product.featured ? t("stage.adminUnfeature") : t("stage.adminFeature")}
            </button>
            <button
              type="button"
              disabled={adminBusy}
              onClick={() => {
                onRemove?.(product.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 border border-[var(--error-ink)]/25 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)] transition-colors hover:bg-[var(--error-ink)]/5 disabled:opacity-40"
            >
              <Trash2 className="size-3" />
              {t("stage.adminRemove")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const actionBar = (
    <div className="flex shrink-0 items-stretch gap-2 border-t border-[var(--ink)]/[0.08] p-3">
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 flex-1 items-center justify-center gap-2 panel-glass-ink px-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]"
      >
        {t("stage.visitProduct")}
        <ExternalLink className="size-3.5" />
      </a>
      <button
        type="button"
        disabled={busy}
        onClick={() => onVote(product.id)}
        aria-pressed={product.myVote}
        className={[
          "flex min-h-12 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 border px-3 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40",
          product.myVote
            ? "border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
            : "border-[var(--ink)]/12 text-[var(--ink)] hover:border-[var(--ink)]/30",
        ].join(" ")}
      >
        <ThumbsUp className={product.myVote ? "size-3.5 fill-current" : "size-3.5"} />
        {product.votes}
      </button>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className="absolute inset-0 bg-[var(--ink-fixed)]/50 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        ref={panelRef}
        layout
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-product-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: EASE, layout: { duration: 0.38, ease: EASE } }}
        className={[
          "panel-glass-strong absolute z-[1] flex flex-col overflow-hidden border-[var(--ink)]/15 shadow-[0_24px_80px_rgba(0,0,0,0.32)]",
          expanded
            ? "inset-0 sm:inset-3 md:inset-4 lg:inset-6"
            : "inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(100vw-1.25rem,46rem)] sm:border-l",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center gap-1.5 border-b border-[var(--ink)]/[0.08] px-3 py-2.5 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("stage.kunye")}
            </p>
            <p className="truncate font-mono text-[10px] text-[var(--ink-subtle)]">{kunyeLabel}</p>
          </div>
          {canShare && (
            <button type="button" onClick={() => void shareKunye()} className={chromeBtn}>
              <Share2 className="size-3.5" />
              <span className="hidden lg:inline">{t("stage.share")}</span>
            </button>
          )}
          <button type="button" onClick={() => void copyKunye()} className={chromeBtn}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? t("stage.linkCopied") : t("stage.copyLink")}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`hidden sm:inline-flex ${chromeBtn}`}
            aria-label={expanded ? t("stage.collapse") : t("stage.expand")}
          >
            {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span className="hidden lg:inline">{expanded ? t("stage.collapse") : t("stage.expand")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="panel-glass shrink-0 p-2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={[
            "min-h-0 flex-1",
            expanded
              ? "overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.9fr)] lg:overflow-hidden"
              : "overflow-y-auto",
          ].join(" ")}
        >
          {media}
          <div
            className={
              expanded
                ? "lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-l lg:border-[var(--ink)]/[0.08]"
                : ""
            }
          >
            <div className={expanded ? "lg:min-h-0 lg:flex-1 lg:overflow-y-auto" : ""}>{body}</div>
            {expanded ? <div className="hidden lg:block">{actionBar}</div> : null}
          </div>
        </div>

        <div className={expanded ? "lg:hidden" : ""}>{actionBar}</div>
      </motion.aside>
    </motion.div>
  );
}
