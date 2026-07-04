import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarDays, Gift, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

// ─── Mock data (API'den gelecek) ───────────────────────────────────────────────
const mockPerks = [
  { id: 1, brand: "Monolite", title: "Monolite İlk Ay Ücretsiz!", description: "Monolite ile sunumlarınızı, etkinliklerinizi ve eğitimlerinizi yönetin.", logoUrl: null },
  { id: 2, brand: "iyigo", title: "İyigo 2 Ay Ücretsiz", description: "Iyigo: Enocta'nın yeni iştiraki olarak geliştirilen, kullanıma hazır platform.", logoUrl: null },
  { id: 3, brand: "Salary Insights", title: "Salary Insights Kurumsal Maaş Raporu %15 İndirimli", description: "Ara zam öncesi Nisan-Mayıs maaş raporu (+10.000 maaş).", logoUrl: null },
  { id: 4, brand: "Dermolisa", title: "Dermolisa Kozmetik Ürünlerinde %30 İndirim", description: "Dr. Dennis Gross, Peter Thomas Roth ve Philip B gibi dünya markaları.", logoUrl: null },
];

const mockEvents = [
  { id: 1, title: "AI & HR Zirvesi", startAt: "2026-09-15T10:00:00", location: "İstanbul" },
  { id: 2, title: "Networking Kahvaltısı", startAt: "2026-08-05T09:00:00", location: "Online" },
];

const mockCourses = [
  { id: 1, title: "HR Teknolojileri 101", progressPct: 40 },
  { id: 2, title: "Yapay Zeka ile İK Yönetimi", progressPct: 0 },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
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

// ─── Perk card ────────────────────────────────────────────────────────────────
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ userName = "Ata" }: { userName?: string }) {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Welcome */}
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

      {/* Enrollment CTA */}
      <FadeIn delay={0.05}>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)] p-6 text-[var(--bone)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(24,255,133,0.35), transparent 50%), radial-gradient(circle at 85% 20%, rgba(24,255,133,0.15), transparent 40%)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40 mb-1">
                Yeni Dönem
              </p>
              <p className="text-lg font-light text-[var(--bone)]">
                2. Kursa Kayıt Ol
              </p>
              <p className="text-sm text-[var(--bone)]/50">
                inner·hub — 2. dönem başvuruları açık
              </p>
            </div>
            <Link href="/panel/applications">
              <a className="inline-flex shrink-0 items-center gap-2 border border-[var(--bone)]/20 bg-[var(--bone)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-80">
                Başvur <ArrowRight className="size-3.5" />
              </a>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Kurslarım" value={mockCourses.length} icon={BookOpen} />
          <StatCard label="Etkinlikler" value={mockEvents.length} icon={CalendarDays} />
          <StatCard label="Ayrıcalıklar" value={mockPerks.length} icon={Gift} />
        </div>
      </FadeIn>

      {/* Courses progress */}
      {mockCourses.length > 0 && (
        <FadeIn delay={0.12}>
          <section>
            <div className="mb-4 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Kurslarım
              </p>
              <Link href="/panel/courses">
                <a className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors">
                  Tümü →
                </a>
              </Link>
            </div>
            <div className="space-y-2">
              {mockCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 border border-[var(--ink)]/[0.08] p-4">
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-light text-[var(--ink)]">{course.title}</p>
                    <div className="h-px w-full bg-[var(--ink)]/10">
                      <div
                        className="h-full bg-[var(--ink)] transition-all duration-700"
                        style={{ width: `${course.progressPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--ink)]/40">
                    %{course.progressPct}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Perks */}
      <FadeIn delay={0.15}>
        <section>
          <div className="mb-4 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Ayrıcalıklar
              </p>
              <p className="text-xs text-[var(--ink)]/30 mt-0.5">
                Program katılımcılarına özel fırsatlar
              </p>
            </div>
            <Link href="/panel/perks">
              <a className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors">
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
