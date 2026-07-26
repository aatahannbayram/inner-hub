import { ArrowRight, BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { AsciiField } from "@/components/AsciiField";
import { EditorialCard } from "@/components/panel/EditorialCard";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useScrubVideo } from "@/hooks/useScrubVideo";
import { useTypewriter } from "@/hooks/useTypewriter";
import type { PortraitConfig } from "@/components/panel/ProceduralPortrait";
import { posterForVideo } from "@/lib/videoPosters";
import { cleanDisplayText } from "@/lib/displayText";
import { useT } from "@/i18n";

const DASHBOARD_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";

const SIGNAL_CARD_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";
const GATHERING_CARD_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const VAULT_CARD_PORTRAIT: PortraitConfig = {
  renderMode: "contour",
  bgMode: "blur",
  bgBlur: 12,
  bgOpacity: 46,
  cellSize: 26,
  coverage: 64,
  invert: true,
  saturation: 100,
  grayscale: 0,
  tintOpacity: 0,
  color: "#0A0A0A",
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    bloom: { enabled: true, intensity: 25 },
  },
  animStyle: "wave",
  animSpeed: 100,
  animIntensity: 60,
};

const EDITORIAL_PORTRAIT = "/editorial/circle-portrait.jpg";

const STAT_CARD_INTERACTIVE =
  "outline-none transition-all duration-150 ease-out hover:bg-[var(--ink)]/[0.04] hover:border-[var(--ink)]/25 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--inner-green)] motion-reduce:transition-none motion-reduce:active:scale-100";

const STAT_CARD_ACCENT =
  "absolute inset-y-0 left-0 w-[2px] bg-[var(--ink)]/12 transition-colors duration-150 ease-out group-hover:bg-[var(--inner-green)] motion-reduce:transition-none";

function StatCard({
  label,
  icon: Icon,
  href,
  value,
  sub,
  emptyLabel,
  emptyActionLabel,
  ariaLabel,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  value: number | string;
  sub?: string;
  emptyLabel?: string;
  emptyActionLabel?: string;
  ariaLabel: string;
}) {
  const isEmpty = typeof value === "number" && value === 0 && !!emptyLabel;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`group relative flex min-h-11 flex-col justify-center gap-2 overflow-hidden panel-glass px-4 py-3.5 sm:px-5 sm:py-4 ${STAT_CARD_INTERACTIVE}`}
    >
      <span aria-hidden className={STAT_CARD_ACCENT} />
      <div className="flex items-center gap-1.5 pl-1">
        <Icon aria-hidden className="size-4 shrink-0 text-[var(--ink-muted)] opacity-60" />
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">{label}</p>
      </div>

      {isEmpty ? (
        <div className="pl-1">
          <p className="text-sm text-[var(--ink-body)]">{emptyLabel}</p>
          {emptyActionLabel && (
            <span className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)] transition-colors duration-150 ease-out group-hover:text-[var(--ink)] motion-reduce:transition-none">
              {emptyActionLabel} <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      ) : (
        <div className="pl-1">
          <p className="font-sans font-semibold text-2xl tabular-nums leading-none text-[var(--ink)] sm:text-[28px]">
            {value}
          </p>
          {sub && (
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">{sub}</p>
          )}
        </div>
      )}
    </Link>
  );
}

function CourseRow({ course }: { course: DashCourse }) {
  const t = useT();
  const pct = Math.max(0, Math.min(100, course.progressPct));
  const status =
    pct === 0 ? t("dashboard.notStarted") : pct >= 100 ? t("dashboard.completed") : t("dashboard.inProgress");

  return (
    <Link
      href="/panel/courses"
      className="group relative flex flex-col gap-3 overflow-hidden panel-glass p-4 transition-colors hover:border-[var(--ink)]/28 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--inner-green)]/40 transition-colors group-hover:bg-[var(--inner-green)]"
      />
      <div className="min-w-0 flex-1 pl-1">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3
            className="font-display font-serif text-base leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-lg"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
          >
            {cleanDisplayText(course.title)}
          </h3>
          <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--ink)]">%{pct}</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--ink)]/[0.08]">
          <div
            className="h-full bg-[var(--inner-green)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
          {status}
          <span className="mx-1.5 text-[var(--ink)]/20">·</span>
          <span className="inline-flex items-center gap-0.5 transition-colors group-hover:text-[var(--ink)]">
            {t("dashboard.continue")} <ArrowRight className="size-2.5" />
          </span>
        </p>
      </div>
    </Link>
  );
}

