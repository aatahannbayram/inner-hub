import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Users,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  X,
  Video,
  Link2,
  Copy,
  Plus,
} from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { useT, useLocale } from "@/i18n";
import { cleanDisplayText, isDecorativeLabel } from "@/lib/displayText";
import { cn } from "@/lib/utils";
import { useJourneyVisit } from "@/hooks/useJourneyVisit";
import { ExternalEventModal } from "@/components/panel/ExternalEventModal";

type ViewMode = "liste" | "takvim";
type RoomFilter = "mine" | "all";
type EventFormat = "online" | "in_person" | "hybrid";
type EventId = number | string;

interface EventHost {
  name: string;
  avatarUrl?: string | null;
}

type EventSource = "inner" | "luma" | "external";

interface Event {
  id: EventId;
  source: EventSource;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  type: "gathering" | "workshop" | "online";
  format: EventFormat | null;
  meetUrl: string | null;
  passCost: number;
  capacity: number;
  registered: number;
  isRegistered: boolean;
  isPast: boolean;
  lumaUrl?: string | null;
  coverUrl?: string | null;
  hosts?: EventHost[];
}

function inferType(title: string, location: string, format?: string | null): Event["type"] {
  if (format === "online") return "online";
  if (format === "hybrid" || format === "in_person") return "gathering";
  const hay = `${title} ${location}`.toLowerCase();
  if (hay.includes("online") || hay.includes("zoom") || hay.includes("meet")) return "online";
  if (hay.includes("workshop")) return "workshop";
  return "gathering";
}

interface RawEvent {
  id: EventId;
  source?: EventSource;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt: string;
  isPast?: boolean;
  capacity?: number;
  registered?: number;
  isRegistered?: boolean;
  format?: EventFormat;
  meetUrl?: string | null;
  passCost?: number;
  lumaUrl?: string | null;
  coverUrl?: string | null;
  hosts?: EventHost[];
}

