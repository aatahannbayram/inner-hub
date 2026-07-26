import { useState } from "react";
import { Lockup } from "@/components/Lockup";
import { FadeIn } from "@/components/FadeIn";
import { ChevronDown } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

type FaqCategory = {
  category: string;
  items: { question: string; answer: string }[];
};

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--ink)]/[0.06] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--ink)]"
      >
        <span className="text-sm font-light leading-relaxed text-[var(--ink)]">{q}</span>
        <ChevronDown
          className={`mt-0.5 size-4 shrink-0 text-[var(--ink-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm font-light leading-relaxed text-[var(--ink-body)]">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const t = useT();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ categories: FaqCategory[] }>(
    ["faq"],
    "/api/faq",
  );
  const categories = data?.categories ?? [];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const current = activeCategory ?? categories[0]?.category ?? null;
  const active = categories.find((c) => c.category === current) ?? categories[0];

  return (
    <div className="min-w-0 max-w-xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"><Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" /></div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("faq.title")}

          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("faq.subtitle")}</p>
        </div>
      </FadeIn>

      {isLoading && categories.length === 0 && <LoadingBlock label={t("faq.loading")} />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("faq.loadError")}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("faq.empty")}
        </p>
      )}

      {categories.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveCategory(cat.category)}
                className={[
                  "border px-3.5 py-1.5 font-mono text-label uppercase tracking-widest transition-colors",
                  current === cat.category
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {active && (
            <div className="panel-glass px-5">
              {active.items.map((item) => (
                <AccordionItem key={item.question} q={item.question} a={item.answer} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="panel-glass p-5">
        <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("faq.noAnswer")}
        </p>
        <p className="mb-3 text-sm font-light text-[var(--ink-muted)]">
          {t("faq.contactHint")}
        </p>
        <a
          href="mailto:support@inner.digital"
          className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] underline underline-offset-2 transition-colors hover:text-[var(--ink)]"
        >
          <span lang="en">support@inner.digital</span>
        </a>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("faq.footer")}
        </p>
      </div>
    </div>
  );
}
