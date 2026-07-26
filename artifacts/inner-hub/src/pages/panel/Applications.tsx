import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { Check, X, ChevronRight, Clock, Search, SlidersHorizontal } from "lucide-react";
import { toLowerTR, toUpperTR } from "@/lib/tr";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import { Lockup } from "@/components/Lockup";
import { useT } from "@/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "beklemede" | "onaylandı" | "reddedildi";

type Application = {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  companyLogo?: string;
  companyDomain?: string;
  why: string;
  referrer: string | null;
  appliedAt: string;
  status: AppStatus;
  linkedinUrl: string;
  tags: string[];
};

const STATUS_STYLE: Record<AppStatus, { color: string; bg: string; labelKey: string }> = {
  beklemede: { labelKey: "applications.pending", color: "text-[var(--ink-muted)]", bg: "bg-[var(--ink)]/[0.06]" },
  onaylandı: { labelKey: "applications.approved", color: "text-[var(--success-ink)]", bg: "bg-[var(--inner-green)]/10" },
  reddedildi: { labelKey: "applications.rejected", color: "text-[var(--error-ink)]", bg: "bg-[var(--error)]/10" },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const t = useT();
  const cfg = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-label uppercase tracking-widest ${cfg.color} ${cfg.bg}`}
    >
      {status === "beklemede" && <Clock className="size-2.5" />}
      {status === "onaylandı" && <Check className="size-2.5" />}
      {status === "reddedildi" && <X className="size-2.5" />}
      {t(cfg.labelKey)}
    </span>
  );
}

function DetailPanel({
  app,
  onClose,
  onApprove,
  onReject,
  busy,
}: {
  app: Application;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  const t = useT();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink)]/20" onClick={onClose} />
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l border-[var(--ink)]/10 bg-[var(--bone)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("applications.detail")}</p>
          <button
            onClick={onClose}
            className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            {t("capital.close")}
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          <div>
            <div className="mb-1 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {app.companyLogo ? (
                  <img
                    src={app.companyLogo}
                    alt=""
                    className="size-10 shrink-0 border border-[var(--ink)]/10 bg-[var(--bone)] object-contain p-1"
                  />
                ) : null}
                <div className="min-w-0">
                  <p
                    className="font-serif text-xl text-[var(--ink)]"
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
                  >
                    {app.name}
                  </p>
                  <p className="font-mono text-label text-[var(--ink-body)]">{app.email}</p>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <p className="mt-1 font-mono text-label text-[var(--ink-body)]">
              {app.role}
              {app.company ? `, ${app.company}` : ""}
              {app.companyDomain ? ` · ${app.companyDomain}` : ""}
            </p>
          </div>

          {app.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {app.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-l-2 border-[var(--ink)]/10 pl-4">
            <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
              {t("applications.why")}
            </p>
            <p className="text-sm font-light leading-relaxed text-[var(--ink-strong)]">{app.why}</p>
          </div>

          <div className="space-y-2 border border-[var(--ink)]/[0.08] p-3">
            <div className="flex justify-between">
              <span className="font-mono text-label text-[var(--ink-muted)]">{t("applications.appliedAt")}</span>
              <span className="font-mono text-label text-[var(--ink-muted)]">{app.appliedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-label text-[var(--ink-muted)]">{t("applications.referrer")}</span>
              <span className="font-mono text-label text-[var(--ink-muted)]">{app.referrer ?? t("applications.none")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="font-mono text-label text-[var(--ink-muted)]">LinkedIn</span>
              <span className="max-w-[140px] truncate font-mono text-label text-[var(--ink-muted)]">
                {app.linkedinUrl || t("applications.none")}
              </span>
            </div>
          </div>
        </div>

        {app.status === "beklemede" && (
          <div className="flex border-t border-[var(--ink)]/[0.08]">
            <button
              disabled={busy}
              onClick={onReject}
              className="flex-1 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:bg-[var(--error)]/5 hover:text-[var(--error-ink)] disabled:opacity-40"
            >
              {t("applications.reject")}
            </button>
            <button
              disabled={busy}
              onClick={onApprove}
              className="flex-1 py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-[var(--inner-green)]/10 hover:text-[var(--success-ink)] disabled:opacity-40"
            >
              {t("applications.approve")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

type FilterId = "all" | AppStatus;

const FILTERS: { id: FilterId; labelKey: string }[] = [
  { id: "all", labelKey: "common.all" },
  { id: "beklemede", labelKey: "applications.pending" },
  { id: "onaylandı", labelKey: "applications.approved" },
  { id: "reddedildi", labelKey: "applications.rejected" },
];

export default function ApplicationsPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ applications: Application[] }>(
    ["applications"],
    "/api/applications",
  );

  const apps = data?.applications ?? [];
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const counts: Record<FilterId, number> = {
    all: apps.length,
    beklemede: apps.filter((a) => a.status === "beklemede").length,
    onaylandı: apps.filter((a) => a.status === "onaylandı").length,
    reddedildi: apps.filter((a) => a.status === "reddedildi").length,
  };

  const filtered = apps.filter((a) => {
    const matchFilter = filter === "all" || a.status === filter;
    const q = toLowerTR(search);
    const matchSearch =
      !q ||
      toLowerTR(a.name).includes(q) ||
      toLowerTR(a.company).includes(q) ||
      toLowerTR(a.email).includes(q) ||
      a.tags.some((t) => toLowerTR(t).includes(q));
    return matchFilter && matchSearch;
  });

  const updateStatus = async (id: number, status: AppStatus) => {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(apiUrl(`/api/applications/${id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("applications.updateFailed"));
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    } catch (e: any) {
      setActionError(e.message ?? t("applications.updateFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 max-w-2xl space-y-6 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{t("applications.admin")}</span>
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("applications.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">
            {t("applications.subtitle")}
          </p>
        </div>
      </FadeIn>

      {isLoading ? (
        <LoadingBlock label={t("applications.loading")}>
          <div className="space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : isError ? (
        <ErrorState message={error instanceof Error ? error.message : t("applications.loadError")} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { labelKey: "applications.pending", val: counts.beklemede, color: "text-[var(--ink)]" },
              { labelKey: "applications.approved", val: counts.onaylandı, color: "text-[var(--success-ink)]" },
              { labelKey: "applications.rejected", val: counts.reddedildi, color: "text-[var(--error-ink)]" },
            ].map((s) => (
              <div key={s.labelKey} className="border border-[var(--ink)]/[0.08] p-4">
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t(s.labelKey)}</p>
                <p
                  className={`mt-1 font-serif text-2xl ${s.color}`}
                  style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                >
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="-mx-px flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={[
                    "shrink-0 border-y border-r px-3 py-2 font-mono text-sm uppercase tracking-widest transition-colors first:border-l sm:py-1.5 sm:text-label",
                    filter === f.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                      : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  {t(f.labelKey)}
                  <span className="ml-1 opacity-50">{counts[f.id]}</span>
                </button>
              ))}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 border border-[var(--ink)]/[0.08] px-3 py-2 sm:py-1.5">
              <Search className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-light text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
                placeholder={t("applications.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {actionError && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {actionError}
            </p>
          )}

          <div className="border border-[var(--ink)]/[0.08]">
            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <SlidersHorizontal className="mx-auto mb-3 size-6 text-[var(--ink-subtle)]" />
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
                  {apps.length === 0 ? t("applications.empty") : t("applications.noResults")}
                </p>
              </div>
            ) : (
              filtered.map((app, i) => (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className={[
                    "flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--ink)]/[0.03]",
                    i < filtered.length - 1 ? "border-b border-[var(--ink)]/[0.05]" : "",
                  ].join(" ")}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--bone)] font-mono text-label text-[var(--ink-body)]">
                    {app.companyLogo ? (
                      <img src={app.companyLogo} alt="" className="size-full object-contain p-0.5" />
                    ) : (
                      toUpperTR(
                        app.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join(""),
                      )
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-sm text-[var(--ink)]" style={{ fontWeight: 400 }}>
                        {app.name}
                      </p>
                      {app.referrer && (
                        <span className="font-mono text-label text-[var(--ink-muted)]">
                          ref: {app.referrer.split(" ")[0]}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-label text-[var(--ink-muted)]">
                      {app.role}
                      {app.company ? `, ${app.company}` : ""}
                    </p>
                  </div>

                  <div className="hidden gap-1 sm:flex">
                    {app.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="border border-[var(--ink)]/[0.08] px-2 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={app.status} />
                    <span className="font-mono text-label text-[var(--ink-subtle)]">{app.appliedAt}</span>
                  </div>

                  <ChevronRight className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("applications.footer")}
        </p>
      </div>

      {selected && (
        <DetailPanel
          app={selected}
          busy={busy}
          onClose={() => setSelected(null)}
          onApprove={() => updateStatus(selected.id, "onaylandı")}
          onReject={() => updateStatus(selected.id, "reddedildi")}
        />
      )}
    </div>
  );
}
