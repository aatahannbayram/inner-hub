import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Rocket, Star, ThumbsUp, Trash2 } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useT } from "@/i18n";

type StageProduct = {
  id: number;
  title: string;
  url: string;
  pitch: string;
  votes: number;
  myVote: boolean;
  featured: boolean;
  authorName: string | null;
  authorHandle: string | null;
};

const RANK_STYLES: Record<number, string> = {
  1: "border-[var(--inner-green)]/45 bg-[var(--inner-green)]/12 text-[var(--success-ink)]",
  2: "border-[var(--ink)]/25 bg-[var(--ink)]/8 text-[var(--ink)]",
  3: "border-[var(--ink)]/15 bg-[var(--ink)]/5 text-[var(--ink-body)]",
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={[
        "inline-flex size-6 shrink-0 items-center justify-center border font-mono text-[11px] font-medium",
        RANK_STYLES[rank] ?? "border-[var(--ink)]/10 bg-transparent text-[var(--ink-muted)]",
      ].join(" ")}
    >
      {rank}
    </span>
  );
}

function StageStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="panel-glass px-4 py-3">
      <p
        className="font-display font-serif text-2xl leading-none text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function ProductCard({
  product,
  rank,
  busy,
  onVote,
  isAdmin,
  adminBusy,
  onToggleFeatured,
  onRemove,
}: {
  product: StageProduct;
  rank?: number;
  busy?: boolean;
  onVote: (id: number) => void;
  isAdmin?: boolean;
  adminBusy?: boolean;
  onToggleFeatured?: (id: number, next: boolean) => void;
  onRemove?: (id: number) => void;
}) {
  const t = useT();
  return (
    <article className="panel-glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {rank !== undefined && <RankBadge rank={rank} />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-serif text-lg text-[var(--ink)]">{product.title}</p>
              {product.featured && (
                <span className="inline-flex items-center gap-1 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--success-ink)]">
                  <Star className="size-2.5 fill-current" />
                  {t("stage.featuredBadge")}
                </span>
              )}
            </div>
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

      {isAdmin && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--ink)]/[0.08] pt-3">
          <button
            type="button"
            disabled={adminBusy}
            onClick={() => onToggleFeatured?.(product.id, !product.featured)}
            className={[
              "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40",
              product.featured
                ? "border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
                : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:border-[var(--ink)]/30",
            ].join(" ")}
          >
            <Star className={product.featured ? "size-3 fill-current" : "size-3"} />
            {product.featured ? t("stage.adminUnfeature") : t("stage.adminFeature")}
          </button>
          <button
            type="button"
            disabled={adminBusy}
            onClick={() => onRemove?.(product.id)}
            className="inline-flex items-center gap-1.5 border border-[var(--error-ink)]/25 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)] transition-colors hover:bg-[var(--error-ink)]/5 disabled:opacity-40"
          >
            <Trash2 className="size-3" />
            {t("stage.adminRemove")}
          </button>
        </div>
      )}
    </article>
  );
}

