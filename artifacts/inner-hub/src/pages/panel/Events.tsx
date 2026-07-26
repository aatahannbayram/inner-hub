import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Clock, Users, ChevronRight, CheckCircle2, CalendarDays, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { StatCardSkeleton, LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { HeroVideo } from "@/components/HeroVideo";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import { useT, useLocale } from "@/i18n";

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

interface RawEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt: string;
  isPast?: boolean;
  capacity?: number;
  registered?: number;
  isRegistered?: boolean;
}

function mapApiEvent(row: RawEvent): Event {
  const location = row.location ?? "";
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    startAt: row.startAt,
    endAt: row.endAt,
    location,
    type: inferType(row.title, location),
    capacity: row.capacity ?? 0,
    registered: row.registered ?? 0,
    isRegistered: row.isRegistered ?? false,
    isPast: row.isPast ?? new Date(row.startAt).getTime() < Date.now(),
  };
}

function localeTag(locale: string) {
  return locale === "en" ? "en-US" : "tr-TR";
}

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(localeTag(locale), { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  return new Date(iso).getDate();
}

function formatWeekday(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(localeTag(locale), { weekday: "short" });
}

function spotsLeft(event: Event) {
  return event.capacity - event.registered;
}

/** Başlıktaki em dash / ay tekrarını temizle — tarih sütunu zaten ayı gösterir. */
function displayTitle(title: string) {
  return title
    .replace(/\s*[—–―]\s*[A-Za-zÇĞİÖŞÜçğıöşü]+\.?\s*$/u, "")
    .replace(/\s*[—–―]\s*/g, " · ")
    .trim();
}

function typeLabel(type: Event["type"], t: (key: string) => string) {
  if (type === "workshop") return t("events.typeWorkshop");
  if (type === "online") return t("events.typeOnline");
  return t("events.typeGathering");
}

function EventCard({
  event,
  busy,
  onRegister,
  onUnregister,
}: {
  event: Event;
  busy?: boolean;
  onRegister?: (id: number) => void;
  onUnregister?: (id: number) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const spots = spotsLeft(event);
  const isFull = event.capacity > 0 && spots <= 0;
  const title = displayTitle(event.title);
  const monthShort = new Date(event.startAt).toLocaleDateString(localeTag(locale), { month: "short" });
  const label = typeLabel(event.type, t);

  return (
    <article
      className={[
        "group relative grid gap-4 overflow-hidden panel-glass p-4 transition-colors duration-200 sm:grid-cols-[5.5rem_1fr] sm:gap-5 sm:p-5",
        event.isPast
          ? "opacity-55"
          : "hover:border-[var(--ink)]/25",
      ].join(" ")}
    >
      {!event.isPast && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-[var(--inner-green)]"
        />
      )}

      {/* Date */}
      <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:border sm:border-[var(--ink)]/[0.08] sm:px-2 sm:py-3 sm:text-center">
        <div className="flex size-14 shrink-0 flex-col items-center justify-center panel-glass bg-[var(--ink)]/[0.03] sm:size-auto sm:border-0 sm:bg-transparent">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {formatWeekday(event.startAt, locale)}
          </span>
          <span
            className="font-display font-serif text-[1.75rem] leading-none text-[var(--ink)] sm:text-3xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
          >
            {formatDay(event.startAt)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            {monthShort}
          </span>
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {event.type === "online" ? (
              <span lang="en">{label}</span>
            ) : (
              label
            )}
          </p>
          <h3 className="font-display font-serif text-lg leading-tight text-[var(--ink)]">{title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)] sm:block">
              {event.type === "online" ? (
                <span lang="en">{label}</span>
              ) : (
                label
              )}
            </p>
            <h3 className="hidden font-display font-serif text-xl leading-snug tracking-[-0.02em] text-[var(--ink)] sm:block md:text-[1.35rem]">
              {title}
            </h3>
            {event.description ? (
              <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-[var(--ink-body)] line-clamp-2">
                {event.description}
              </p>
            ) : null}
          </div>
          {event.isRegistered && (
            <span className="inline-flex shrink-0 items-center gap-1 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--success-ink)]">
              <CheckCircle2 className="size-2.5" /> {t("events.joined")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--ink)]/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[var(--ink-body)]">
            <li className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">
              <Clock className="size-3 shrink-0 text-[var(--ink-muted)]" aria-hidden />
              <span>
                {formatTime(event.startAt, locale)}
                <span className="mx-1 text-[var(--ink-muted)]">·</span>
                {formatTime(event.endAt, locale)}
              </span>
            </li>
            <li className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">
              <MapPin className="size-3 shrink-0 text-[var(--ink-muted)]" aria-hidden />
              {event.location ? <span lang="en">{event.location}</span> : t("events.locationSoon")}
            </li>
            {event.capacity > 0 && (
              <li className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">
                <Users className="size-3 shrink-0 text-[var(--ink-muted)]" aria-hidden />
                {t("events.peopleCount", {
                  registered: event.registered,
                  capacity: event.capacity,
                })}
              </li>
            )}
          </ul>

          {!event.isPast && (
            <div className="shrink-0">
              {event.capacity > 0 && isFull ? (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("events.full")}
                </span>
              ) : event.isRegistered ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onUnregister?.(event.id)}
                  className="min-h-10 w-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--error-ink)] disabled:opacity-40 sm:w-auto"
                >
                  {t("events.rsvpCancel")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRegister?.(event.id)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 bg-[var(--ink)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85 disabled:opacity-40 sm:w-auto"
                >
                  {t("events.join")}
                  <ChevronRight className="size-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────

function CalendarView({ events }: { events: Event[] }) {
  const t = useT();
  const days = [
    t("events.dayMon"),
    t("events.dayTue"),
    t("events.dayWed"),
    t("events.dayThu"),
    t("events.dayFri"),
    t("events.daySat"),
    t("events.daySun"),
  ];
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
    <div className="overflow-x-auto panel-glass">
      {/* Header row */}
      <div className="grid min-w-[520px] grid-cols-7 border-b border-[var(--ink)]/[0.08]">
        {days.map((d) => (
          <div key={d} className="p-2 text-center font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid min-w-[520px] grid-cols-7">
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
                      "flex size-6 items-center justify-center font-mono text-label",
                      isToday
                        ? "bg-[var(--ink)] text-[var(--bone)]"
                        : "text-[var(--ink-muted)]",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={[
                          "truncate px-1 py-0.5 font-mono text-label uppercase tracking-wide",
                          e.isRegistered
                            ? "bg-[var(--inner-green)]/15 text-[var(--ink-strong)]"
                            : "bg-[var(--ink)]/[0.06] text-[var(--ink-muted)]",
                        ].join(" ")}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="font-mono text-label text-[var(--ink-muted)]">
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

function EventsHero({ upcomingCount }: { upcomingCount: number }) {
  const t = useT();
  return (
    <div
      className="relative -mx-3 -mt-5 overflow-hidden sm:-mx-5 sm:-mt-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(62vh, 620px)", minHeight: 360 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-label uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              {t("events.title")}
            </p>
            <AnimatedHeading
              text={t("events.heroTitle")}
              className="mb-4 font-display font-serif italic text-3xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-sm text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base md:text-lg">
                {t("events.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToId("events-upcoming")}
                  className="group inline-flex min-h-11 items-center gap-2 bg-white px-6 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:px-8"
                >
                  {t("events.seeUpcoming")}
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("events-calendar-toggle")}
                  className="liquid-glass group inline-flex min-h-11 items-center gap-2 border border-white/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black sm:px-8"
                >
                  {t("events.openCalendar")}
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 hidden items-end justify-start sm:flex lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={upcomingCount}
              label={t("events.upcomingStat")}
              tagline={t("events.heroTagline")}
            />
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
    <div className="panel-glass p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Events() {
  const t = useT();
  const [view, setView] = useState<ViewMode>("liste");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading: loading, isError, error, refetch } = useApiQuery<{ events: RawEvent[] }>(
    ["events"],
    "/api/events",
  );
  const events: Event[] = (data?.events ?? []).map(mapApiEvent);

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);
  const now = new Date();
  const thisMonth = events.filter((e) => {
    const d = new Date(e.startAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const registeredCount = events.filter((e) => e.isRegistered).length;

  const register = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(apiUrl(`/api/events/${id}/register`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("events.registerFailed"));
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (e: any) {
      setActionError(e.message ?? t("events.registerFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const unregister = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(apiUrl(`/api/events/${id}/register`), {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("events.cancelFailed"));
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (e: any) {
      setActionError(e.message ?? t("events.cancelFailed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero */}
      <EventsHero upcomingCount={upcoming.length} />

      {!loading && !isError && events.length > 0 && (
        <FadeIn delay={0.02}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <EventsStat label={t("events.filterUpcoming")} value={String(upcoming.length)} sub={t("events.planned")} icon={CalendarDays} />
            <EventsStat label={t("events.thisMonth")} value={String(thisMonth)} sub={t("events.onCalendar")} icon={Sparkles} />
            <EventsStat label={t("events.youreRegistered")} value={String(registeredCount)} sub={t("events.atEvent")} icon={CheckCircle2} />
            <EventsStat label={t("events.past")} value={String(past.length)} sub={t("events.completed")} icon={Clock} />
          </div>
        </FadeIn>
      )}

      {/* View toggle */}
      <FadeIn delay={0.03}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="hidden text-sm font-light text-[var(--ink-muted)] sm:block">
            {t("events.subtitle")}
          </p>
          <div id="events-calendar-toggle" className="flex w-full shrink-0 scroll-mt-6 panel-glass sm:w-auto">
            {(["liste", "takvim"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "min-h-10 flex-1 px-4 py-2 font-mono text-label uppercase tracking-widest transition-colors sm:flex-none",
                  view === v
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink-body)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {v === "liste" ? t("events.list") : t("events.calendar")}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {loading && (
        <LoadingBlock label={t("events.loading")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </LoadingBlock>
      )}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("events.loadError")}
          onRetry={() => refetch()}
        />
      )}
      {!loading && !isError && events.length === 0 && (
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("events.emptyPublished")}
        </p>
      )}

      {actionError && (
        <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
          {actionError}
        </p>
      )}

      {!loading && !isError && events.length > 0 && view === "liste" ? (
        <>
          {/* Upcoming */}
          <FadeIn delay={0.05}>
            <section id="events-upcoming" className="scroll-mt-6">
              <div className="mb-4 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  {t("events.upcomingSection")}
                </p>
                <span className="flex size-5 items-center justify-center bg-[var(--ink)] font-mono text-[10px] text-[var(--bone)]">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("events.empty")}
                  </p>
                ) : (
                  upcoming.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      busy={busyId === e.id}
                      onRegister={register}
                      onUnregister={unregister}
                    />
                  ))
                )}
              </div>
            </section>
          </FadeIn>

          {/* Past */}
          {past.length > 0 && (
            <FadeIn delay={0.1}>
              <section>
                <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {t("events.pastSection")}
                  </p>
                </div>
                <div className="space-y-3">
                  {past.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            </FadeIn>
          )}
        </>
      ) : null}

      {!loading && !isError && events.length > 0 && view === "takvim" ? (
        <FadeIn delay={0.05}>
          <section>
            <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("events.calendar")}
              </p>
            </div>
            <CalendarView events={events} />
          </section>
        </FadeIn>
      ) : null}
    </div>
  );
}
