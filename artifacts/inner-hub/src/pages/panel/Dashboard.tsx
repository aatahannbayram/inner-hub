import { ArrowRight, BookOpen, CalendarDays, Gift } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { AsciiField } from "@/components/AsciiField";
import { EditorialCard } from "@/components/panel/EditorialCard";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { useApiQuery } from "@/hooks/useApiQuery";
import { avatarColor } from "@/lib/avatarColor";
import { useScrubVideo } from "@/hooks/useScrubVideo";
import { useTypewriter } from "@/hooks/useTypewriter";
import type { PortraitConfig } from "@/components/panel/ProceduralPortrait";
import { posterForVideo } from "@/lib/videoPosters";
import { cleanDisplayText } from "@/lib/displayText";

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

// brand: uppercase class Türkçe (tr) bağlamında İ/ı çevirimi uygular; marka adı
// İngilizce kalmalı ("İNNER" değil "INNER") — bu yüzden ayrı, lang="en" ile render edilir.
const QUICK_NAV: { brand?: string; label: string; href: string }[] = [
  { brand: "inner·signal", label: "'i gör", href: "/panel/signal" },
  { brand: "inner·match", label: "'e git", href: "/panel/match" },
  { brand: "inner·capital", label: "'i incele", href: "/panel/capital" },
  { label: "Etkinlikleri gör", href: "/panel/events" },
];

const EDITORIAL_PORTRAIT = "/editorial/circle-portrait.jpg";

const spotlightCards = [
  {
    title: "inner·signal",
    eyebrow: "Bu hafta",
    description: "Topluluk hafızasından çıkan sinyaller ve bağlantı önerileri.",
    href: "/panel/signal",
    videoSrc: SIGNAL_CARD_VIDEO,
    videoPoster: "/posters/courses-hero.jpg",
  },
  {
    title: "Eylül Gathering",
    eyebrow: "Sep 2026 · İstanbul",
    description: "Otuz dört kişi. İki gün. Bir daire. İlk buluşma.",
    href: "/panel/events",
    videoSrc: GATHERING_CARD_VIDEO,
    videoPoster: "/posters/capital-events.jpg",
  },
  {
    title: "inner·vault",
    eyebrow: "Bilgi tabanı",
    description: "Pitch deck’ler, araştırmalar ve notlar · yalnızca daire içinde.",
    href: "/panel/vault",
    portrait: { src: EDITORIAL_PORTRAIT, config: VAULT_CARD_PORTRAIT },
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 transition-colors hover:border-[var(--ink)]/30 sm:gap-4 sm:p-5"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ink)]/15 transition-colors group-hover:bg-[var(--inner-green)]"
      />
      <div className="ml-1 flex size-10 shrink-0 items-center justify-center border border-[var(--ink)]/[0.1] bg-[var(--ink)]/[0.03] transition-colors group-hover:border-[var(--ink)]/25">
        <Icon className="size-4 text-[var(--ink-muted)]" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{label}</p>
        <p
          className="mt-0.5 font-display font-serif text-2xl tabular-nums leading-none text-[var(--ink)] sm:text-3xl"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
        >
          {value}
        </p>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">{sub}</p>
      </div>
    </Link>
  );
}

function CourseRow({ course }: { course: DashCourse }) {
  const pct = Math.max(0, Math.min(100, course.progressPct));
  return (
    <Link
      href="/panel/courses"
      className="group relative flex flex-col gap-3 overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 transition-colors hover:border-[var(--ink)]/28 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
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
          {pct === 0 ? "Henüz başlanmadı" : pct >= 100 ? "Tamamlandı" : "Devam ediyor"}
          <span className="mx-1.5 text-[var(--ink)]/20">·</span>
          <span className="inline-flex items-center gap-0.5 transition-colors group-hover:text-[var(--ink)]">
            Devam et <ArrowRight className="size-2.5" />
          </span>
        </p>
      </div>
    </Link>
  );
}

function PerkCard({
  perk,
}: {
  perk: { id: number; brand: string; title: string; description: string; logoUrl: string | null };
}) {
  const color = avatarColor(perk.brand);
  return (
    <Link
      href="/panel/perks"
      className="group relative flex h-full flex-col overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 transition-colors hover:border-[var(--ink)]/28 sm:p-5"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ink)]/12 transition-colors group-hover:bg-[var(--inner-green)]"
      />
      <div className="mb-3 flex items-center gap-3 pl-1">
        <div
          className="flex size-10 shrink-0 items-center justify-center text-[var(--bone)]"
          style={{ backgroundColor: color }}
        >
          {perk.logoUrl ? (
            <img src={perk.logoUrl} alt="" className="size-6 object-contain" />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wide" lang="en">
              {perk.brand.slice(0, 2)}
            </span>
          )}
        </div>
        <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          {perk.brand}
        </p>
      </div>
      <h3
        className="mb-1.5 pl-1 font-display font-serif text-base leading-snug tracking-[-0.02em] text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
      >
        {cleanDisplayText(perk.title)}
      </h3>
      <p className="mb-4 flex-1 pl-1 text-sm leading-relaxed text-[var(--ink-body)] line-clamp-2">
        {perk.description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pl-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors group-hover:text-[var(--ink)]">
        Detay <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}

