import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useLocale, useT } from "@/i18n";

type LegalDoc = {
  id: number;
  slug: string;
  version: string;
  title: string;
  bodyMarkdown: string;
};

export function LegalAcceptModal() {
  const t = useT();
  const { locale } = useLocale();
  const [pending, setPending] = useState<LegalDoc[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/api/legal/pending?locale=${locale}`), {
        credentials: "include",
      });
      if (!res.ok) {
        setPending([]);
        return;
      }
      const json = (await res.json()) as { pending?: LegalDoc[] };
      setPending(json.pending ?? []);
    } catch {
      setPending([]);
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pending?.length) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pending]);

  const acceptAll = async () => {
    if (busy || !pending?.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/legal/accept"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptAll: true,
          documentIds: pending.map((d) => d.id),
          locale,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("legal.acceptError"));
      setPending([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("legal.acceptError"));
    } finally {
      setBusy(false);
    }
  };

  if (!pending?.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[var(--ink-fixed)]/70 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-accept-title"
    >
      <div className="flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden border border-white/10 panel-glass-strong shadow-2xl sm:max-h-[85svh]">
        <div className="shrink-0 border-b border-[var(--ink)]/[0.08] px-5 py-4 sm:px-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {t("legal.eyebrow")}
          </p>
          <h2
            id="legal-accept-title"
            className="mt-2 font-serif text-2xl text-[var(--ink)] sm:text-3xl"
            style={{ fontWeight: 600 }}
          >
            {t("legal.title")}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{t("legal.subtitle")}</p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
          {pending.map((doc) => (
            <article key={doc.id} className="border border-[var(--ink)]/[0.08] p-4">
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {doc.title}
                <span className="ml-2 text-[var(--ink-muted)]">v{doc.version}</span>
              </p>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[var(--ink-body)] sm:text-sm">
                {doc.bodyMarkdown}
              </pre>
            </article>
          ))}
        </div>

        <div className="shrink-0 space-y-3 border-t border-[var(--ink)]/[0.08] px-5 py-4 sm:px-7">
          {error ? (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void acceptAll()}
            className="w-full bg-[var(--ink)] px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? t("legal.accepting") : t("legal.acceptAll")}
          </button>
          <p className="text-center font-mono text-label text-[var(--ink-muted)]">
            {t("legal.required")}
          </p>
        </div>
      </div>
    </div>
  );
}
