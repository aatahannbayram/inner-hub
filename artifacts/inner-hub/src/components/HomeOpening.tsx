import { useMemo, useRef, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { WordsPullUpMultiStyle } from "@/components/WordsPullUp";
import { ScrollTextReveal } from "@/components/ScrollTextReveal";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { HeroVideo } from "@/components/HeroVideo";
import { Lockup } from "@/components/Lockup";
import { useT } from "@/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;
const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const FEATURE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

/** Home §01 background — not used elsewhere on the public landing. */
const IDEA_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";

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
  const t = useT();
  return (
    <section
      className="relative h-[100svh] p-2 sm:p-3 md:p-5 lg:p-6"
      style={{ backgroundColor: "var(--ink-fixed)" }}
    >
      <div
        className="relative h-full w-full overflow-hidden border border-white/[0.08]"
        style={{ backgroundColor: "var(--ink-fixed)" }}
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
            className="mb-3 flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--bone-fixed)]/55 sm:mb-6 sm:gap-3 sm:text-[11px]"
          >
            <span className="size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" />
            {t("home.heroTag")}
          </motion.div>

          <div className="grid grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-12 md:gap-10">
            <div className="min-w-0 md:col-span-8">
              <h1 className="text-[var(--bone-fixed)]">
                <Lockup
                  suffix="hub"
                  className="text-[var(--bone-fixed)]"
                  fontSize="clamp(2.75rem, 14vw, 9.5rem)"
                  pulse
                />
              </h1>
              <p className="sr-only">{t("common.privateCircle")}</p>
            </div>

            <div className="flex flex-col gap-3.5 sm:gap-5 md:col-span-4 md:pb-3">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                className="max-w-[36ch] text-[13px] leading-[1.45] text-[var(--bone-fixed)]/70 sm:text-sm md:text-[15px] md:leading-[1.35]"
              >
                {t("home.heroBody")}
              </motion.p>

              <motion.a
                href="/invitation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
                className="group inline-flex w-full min-h-11 items-center justify-between gap-2.5 bg-[var(--bone-fixed)] py-1.5 pl-4 pr-1.5 text-sm font-medium text-[var(--ink-fixed)] transition-[gap] duration-300 hover:gap-3.5 sm:w-fit sm:min-h-0 sm:pl-5 sm:text-base"
              >
                {t("home.requestInvitation")}
                <span className="flex size-9 shrink-0 items-center justify-center bg-[var(--ink-fixed)] transition-transform duration-300 group-hover:scale-110 sm:size-10">
                  <ArrowUpRight className="size-4 text-[var(--bone-fixed)]" strokeWidth={1.75} />
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
  const t = useT();
  return (
    <section
      id="section-01"
      className="bg-[var(--ink-fixed)] px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-28"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden border border-white/10">
        {/* Video only inside the rectangle */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <HeroVideo
            src={IDEA_VIDEO}
            className="h-full w-full scale-[1.04] object-cover"
          />
          <div className="absolute inset-0 bg-[var(--ink-fixed)]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
          <div className="noise-overlay absolute inset-0 opacity-[0.3] mix-blend-overlay" />
        </div>

        <div className="relative z-10 px-5 py-14 text-center sm:px-8 sm:py-16 md:px-12 md:py-20">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/60 sm:mb-8 sm:text-xs">
            {t("home.ideaEyebrow")}
          </p>

          <WordsPullUpMultiStyle
            className="mx-auto max-w-3xl justify-center text-3xl leading-[0.95] text-[var(--bone-fixed)] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
            segments={[
              { text: t("home.ideaLine1"), className: "font-normal" },
              {
                text: t("home.ideaLine2"),
                className: "font-display font-serif italic",
              },
              {
                text: t("home.ideaLine3"),
                className: "font-normal",
              },
            ]}
          />

          <ScrollTextReveal
            text={t("home.ideaReveal")}
            className="mx-auto mt-10 max-w-2xl text-xs leading-relaxed text-[var(--bone-fixed)]/70 sm:mt-12 sm:text-sm md:text-base"
          />
        </div>
      </div>
    </section>
  );
}

function FoundingSeats() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const seatCards = useMemo(
    () => [
      {
        id: "01",
        title: t("home.seatFounders"),
        items: [
          t("home.seatFounders1"),
          t("home.seatFounders2"),
          t("home.seatFounders3"),
          t("home.seatFounders4"),
        ],
      },
      {
        id: "02",
        title: t("home.seatBuilders"),
        items: [t("home.seatBuilders1"), t("home.seatBuilders2"), t("home.seatBuilders3")],
      },
      {
        id: "03",
        title: t("home.seatInvestors"),
        items: [t("home.seatInvestors1"), t("home.seatInvestors2"), t("home.seatInvestors3")],
      },
    ],
    [t],
  );

  return (
    <section
      id="section-02"
      ref={ref}
      className="relative min-h-0 overflow-hidden bg-[var(--ink-fixed)] px-3 py-12 sm:px-4 sm:py-16 md:min-h-svh md:px-6 md:py-24"
    >
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl sm:mb-12 md:mb-14">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/50 sm:text-xs">
            {t("home.seatsEyebrow")}
          </p>
          <WordsPullUpMultiStyle
            className="justify-start text-left text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[
              {
                text: t("home.seatsLine1"),
                className: "font-normal text-[var(--bone-fixed)]",
              },
              {
                text: t("home.seatsLine2"),
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
              {t("home.circleStartsHere")}
            </p>
          </FeatureCard>

          {seatCards.map((card, i) => (
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
              <h3 className="mb-4 text-lg font-medium text-[var(--bone-fixed)] sm:text-xl">{card.title}</h3>
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
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/70 transition-colors hover:text-[var(--bone-fixed)]"
              >
                {t("home.learnMore")}
                <ArrowUpRight className="size-3.5 -rotate-0" strokeWidth={1.75} />
              </a>
            </FeatureCard>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-10 sm:text-base">
          {t("home.seatsFooter")}
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
