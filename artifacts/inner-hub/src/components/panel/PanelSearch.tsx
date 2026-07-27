"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  ai: "ai",
};

export function PanelSearch({
  open,
  onOpenChange,
  focusSignal = 0,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Artınca input’a senkron focus (iOS klavye için) */
  focusSignal?: number;
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
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    setQ("");
    setAi(null);
    setResults([]);
    setActive(-1);
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
        setActive(-1);
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
      setAi({ summary: t("search.aiFailed") });
    } finally {
      setAiLoading(false);
    }
  }, [q, locale, t]);

  useEffect(() => {
    if (!open) return;
    // Kullanıcı jestürü zincirinde focus (iOS soft keyboard)
    const el = inputRef.current;
    if (el) {
      el.focus({ preventScroll: true });
      // Bazı Safari sürümlerinde ikinci tick gerekir
      requestAnimationFrame(() => el.focus({ preventScroll: true }));
    }
  }, [open, focusSignal]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open, runSearch]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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

  if (!open || typeof document === "undefined") return null;

  const flatNav =
    ai?.suggestions?.map((s, i) => ({
      id: `ai-${i}`,
      kind: "ai",
      title: s.title,
      subtitle: s.reason,
      href: s.href,
      score: 100,
    })) ?? [];

  const display = [
    ...flatNav,
    ...results.filter((r) => !flatNav.some((a) => a.href === r.href && a.title === r.title)),
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min((i < 0 ? -1 : i) + 1, Math.max(display.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      // Yazarken Enter ile yanlışlıkla ilk sonuca gitme; yalnız seçili satır varsa
      if (active >= 0 && display[active]) {
        e.preventDefault();
        go(display[active]!.href);
      } else if (q.trim().length >= 2 && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void runAi();
      }
    }
  };

  const ui = (
    <div
      className="fixed inset-0 z-[120] flex flex-col"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-[var(--ink)]/50 dark:bg-black/60"
        aria-label={t("search.close")}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("search.title")}
        className="relative z-[1] mt-[max(0.5rem,env(safe-area-inset-top))] flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden border border-[var(--ink)]/10 bg-[var(--bone)] shadow-2xl dark:border-white/10 dark:bg-[#12110f] sm:mx-auto sm:mt-[8vh] sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--ink)]/[0.08] px-3 py-2.5 dark:border-white/10">
          <Search className="size-4 shrink-0 text-[var(--ink-muted)]" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAi(null);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            inputMode="search"
          />
          {loading || aiLoading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--ink-muted)]" />
          ) : null}
          <button
            type="button"
            onClick={() => void runAi()}
            disabled={q.trim().length < 2 || aiLoading}
            className="inline-flex size-11 shrink-0 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/35 hover:text-[var(--ink)] disabled:opacity-40"
            aria-label={t("search.ai")}
          >
            <Sparkles className="size-4" />
          </button>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 shrink-0 items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)]"
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

        <div
          id={listId}
          role="listbox"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
        >
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
                    onPointerDown={(e) => {
                      // blur olmadan önce git (iOS)
                      e.preventDefault();
                      go(hit.href);
                    }}
                    className={cn(
                      "flex min-h-14 w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                      i === active
                        ? "bg-[var(--ink)]/[0.06] dark:bg-white/[0.06]"
                        : "active:bg-[var(--ink)]/[0.04]",
                    )}
                  >
                    <span className="mt-0.5 w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
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
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}

/** Sabit 44px dokunma hedefi — hit-40 kullanma (üst barda çakışma yapıyor). */
export function HeaderIconButton({
  onClick,
  label,
  children,
  className,
  "data-onboarding": dataOnboarding,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  "data-onboarding"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-onboarding={dataOnboarding}
      className={cn(
        "relative z-10 inline-flex size-11 shrink-0 items-center justify-center text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] dark:text-white/55 dark:hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SearchTriggerBar({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-full max-w-[280px] items-center gap-2 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.03] px-3 text-left transition-colors hover:border-[var(--ink)]/25 dark:border-white/10 dark:bg-white/[0.04]"
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
