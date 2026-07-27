"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, X, Loader2, ArrowUpRight } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useLocale, useT } from "@/i18n";
import { cn } from "@/lib/utils";

type SearchHit = {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
};

type AiBlock = {
  intent?: string;
  summary?: string;
  suggestions?: { title: string; href: string; reason?: string }[];
};

const KIND_LABEL: Record<string, string> = {
  page: "page",
  member: "member",
  course: "course",
  event: "event",
  perk: "perk",
  stage: "stage",
  org: "org",
  faq: "faq",
};

export function PanelSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [ai, setAi] = useState<AiBlock | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [active, setActive] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    setQ("");
    setAi(null);
    setResults([]);
    setActive(0);
  }, [onOpenChange]);

  const go = useCallback(
    (href: string) => {
      close();
      setLocation(href);
    },
    [close, setLocation],
  );

  const runSearch = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          apiUrl(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`),
          { credentials: "include" },
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "search");
        setResults(Array.isArray(json.results) ? json.results : []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  const runAi = useCallback(async () => {
    if (q.trim().length < 2) return;
    setAiLoading(true);
    try {
      const res = await fetch(apiUrl("/api/search/ai"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: q.trim(), locale }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "ai");
      setResults(Array.isArray(json.results) ? json.results : []);
      setAi(json.ai ?? null);
      setActive(0);
    } catch {
      setAi({
        summary: t("search.aiFailed"),
      });
    } finally {
      setAiLoading(false);
    }
  }, [q, locale, t]);

  useEffect(() => {
    if (!open) return;
    const tmr = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(tmr);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open, runSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, close]);

  if (!open) return null;

  const flatNav =
    ai?.suggestions?.map((s, i) => ({
      id: `ai-${i}`,
      kind: "ai",
      title: s.title,
      subtitle: s.reason,
      href: s.href,
      score: 100,
    })) ?? [];

  const display = [...flatNav, ...results.filter((r) => !flatNav.some((a) => a.href === r.href && a.title === r.title))];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(display.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = display[active];
      if (hit) go(hit.href);
      else if (q.trim().length >= 2) void runAi();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col sm:items-center sm:justify-start sm:pt-[8vh] sm:px-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/45 backdrop-blur-[2px] dark:bg-black/55"
        aria-label={t("search.close")}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("search.title")}
        className="relative z-[1] flex h-full w-full flex-col overflow-hidden bg-[var(--bone)] shadow-2xl sm:h-auto sm:max-h-[min(78vh,640px)] sm:max-w-xl sm:rounded-none sm:border sm:border-[var(--ink)]/12 dark:bg-[#12110f] dark:border-white/10"
      >
        <div className="flex items-center gap-2 border-b border-[var(--ink)]/[0.08] px-3 py-3 sm:px-4 dark:border-white/10">
          <Search className="size-4 shrink-0 text-[var(--ink-muted)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAi(null);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] sm:text-sm"
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            enterKeyHint="search"
          />
          {loading || aiLoading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--ink-muted)]" />
          ) : null}
          <button
            type="button"
            onClick={() => void runAi()}
            disabled={q.trim().length < 2 || aiLoading}
            className="inline-flex min-h-10 items-center gap-1.5 border border-[var(--ink)]/15 px-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/35 hover:text-[var(--ink)] disabled:opacity-40"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden xs:inline sm:inline">{t("search.ai")}</span>
          </button>
          <button
            type="button"
            onClick={close}
            className="hit-40 text-[var(--ink-muted)] hover:text-[var(--ink)] sm:hidden"
            aria-label={t("search.close")}
          >
            <X className="size-5" />
          </button>
        </div>

        {ai?.summary ? (
          <div className="border-b border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.03] px-4 py-3 dark:border-white/8">
            {ai.intent ? (
              <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {ai.intent}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-[var(--ink-body)]">{ai.summary}</p>
          </div>
        ) : null}

        <div id={listId} role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {display.length === 0 && !loading ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
              {q.trim() ? t("search.empty") : t("search.hint")}
            </p>
          ) : (
            <ul className="py-1">
              {display.map((hit, i) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit.href)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      i === active
                        ? "bg-[var(--ink)]/[0.06] dark:bg-white/[0.06]"
                        : "hover:bg-[var(--ink)]/[0.03]",
                    )}
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                      {t(`search.kind.${KIND_LABEL[hit.kind] ?? "page"}`)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--ink)]">{hit.title}</span>
                      {hit.subtitle ? (
                        <span className="mt-0.5 block truncate text-xs text-[var(--ink-muted)]">
                          {hit.subtitle}
                        </span>
                      ) : null}
                    </span>
                    <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-[var(--ink-muted)]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden items-center justify-between border-t border-[var(--ink)]/[0.08] px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] sm:flex dark:border-white/10">
          <span>{t("search.footerNav")}</span>
          <span>{t("search.footerAi")}</span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger({
  onClick,
  variant = "auto",
}: {
  onClick: () => void;
  variant?: "auto" | "icon" | "bar";
}) {
  const t = useT();
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="hit-40 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] dark:text-white/45 dark:hover:text-white"
        aria-label={t("search.open")}
      >
        <Search className="size-4" />
      </button>
    );
  }
  if (variant === "bar") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-9 w-full max-w-[280px] items-center gap-2 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.03] px-3 text-left transition-colors hover:border-[var(--ink)]/25 dark:border-white/10 dark:bg-white/[0.04]"
        aria-label={t("search.open")}
      >
        <Search className="size-3.5 shrink-0 text-[var(--ink-muted)]" />
        <span className="min-w-0 flex-1 truncate text-xs text-[var(--ink-muted)]">
          {t("search.placeholderShort")}
        </span>
        <kbd className="font-mono text-label text-[var(--ink-muted)]">⌘K</kbd>
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="hit-40 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] dark:text-white/45 dark:hover:text-white lg:hidden"
        aria-label={t("search.open")}
      >
        <Search className="size-4" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="hidden min-h-9 max-w-[220px] flex-1 items-center gap-2 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.03] px-3 text-left transition-colors hover:border-[var(--ink)]/25 lg:flex dark:border-white/10 dark:bg-white/[0.04]"
        aria-label={t("search.open")}
      >
        <Search className="size-3.5 shrink-0 text-[var(--ink-muted)]" />
        <span className="min-w-0 flex-1 truncate text-xs text-[var(--ink-muted)]">
          {t("search.placeholderShort")}
        </span>
        <kbd className="font-mono text-label text-[var(--ink-muted)]">⌘K</kbd>
      </button>
    </>
  );
}
