import { useEffect, useMemo, useState } from "react";
import { Globe, MapPin, Plus, X } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { CoverImageField } from "@/components/panel/CoverImageField";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(v: string): string | null {
  if (!v.trim()) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatRangeLabel(startLocal: string, endLocal: string, locale: string) {
  const s = startLocal ? new Date(startLocal) : null;
  const e = endLocal ? new Date(endLocal) : null;
  if (!s || Number.isNaN(s.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  const left = s.toLocaleString(locale === "en" ? "en-US" : "tr-TR", opts);
  if (!e || Number.isNaN(e.getTime())) return left;
  return `${left}  →  ${e.toLocaleString(locale === "en" ? "en-US" : "tr-TR", opts)}`;
}

function guessFormat(url: string, location: string): "online" | "in_person" | "hybrid" {
  const hay = `${url} ${location}`.toLowerCase();
  if (/zoom|meet\.google|teams\.microsoft|luma\.com|eventbrite|online|webinar/.test(hay)) {
    return "online";
  }
  return "in_person";
}

export function ExternalEventModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const defaults = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(19, 0, 0, 0);
    const end = new Date(start);
    end.setHours(21, 0, 0, 0);
    return { start: toDatetimeLocal(start), end: toDatetimeLocal(end) };
  }, [open]);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("inner·hub");
  const [startAt, setStartAt] = useState(defaults.start);
  const [endAt, setEndAt] = useState(defaults.end);
  const [coverPath, setCoverPath] = useState("");
  const [coverUpload, setCoverUpload] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setTitle("");
    setLocation("");
    setOrganizer("inner·hub");
    setStartAt(defaults.start);
    setEndAt(defaults.end);
    setCoverPath("");
    setCoverUpload(null);
    setError(null);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, defaults]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim() || !startAt) return;
    setBusy(true);
    setError(null);
    try {
      const externalUrl = url.trim() || null;
      const coverUrl = coverUpload || (coverPath.trim() ? `https://${coverPath.trim()}` : null);
      const res = await fetch(apiUrl("/api/events"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: null,
          location: location.trim() || null,
          startAt: fromDatetimeLocal(startAt),
          endAt: fromDatetimeLocal(endAt),
          format: guessFormat(url, location),
          meetUrl: null,
          externalUrl,
          organizer: organizer.trim() || null,
          coverUrl,
          audience: "all",
          passCost: 0,
          isPublished: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("events.externalSaveFailed"));
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("events.externalSaveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = Boolean(title.trim() && startAt && !busy);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[var(--ink-fixed)]/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-event-title"
        className="panel-glass-strong fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,640px)] w-[min(100%-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col border border-[var(--ink)]/15 shadow-none"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4">
          <h2 id="external-event-title" className="font-sans text-base font-medium text-[var(--ink)]">
            {t("events.externalAddTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("events.externalUrl")}
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://luma.com/…"
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none focus:border-[var(--ink)]/35"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("events.externalName")} *
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("events.externalNamePh")}
              required
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none focus:border-[var(--ink)]/35"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("events.externalLocation")}
            </span>
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("events.externalLocationPh")}
                className="w-full border border-[var(--ink)]/15 bg-transparent py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none focus:border-[var(--ink)]/35"
              />
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("events.externalOrganizer")}
            </span>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/35"
            />
          </label>

          <CoverImageField
            urlPath={coverPath}
            onUrlChange={setCoverPath}
            uploadDataUrl={coverUpload}
            onUploadChange={setCoverUpload}
            label={t("events.externalCover")}
            placeholder="gorsel-linki.com/kapak.jpg"
          />

          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("events.externalTime")}
            </span>
            <div className="border border-[var(--ink)]/15 p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-[11px] text-[var(--ink-muted)]">{t("events.externalStart")}</span>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full border border-[var(--ink)]/10 bg-transparent px-2 py-2 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--ink)]/30"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] text-[var(--ink-muted)]">{t("events.externalEnd")}</span>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full border border-[var(--ink)]/10 bg-transparent px-2 py-2 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--ink)]/30"
                  />
                </label>
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
                <Globe className="size-3.5 shrink-0" />
                GMT+03:00 İstanbul
              </p>
              <p className="mt-1 font-mono text-[10px] text-[var(--ink-subtle)]">
                {formatRangeLabel(startAt, endAt, "tr")}
              </p>
            </div>
          </div>

          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-[var(--ink)]/[0.08] p-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className={cn(
              "flex w-full min-h-11 items-center justify-center gap-1.5 bg-[var(--ink)] font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity",
              !canSubmit && "opacity-40",
            )}
          >
            <Plus className="size-3.5" />
            {busy ? t("common.saving") : t("events.externalSubmit")}
          </button>
        </div>
      </div>
    </>
  );
}
