"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ProceduralPortrait, type PortraitConfig } from "@/components/panel/ProceduralPortrait";
import { HeroVideo } from "@/components/HeroVideo";
import { posterForVideo } from "@/lib/videoPosters";

type EditorialCardProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  cta?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Autoplaying muted loop video — takes priority over imageSrc/portrait */
  videoSrc?: string;
  /** Optional poster; defaults via posterForVideo(videoSrc) */
  videoPoster?: string;
  /** Live Canvas2D procedural portrait (Phosphor/D60-hero) — takes priority over imageSrc */
  portrait?: { src: string; config: PortraitConfig };
  tone?: "light" | "dark";
  className?: string;
  /** Visual-only frame without CTA */
  mediaOnly?: boolean;
  /** 1-based position in a set — renders as a small editorial index mark */
  index?: number;
};

/**
 * Kurumsal editorial kart — zero radius, ink/bone, görsel + tipografi.
 * Dekoratif “AI card” değil; etkileşim veya içerik taşıyıcı.
 */
export function EditorialCard({
  title,
  eyebrow,
  description,
  href,
  cta = "İncele",
  imageSrc,
  imageAlt = "",
  videoSrc,
  videoPoster,
  portrait,
  tone = "light",
  className,
  mediaOnly = false,
  index,
}: EditorialCardProps) {
  const dark = tone === "dark";
  const reduce = useReducedMotion();
  const hasMedia = Boolean(videoSrc || portrait || imageSrc);

  const body = (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border transition-colors duration-300",
        dark
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] hover:border-[var(--ink)]"
          : "border-[var(--ink)]/[0.08] bg-[var(--bone)] text-[var(--ink)] hover:border-[var(--ink)]/25",
        className,
      )}
    >
      {/* Top accent — draws in on hover, the one recurring "signature" mark across the panel */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />

      {hasMedia && (
        <div className="relative aspect-[16/10] overflow-hidden">
          {videoSrc ? (
            <HeroVideo
              src={videoSrc}
              poster={videoPoster ?? posterForVideo(videoSrc)}
              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          ) : portrait ? (
            <ProceduralPortrait src={portrait.src} config={portrait.config} className="size-full" />
          ) : (
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              loading="lazy"
            />
          )}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              dark
                ? "bg-gradient-to-t from-[var(--ink-fixed)]/80 via-transparent to-transparent"
                : "bg-gradient-to-t from-[var(--bone)]/40 via-transparent to-transparent",
            )}
          />
          {typeof index === "number" && (
            <span
              className={cn(
                "absolute right-3 top-3 font-mono text-label tabular-nums tracking-widest",
                dark ? "text-[var(--bone)]/50" : "text-[var(--bone)]",
              )}
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              {String(index).padStart(2, "0")}
            </span>
          )}
        </div>
      )}

      {!mediaOnly && (
        <div className="flex flex-1 flex-col gap-2 p-5">
          {eyebrow && (
            <p
              className={cn(
                "font-mono text-label uppercase tracking-widest",
                dark ? "text-[var(--bone)]/57" : "text-[var(--ink-body)]",
              )}
            >
              {eyebrow}
            </p>
          )}
          <h3
            className="font-serif text-2xl italic leading-snug"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "text-sm font-light leading-relaxed line-clamp-3",
                dark ? "text-[var(--bone)]/55" : "text-[var(--ink-muted)]",
              )}
            >
              {description}
            </p>
          )}
          {href && (
            <span
              className={cn(
                "mt-auto flex items-center gap-1.5 pt-3 font-mono text-label uppercase tracking-widest transition-all",
                dark
                  ? "text-[var(--bone)]/70 group-hover:text-[var(--success-ink)]"
                  : "text-[var(--ink-muted)] group-hover:text-[var(--success-ink)]",
              )}
            >
              {cta}
              <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </div>
      )}
    </motion.article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }

  return body;
}