function PerkCard({
  perk,
}: {
  perk: { id: number; brand: string; title: string; description: string; logoUrl: string | null; badge: string };
}) {
  const t = useT();
  const title = cleanDisplayText(perk.title).replace(/!+\s*$/, "");
  return (
    <Link
      href="/panel/perks"
      aria-label={`${perk.brand} — ${title}`}
      className={`group relative flex h-full min-h-11 flex-col overflow-hidden panel-glass p-4 sm:p-5 ${STAT_CARD_INTERACTIVE}`}
    >
      <span aria-hidden className={STAT_CARD_ACCENT} />
      <div className="mb-3 flex items-start justify-between gap-2 pl-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center border border-[var(--ink)]/12 bg-[var(--ink)]/[0.04] text-[var(--ink-muted)]">
            {perk.logoUrl ? (
              <img src={perk.logoUrl} alt="" className="size-6 object-contain" />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wide" lang="en">
                {perk.brand.slice(0, 2)}
              </span>
            )}
          </div>
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            {perk.brand}
          </p>
        </div>
        {perk.badge && (
          <span
            lang="tr"
            className="shrink-0 border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--inner-green)]"
          >
            {perk.badge}
          </span>
        )}
      </div>
      <h3 className="mb-1.5 pl-1 font-sans text-base font-medium leading-snug text-[var(--ink)]">{title}</h3>
      <p className="mb-4 flex-1 pl-1 text-sm leading-relaxed text-[var(--ink-body)] line-clamp-2">
        {perk.description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pl-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)] transition-colors duration-150 ease-out group-hover:text-[var(--ink)] motion-reduce:transition-none">
        {t("dashboard.details")} <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}

type DashCourse = { id: number; title: string; progressPct: number };
type DashEvent = { id: number; title: string };

// ─── Hero ─────────────────────────────────────────────────────────────────────

