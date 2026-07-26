import { useEffect, useRef, useState } from "react";
import {
  Linkedin,
  Instagram,
  Zap,
  Users,
  TrendingUp,
  BookOpen,
  Radio,
  Fingerprint,
  Code2,
  Target,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import { motion, useInView, useScroll } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { WordsPullUp } from "@/components/WordsPullUp";
import { ScrollTextReveal } from "@/components/ScrollTextReveal";
import { Lockup } from "@/components/Lockup";
import { useLocale, useT } from "@/i18n";
import { Grain } from "@/components/Grain";
import { IndexRail } from "@/components/IndexRail";
import { DiagramCircle } from "@/components/DiagramCircle";
import { Preloader } from "@/components/Preloader";
import { PlatformFeatures, type PlatformFeature } from "@/components/PlatformFeatures";
import { HeroVideo } from "@/components/HeroVideo";
import { WhatsNextCinematic } from "@/components/WhatsNextCinematic";
import { HomeOpening } from "@/components/HomeOpening";
import { useLenis } from "@/hooks/useLenis";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Platform modules ─────────────────────────────────────────────────────────
const MODULES = [
  {
    id: "signal",
    name: "inner·signal",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    icon: Zap,
    tag: "AI Layer",
  },
  {
    id: "match",
    name: "inner·match",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    icon: Users,
    tag: "Matching",
  },
  {
    id: "capital",
    name: "inner·capital",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    icon: TrendingUp,
    tag: "Investments",
  },
  {
    id: "vault",
    name: "inner·vault",
    desc: "Shared knowledge base. Pitch decks, market research, and documents. Permissioned and searchable.",
    icon: BookOpen,
    tag: "Knowledge",
  },
  {
    id: "pulse",
    name: "inner·pulse",
    desc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters. Inside only.",
    icon: Radio,
    tag: "Intelligence",
  },
  {
    id: "id",
    name: "inner·id",
    desc: "Portable verified membership identity. Your inner.hub membership carries weight beyond the platform.",
    icon: Fingerprint,
    tag: "Identity",
  },
  {
    id: "api",
    name: "inner·api",
    desc: "Platform API for integrations and partners. Build on top of the inner.hub infrastructure.",
    icon: Code2,
    tag: "Platform",
  },
  {
    id: "bounty",
    name: "inner·bounty",
    desc: "Community task system. Companies post challenges, members solve them, platform facilitates.",
    icon: Target,
    tag: "Marketplace",
  },
];

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: "signal",
    name: "inner·signal",
    tag: "AI Layer",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
    },
  },
  {
    id: "match",
    name: "inner·match",
    tag: "Matching",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4",
    },
  },
  {
    id: "capital",
    name: "inner·capital",
    tag: "Investments",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4",
    },
  },
];

// ─── Marquee strip ────────────────────────────────────────────────────────────
const MARQUEE_MODULES = MODULES.map((m) => ({
  id: m.id,
  name: m.name,
  icon: m.icon,
  tag: m.tag,
}));

