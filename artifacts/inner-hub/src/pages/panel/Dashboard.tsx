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
    description: "Pitch deck’ler, araştırmalar ve notlar — yalnızca daire içinde.",
    href: "/panel/vault",
    portrait: { src: EDITORIAL_PORTRAIT, config: VAULT_CARD_PORTRAIT },
  },
];

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-4 border border-[var(--ink)]/[0.08] p-5">
      <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--ink)]/[0.08]">
        <Icon className="size-4 text-[var(--ink-muted)]" />
      </div>
      <div>
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{label}</p>
        <p className="text-xl font-light tabular-nums text-[var(--ink)]">{value}</p>
      </div>
    </div>
  );
}

function PerkCard({ perk }: { perk: { id: number; brand: string; title: string; description: string; logoUrl: string | null } }) {
  const color = avatarColor(perk.brand);
  return (
    <div className="group relative flex flex-col overflow-hidden border border-[var(--ink)]/[0.08] p-5 transition-colors duration-200 hover:border-[var(--ink)]/20">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
      <div
        className="mb-4 flex size-12 items-center justify-center border text-[var(--bone)]"
        style={{ backgroundColor: color, borderColor: color }}
      >
        {perk.logoUrl ? (
          <img src={perk.logoUrl} alt={perk.brand} className="size-8 object-contain" />
        ) : (
          <span className="font-mono text-label uppercase tracking-wide">
            <span lang="en">{perk.brand.slice(0, 2)}</span>
          </span>
        )}
      </div>
      <p className="mb-1 text-sm font-medium leading-snug text-[var(--ink)]">{perk.title}</p>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-2">{perk.description}</p>
      <button className="flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]">
        Detayları gör <ArrowRight className="size-3" />
      </button>
    </div>
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--ink)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--ink)]/55 via-transparent to-transparent"
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
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[12px]"
            >
              {item.brand && <span lang="en">{item.brand}</span>}
              {item.label}
            </Link>
          ))}
          <Link
            href="/panel/profile"
            className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.5em] font-mono text-caption uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-black sm:px-5 sm:text-[12px]"
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
              <p className="text-sm text-[var(--bone)]/50">inner·hub — 2. dönem başvuruları açık</p>
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Kurslarım" value={courses.length} icon={BookOpen} />
          <StatCard label="Etkinlikler" value={events.length} icon={CalendarDays} />
          <StatCard label="Ayrıcalıklar" value={perks.length} icon={Gift} />
        </div>
      </FadeIn>

      {courses.length > 0 && (
        <FadeIn delay={0.12}>
          <section>
            <div className="mb-4 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">Kurslarım</p>
              <Link
                href="/panel/courses"
                className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]"
              >
                Tümü →
              </Link>
            </div>
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 border border-[var(--ink)]/[0.08] p-4">
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-light text-[var(--ink)]">{course.title}</p>
                    <div className="h-px w-full bg-[var(--ink)]/10">
                      <div className="h-full bg-[var(--ink)] transition-all duration-700" style={{ width: `${course.progressPct}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-label tabular-nums text-[var(--ink-body)]">%{course.progressPct}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <section>
          <div className="mb-4 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
            <div>
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">Ayrıcalıklar</p>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Program katılımcılarına özel fırsatlar</p>
            </div>
            <Link
              href="/panel/perks"
              className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]"
            >
              Tümü →
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