function DashboardHero({ userName }: { userName: string }) {
  const t = useT();
  const scrubVideoRef = useScrubVideo();
  const greeting = t("dashboard.greetingLine", { name: userName });
  const ambient = t("dashboard.ambientLine", { name: userName });
  const { displayed: typedGreeting, done: typedDone } = useTypewriter(greeting);

  // brand: uppercase class Türkçe (tr) bağlamında İ/ı çevirimi uygular; marka adı
  // İngilizce kalmalı ("İNNER" değil "INNER") — bu yüzden ayrı, lang="en" ile render edilir.
  const quickNav: { brand?: string; label: string; href: string }[] = [
    { brand: "inner·signal", label: t("dashboard.goToSignal"), href: "/panel/signal" },
    { brand: "inner·match", label: t("dashboard.goToMatch"), href: "/panel/match" },
    { brand: "inner·capital", label: t("dashboard.goToCapital"), href: "/panel/capital" },
    { label: t("dashboard.openEvents"), href: "/panel/events" },
  ];

  return (
    <div
      className="relative -mx-3 -mt-5 overflow-hidden sm:-mx-5 sm:-mt-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(62vh, 620px)", minHeight: 360 }}
    >
      <video
        ref={scrubVideoRef}
        muted
        playsInline
        poster={posterForVideo(DASHBOARD_VIDEO_SRC)}
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "70% center" }}
        src={DASHBOARD_VIDEO_SRC}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--ink-fixed)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink-fixed)]/85 via-[var(--ink-fixed)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--ink-fixed)]/55 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-10 md:px-12 md:pb-14">
        <p
          aria-hidden="true"
          className="mb-4 hidden max-w-[46ch] select-none font-serif italic leading-[1.3] text-white/35 sm:block"
          style={{ fontSize: "clamp(16px, 2.2vw, 22px)", filter: "blur(3px)" }}
        >
          {ambient.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <p
          className="mb-5 max-w-[42ch] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)] sm:mb-6"
          style={{ fontSize: "clamp(22px, 3.4vw, 34px)", lineHeight: 1.25, minHeight: 44 }}
        >
          {typedGreeting}
          {!typedDone && (
            <span className="animate-blink ml-[2px] inline-block h-[0.9em] w-[2px] bg-white align-middle" />
          )}
        </p>

        <div className="flex flex-wrap gap-y-2">
          {quickNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mx-[0.2em] mb-[0.4em] inline-flex min-h-11 items-center justify-center whitespace-nowrap border border-black/10 bg-white px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[12px]"
            >
              {item.brand && <span lang="en">{item.brand}</span>}
              {item.label}
            </Link>
          ))}
          <Link
            href="/panel/profile"
            className="mx-[0.2em] mb-[0.4em] inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border border-white bg-transparent px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-black sm:px-5 sm:text-[12px]"
          >
            {t("dashboard.completeProfile")}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Dashboard({
  userName = "Ata",
  profileCompletionPct = 0,
}: {
  userName?: string;
  profileCompletionPct?: number;
}) {
  const t = useT();
  // Dashboard stats fail soft — 0 sonuç göster, hata banner'ı yok (bilinçli tasarım kararı).
  const { data: coursesData } = useApiQuery<{ courses: { id: number; title: string; progressPct?: number }[] }>(
    ["courses"],
    "/api/courses",
  );
  const { data: eventsData } = useApiQuery<{ events: { id: number; title: string }[] }>(
    ["events"],
    "/api/events",
  );
  const { data: perksData } = useApiQuery<{ perks: { id: number; brand: string; title: string; description: string; logoUrl: string | null; badge: string }[] }>(
    ["perks"],
    "/api/perks",
  );
  const courses: DashCourse[] = (coursesData?.courses ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    progressPct: c.progressPct ?? 0,
  }));
  const events: DashEvent[] = (eventsData?.events ?? []).map((e) => ({ id: e.id, title: e.title }));
  const perks = perksData?.perks ?? [];

  const spotlightCards = [
    {
      title: "inner·signal",
      eyebrow: t("dashboard.signalEyebrow"),
      description: t("dashboard.signalDesc"),
      href: "/panel/signal",
      videoSrc: SIGNAL_CARD_VIDEO,
      videoPoster: "/posters/courses-hero.jpg",
    },
    {
      title: "Eylül Gathering",
      eyebrow: t("dashboard.gatheringEyebrow"),
      description: t("dashboard.gatheringDesc"),
      href: "/panel/events",
      videoSrc: GATHERING_CARD_VIDEO,
      videoPoster: "/posters/capital-events.jpg",
    },
    {
      title: "inner·vault",
      eyebrow: t("dashboard.vaultEyebrow"),
      description: t("dashboard.vaultDesc"),
      href: "/panel/vault",
      portrait: { src: EDITORIAL_PORTRAIT, config: VAULT_CARD_PORTRAIT },
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      <DashboardHero userName={userName} />

      <FadeIn delay={0.06}>
        <section>
          <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("dashboard.featured")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
            {spotlightCards.map((card, i) => (
              <EditorialCard key={card.href} {...card} tone="light" cta={t("common.open")} index={i + 1} />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="relative overflow-hidden panel-glass-ink p-5 text-[var(--bone-fixed)] sm:p-6">
          <AsciiField tone="dark" />
          <AmbientCardBackground />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/57">
                {t("dashboard.newTerm")}
              </p>
              <p className="text-lg font-light text-[var(--bone-fixed)]">{t("dashboard.enrollCourse2")}</p>
              <p className="text-sm text-[var(--bone-fixed)]/50">
                <span lang="en">inner·hub</span> · {t("dashboard.termApplicationsOpen")}
              </p>
            </div>
            <Link
              href="/panel/applications"
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 border border-[var(--bone-fixed)]/20 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-caption uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-80 sm:w-auto"
            >
              {t("dashboard.apply")} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <StatCard
            label={t("dashboard.myCourses")}
            icon={BookOpen}
            href="/panel/courses"
            value={courses.length}
            sub={t("dashboard.enrolled")}
            emptyLabel={t("dashboard.noCoursesYet")}
            emptyActionLabel={t("courses.exploreCta")}
            ariaLabel={
              courses.length > 0
                ? `${t("dashboard.myCourses")}: ${courses.length} ${t("dashboard.enrolled")}`
                : `${t("dashboard.myCourses")}: ${t("dashboard.noCoursesYet")}`
            }
          />
          <StatCard
            label={t("nav.events")}
            icon={CalendarDays}
            href="/panel/events"
            value={events.length}
            sub={t("dashboard.upcoming")}
            emptyLabel={t("dashboard.noUpcomingEvents")}
            emptyActionLabel={t("events.openCalendar")}
            ariaLabel={
              events.length > 0
                ? `${t("nav.events")}: ${events.length} ${t("dashboard.upcoming")}`
                : `${t("nav.events")}: ${t("dashboard.noUpcomingEvents")}`
            }
          />
          <StatCard
            label={t("dashboard.programProgress")}
            icon={Sparkles}
            href="/panel/profile"
            value={`%${profileCompletionPct}`}
            sub={t("courses.completed")}
            ariaLabel={`${t("dashboard.programProgress")}: %${profileCompletionPct}`}
          />
        </div>
      </FadeIn>

      {courses.length > 0 && (
        <FadeIn delay={0.12}>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  {t("dashboard.myCourses")}
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{t("dashboard.continueFrom")}</p>
              </div>
              <Link
                href="/panel/courses"
                className="inline-flex min-h-10 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
              >
                {t("dashboard.viewAll")} <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {courses.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.15} className="-mt-5">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.05] pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink)]">
              {t("nav.perks")}
              <span className="text-[var(--ink-muted)]">
                {" "}
                · {perks.length} {t("dashboard.activePerks")}
              </span>
            </p>
            <Link
              href="/panel/perks"
              className="inline-flex min-h-10 shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)] transition-colors duration-150 ease-out hover:text-[var(--ink)] motion-reduce:transition-none"
            >
              {t("dashboard.viewAll")} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {perks.slice(0, 3).map((perk) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
