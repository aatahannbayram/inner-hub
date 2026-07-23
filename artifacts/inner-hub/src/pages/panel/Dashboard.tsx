import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Gift } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { EditorialCard } from "@/components/panel/EditorialCard";
import { apiUrl } from "@/lib/api";

const EDITORIAL_IMG = "/editorial/circle-dusk.png";
const EDITORIAL_PORTRAIT = "/editorial/circle-portrait.jpg";

const mockPerks = [
  { id: 1, brand: "Monolite", title: "Monolite İlk Ay Ücretsiz!", description: "Monolite ile sunumlarınızı, etkinliklerinizi ve eğitimlerinizi yönetin.", logoUrl: null },
  { id: 2, brand: "iyigo", title: "İyigo 2 Ay Ücretsiz", description: "Iyigo: Enocta'nın yeni iştiraki olarak geliştirilen, kullanıma hazır platform.", logoUrl: null },
  { id: 3, brand: "Salary Insights", title: "Salary Insights Kurumsal Maaş Raporu %15 İndirimli", description: "Ara zam öncesi Nisan-Mayıs maaş raporu (+10.000 maaş).", logoUrl: null },
  { id: 4, brand: "Dermolisa", title: "Dermolisa Kozmetik Ürünlerinde %30 İndirim", description: "Dr. Dennis Gross, Peter Thomas Roth ve Philip B gibi dünya markaları.", logoUrl: null },
];

const spotlightCards = [
  {
    title: "inner·signal",
    eyebrow: "Bu hafta",
    description: "Topluluk hafızasından çıkan sinyaller ve bağlantı önerileri.",
    href: "/panel/signal",
    imageSrc: EDITORIAL_IMG,
  },
  {
    title: "Eylül Gathering",
    eyebrow: "Sep 2026 · İstanbul",
    description: "Otuz dört kişi. İki gün. Bir daire. İlk buluşma.",
    href: "/panel/events",
    imageSrc: EDITORIAL_PORTRAIT,
  },
  {
    title: "inner·vault",
    eyebrow: "Bilgi tabanı",
    description: "Pitch deck’ler, araştırmalar ve notlar — yalnızca daire içinde.",
    href: "/panel/vault",
    imageSrc: EDITORIAL_IMG,
  },
];

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-4 border border-[var(--ink)]/[0.08] p-5">
      <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--ink)]/[0.08]">
        <Icon className="size-4 text-[var(--ink)]/50" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">{label}</p>
        <p className="text-xl font-light tabular-nums text-[var(--ink)]">{value}</p>
      </div>
    </div>
  );
}

function PerkCard({ perk }: { perk: typeof mockPerks[0] }) {
  return (
    <div className="flex flex-col border border-[var(--ink)]/[0.08] p-5 transition-colors duration-200 hover:border-[var(--ink)]/20">
      <div className="mb-4 flex size-12 items-center justify-center border border-[var(--ink)]/[0.08] bg-[var(--bone)]">
        {perk.logoUrl ? (
          <img src={perk.logoUrl} alt={perk.brand} className="size-8 object-contain" />
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--ink)]/40">
            {perk.brand.slice(0, 2)}
          </span>
        )}
      </div>
      <p className="mb-1 text-sm font-medium leading-snug text-[var(--ink)]">{perk.title}</p>
      <p className="mb-4 flex-1 text-xs leading-relaxed text-[var(--ink)]/50 line-clamp-2">{perk.description}</p>
      <button className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)]">
        Detayları gör <ArrowRight className="size-3" />
      </button>
    </div>
  );
}

type DashCourse = { id: number; title: string; progressPct: number };
type DashEvent = { id: number; title: string };

export default function Dashboard({ userName = "Ata" }: { userName?: string }) {
  const [courses, setCourses] = useState<DashCourse[]>([]);
  const [events, setEvents] = useState<DashEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [coursesRes, eventsRes] = await Promise.all([
          fetch(apiUrl("/api/courses"), { credentials: "include" }),
          fetch(apiUrl("/api/events"), { credentials: "include" }),
        ]);
        const coursesJson = await coursesRes.json().catch(() => ({}));
        const eventsJson = await eventsRes.json().catch(() => ({}));
        if (cancelled) return;
        if (coursesRes.ok) {
          setCourses(
            (coursesJson.courses ?? []).map((c: { id: number; title: string; progressPct?: number }) => ({
              id: c.id,
              title: c.title,
              progressPct: c.progressPct ?? 0,
            })),
          );
        }
        if (eventsRes.ok) {
          setEvents(
            (eventsJson.events ?? []).map((e: { id: number; title: string }) => ({
              id: e.id,
              title: e.title,
            })),
          );
        }
      } catch {
        // Dashboard stats fail soft — empty counts
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10 max-w-5xl">
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            Hoş geldin, {userName}
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            inner·hub yolculuğundaki güncel durumun.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.04}>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08]">
          <img
            src={EDITORIAL_IMG}
            alt="inner·hub editorial"
            className="aspect-[21/9] w-full object-cover md:aspect-[24/9]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/75 via-[var(--ink)]/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/50">
              The circle · İstanbul
            </p>
            <p
              className="max-w-[18ch] font-serif text-3xl text-[var(--bone)] md:text-4xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 100 }}
            >
              What comes next starts here.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <section>
          <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
              Öne çıkan
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {spotlightCards.map((card) => (
              <EditorialCard key={card.href} {...card} tone="light" cta="Aç" />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)] p-6 text-[var(--bone)]">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40">
                Yeni Dönem
              </p>
              <p className="text-lg font-light text-[var(--bone)]">2. Kursa Kayıt Ol</p>
              <p className="text-sm text-[var(--bone)]/50">inner·hub — 2. dönem başvuruları açık</p>
            </div>
            <Link href="/panel/applications">
              <a className="inline-flex shrink-0 items-center gap-2 border border-[var(--bone)]/20 bg-[var(--bone)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-80">
                Başvur <ArrowRight className="size-3.5" />
              </a>
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Kurslarım" value={courses.length} icon={BookOpen} />
          <StatCard label="Etkinlikler" value={events.length} icon={CalendarDays} />
          <StatCard label="Ayrıcalıklar" value={mockPerks.length} icon={Gift} />
        </div>
      </FadeIn>

      {courses.length > 0 && (
        <FadeIn delay={0.12}>
          <section>
            <div className="mb-4 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Kurslarım</p>
              <Link href="/panel/courses">
                <a className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-colors hover:text-[var(--ink)]">
                  Tümü →
                </a>
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
                  <span className="font-mono text-[10px] tabular-nums text-[var(--ink)]/40">%{course.progressPct}</span>
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Ayrıcalıklar</p>
              <p className="mt-0.5 text-xs text-[var(--ink)]/30">Program katılımcılarına özel fırsatlar</p>
            </div>
            <Link href="/panel/perks">
              <a className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-colors hover:text-[var(--ink)]">
                Tümü →
              </a>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mockPerks.map((perk) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
