import { useRef, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { WordsPullUp, WordsPullUpMultiStyle } from "@/components/WordsPullUp";
import { ScrollTextReveal } from "@/components/ScrollTextReveal";
import { FloatingNavbar, HERO_CHROME } from "@/components/FloatingNavbar";
import { HeroVideo } from "@/components/HeroVideo";
import { Lockup } from "@/components/Lockup";

const EASE = [0.16, 1, 0.3, 1] as const;
const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const FEATURE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

/** Home §01 background — not used elsewhere on the public landing. */
const IDEA_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";

const SEAT_CARDS = [
  {
    id: "01",
    title: "Founders.",
    items: [
      "Building startups in AI and beyond",
      "Shipping before the noise arrives",
      "Looking for co-builders, not crowds",
      "Chosen one by one. Never open apply",
    ],
  },
  {
    id: "02",
    title: "Builders.",
    items: [
      "Engineers and researchers in serious AI",
      "Depth over demos. Craft that compounds",
      "Signal shared inside the circle first",
    ],
  },
  {
    id: "03",
    title: "Investors.",
    items: [
      "Angels and venture operators",
      "Early conviction, patient capital",
      "Access shaped by trust, not tickets",
    ],
  },
] as const;

/**
 * Opening span: inset cinematic hero + §01 idea card + §02 founding seats grid.
 * Prisma composition adapted to inner·hub (Fraunces / bone / radius 0).
 */
export function HomeOpening() {
  return (
    <>
      <HeroInset />
      <AboutIdea />
      <FoundingSeats />
    </>
  );
}

function HeroInset() {
  return (
    <section
      className="relative h-[100svh] p-2 sm:p-3 md:p-5 lg:p-6"
      style={{ backgroundColor: HERO_CHROME }}
    >
      <div
        className="relative h-full w-full overflow-hidden border border-white/[0.08]"
        style={{ backgroundColor: HERO_CHROME }}
      >
        <HeroVideo
          src={HERO_VIDEO}
          className="absolute inset-0 z-0 h-full w-full scale-[1.02] object-cover"
        />
        <div
          aria-hidden
          className="noise-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.55] mix-blend-overlay"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-transparent to-black/70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent"
        />

        <FloatingNavbar />

        <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:px-5 sm:pb-6 md:px-8 md:pb-9 lg:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className="mb-3 flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--bone)]/55 sm:mb-6 sm:gap-3 sm:text-[11px]"
          >
            <span className="size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" />
            İstanbul → Global · Est. 2026
          </motion.div>

          <div className="grid grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-12 md:gap-10">
            <div className="min-w-0 md:col-span-8">
              <h1 className="text-[var(--bone)]">
                <Lockup
                  suffix="hub"
                  className="text-[var(--bone)]"
                  fontSize="clamp(2.75rem, 14vw, 9.5rem)"
                />
              </h1>
              <p className="sr-only">inner hub private circle</p>
            </div>

            <div className="flex flex-col gap-3.5 sm:gap-5 md:col-span-4 md:pb-3">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                className="max-w-[36ch] text-[13px] leading-[1.45] text-[var(--bone)]/70 sm:text-sm md:text-[15px] md:leading-[1.35]"
              >
                A private circle of founders, builders, and investors. Bound not by place or
                status, but by hunger to meet early and build what comes next.
              </motion.p>

              <motion.a
                href="/invitation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
                className="group inline-flex w-full min-h-11 items-center justify-between gap-2.5 bg-[var(--bone)] py-1.5 pl-4 pr-1.5 text-sm font-medium text-black transition-[gap] duration-300 hover:gap-3.5 sm:w-fit sm:min-h-0 sm:pl-5 sm:text-base"
              >
                Request an invitation
                <span className="flex size-9 shrink-0 items-center justify-center bg-black transition-transform duration-300 group-hover:scale-110 sm:size-10">
                  <ArrowUpRight className="size-4 text-[var(--bone)]" strokeWidth={1.75} />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutIdea() {
  return (
    <section
      id="section-01"
      className="bg-[var(--ink)] px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-28"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden border border-white/10">
        {/* Video only inside the rectangle */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <HeroVideo
            src={IDEA_VIDEO}
            className="h-full w-full scale-[1.04] object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
          <div className="noise-overlay absolute inset-0 opacity-[0.3] mix-blend-overlay" />
        </div>

        <div className="relative z-10 px-5 py-14 text-center sm:px-8 sm:py-16 md:px-12 md:py-20">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/60 sm:mb-8 sm:text-xs">
            01 · The idea
          </p>

          <WordsPullUpMultiStyle
            className="mx-auto max-w-3xl justify-center text-3xl leading-[0.95] text-[var(--bone)] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
            segments={[
              { text: "AI is the center.", className: "font-normal" },
              {
                text: "Around it: founders, builders, investors.",
                className: "font-display font-serif italic",
              },
              {
                text: "inner.hub brings them together early.",
                className: "font-normal",
              },
            ]}
          />

          <ScrollTextReveal
            text="It starts in İstanbul. Thirty-four people, chosen one by one, form the founding circle: not members of a platform, but the people who make what comes next possible."
            className="mx-auto mt-10 max-w-2xl text-xs leading-relaxed text-[var(--bone)]/70 sm:mt-12 sm:text-sm md:text-base"
          />
        </div>
      </div>
    </section>
  );
}

function FoundingSeats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="section-02"
      ref={ref}
      className="relative min-h-0 overflow-hidden bg-black px-3 py-12 sm:px-4 sm:py-16 md:min-h-svh md:px-6 md:py-24"
    >
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl sm:mb-12 md:mb-14">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/50 sm:text-xs">
            02 · The first thirty-four
          </p>
          <WordsPullUpMultiStyle
            className="justify-start text-left text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[
              {
                text: "Founding seats for people who meet early.",
                className: "font-normal text-[var(--bone)]",
              },
            {
              text: "Not tickets. Not tiers. The circle.",
              className: "font-normal text-white/40",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4 lg:h-[min(480px,70vh)]">
          {/* Video card */}
          <FeatureCard index={0} inView={inView} className="relative min-h-[240px] overflow-hidden lg:min-h-0">
            <HeroVideo src={FEATURE_VIDEO} className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <p
              className="absolute bottom-4 left-4 right-4 font-medium sm:bottom-5 sm:left-5"
              style={{ color: "#F4F1EC" }}
            >
              Your circle starts here.
            </p>
          </FeatureCard>

          {SEAT_CARDS.map((card, i) => (
            <FeatureCard
              key={card.id}
              index={i + 1}
              inView={inView}
              className="flex min-h-[240px] flex-col bg-[#212121] p-4 sm:p-5 lg:min-h-0"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {card.id}
                </span>
                <span className="size-2.5 bg-[var(--inner-green)] animate-beacon" aria-hidden />
              </div>
              <h3 className="mb-4 text-lg font-medium text-[var(--bone)] sm:text-xl">{card.title}</h3>
              <ul className="flex flex-1 flex-col gap-2.5">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/55">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-[var(--inner-green)]"
                      strokeWidth={2}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/invitation"
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/70 transition-colors hover:text-[var(--bone)]"
              >
                Learn more
                <ArrowUpRight className="size-3.5 -rotate-0" strokeWidth={1.75} />
              </a>
            </FeatureCard>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-10 sm:text-base">
          These thirty-four are not just members. They are the founding members of inner.hub.
        </p>
      </div>
    </section>
  );
}

function FeatureCard({
  children,
  index,
  inView,
  className,
}: {
  children: ReactNode;
  index: number;
  inView: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.65, delay: index * 0.15, ease: CARD_EASE }}
    >
      {children}
    </motion.div>
  );
}