type DashCourse = { id: number; title: string; progressPct: number };
type DashEvent = { id: number; title: string };

// ─── Hero ─────────────────────────────────────────────────────────────────────

function DashboardHero({ userName }: { userName: string }) {
  const scrubVideoRef = useScrubVideo();
  const { displayed: typedGreeting, done: typedDone } = useTypewriter(
    `Selam, ${userName}. Daire hareketli. Peki bugün ne inşa ediyoruz?`,
  );

  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
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

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <p
          aria-hidden="true"
          className="select-none mb-4 max-w-[46ch] font-serif italic leading-[1.3] text-white/35"
          style={{ fontSize: "clamp(16px, 2.2vw, 22px)", filter: "blur(3px)" }}
        >
          İyi seçilenler burada buluşur,
          <br />
          {userName}, bugün de aralarındasın.
        </p>
        <p
          className="mb-6 max-w-[42ch] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]"
          style={{ fontSize: "clamp(22px, 3.4vw, 34px)", lineHeight: 1.25, minHeight: 44 }}
        >
          {typedGreeting}
          {!typedDone && (
            <span className="animate-blink ml-[2px] inline-block h-[0.9em] w-[2px] bg-white align-middle" />
          )}
        </p>

        <div className="flex flex-wrap gap-y-2">
          {QUICK_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap border border-black/10 bg-white px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[12px]"
            >
              {item.brand && <span lang="en">{item.brand}</span>}
              {item.label}
            </Link>
          ))}
          <Link
            href="/panel/profile"
            className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-white bg-transparent px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-black sm:px-5 sm:text-[12px]"
          >
            Profilini tamamla
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Dashboard({ userName = "Ata" }: { userName?: string }) {
  // Dashboard stats fail soft — 0 sonuç göster, hata banner'ı yok (bilinçli tasarım kararı).
  const { data: coursesData } = useApiQuery<{ courses: { id: number; title: string; progressPct?: number }[] }>(
    ["courses"],
    "/api/courses",
  );
  const { data: eventsData } = useApiQuery<{ events: { id: number; title: string }[] }>(
    ["events"],
    "/api/events",
  );
  const { data: perksData } = useApiQuery<{ perks: { id: number; brand: string; title: string; description: string; logoUrl: string | null }[] }>(
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

  return (
    <div className="space-y-10 max-w-5xl">
      <DashboardHero userName={userName} />

      <FadeIn delay={0.06}>
        <section>
          <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              Öne çıkan
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
            {spotlightCards.map((card, i) => (
              <EditorialCard key={card.href} {...card} tone="light" cta="Aç" index={i + 1} />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)] p-6 text-[var(--bone)]">
          <AsciiField tone="dark" />
          <AmbientCardBackground />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57">
                Yeni Dönem
              </p>
              <p className="text-lg font-light text-[var(--bone)]">2. Kursa Kayıt Ol</p>
              <p className="text-sm text-[var(--bone)]/50">
                <span lang="en">inner·hub</span> · 2. dönem başvuruları açık
              </p>
            </div>
            <Link
              href="/panel/applications"
              className="inline-flex shrink-0 items-center gap-2 border border-[var(--bone)]/20 bg-[var(--bone)] px-5 py-2.5 font-mono text-caption uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-80"
            >
              Başvur <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <StatCard
            label="Kurslarım"
            value={courses.length}
            icon={BookOpen}
            href="/panel/courses"
            sub="kayıtlı"
          />
          <StatCard
            label="Etkinlikler"
            value={events.length}
            icon={CalendarDays}
            href="/panel/events"
            sub="yaklaşan"
          />
          <StatCard
            label="Ayrıcalıklar"
            value={perks.length}
            icon={Gift}
            href="/panel/perks"
            sub="aktif fırsat"
          />
        </div>
      </FadeIn>

      {courses.length > 0 && (
        <FadeIn delay={0.12}>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  Kurslarım
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">Kaldığın yerden devam et</p>
              </div>
              <Link
                href="/panel/courses"
                className="inline-flex min-h-9 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
              >
                Tümü <ArrowRight className="size-3" />
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

      <FadeIn delay={0.15}>
        <section>
          <div className="mb-4 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                Ayrıcalıklar
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Program katılımcılarına özel fırsatlar
              </p>
            </div>
            <Link
              href="/panel/perks"
              className="inline-flex min-h-9 shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              Tümü <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {perks.slice(0, 4).map((perk) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