function MarqueeStrip() {
  const loop = [...MARQUEE_MODULES, ...MARQUEE_MODULES, ...MARQUEE_MODULES];

  return (
    <div className="relative z-10 overflow-hidden bg-[var(--ink-fixed)] py-3 sm:py-4">
      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--ink-fixed)] to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--ink-fixed)] to-transparent sm:w-20"
      />

      <div className="relative mx-auto max-w-[100vw] overflow-hidden border-y border-white/10 bg-[var(--bone)] py-3.5 sm:py-4">
        <motion.div
          className="flex w-max items-center gap-0"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 36, ease: "linear", repeat: Infinity }}
        >
          {loop.map((item, i) => {
            const Icon = item.icon;
            return (
              <a
                key={`${item.id}-${i}`}
                href="#section-03"
                className="group flex shrink-0 items-center gap-3 px-5 sm:gap-3.5 sm:px-7"
              >
                <span className="flex size-7 items-center justify-center bg-[var(--ink)] transition-colors group-hover:bg-[var(--inner-green)] sm:size-8">
                  <Icon
                    className="size-3.5 text-[var(--bone)] transition-colors group-hover:text-[var(--ink)] sm:size-4"
                    strokeWidth={1.6}
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] sm:text-[11px]">
                    {item.name}
                  </span>
                  <span className="hidden font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--ink)]/40 sm:block">
                    {item.tag}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="ml-5 size-1 shrink-0 bg-[var(--inner-green)] sm:ml-7"
                />
              </a>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatItem({ n, label, suffix = "" }: { n: number; label: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="font-display font-serif italic text-4xl leading-none mb-2 text-[var(--bone-fixed)] sm:mb-3 sm:text-5xl md:text-7xl">
        <Counter to={n} suffix={suffix} />
      </span>
      <span className="font-mono text-[9px] uppercase tracking-widest opacity-40 text-[var(--bone-fixed)] sm:text-label">{label}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useLenis(true);
  const t = useT();
  const { locale } = useLocale();

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);

  return (
    <div lang={locale} className="min-h-screen bg-background text-foreground flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest">
        {t("common.skipToContent")}
      </a>

      <ScrollProgress />
      <Preloader />
      <Grain />
      <IndexRail />

      <main id="main-content" className="flex-grow">

        {/* ── Hero + 01 + 02 (Prisma composition → inner·hub) ── */}
        <HomeOpening />

        {/* ── Marquee ── */}
        <MarqueeStrip />

        {/* ── 03 · The platform ── */}
        <section id="section-03">
          <PlatformFeatures features={PLATFORM_FEATURES} restModules={MODULES.slice(3)} />
        </section>

        {/* ── 04–05 · What this is → Entry (one continuous dark, video-anchored span) ── */}
        <div className="relative overflow-hidden bg-black border-t border-border/15">
          <div className="absolute inset-x-0 top-0 h-[85vh] md:h-[95vh] z-0" aria-hidden="true">
            <HeroVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black" />
          </div>

          {/* 04 · What this is */}
          <section id="section-04" className="relative z-10 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 md:px-12 md:pt-36 lg:px-[10%]">
            <div className="mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs">
              <span>04 · What this is</span>
              <span className="whitespace-nowrap">The point</span>
            </div>
            <WordsPullUp
              text="Big things start here."
              className="font-display font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--bone-fixed)] max-w-3xl mb-8 sm:mb-10 text-balance"
            />
            <ScrollTextReveal
              text="New ideas are discussed here, tested here, and supported here by people who can actually build them and fund them."
              className="max-w-[46ch] text-[var(--bone-fixed)]"
              style={{ fontSize: "clamp(17px, 2.4vw, 26px)", lineHeight: 1.55, opacity: 0.85 }}
            />
          </section>

          {/* 05 · Entry */}
          <section id="section-05" className="relative z-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-32 md:px-12 md:pb-48 lg:px-[10%]">
            <div className="mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs">
              <span>05 · Entry</span>
              <span className="whitespace-nowrap">By invitation</span>
            </div>
            <WordsPullUp
              text="Entry is by invitation. Always."
              className="font-display font-serif italic text-3xl sm:text-4xl md:text-5xl max-w-2xl mb-6 sm:mb-8 text-balance text-[var(--bone-fixed)]"
            />
            <FadeIn delay={0.2}>
              <p className="mb-12 max-w-[65ch] text-base leading-[1.7] text-[var(--bone-fixed)]/80 sm:mb-20 sm:text-lg">
                There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally.
              </p>
            </FadeIn>
            <div className="max-w-3xl">
              {[
                { label: "Your name", line: "Someone inside the circle puts your name forward." },
                { label: "Consideration", line: "We take our time. Fit beats fame." },
                { label: "Invitation", line: "If it is right, you hear from us directly." },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.1}>
                  <div className="flex flex-col gap-2 border-t border-white/15 py-5 last:border-b md:flex-row md:items-baseline md:gap-12 md:py-6">
                    <div className="w-full flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-xs md:w-48">{item.label}</div>
                    <p className="text-base text-[var(--bone-fixed)]/90 sm:text-lg">{item.line}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        </div>

        {/* ── 06 · The gathering (ink bridge into cinematic) ── */}
        <section
          id="section-06"
          className="relative overflow-hidden border-t border-border/15 bg-[var(--ink-fixed)] px-4 py-20 text-[var(--bone-fixed)] transition-colors duration-700 sm:px-6 sm:py-32 md:px-12 md:py-48 lg:px-[10%]"
        >
          <div className="pointer-events-none absolute -right-24 top-0 size-[520px] bg-[var(--inner-green)]/[0.04] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

          <FadeIn>
            <div className="mb-12 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest opacity-60 sm:mb-20 sm:gap-6 sm:pb-6 sm:text-xs">
              <span>06 · The gathering</span>
              <span className="whitespace-nowrap">Sep 2026 · İstanbul</span>
            </div>
          </FadeIn>
          <WordsPullUp
            text="The first inner.hub gathering. İstanbul, September 2026."
            className="mb-12 max-w-3xl text-balance font-display font-serif italic text-3xl sm:mb-20 sm:text-4xl md:mb-24 md:text-5xl lg:text-6xl"
          />

          <div className="mb-12 flex flex-col gap-12 sm:mb-20 sm:gap-16 lg:mb-24 lg:flex-row lg:items-center">
            <div className="grid min-w-0 grid-cols-3 gap-3 sm:gap-6 md:gap-10 lg:flex-1">
              <StatItem n={34} label="People" />
              <StatItem n={2} label="Days" />
              <StatItem n={8} label="Modules" />
            </div>
            <FadeIn delay={0.2} className="flex-shrink-0">
              <DiagramCircle />
            </FadeIn>
          </div>

          <FadeIn delay={0.15}>
            <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-2xl text-balance font-serif text-xl opacity-80 sm:text-2xl md:text-3xl">
                Thirty-four people. Two days. One circle. The first of many.
              </p>
              <a
                href="#section-07"
                className="group inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:border-white/60 hover:bg-white hover:text-black sm:min-h-0 sm:justify-start"
              >
                What&apos;s next
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </FadeIn>
        </section>

        {/* ── 07 · What's next (cinematic) ── */}
        <WhatsNextCinematic />

      </main>

      {/* Footer */}
      <footer
        id="site-footer"
        className="relative overflow-hidden border-t border-white/10 bg-[var(--ink-fixed)] px-4 pb-8 pt-12 text-[var(--bone-fixed)] sm:px-6 sm:pt-16 md:px-12 md:pt-20 lg:px-[10%]"
      >
        <div className="pointer-events-none absolute -left-20 top-10 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-5">
            <Lockup className="text-[var(--bone-fixed)]" fontSize="clamp(28px, 4vw, 36px)" />
            <p className="max-w-[36ch] text-sm font-light leading-relaxed text-[var(--bone-fixed)]/70">
              {t("home.footerTagline")}
            </p>
            <a
              href="mailto:destek@inner.digital"
              className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/55 transition-colors hover:text-[var(--bone-fixed)]"
            >
              <Mail className="size-3.5" />
              destek@inner.digital
            </a>
          </div>

          <div>
            <p className="mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40">
              {t("home.footerNavigate")}
            </p>
            <ul className="space-y-2.5">
              {[
                { label: t("publicNav.platform"), href: "#section-03" },
                { label: t("publicNav.gathering"), href: "#section-06" },
                { label: t("publicNav.next"), href: "#section-07" },
                { label: t("home.panel"), href: "/panel" },
                { label: t("publicNav.invitation"), href: "/invitation" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-mono text-caption uppercase tracking-widest text-[var(--bone-fixed)]/65 transition-colors hover:text-[var(--bone-fixed)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40">
              {t("home.footerConnect")}
            </p>
            <div className="mb-6 flex items-center gap-4">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="inner on LinkedIn"
                className="border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]"
              >
                <Linkedin size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="inner on Instagram"
                className="border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
            </div>
            <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
              İstanbul → Global
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
            © 2026 inner hub · All rights reserved
          </p>
          <div className="leading-none text-[var(--bone-fixed)]" aria-hidden="true">
            <Lockup fontSize="clamp(2.75rem, 10vw, 7.5rem)" />
          </div>
        </div>
        <span className="sr-only">inner hub</span>
      </footer>
    </div>
  );
}
