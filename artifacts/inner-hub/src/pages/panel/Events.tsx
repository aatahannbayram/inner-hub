import { useEffect, useState } from "react";
import { MapPin, Clock, Users, ChevronRight, CheckCircle2, CalendarDays, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { apiUrl } from "@/lib/api";

type ViewMode = "liste" | "takvim";

interface Event {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  type: "gathering" | "workshop" | "online";
  capacity: number;
  registered: number;
  isRegistered: boolean;
  isPast: boolean;
}

function inferType(title: string, location: string): Event["type"] {
  const hay = `${title} ${location}`.toLowerCase();
  if (hay.includes("online") || hay.includes("zoom")) return "online";
  if (hay.includes("workshop")) return "workshop";
  return "gathering";
}

function mapApiEvent(row: {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt: string;
  isPast?: boolean;
}): Event {
  const location = row.location ?? "";
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    startAt: row.startAt,
    endAt: row.endAt,
    location,
    type: inferType(row.title, location),
    capacity: 0,
    registered: 0,
    isRegistered: false,
    isPast: row.isPast ?? new Date(row.startAt).getTime() < Date.now(),
  };
}

const TYPE_LABELS: Record<Event["type"], string> = {
  gathering: "Buluşma",
  workshop: "Workshop",
  online: "Online",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

function formatDay(iso: string) {
  return new Date(iso).getDate();
}

function formatWeekday(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short" });
}

function spotsLeft(event: Event) {
  return event.capacity - event.registered;
}

function EventCard({ event }: { event: Event }) {
  const spots = spotsLeft(event);
  const isFull = spots <= 0;

  return (
    <div
      className={[
        "group relative flex gap-5 overflow-hidden border p-5 transition-all duration-200",
        event.isPast
          ? "border-[var(--ink)]/[0.06] opacity-60"
          : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
      ].join(" ")}
    >
      {!event.isPast && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[var(--inner-green)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
        />
      )}
      {/* Date column */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-start border border-[var(--ink)]/[0.08] p-2 text-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">
          {formatWeekday(event.startAt)}
        </span>
        <span
          className="font-serif text-3xl leading-none text-[var(--ink)]"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
        >
          {formatDay(event.startAt)}
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/30">
          {new Date(event.startAt).toLocaleDateString("tr-TR", { month: "short" })}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              {TYPE_LABELS[event.type]}
            </span>
            <h3 className="text-sm font-medium text-[var(--ink)] leading-snug">{event.title}</h3>
          </div>
          {event.isRegistered && (
            <span className="shrink-0 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)] border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-2 py-0.5">
              <CheckCircle2 className="size-2.5" /> Kayıtlısın
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-[var(--ink)]/50 line-clamp-2">{event.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-[var(--ink)]/40">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
            <Clock className="size-3" />
            {formatTime(event.startAt)} – {formatTime(event.endAt)}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
            <MapPin className="size-3" />
            {event.location || "Konum yakında"}
          </span>
          {event.capacity > 0 && (
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
              <Users className="size-3" />
              {event.registered}/{event.capacity}
            </span>
          )}
        </div>

        {!event.isPast && (
          <div className="mt-1">
            {event.capacity > 0 && isFull ? (
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
                Kontenjan dolu
              </span>
            ) : event.isRegistered ? (
              <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--error)] transition-colors">
                Kaydı İptal Et
              </button>
            ) : (
              <button className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
                Kayıt Ol
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function CalendarView({ events }: { events: Event[] }) {
  const today = new Date("2026-07-04");
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Mon-based offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);
  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    return dayNum >= 1 && dayNum <= lastDay.getDate() ? dayNum : null;
  });

  const eventsByDay: Record<number, Event[]> = {};
  events.forEach((e) => {
    const d = new Date(e.startAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(e);
    }
  });

  return (
    <div className="border border-[var(--ink)]/[0.08]">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-[var(--ink)]/[0.08]">
        {DAYS.map((d) => (
          <div key={d} className="p-2 text-center font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isToday = day === today.getDate();
          const dayEvents = day ? eventsByDay[day] ?? [] : [];
          return (
            <div
              key={i}
              className={[
                "min-h-[72px] border-b border-r border-[var(--ink)]/[0.06] p-1.5 last:border-r-0",
                !day && "bg-[var(--ink)]/[0.02]",
              ].join(" ")}
            >
              {day && (
                <>
                  <span
                    className={[
                      "flex size-6 items-center justify-center font-mono text-[10px]",
                      isToday
                        ? "bg-[var(--ink)] text-[var(--bone)]"
                        : "text-[var(--ink)]/50",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={[
                          "truncate px-1 py-0.5 font-mono text-[8px] uppercase tracking-wide",
                          e.isRegistered
                            ? "bg-[var(--inner-green)]/15 text-[var(--ink)]/70"
                            : "bg-[var(--ink)]/[0.06] text-[var(--ink)]/50",
                        ].join(" ")}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="font-mono text-[8px] text-[var(--ink)]/30">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function EventsHero() {
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              Etkinlikler
            </p>
            <AnimatedHeading
              text={"Where the circle\ngathers in person."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                Topluluk buluşmaları, workshoplar ve networking — dairenin içinde, güvenle kurulan bağlar.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToId("events-upcoming")}
                  className="group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  Yaklaşanları Gör
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("events-calendar-toggle")}
                  className="liquid-glass group inline-flex items-center gap-2 border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  Takvimi Aç
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Buluşmalar. Workshoplar. Networking.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/35">{label}</p>
        <Icon className="size-3.5 text-[var(--ink)]/20" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] text-[var(--ink)]/30">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Events() {
  const [view, setView] = useState<ViewMode>("liste");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl("/api/events"), { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Etkinlikler yüklenemedi");
        if (!cancelled) {
          setEvents((json.events ?? []).map(mapApiEvent));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Etkinlikler yüklenemedi");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);
  const now = new Date();
  const thisMonth = events.filter((e) => {
    const d = new Date(e.startAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const registeredCount = events.filter((e) => e.isRegistered).length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero */}
      <EventsHero />

      {!loading && !error && events.length > 0 && (
        <FadeIn delay={0.02}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <EventsStat label="Yaklaşan" value={String(upcoming.length)} sub="planlanan etkinlik" icon={CalendarDays} />
            <EventsStat label="Bu Ay" value={String(thisMonth)} sub="takvimde" icon={Sparkles} />
            <EventsStat label="Kayıtlısın" value={String(registeredCount)} sub="etkinlikte" icon={CheckCircle2} />
            <EventsStat label="Geçmiş" value={String(past.length)} sub="tamamlandı" icon={Clock} />
          </div>
        </FadeIn>
      )}

      {/* View toggle */}
      <FadeIn delay={0.03}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--ink)]/50 font-light">
            Topluluk buluşmaları, workshoplar ve networking etkinlikleri.
          </p>
          <div id="events-calendar-toggle" className="flex shrink-0 scroll-mt-6 border border-[var(--ink)]/15">
            {(["liste", "takvim"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  view === v
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {v === "liste" ? "Liste" : "Takvim"}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {loading && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          Yükleniyor…
        </p>
      )}
      {error && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
          {error}
        </p>
      )}
      {!loading && !error && events.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          Henüz yayınlanmış etkinlik yok.
        </p>
      )}

      {!loading && !error && events.length > 0 && view === "liste" ? (
        <>
          {/* Upcoming */}
          <FadeIn delay={0.05}>
            <section id="events-upcoming" className="scroll-mt-6">
              <div className="mb-3 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                  Yaklaşan Etkinlikler
                </p>
                <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-[9px] text-[var(--bone)]">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-2">
                {upcoming.length === 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
                    Yaklaşan etkinlik yok.
                  </p>
                ) : (
                  upcoming.map((e) => <EventCard key={e.id} event={e} />)
                )}
              </div>
            </section>
          </FadeIn>

          {/* Past */}
          {past.length > 0 && (
            <FadeIn delay={0.1}>
              <section>
                <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
                    Geçmiş Etkinlikler
                  </p>
                </div>
                <div className="space-y-2">
                  {past.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            </FadeIn>
          )}
        </>
      ) : null}

      {!loading && !error && events.length > 0 && view === "takvim" ? (
        <FadeIn delay={0.05}>
          <section>
            <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Takvim
              </p>
            </div>
            <CalendarView events={events} />
          </section>
        </FadeIn>
      ) : null}
    </div>
  );
}