function SubmitDrawer({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
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
      onClose();
    } catch (e: any) {
      setError(e.message ?? t("stage.submitFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none panel-glass-strong border-white/10">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            <span lang="en">inner·stage</span>
          </p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("stage.submit")}
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink-body)]">
            {t("stage.subtitle")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("stage.titlePlaceholder")}
            className="w-full panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("stage.urlPlaceholder")}
            className="w-full panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder={t("stage.pitchPlaceholder")}
            rows={3}
            className="w-full panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
          <button
            type="button"
            disabled={busy || !title.trim() || !url.trim() || !pitch.trim()}
            onClick={() => void submit()}
            className="flex items-center gap-1.5 panel-glass-ink px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Plus className="size-3" />
            {t("stage.submit")}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default function Stage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [adminBusyId, setAdminBusyId] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"votes" | "newest">("votes");

  const showcase = useApiQuery<{ products: StageProduct[] }>(
    ["stage-showcase"],
    "/api/stage/showcase",
  );
  const products = useApiQuery<{ products: StageProduct[] }>(
    ["stage-products"],
    "/api/stage/products",
  );
  const { data: meData } = useApiQuery<{ user: { role: "member" | "admin" } }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const isAdmin = meData?.user?.role === "admin";

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

  const toggleFeatured = async (id: number, next: boolean) => {
    setAdminBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (res.ok) refresh();
    } finally {
      setAdminBusyId(null);
    }
  };

  const removeProduct = async (id: number) => {
    if (!window.confirm(t("stage.confirmRemove"))) return;
    setAdminBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) refresh();
    } finally {
      setAdminBusyId(null);
    }
  };

  const loading = showcase.isLoading || products.isLoading;
  const errored = showcase.isError || products.isError;
  const showcaseList = showcase.data?.products ?? [];
  const productList = products.data?.products ?? [];

  const sortedProducts = useMemo(() => {
    const list = [...productList];
    // createdAt frontend'e taşınmıyor; serial id kayıt sırasıyla birebir arttığı
    // için "en yeni" sıralamasını id desc ile karşılıyoruz.
    if (sortMode === "newest") list.sort((a, b) => b.id - a.id);
    return list;
  }, [productList, sortMode]);

  const totalVotes = productList.reduce((sum, p) => sum + p.votes, 0);

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
          <FadeIn delay={0.02}>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StageStat value={productList.length} label={t("stage.statsProducts")} />
              <StageStat value={totalVotes} label={t("stage.statsVotes")} />
              <StageStat value={showcaseList.length} label={t("stage.statsShowcase")} />
            </div>
          </FadeIn>

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
                  {showcaseList.map((p, i) => (
                    <ProductCard
                      key={`s-${p.id}`}
                      product={p}
                      rank={i + 1}
                      busy={busyId === p.id}
                      onVote={vote}
                      isAdmin={isAdmin}
                      adminBusy={adminBusyId === p.id}
                      onToggleFeatured={toggleFeatured}
                      onRemove={removeProduct}
                    />
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          <FadeIn delay={0.08}>
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ink)]/[0.08] pt-3">
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                  {t("stage.allProducts")}
                </p>
                <div className="flex items-center gap-2">
                  {productList.length > 0 && (
                    <div className="flex border border-[var(--ink)]/10">
                      <button
                        type="button"
                        onClick={() => setSortMode("votes")}
                        className={[
                          "px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                          sortMode === "votes"
                            ? "bg-[var(--ink)] text-[var(--bone)]"
                            : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                        ].join(" ")}
                      >
                        {t("stage.sortVotes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortMode("newest")}
                        className={[
                          "px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                          sortMode === "newest"
                            ? "bg-[var(--ink)] text-[var(--bone)]"
                            : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                        ].join(" ")}
                      >
                        {t("stage.sortNewest")}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setComposeOpen(true)}
                    className="inline-flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                  >
                    <Plus className="size-3" />
                    {t("stage.addProduct")}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {sortedProducts.length === 0 ? (
                  <div className="panel-glass flex flex-col items-center gap-3 px-6 py-10 text-center">
                    <Rocket className="size-6 text-[var(--ink-subtle)]" />
                    <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                      {t("stage.empty")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setComposeOpen(true)}
                      className="mt-1 inline-flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                    >
                      <Plus className="size-3" />
                      {t("stage.emptyCta")}
                    </button>
                  </div>
                ) : (
                  sortedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      busy={busyId === p.id}
                      onVote={vote}
                      isAdmin={isAdmin}
                      adminBusy={adminBusyId === p.id}
                      onToggleFeatured={toggleFeatured}
                      onRemove={removeProduct}
                    />
                  ))
                )}
              </div>
            </section>
          </FadeIn>
        </>
      )}

      <SubmitDrawer open={composeOpen} onClose={() => setComposeOpen(false)} onAdded={refresh} />
    </div>
  );
}
