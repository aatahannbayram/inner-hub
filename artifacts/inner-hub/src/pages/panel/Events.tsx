import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

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

const EVENTS: Event[] = [
  {
    id: 1,
    title: "AI & Girişimcilik Zirvesi",
    description: "Türkiye'nin önde gelen yapay zeka girişimcileri ve yatırımcılarıyla networking ve panel oturumları. inner·hub üyelerine ayrılmış oturumlar dahil.",
    startAt: "2026-09-15T10:00:00",
    endAt: "2026-09-15T18:00:00",
    location: "Nidakule Levent, İstanbul",
    type: "gathering",
    capacity: 120,
    registered: 87,
    isRegistered: true,
    isPast: false,
  },
  {
    id: 2,
    title: "Networking Kahvaltısı — Ağustos",
    description: "Her ayın ilk Salısı: küçük grup, derin konuşmalar. Bu ayki tema: B2B satış ve uluslararasılaşma.",
    startAt: "2026-08-05T09:00:00",
    endAt: "2026-08-05T11:00:00",
    location: "Online (Zoom)",
    type: "online",
    capacity: 30,
    registered: 22,
    isRegistered: false,
    isPast: false,
  },
  {
    id: 3,
    title: "Fundraising Workshop",
    description: "Seed ve Series A yatırım süreçleri, pitch deck hazırlığı ve yatırımcı görüşme teknikleri. Sınırlı katılım.",
    startAt: "2026-08-20T14:00:00",
    endAt: "2026-08-20T17:00:00",
    location: "Kolektif House Maslak",
    type: "workshop",
    capacity: 20,
    registered: 18,
    isRegistered: false,
    isPast: false,
  },
  {
    id: 4,
    title: "Demo Day — Kohort 1",
    description: "1. kohort girişimlerinin yatırımcılara ve topluluk üyelerine sunum günü. 8 startup, 3 dakikalık pitch + Q&A.",
    startAt: "2026-07-10T16:00:00",
    endAt: "2026-07-10T19:00:00",
    location: "İstanbul",
    type: "gathering",
    capacity: 60,
    registered: 60,
    isRegistered: true,
    isPast: true,
  },
  {
    id: 5,
    title: "Founder Dinner",
    description: "Kapalı davet. Ayın kurucu buluşması — 12 kişilik masa, moderatörsüz serbest sohbet.",
    startAt: "2026-06-25T19:30:00",
    endAt: "2026-06-25T22:30:00",
    location: "Özel mekan, İstanbul",
    type: "gathering",
    capacity: 12,
    registered: 12,
    isRegistered: true,
    isPast: true,
  },
];

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
        "flex gap-5 border p-5 transition-all duration-200",
        event.isPast
          ? "border-[var(--ink)]/[0.06] opacity-60"
          : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
      ].join(" ")}
    >
      {/* Date column */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-start border border-[var(--ink)]/[0.08] p-2 text-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">
          {formatWeekday(event.startAt)}
        </span>
        <span
          className="font-serif text-3xl leading-none text-[var(--ink)]"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
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

        <p className="text-xs leading-relaxed text-[var(--ink)]/50 line-clamp-2">{event.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-[var(--ink)]/40">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
            <Clock className="size-3" />
            {formatTime(event.startAt)} – {formatTime(event.endAt)}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
            <MapPin className="size-3" />
            {event.location}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
            <Users className="size-3" />
            {event.registered}/{event.capacity}
          </span>
        </div>

        {!event.isPast && (
          <div className="mt-1">
            {isFull ? (
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Events() {
  const [view, setView] = useState<ViewMode>("liste");

  const upcoming = EVENTS.filter((e) => !e.isPast);
  const past = EVENTS.filter((e) => e.isPast);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
              inner·hub
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              Etkinlikler
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluk buluşmaları, workshoplar ve networking etkinlikleri.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex border border-[var(--ink)]/15">
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

      {view === "liste" ? (
        <>
          {/* Upcoming */}
          <FadeIn delay={0.05}>
            <section>
              <div className="mb-3 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                  Yaklaşan Etkinlikler
                </p>
                <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-[9px] text-[var(--bone)]">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-2">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
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
      ) : (
        <FadeIn delay={0.05}>
          <section>
            <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Temmuz 2026
              </p>
            </div>
            <CalendarView events={EVENTS} />
          </section>
        </FadeIn>
      )}
    </div>
  );
}
