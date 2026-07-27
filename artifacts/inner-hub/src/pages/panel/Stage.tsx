import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, ThumbsUp } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

type StageProduct = {
  id: number;
  title: string;
  url: string;
  pitch: string;
  votes: number;
  myVote: boolean;
  authorName: string | null;
  authorHandle: string | null;
};

function ProductCard({
  product,
  busy,
  onVote,
}: {
  product: StageProduct;
  busy?: boolean;
  onVote: (id: number) => void;
}) {
  const t = useT();
  return (
    <article className="panel-glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg text-[var(--ink)]">{product.title}</p>
          {product.authorName ? (
            <p className="mt-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {product.authorHandle ? `@${product.authorHandle}` : product.authorName}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-body)]">{product.pitch}</p>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            {t("stage.openLink")}
            <ExternalLink className="size-3" />
          </a>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onVote(product.id)}
          className={[
            "inline-flex min-h-10 shrink-0 items-center gap-1.5 px-3 py-2 font-mono text-label uppercase tracking-widest transition-colors disabled:opacity-40",
            product.myVote
              ? "border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
              : "panel-glass text-[var(--ink-body)] hover:border-[var(--ink)]/30",
          ].join(" ")}
        >
          <ThumbsUp className="size-3.5" />
          {product.votes}
        </button>
      </div>
    </article>
  );
}

function SubmitForm({ onAdded }: { onAdded: () => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pitch, setPitch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !url.trim() || !pitch.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/stage/products"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, pitch }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("stage.submitFailed"));
      setTitle("");
      setUrl("");
      setPitch("");
      onAdded();
    } catch (e: any) {
      setError(e.message ?? t("stage.submitFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel-glass space-y-3 p-4">
      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink)]">
        {t("stage.submit")}
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("stage.titlePlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t("stage.urlPlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <textarea
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        placeholder={t("stage.pitchPlaceholder")}
        rows={3}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
      <button
        type="button"
        disabled={busy || !title.trim() || !url.trim() || !pitch.trim()}
        onClick={() => void submit()}
        className="flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        <Plus className="size-3" />
        {t("stage.submit")}
      </button>
    </div>
  );
}

export default function Stage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<number | null>(null);

  const showcase = useApiQuery<{ products: StageProduct[] }>(
    ["stage-showcase"],
    "/api/stage/showcase",
  );
  const products = useApiQuery<{ products: StageProduct[] }>(
    ["stage-products"],
    "/api/stage/products",
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["stage-showcase"] });
    void queryClient.invalidateQueries({ queryKey: ["stage-products"] });
  };

  const vote = async (id: number) => {
    setBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}/vote`), {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) refresh();
    } finally {
      setBusyId(null);
    }
  };

  const loading = showcase.isLoading || products.isLoading;
  const errored = showcase.isError || products.isError;
  const showcaseList = showcase.data?.products ?? [];
  const productList = products.data?.products ?? [];

  return (
    <div className="min-w-0 max-w-2xl space-y-8">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="stage" className="text-[var(--ink)]" fontSize="1.15rem" />
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("stage.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("stage.subtitle")}</p>
        </div>
      </FadeIn>

      {loading ? (
        <LoadingBlock label={t("stage.loading")}>
          <div className="space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : errored ? (
        <ErrorState
          message={t("stage.loadFailed")}
          onRetry={() => {
            void showcase.refetch();
            void products.refetch();
          }}
        />
      ) : (
        <>
          {showcaseList.length > 0 && (
            <FadeIn delay={0.04}>
              <section>
                <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                    {t("stage.showcase")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{t("stage.showcaseHint")}</p>
                </div>
                <div className="space-y-3">
                  {showcaseList.map((p) => (
                    <ProductCard
                      key={`s-${p.id}`}
                      product={p}
                      busy={busyId === p.id}
                      onVote={vote}
                    />
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          <FadeIn delay={0.08}>
            <section>
              <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                  {t("stage.allProducts")}
                </p>
              </div>
              <div className="space-y-3">
                {productList.length === 0 ? (
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("stage.empty")}
                  </p>
                ) : (
                  productList.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      busy={busyId === p.id}
                      onVote={vote}
                    />
                  ))
                )}
                <SubmitForm onAdded={refresh} />
              </div>
            </section>
          </FadeIn>
        </>
      )}
    </div>
  );
}
