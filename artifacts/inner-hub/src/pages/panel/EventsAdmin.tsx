import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import { CoverImageField } from "@/components/panel/CoverImageField";
import { useT } from "@/i18n";

type EventFormat = "online" | "in_person" | "hybrid";
type Audience = "all" | "founder" | "investor" | "builder" | "company";

type AdminEvent = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  format: EventFormat;
  meetUrl: string | null;
  coverUrl?: string | null;
  audience: Audience;
  passCost: number;
  isPublished: boolean;
};

const FORMAT_OPTIONS: EventFormat[] = ["online", "in_person", "hybrid"];
const AUDIENCE_OPTIONS: Audience[] = ["all", "founder", "investor", "builder", "company"];

function fromDatetimeLocal(v: string): string | null {
  if (!v.trim()) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function EventAdminCard({ event, onChanged }: { event: AdminEvent; onChanged: () => void }) {
  const t = useT();
  const [notifying, setNotifying] = useState(false);

  const togglePublish = async () => {
    await fetch(apiUrl(`/api/events/${event.id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !event.isPublished }),
    });
    onChanged();
  };

  const notify = async () => {
    setNotifying(true);
    try {
      await fetch(apiUrl("/api/admin/live/notify"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refType: "event", refId: event.id, channel: "both" }),
      });
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="panel-glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {event.coverUrl && (
            <img
              src={event.coverUrl}
              alt=""
              className="size-14 shrink-0 object-cover"
            />
          )}
          <div className="min-w-0">
          <p className="font-serif text-lg text-[var(--ink)]">{event.title}</p>
          <p className="mt-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {event.format} · {event.audience} · {event.passCost} pass
          </p>
          {event.description ? (
            <p className="mt-2 text-sm text-[var(--ink-muted)] line-clamp-2">{event.description}</p>
          ) : null}
          <p className="mt-2 font-mono text-label text-[var(--ink-body)]">
            {new Date(event.startAt).toLocaleString("tr-TR")}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {event.meetUrl ? (
            <a
              href={event.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono text-label text-[var(--ink-muted)] underline-offset-2 hover:underline"
            >
              {event.meetUrl}
            </a>
          ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={notifying}
            onClick={() => void notify()}
            className="px-2 py-0.5 font-mono text-label uppercase tracking-widest border border-[var(--ink)]/20 bg-[var(--ink)]/[0.04] text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/40 disabled:opacity-40"
          >
            {notifying ? "…" : t("eventsAdmin.notify")}
          </button>
          <button
            type="button"
            onClick={() => void togglePublish()}
            className={`px-2 py-0.5 font-mono text-label uppercase tracking-widest ${
              event.isPublished
                ? "border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/8 text-[var(--success-ink)]"
                : "border border-[var(--ink)]/20 bg-[var(--ink)]/[0.04] text-[var(--ink-body)]"
            }`}
          >
            {event.isPublished ? t("eventsAdmin.published") : t("eventsAdmin.draft")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEventForm({ onAdded }: { onAdded: () => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [format, setFormat] = useState<EventFormat>("online");
  const [meetUrl, setMeetUrl] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [passCost, setPassCost] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [coverPath, setCoverPath] = useState("");
  const [coverUpload, setCoverUpload] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !startAt || !endAt) return;
    setBusy(true);
    setError(null);
    try {
      const coverUrl = coverUpload || (coverPath.trim() ? `https://${coverPath.trim()}` : null);
      const res = await fetch(apiUrl("/api/events"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          location: location || null,
          startAt: fromDatetimeLocal(startAt),
          endAt: fromDatetimeLocal(endAt),
          format,
          meetUrl: meetUrl.trim() || null,
          coverUrl,
          audience,
          passCost,
          isPublished,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("eventsAdmin.saveFailed"));
      setTitle("");
      setDescription("");
      setLocation("");
      setStartAt("");
      setEndAt("");
      setFormat("online");
      setMeetUrl("");
      setAudience("all");
      setPassCost(1);
      setIsPublished(false);
      setCoverPath("");
      setCoverUpload(null);
      onAdded();
    } catch (e: any) {
      setError(e.message ?? t("eventsAdmin.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel-glass space-y-3 p-4">
      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink)]">
        {t("eventsAdmin.addEvent")}
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("eventsAdmin.titlePlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("eventsAdmin.descriptionPlaceholder")}
        rows={2}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder={t("eventsAdmin.locationPlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <CoverImageField
        urlPath={coverPath}
        onUrlChange={setCoverPath}
        uploadDataUrl={coverUpload}
        onUploadChange={setCoverUpload}
        label={t("events.externalCover")}
        placeholder="gorsel-linki.com/kapak.jpg"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.startAt")}
          </span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.endAt")}
          </span>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.format")}
          </span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as EventFormat)}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          >
            {FORMAT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.audience")}
          </span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          >
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(format === "online" || format === "hybrid") && (
        <label className="block space-y-1">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.meetUrl")}
          </span>
          <input
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet…"
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          />
        </label>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("eventsAdmin.passCost")}
          </span>
          <input
            type="number"
            min={0}
            value={passCost}
            onChange={(e) => setPassCost(Number(e.target.value) || 0)}
            className="w-16 border border-[var(--ink)]/15 bg-transparent px-2 py-1 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
          />
        </label>
        <label className="flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="size-3.5 accent-[var(--ink)]"
          />
          {t("eventsAdmin.publishNow")}
        </label>
      </div>
      {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
      <button
        type="button"
        disabled={busy || !title.trim() || !startAt || !endAt}
        onClick={() => void submit()}
        className="flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        <Plus className="size-3" />
        {t("eventsAdmin.addEvent")}
      </button>
    </div>
  );
}

export default function EventsAdmin() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useApiQuery<{ events: AdminEvent[] }>(
    ["events-admin"],
    "/api/admin/events",
  );
  const events = data?.events ?? [];
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["events-admin"] });

  return (
    <div className="min-w-0 max-w-2xl space-y-6">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("eventsAdmin.eyebrow")}
            </span>
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontWeight: 600 }}
          >
            {t("eventsAdmin.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("eventsAdmin.subtitle")}</p>
        </div>
      </FadeIn>

      {isLoading ? (
        <LoadingBlock label={t("eventsAdmin.loading")}>
          <div className="space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : isError ? (
        <ErrorState message={t("eventsAdmin.loadFailed")} onRetry={() => refetch()} />
      ) : (
        <FadeIn delay={0.05}>
          <div className="space-y-3">
            {events.map((e) => (
              <EventAdminCard key={e.id} event={e} onChanged={refresh} />
            ))}
            <AddEventForm onAdded={refresh} />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