function mapApiEvent(row: RawEvent): Event {
  const location = row.location ?? "";
  return {
    id: row.id,
    source:
      row.source ??
      (typeof row.id === "string" && String(row.id).startsWith("luma:")
        ? "luma"
        : row.lumaUrl
          ? "external"
          : "inner"),
    title: row.title,
    description: row.description ?? "",
    startAt: row.startAt,
    endAt: row.endAt,
    location,
    type: inferType(row.title, location, row.format),
    format: row.format ?? null,
    meetUrl: row.meetUrl ?? null,
    passCost: row.passCost ?? 1,
    capacity: row.capacity ?? 0,
    registered: row.registered ?? 0,
    isRegistered: row.isRegistered ?? false,
    isPast: row.isPast ?? new Date(row.startAt).getTime() < Date.now(),
    lumaUrl: row.lumaUrl ?? null,
    coverUrl: row.coverUrl ?? null,
    hosts: row.hosts ?? [],
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

function formatMonthShort(iso: string, locale: string) {
  return new Date(iso)
    .toLocaleDateString(localeTag(locale), { month: "short" })
    .replace(/\.$/, "")
    .toLocaleUpperCase(localeTag(locale));
}

function formatWeekdayLong(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(localeTag(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function displayTitle(title: string, fallback = "") {
  const cleaned = cleanDisplayText(
    title
      .replace(/\s+[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]\s*[A-Za-zÇĞİÖŞÜçğıöşü]+\.?\s*$/u, "")
      .trim(),
  );
  if (cleaned && !isDecorativeLabel(cleaned)) return cleaned;
  return fallback;
}

function typeLabel(event: Event, t: (key: string) => string) {
  if (event.format === "online") return t("events.typeOnline");
  if (event.format === "hybrid") return t("events.typeHybrid");
  if (event.format === "in_person") return t("events.typeInPerson");
  if (event.type === "workshop") return t("events.typeWorkshop");
  if (event.type === "online") return t("events.typeOnline");
  return t("events.typeGathering");
}

function isOnlineEvent(event: Event) {
  return event.format === "online" || event.type === "online";
}

function daysAgoLabel(iso: string, t: (k: string, p?: Record<string, string | number>) => string) {
  const days = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  return t("events.endedDaysAgo", { n: days });
}

function durationLabel(startIso: string, endIso: string, locale: string) {
  const ms = Math.max(0, new Date(endIso).getTime() - new Date(startIso).getTime());
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return locale === "en" ? `${mins} min` : `${mins} dk`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (locale === "en") return m ? `${h}h ${m}m` : `${h}h`;
  return m ? `${h} sa ${m} dk` : `${h} saat`;
}

/** Takvim chip — net kontrast, iç çerçeve yok */
function DateChip({ iso, locale, muted, size = "md" }: { iso: string; locale: string; muted?: boolean; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-14" : size === "sm" ? "size-10" : "size-12";
  const dayCls = size === "lg" ? "text-[1.5rem]" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center bg-[var(--ink)]/[0.08] dark:bg-white/[0.08]",
        box,
        muted && "opacity-70",
      )}
      aria-hidden
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-body)] leading-none">
        {formatMonthShort(iso, locale)}
      </span>
      <span className={cn("mt-1 font-mono leading-none tabular-nums tracking-tight text-[var(--ink)]", dayCls)}>
        {formatDay(iso)}
      </span>
    </div>
  );
}

function EventDetailPanel({
  event,
  onClose,
  busy,
  onRegister,
  onUnregister,
}: {
  event: Event;
  onClose: () => void;
  busy?: boolean;
  onRegister: (id: EventId) => void;
  onUnregister: (id: EventId) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const title = displayTitle(event.title, typeLabel(event, t));
  const panelRef = useRef<HTMLDivElement>(null);
  const host = event.hosts?.[0];

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const copyLink = async () => {
    const url = event.lumaUrl || `${window.location.origin}/panel/events?etkinlik=${encodeURIComponent(String(event.id))}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const sourceLabel =
    event.source === "luma" ? "Luma" : event.source === "external" ? t("events.externalBadge") : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink-fixed)]/50" onClick={onClose} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-drawer-title"
        className="panel-glass-strong fixed inset-0 z-50 flex w-full flex-col border-[var(--ink)]/15 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:border-l md:max-w-lg"
      >
        <div className="flex items-center gap-2 border-b border-[var(--ink)]/[0.1] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex min-h-9 items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
          >
            <Copy className="size-3" /> {copied ? t("events.linkCopied") : t("events.copyLink")}
          </button>
          {event.lumaUrl ? (
            <a
              href={event.lumaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            >
              {t("events.openPage")} <ExternalLink className="size-3" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto min-h-9 min-w-9 border border-[var(--ink)]/15 p-2 text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
          {event.coverUrl ? (
            <img src={event.coverUrl} alt="" className="aspect-[16/10] w-full object-cover" />
          ) : null}

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-body)]">
                {typeLabel(event, t)}
              </span>
              {sourceLabel ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--inner-green)]">
                  {sourceLabel}
                </span>
              ) : null}
            </div>
            <h2
              id="event-drawer-title"
              className="font-sans text-[1.65rem] font-medium leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-3xl"
            >
              {title}
            </h2>
            {host ? (
              <p className="mt-3 flex items-center gap-2.5 text-[15px] text-[var(--ink-body)]">
                {host.avatarUrl ? (
                  <img src={host.avatarUrl} alt="" className="size-7 object-cover" />
                ) : (
                  <span className="flex size-7 items-center justify-center bg-[var(--ink)]/[0.1] font-mono text-[10px] text-[var(--ink)]">
                    {host.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                {t("events.hostedBy", { name: host.name })}
              </p>
            ) : (
              <p className="mt-3 text-[15px] text-[var(--ink-body)]">{t("events.hostedBy", { name: "inner·hub" })}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3.5">
              <DateChip iso={event.startAt} locale={locale} size="lg" />
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-medium text-[var(--ink)]">{formatWeekdayLong(event.startAt, locale)}</p>
                <p className="mt-1 font-mono text-[13px] tabular-nums text-[var(--ink-body)]">
                  {formatTime(event.startAt, locale)}
                  <span className="mx-1.5 text-[var(--ink-muted)]">-</span>
                  {formatTime(event.endAt, locale)}
                </p>
                <p className="mt-1 text-[13px] text-[var(--ink-body)]">
                  {durationLabel(event.startAt, event.endAt, locale)} ·{" "}
                  {locale === "en" ? "Istanbul time" : "İstanbul saati"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="flex size-14 shrink-0 items-center justify-center bg-[var(--ink)]/[0.08]">
                {isOnlineEvent(event) ? (
                  <Video className="size-5 text-[var(--ink)]" />
                ) : (
                  <MapPin className="size-5 text-[var(--ink)]" />
                )}
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-[15px] font-medium text-[var(--ink)]">
                  {event.location || t("events.locationSoon")}
                </p>
                <p className="mt-1 text-[13px] text-[var(--ink-body)]">{typeLabel(event, t)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--ink)]/[0.04] p-4 dark:bg-white/[0.05]">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-body)]">
              {t("events.registration")}
            </p>
            {event.isPast ? (
              <div className="flex items-start gap-3 border border-[var(--ink)]/10 bg-[var(--bone)]/40 p-3 dark:bg-black/20">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-[var(--ink-body)]" />
                <div>
                  <p className="text-[15px] font-medium text-[var(--ink)]">{t("events.pastEvent")}</p>
                  <p className="mt-1 text-[13px] text-[var(--ink-body)]">{daysAgoLabel(event.endAt, t)}</p>
                </div>
              </div>
            ) : event.source === "luma" || event.source === "external" || event.lumaUrl ? (
              <a
                href={event.lumaUrl!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--ink)] px-4 font-mono text-[12px] uppercase tracking-widest text-[var(--bone)] hover:opacity-90"
              >
                {event.source === "luma" || (event.lumaUrl ?? "").includes("luma.com")
                  ? t("events.registerOnLuma")
                  : t("events.registerExternal")}{" "}
                <ExternalLink className="size-3.5" />
              </a>
            ) : event.isRegistered ? (
              <div className="space-y-3">
                <p className="inline-flex items-center gap-1.5 text-[15px] text-[var(--success-ink)]">
                  <CheckCircle2 className="size-4" /> {t("events.joined")}
                </p>
                {event.meetUrl ? (
                  <a
                    href={event.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 bg-[var(--ink)] px-4 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)]"
                  >
                    {t("events.joinMeet")} <ExternalLink className="size-3" />
                  </a>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onUnregister(event.id)}
                  className="w-full py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-body)] hover:text-[var(--error-ink)] disabled:opacity-40"
                >
                  {t("events.rsvpCancel")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onRegister(event.id)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 bg-[var(--ink)] px-4 font-mono text-[12px] uppercase tracking-widest text-[var(--bone)] disabled:opacity-40"
              >
                {t("events.join")} <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-body)]">
              {t("events.about")}
            </p>
            {event.description ? (
              <p className="text-[15px] leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
                {event.description}
              </p>
            ) : (
              <p className="text-[15px] leading-relaxed text-[var(--ink-body)]">{t("events.noDescription")}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--ink)]/[0.08] pt-4 text-[13px] text-[var(--ink-body)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatWeekdayLong(event.startAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
              {formatTime(event.startAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {isOnlineEvent(event) ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
              {event.location || typeLabel(event, t)}
            </span>
          </div>

          {event.registered > 0 && (
            <p className="flex items-center gap-2 text-[14px] text-[var(--ink)]">
              <Users className="size-4 text-[var(--ink-body)]" />
              {t("events.guestCount", { n: event.registered })}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

function TimelineEvent({
  event,
  isLast,
  onOpen,
}: {
  event: Event;
  isLast: boolean;
  onOpen: (e: Event) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const title = displayTitle(event.title, typeLabel(event, t));
  const host = event.hosts?.[0];
  const blurb = event.description?.trim()
    ? event.description.trim().slice(0, 140) + (event.description.trim().length > 140 ? "…" : "")
    : null;

  return (
    <li className="relative flex gap-3 pb-9 last:pb-0 sm:gap-5 md:gap-6">
      {/* Date column — tablet+ */}
      <div className="hidden w-[5.5rem] shrink-0 pt-1 text-right md:block md:w-[7rem]">
        <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-[var(--ink)]">
          {new Date(event.startAt).toLocaleDateString(localeTag(locale), {
            day: "numeric",
            month: "short",
          })}
        </p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-body)]">
          {new Date(event.startAt).toLocaleDateString(localeTag(locale), { weekday: "short" })}
        </p>
      </div>

      {/* Spine */}
      <div className="relative flex w-3 shrink-0 flex-col items-center">
        <span
          className={cn(
            "mt-2.5 size-2.5 shrink-0 rounded-full border-2",
            event.isPast
              ? "border-[var(--ink-muted)] bg-transparent"
              : "border-[var(--inner-green)] bg-[var(--inner-green)]",
          )}
        />
        {!isLast && (
          <span
            aria-hidden
            className="absolute top-6 bottom-0 w-px border-l border-dashed border-[var(--ink)]/25"
          />
        )}
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={() => onOpen(event)}
        className={cn(
          "group min-w-0 flex-1 rounded-none text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
          event.isPast && "opacity-75",
        )}
      >
        <div className="flex gap-3 sm:gap-4">
          <div className="md:hidden">
            <DateChip iso={event.startAt} locale={locale} muted={event.isPast} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <p className="font-mono text-[13px] tabular-nums text-[var(--ink)]">
                {formatTime(event.startAt, locale)}
              </p>
              <span className="font-mono text-[12px] text-[var(--ink-body)]">
                {durationLabel(event.startAt, event.endAt, locale)}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-body)]">
                {typeLabel(event, t)}
              </span>
            </div>
            <h3 className="mt-1.5 font-sans text-[1.05rem] font-medium leading-snug tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--inner-green)] sm:text-xl">
              {title}
            </h3>
            {blurb ? (
              <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-[var(--ink-body)]">{blurb}</p>
            ) : null}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--ink-body)]">
              {host ? <span>{t("events.hostedBy", { name: host.name })}</span> : null}
              <span className="inline-flex items-center gap-1">
                {isOnlineEvent(event) ? <Video className="size-3.5 shrink-0" /> : <MapPin className="size-3.5 shrink-0" />}
                <span className="truncate">{event.location || t("events.locationSoon")}</span>
              </span>
              {event.source === "luma" || event.source === "external" ? (
                <span className="inline-flex items-center border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--inner-green)]">
                  {event.source === "luma" ? "Luma" : t("events.externalBadge")}
                </span>
              ) : null}
            </div>
            {(event.isRegistered || event.registered > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {event.isRegistered && (
                  <span className="inline-flex items-center gap-1 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--success-ink)]">
                    <CheckCircle2 className="size-2.5" /> {t("events.joined")}
                  </span>
                )}
                {event.registered > 0 && (
                  <span className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-body)]">
                    <Users className="size-3.5" />
                    {t("events.guestCount", { n: event.registered })}
                  </span>
                )}
              </div>
            )}
          </div>
          {event.coverUrl ? (
            <img
              src={event.coverUrl}
              alt=""
              className="hidden size-[4.5rem] shrink-0 object-cover sm:block md:size-24"
            />
          ) : null}
        </div>
      </button>
    </li>
  );
}

function CalendarView({ events, onOpen }: { events: Event[]; onOpen: (e: Event) => void }) {
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
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
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
      <div className="grid min-w-[520px] grid-cols-7 border-b border-[var(--ink)]/[0.08]">
        {days.map((d) => (
          <div key={d} className="p-2 text-center font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-w-[520px] grid-cols-7">
        {cells.map((day, i) => {
          const isToday = day === today.getDate();
          const dayEvents = day ? eventsByDay[day] ?? [] : [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-[72px] border-b border-r border-[var(--ink)]/[0.06] p-1.5",
                !day && "bg-[var(--ink)]/[0.02]",
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center font-mono text-label",
                      isToday ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--ink-muted)]",
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <button
                        key={String(e.id)}
                        type="button"
                        onClick={() => onOpen(e)}
                        className="block w-full truncate px-1 py-0.5 text-left font-mono text-label uppercase tracking-wide bg-[var(--ink)]/[0.06] text-[var(--ink-muted)] hover:bg-[var(--ink)]/[0.1]"
                        title={e.title}
                      >
                        {displayTitle(e.title, e.title)}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="font-mono text-label text-[var(--ink-muted)]">+{dayEvents.length - 2}</span>
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

export default function Events() {
  const t = useT();
  useJourneyVisit("events");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const etkinlikParam = useMemo(
    () => new URLSearchParams(searchString).get("etkinlik"),
    [searchString],
  );

  const [view, setView] = useState<ViewMode>("liste");
  const [room, setRoom] = useState<RoomFilter>("all");
  const [period, setPeriod] = useState<"upcoming" | "past" | "all">("upcoming");
  const [composeOpen, setComposeOpen] = useState(false);
  const [busyId, setBusyId] = useState<EventId | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [passRequired, setPassRequired] = useState(false);

  const { data: meData } = useApiQuery<{ user: { role: string } }>(["auth-me"], "/api/auth/me");
  const isAdmin = meData?.user?.role === "admin";

  const { data, isLoading: loading, isError, error, refetch } = useApiQuery<{
    events: RawEvent[];
    luma?: { configured: boolean; count: number };
  }>(["events", room], `/api/events?room=${room}`);

  const events: Event[] = (data?.events ?? []).map(mapApiEvent);
  const lumaConfigured = data?.luma?.configured ?? false;

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  const visible = useMemo(() => {
    if (period === "upcoming") return upcoming;
    if (period === "past") return past;
    return [...upcoming, ...past];
  }, [period, upcoming, past]);

  const selected = useMemo(() => {
    if (!etkinlikParam) return null;
    return events.find((e) => String(e.id) === etkinlikParam) ?? null;
  }, [etkinlikParam, events]);

  const openEvent = (e: Event) => {
    const params = new URLSearchParams(searchString);
    params.set("etkinlik", String(e.id));
    setLocation(`/panel/events?${params.toString()}`, { replace: false });
  };

  const closeEvent = () => {
    if (typeof window !== "undefined" && window.history.length > 1 && etkinlikParam) {
      window.history.back();
      return;
    }
    const params = new URLSearchParams(searchString);
    params.delete("etkinlik");
    const q = params.toString();
    setLocation(q ? `/panel/events?${q}` : "/panel/events", { replace: true });
  };

  const register = async (id: EventId) => {
    const ev = events.find((e) => e.id === id);
    if (ev?.lumaUrl && (ev.source === "luma" || ev.source === "external" || typeof id === "string")) {
      window.open(ev.lumaUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (typeof id === "string" && id.startsWith("luma:")) {
      if (ev?.lumaUrl) window.open(ev.lumaUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setBusyId(id);
    setActionError(null);
    setPassRequired(false);
    try {
      const res = await fetch(apiUrl(`/api/events/${id}/register`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setPassRequired(true);
        setActionError(t("events.passRequired"));
        return;
      }
      if (!res.ok) throw new Error(json.error ?? t("events.registerFailed"));
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("events.registerFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const unregister = async (id: EventId) => {
    if (typeof id === "string") return;
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
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("events.cancelFailed"));
    } finally {
      setBusyId(null);
    }
  };

  // Group timeline by date for past/all views when many events
  const timeline = visible;

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-7">
      <FadeIn delay={0.02}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-body)]">
              INNER.HUB · {t("events.title")}
            </p>
            <h1 className="mt-1.5 font-sans text-[1.65rem] font-medium leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-3xl">
              {t("events.pageHeadline")}
            </h1>
            <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[var(--ink-body)]">
              {t("events.pageSub")}
            </p>
            {lumaConfigured ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-[var(--inner-green)]">
                <Link2 className="size-3" /> {t("events.lumaConnected", { n: data?.luma?.count ?? 0 })}
              </p>
            ) : isAdmin ? (
              <p className="mt-2.5 text-[13px] text-[var(--ink-body)]">{t("events.lumaHint")}</p>
            ) : null}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 bg-[var(--ink)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            >
              <Plus className="size-3.5" /> {t("events.externalAddCta")}
            </button>
          )}
        </div>
      </FadeIn>

      <div className="sticky top-0 z-20 -mx-3 space-y-2.5 border-b border-white/[0.08] bg-[var(--bone)]/85 px-3 py-3 backdrop-blur-xl sm:-mx-1 sm:px-1 dark:border-white/[0.1] dark:bg-black/70">
        <div
          className="flex gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("events.filterUpcoming")}
        >
          {(
            [
              { id: "upcoming" as const, label: t("events.filterUpcoming"), n: upcoming.length },
              { id: "past" as const, label: t("events.filterPast"), n: past.length },
              { id: "all" as const, label: t("events.filterAll"), n: events.length },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={period === chip.id}
              onClick={() => setPeriod(chip.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 font-mono text-[13px] tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                period === chip.id
                  ? "border-[var(--ink)] text-[var(--ink)]"
                  : "border-transparent text-[var(--ink-body)] hover:text-[var(--ink)]",
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  period === chip.id ? "text-[var(--ink)]/70" : "text-[var(--ink-muted)]",
                )}
              >
                {chip.n}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 pb-0.5">
          <div className="flex items-center" role="group" aria-label={t("events.roomAll")}>
            {(["all", "mine"] as RoomFilter[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={room === r}
                onClick={() => setRoom(r)}
                className={cn(
                  "min-h-8 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                  room === r
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink-body)]",
                )}
              >
                {r === "mine" ? t("events.roomMine") : t("events.roomAll")}
              </button>
            ))}
          </div>
          <span className="mx-1 h-3 w-px bg-[var(--ink)]/20" aria-hidden />
          <div className="flex items-center" role="group" aria-label={t("events.list")}>
            {(["liste", "takvim"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "min-h-8 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                  view === v
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink-body)]",
                )}
              >
                {v === "liste" ? t("events.list") : t("events.calendar")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <LoadingBlock label={t("events.loading")} />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("events.loadError")}
          onRetry={() => refetch()}
        />
      )}

      {actionError && (
        <div className="panel-glass space-y-2 p-4" role="alert">
          <p className="font-mono text-label text-[var(--error-ink)]">{actionError}</p>
          {passRequired && (
            <Link
              href="/panel/membership"
              className="inline-block font-mono text-label uppercase tracking-widest text-[var(--ink)] underline"
            >
              {t("events.getPass")}
            </Link>
          )}
        </div>
      )}

      {!loading && !isError && events.length === 0 && (
        <div className="panel-glass space-y-4 px-5 py-10 text-center">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("events.emptyPublished")}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">{t("events.emptyHint")}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setComposeOpen(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
                >
                  <Plus className="size-3.5" /> {t("events.emptyCtaCreate")}
                </button>
                <Link
                  href="/panel/events/admin"
                  className="inline-flex min-h-11 items-center border border-[var(--ink)]/20 px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink)]"
                >
                  {t("events.emptyCtaAdmin")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/panel/chat"
                  className="inline-flex min-h-11 items-center bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
                >
                  {t("events.emptyCtaChat")}
                </Link>
                <Link
                  href="/panel"
                  className="inline-flex min-h-11 items-center border border-[var(--ink)]/20 px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink)]"
                >
                  {t("events.emptyCtaHome")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !isError && view === "liste" && timeline.length > 0 && (
        <FadeIn delay={0.04}>
          <ol className="relative">
            {timeline.map((e, i) => (
              <TimelineEvent
                key={String(e.id)}
                event={e}
                isLast={i === timeline.length - 1}
                onOpen={openEvent}
              />
            ))}
          </ol>
        </FadeIn>
      )}

      {!loading && !isError && view === "liste" && timeline.length === 0 && events.length > 0 && (
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("events.empty")}
        </p>
      )}

      {!loading && !isError && view === "takvim" && events.length > 0 && (
        <FadeIn delay={0.04}>
          <CalendarView events={events} onOpen={openEvent} />
        </FadeIn>
      )}

      {selected && (
        <EventDetailPanel
          event={selected}
          onClose={closeEvent}
          busy={busyId === selected.id}
          onRegister={register}
          onUnregister={unregister}
        />
      )}

      <ExternalEventModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["events"] });
        }}
      />
    </div>
  );
}
