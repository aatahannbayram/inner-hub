import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { HeroVideo } from "@/components/HeroVideo";
import { posterForVideo } from "@/lib/videoPosters";
import { useLocalizedHref, useT } from "@/i18n";

export type PlatformFeature = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  media: { type: "video" | "image"; src: string };
};

/** Founding seats kartları ile aynı yüzey */
const CARD_BG = "#212121";

function FeatureCard({
  feature,
  index,
  setRef,
}: {
  feature: PlatformFeature;
  index: number;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15, margin: "0px 0px -8% 0px" });

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setRef(el);
      }}
      data-feature-index={index}
      className={`border border-white/10 p-6 opacity-100 md:p-8 lg:transition-all lg:duration-700 lg:ease-out ${
        inView ? "lg:translate-x-0 lg:opacity-100" : "lg:translate-x-16 lg:opacity-0"
      }`}
      style={{ backgroundColor: CARD_BG }}
    >
      <p className="mb-4 font-mono text-label uppercase tracking-widest text-white/45">
        {feature.tag}
      </p>
      <h3 lang="en" className="mb-6 font-serif text-xl italic text-[var(--bone-fixed)] md:text-2xl">
        {feature.name}
      </h3>
      <div className="mb-6 aspect-video overflow-hidden bg-black/40">
        {feature.media.type === "video" ? (
          <HeroVideo
            src={feature.media.src}
            poster={posterForVideo(feature.media.src)}
            className="size-full object-cover"
          />
        ) : (
          <img
            src={feature.media.src}
            alt={feature.name}
            className="size-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <p className="text-sm leading-relaxed text-white/55 md:text-base">{feature.desc}</p>
    </div>
  );
}

export function PlatformFeatures({
  features,
  septemberModules = [],
  roadmapModules = [],
}: {
  features: PlatformFeature[];
  septemberModules?: { id: string; name: string; desc: string; icon: LucideIcon; tag: string }[];
  roadmapModules?: { id: string; name: string; desc: string; icon: LucideIcon; tag: string }[];
}) {
  const t = useT();
  const inviteHref = useLocalizedHref("/invitation");
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const ratiosRef = useRef<Map<number, number>>(new Map());

  const renderModuleGrid = (
    mods: { id: string; name: string; desc: string; icon: LucideIcon; tag: string }[],
    eyebrow: string,
  ) => {
    if (mods.length === 0) return null;
    return (
      <div className="mt-6 border-t border-white/10 pt-10">
        <p className="mb-6 font-mono text-label uppercase tracking-widest text-white/45">{eyebrow}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-1">
          {mods.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="flex flex-col gap-3 border border-white/10 p-5 sm:p-6"
                style={{ backgroundColor: CARD_BG }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-white/45" strokeWidth={1.5} />
                  <span className="font-mono text-label uppercase tracking-widest text-white/40">
                    {mod.tag}
                  </span>
                </div>
                <h4 lang="en" className="font-serif italic text-lg text-[var(--bone-fixed)]">
                  {mod.name}
                </h4>
                <p className="text-sm leading-relaxed text-white/50">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const ratios = ratiosRef.current;
    ratios.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.featureIndex);
          if (Number.isNaN(idx)) return;
          ratios.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestIdx = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        });
        if (bestRatio > 0) setActiveIndex(bestIdx);
      },
      {
        // Mid-viewport band so the left nav tracks the card you're actually reading
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-28% 0px -42% 0px",
      },
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);

  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    cardRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className="relative px-4 py-20 text-[var(--bone-fixed)] sm:px-6 md:px-12 md:py-40 lg:px-[10%] lg:py-48"
      style={{ backgroundColor: "var(--ink-fixed)" }}
    >
      {/* Soft green orbs - clipped locally so they don't break sticky */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-24 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" />
        <div className="absolute -right-16 bottom-20 size-80 bg-[var(--inner-green)]/[0.035] blur-3xl" />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-[400px_1fr] lg:items-start lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48">
        {/* self-start + sticky: grid stretch was pinning the column to full row height */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-between lg:self-start lg:py-28">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/45">
              {t("home.platformEyebrow")}
            </p>
            <h2 className="font-display font-serif italic text-2xl leading-[1.2] text-[var(--bone-fixed)] sm:text-3xl lg:text-[46px]">
              {t("home.platformTitle")}
            </h2>

            <div className="mt-8 flex flex-wrap gap-2 lg:hidden">
              {features.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  className={`border px-3 py-2 font-mono text-[10px] tracking-widest transition-colors ${
                    activeIndex === i
                      ? "border-white/15 bg-white/[0.08] text-[var(--bone-fixed)]"
                      : "border-white/10 text-white/45"
                  }`}
                >
                  <span lang="en">{f.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 lg:hidden">
              <p className="mb-4 text-sm text-white/55">{t("home.platformAccess")}</p>
              <a
                href={inviteHref}
                className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:border-white/50 hover:bg-[var(--bone-fixed)] hover:text-[var(--ink-fixed)]"
              >
                {t("home.requestInvitation")} <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          <div className="mt-12 hidden flex-col gap-2 lg:flex">
            {features.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => scrollToCard(i)}
                className={`border px-4 py-3 text-left font-mono text-xs tracking-widest transition-colors ${
                  activeIndex === i
                    ? "border-white/15 bg-white/[0.08] text-[var(--bone-fixed)]"
                    : "border-transparent text-white/45 hover:text-white/70"
                }`}
              >
                <span lang="en">{f.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-12 hidden lg:block">
            <p className="mb-4 text-sm text-white/55">{t("home.platformAccess")}</p>
            <a
              href={inviteHref}
              className="inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:border-white/50 hover:bg-[var(--bone-fixed)] hover:text-[var(--ink-fixed)]"
            >
              {t("home.requestInvitation")} <ArrowRight className="size-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-2">
          {features.map((f, i) => (
            <FeatureCard
              key={f.id}
              feature={f}
              index={i}
              setRef={(el) => {
                if (el) cardRefs.current.set(i, el);
                else cardRefs.current.delete(i);
              }}
            />
          ))}

          {renderModuleGrid(septemberModules, t("home.modulesSeptemberEyebrow"))}
          {renderModuleGrid(roadmapModules, t("home.modulesRoadmapEyebrow"))}
        </div>
      </div>
    </div>
  );
}
