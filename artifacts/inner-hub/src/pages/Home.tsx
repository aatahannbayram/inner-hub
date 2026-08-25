import { useEffect } from "react";
import {
  Zap,
  Users,
  TrendingUp,
  BookOpen,
  Radio,
  Fingerprint,
  Code2,
  Target,
} from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { WordsPullUp } from "@/components/WordsPullUp";
import { ScrollTextReveal } from "@/components/ScrollTextReveal";
import { Lockup } from "@/components/Lockup";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocale, useT, localizedPath } from "@/i18n";
import { Grain } from "@/components/Grain";
import { IndexRail } from "@/components/IndexRail";
import { Preloader } from "@/components/Preloader";
import { PlatformFeatures, type PlatformFeature } from "@/components/PlatformFeatures";
import { HeroVideo } from "@/components/HeroVideo";
import { WhatsNextCinematic } from "@/components/WhatsNextCinematic";
import { HomeOpening } from "@/components/HomeOpening";
import { useLenis } from "@/hooks/useLenis";
import { useSeo, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

// ─── Platform module media (copy comes from i18n) ─────────────────────────────
const FEATURE_MEDIA = {
  signal:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  match:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4",
  capital:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4",
} as const;

type HomeModule = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Zap;
  tag: string;
  phase: "live" | "september" | "roadmap";
};

function buildHomeModules(t: (key: string) => string): HomeModule[] {
  return [
    {
      id: "signal",
      name: "inner·signal",
      desc: t("home.modSignalDesc"),
      icon: Zap,
      tag: t("home.modSignalTag"),
      phase: "live",
    },
    {
      id: "match",
      name: "inner·match",
      desc: t("home.modMatchDesc"),
      icon: Users,
      tag: t("home.modMatchTag"),
      phase: "live",
    },
    {
      id: "capital",
      name: "inner·capital",
      desc: t("home.modCapitalDesc"),
      icon: TrendingUp,
      tag: t("home.modCapitalTag"),
      phase: "live",
    },
    {
      id: "pulse",
      name: "inner·pulse",
      desc: t("home.modPulseDesc"),
      icon: Radio,
      tag: t("home.modPulseTag"),
      phase: "september",
    },
    {
      id: "vault",
      name: "inner·vault",
      desc: t("home.modVaultDesc"),
      icon: BookOpen,
      tag: t("home.modVaultTag"),
      phase: "live",
    },
    {
      id: "id",
      name: "inner·id",
      desc: t("home.modIdDesc"),
      icon: Fingerprint,
      tag: t("home.modIdTag"),
      phase: "live",
    },
    {
      id: "api",
      name: "inner·api",
      desc: t("home.modApiDesc"),
      icon: Code2,
      tag: t("home.modApiTag"),
      phase: "live",
    },
    {
      id: "bounty",
      name: "inner·bounty",
      desc: t("home.modBountyDesc"),
      icon: Target,
      tag: t("home.modBountyTag"),
      phase: "roadmap",
    },
  ];
}

function buildPlatformFeatures(modules: HomeModule[]): PlatformFeature[] {
  return modules
    .filter((m) => m.phase === "live" && m.id in FEATURE_MEDIA)
    .map((m) => ({
      id: m.id,
      name: m.name,
      tag: m.tag,
      desc: m.desc,
      media: {
        type: "video" as const,
        src: FEATURE_MEDIA[m.id as keyof typeof FEATURE_MEDIA],
      },
    }));
}

// ─── Marquee strip ────────────────────────────────────────────────────────────
function MarqueeStrip({ modules }: { modules: HomeModule[] }) {
  const loop = [...modules, ...modules, ...modules];

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

      <div className="relative w-full overflow-hidden border-y border-white/10 bg-[var(--ink-fixed)] py-3.5 sm:py-4">
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
                <span className="flex size-7 items-center justify-center bg-white/10 transition-colors group-hover:bg-[var(--inner-green)] sm:size-8">
                  <Icon
                    className="size-3.5 text-[var(--bone-fixed)] transition-colors group-hover:text-[var(--ink-fixed)] sm:size-4"
                    strokeWidth={1.6}
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span
                    lang="en"
                    className="font-mono text-[10px] tracking-[0.16em] text-[var(--bone-fixed)] sm:text-[11px]"
                  >
                    {item.name.toUpperCase()}
                  </span>
                  <span className="hidden font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--bone-fixed)]/40 sm:block">
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useLenis(true);
  const t = useT();
  const { locale } = useLocale();
  const modules = buildHomeModules(t);
  const platformFeatures = buildPlatformFeatures(modules);
  const liveExtraModules = modules.filter(
    (m) => m.phase === "live" && !(m.id in FEATURE_MEDIA),
  );
  const septemberModules = modules.filter((m) => m.phase === "september");
  const roadmapModules = modules.filter((m) => m.phase === "roadmap");

  useSeo({
    title: t("home.metaTitle"),
    description: t("home.metaDescription"),
    canonicalPath: localizedPath("/", locale),
    type: "website",
    jsonLd: [organizationJsonLd(), websiteJsonLd(locale, t("home.metaDescription"))],
  });

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);

  return (
    <div lang={locale} className="site-atmosphere flex min-h-screen flex-col">
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
        <MarqueeStrip modules={modules.filter((m) => m.phase === "live")} />

        {/* ── 03 · The platform ── */}
        <section id="section-03">
          <PlatformFeatures
            features={platformFeatures}
            liveExtraModules={liveExtraModules}
            septemberModules={septemberModules}
            roadmapModules={roadmapModules}
          />
        </section>

        {/* ── 04-05 · What this is → Entry (one continuous dark, video-anchored span) ── */}
        <div className="relative overflow-hidden bg-[var(--ink-fixed)] border-t border-border/15">
          <div className="absolute inset-x-0 top-0 h-[85vh] md:h-[95vh] z-0" aria-hidden="true">
            <HeroVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-[var(--ink-fixed)]" />
          </div>

          {/* 04 · What this is */}
          <section id="section-04" className="relative z-10 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 md:px-12 md:pt-36 lg:px-[10%]">
            <div className="mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs">
              <span>{t("home.whatThisIsEyebrow")}</span>
              <span className="whitespace-nowrap">{t("home.thePoint")}</span>
            </div>
            <WordsPullUp
              text={t("home.bigThings")}
              className="font-display font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--bone-fixed)] max-w-3xl mb-8 sm:mb-10 text-balance"
            />
            <ScrollTextReveal
              text={t("home.whatThisIsBody")}
              className="max-w-[46ch] text-[var(--bone-fixed)]"
              style={{ fontSize: "clamp(17px, 2.4vw, 26px)", lineHeight: 1.55, opacity: 0.85 }}
            />
          </section>

          {/* 05 · Entry */}
          <section id="section-05" className="relative z-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-32 md:px-12 md:pb-48 lg:px-[10%]">
            <div className="mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs">
              <span>{t("home.entryEyebrow")}</span>
              <span className="whitespace-nowrap">{t("home.byInvitation")}</span>
            </div>
            <WordsPullUp
              text={t("home.entryTitle")}
              className="font-display font-serif italic text-3xl sm:text-4xl md:text-5xl max-w-2xl mb-6 sm:mb-8 text-balance text-[var(--bone-fixed)]"
            />
            <FadeIn delay={0.2}>
              <p className="mb-12 max-w-[65ch] text-base leading-[1.7] text-[var(--bone-fixed)]/80 sm:mb-20 sm:text-lg">
                {t("home.entryBody")}
              </p>
            </FadeIn>
            <div className="max-w-3xl">
              {[
                { label: t("home.entryStepName"), line: t("home.entryStepNameLine") },
                { label: t("home.entryStepConsider"), line: t("home.entryStepConsiderLine") },
                { label: t("home.entryStepInvite"), line: t("home.entryStepInviteLine") },
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

        {/* ── 06 · What's next (cinematic) ── */}
        <WhatsNextCinematic />

      </main>

      <SiteFooter />
    </div>
  );
}
