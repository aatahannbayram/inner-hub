import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Layers,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { avatarColor } from "@/lib/avatarColor";
import { HeroVideo } from "@/components/HeroVideo";
import { toLowerTR, toUpperTR } from "@/lib/tr";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import { useT, useLocale } from "@/i18n";

type Category = "Tümü" | "Yazılım" | "Finans" | "Yaşam" | "Eğitim";

interface Perk {
  id: number;
  brand: string;
  title: string;
  description: string;
  howTo: string;
  category: Exclude<Category, "Tümü">;
  logoUrl: string | null;
  badge: string;
  code: string | null;
  partnerUrl: string;
  featured?: boolean;
  expiresAt?: string;
}

const CATEGORIES: Category[] = ["Tümü", "Yazılım", "Finans", "Yaşam", "Eğitim"];
const SAVED_KEY = "inner_perks_saved";

function loadSaved(): number[] {
  try {
    const raw = sessionStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function BrandMark({ brand }: { brand: string }) {
  const initials = toUpperTR(brand.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, "").slice(0, 2));
  const color = avatarColor(brand);
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center border text-[var(--bone)]"
      style={{ backgroundColor: color, borderColor: color }}
      lang="en"
    >
      <span className="font-mono text-caption uppercase tracking-widest">{initials}</span>
    </div>
  );
}

function formatExpiry(iso: string | undefined, locale: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function catLabel(cat: Category, t: (k: string) => string) {
  if (cat === "Tümü") return t("common.all");
  if (cat === "Yazılım") return t("perks.catSoftware");
  if (cat === "Finans") return t("perks.catFinance");
  if (cat === "Yaşam") return t("perks.catLife");
  return t("perks.catEducation");
}

function PerkCard({
  perk,
  saved,
  onOpen,
}: {
  perk: Perk;
  saved: boolean;
  onOpen: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col panel-glass p-5 text-left transition-colors duration-200 hover:border-[var(--ink)]/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <BrandMark brand={perk.brand} />
        <span className="font-mono text-label uppercase tracking-widest text-[var(--ink)] panel-glass bg-[var(--ink)]/[0.03] px-2 py-0.5">
          {perk.badge}
        </span>
      </div>

      <p className="mb-1 text-xs text-[var(--ink-muted)]">
        <span lang="en">{perk.brand}</span> · {catLabel(perk.category, t)}
      </p>
      <p
        className="mb-2 font-serif text-base leading-snug text-[var(--ink)] group-hover:underline decoration-[var(--ink)]/20 underline-offset-4"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
      >
        {perk.title}
      </p>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-3">
        {perk.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--ink)]/[0.08] pt-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors group-hover:text-[var(--ink)]">
          {t("perks.review")} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </span>
        {saved ? (
          <span className="font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
            {t("common.saved")}
          </span>
        ) : perk.code ? (
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("perks.hasCode")}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function PerkDetail({
  perk,
  saved,
  onClose,
  onToggleSave,
}: {
  perk: Perk;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const copyCode = async () => {
    if (!perk.code) return;
    try {
      await navigator.clipboard.writeText(perk.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const expiry = formatExpiry(perk.expiresAt, locale);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink)]/25" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="perk-detail-title"
        initial={reduce ? false : { x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={reduce ? undefined : { x: 16, opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="panel-glass-strong fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--ink)]/10"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("perks.perkLabel")} · {catLabel(perk.category, t)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <X className="size-3" /> {t("common.close")}
            </span>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex items-start gap-4">
            <BrandMark brand={perk.brand} />
            <div className="min-w-0">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                <span lang="en">{perk.brand}</span>
              </p>
              <h2
                id="perk-detail-title"
                className="mt-1 font-serif text-2xl leading-snug text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
              >
                {perk.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-2 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink)]">
              {perk.badge}
            </span>
            {expiry && (
              <span className="panel-glass px-2 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("perks.expires", { date: expiry })}
              </span>
            )}
          </div>

          <p className="text-sm font-light leading-relaxed text-[var(--ink-strong)]">{perk.description}</p>

          <div className="panel-glass p-4">
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("perks.howTo")}
            </p>
            <p className="text-sm leading-relaxed text-[var(--ink-body)]">{perk.howTo}</p>
          </div>

          {perk.code && (
            <div className="panel-glass-ink p-4 text-[var(--bone)]">
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/62">
                {t("perks.activationCode")}
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm tracking-wider text-[var(--bone)]">{perk.code}</code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 border border-[var(--bone-fixed)]/25 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? t("common.copied") : t("common.copy")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-[var(--ink)]/[0.08] p-5">
          <a
            href={perk.partnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 panel-glass-ink px-4 py-3 font-mono text-caption uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85"
          >
            {t("perks.goPartner")} <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={onToggleSave}
            className="flex w-full items-center justify-center gap-2 panel-glass px-4 py-3 font-mono text-caption uppercase tracking-widest text-[var(--ink-strong)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            {saved ? t("perks.unsave") : t("perks.saveForLater")}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PerksHero({ totalCount }: { totalCount: number }) {
  const t = useT();
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink-fixed)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--ink-fixed)]/85 via-[var(--ink-fixed)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[var(--ink-fixed)]/60 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--bone)]/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              {t("perks.title")}
            </p>
            <AnimatedHeading
              text={"Perks worth\nbeing inside for."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-[var(--bone)] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-[var(--bone)]/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                {t("perks.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToId("perks-featured")}
                  className="group inline-flex min-h-11 items-center gap-2 bg-[var(--bone)] px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-90 sm:px-8"
                >
                  {t("perks.featuredCta")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("perks-all")}
                  className="liquid-glass group inline-flex min-h-11 items-center gap-2 border border-[var(--bone-fixed)]/25 px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:bg-[var(--bone-fixed)] hover:text-[var(--ink-fixed)] sm:px-8"
                >
                  {t("perks.allCta")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={totalCount}
              label={t("perks.heroStat")}
              tagline={t("perks.heroTagline")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PerksStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="panel-glass p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

export default function Perks() {
  const t = useT();
  const [active, setActive] = useState<Category>("Tümü");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Perk | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>(() => loadSaved());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { data, isLoading, isError, error, refetch } = useApiQuery<{ perks: Perk[] }>(
    ["perks"],
    "/api/perks",
  );
  const perks = data?.perks ?? [];

  const counts = useMemo(() => {
    const map: Record<Category, number> = {
      Tümü: perks.length,
      Yazılım: 0,
      Finans: 0,
      Yaşam: 0,
      Eğitim: 0,
    };
    for (const p of perks) {
      if (p.category in map) map[p.category] += 1;
    }
    return map;
  }, [perks]);

  const featured = perks.filter((p) => p.featured);

  const filtered = useMemo(() => {
    const q = toLowerTR(query.trim());
    return perks.filter((p) => {
      if (active !== "Tümü" && p.category !== active) return false;
      if (showSavedOnly && !savedIds.includes(p.id)) return false;
      if (!q) return true;
      return (
        toLowerTR(p.brand).includes(q) ||
        toLowerTR(p.title).includes(q) ||
        toLowerTR(p.description).includes(q) ||
        toLowerTR(p.badge).includes(q)
      );
    });
  }, [perks, active, query, showSavedOnly, savedIds]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      sessionStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="mx-auto min-w-0 max-w-5xl space-y-8 overflow-x-hidden">
      {/* Hero */}
      <PerksHero totalCount={perks.length} />

      {isLoading ? (
        <LoadingBlock label={t("perks.loading")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : t("perks.loadError")}
          onRetry={() => refetch()}
        />
      ) : (
        <>
      <FadeIn delay={0.01}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PerksStat label={t("perks.statTotal")} value={String(perks.length)} sub={t("perks.statTotalSub")} icon={Gift} />
          <PerksStat label={t("perks.statFeatured")} value={String(featured.length)} sub={t("perks.statFeaturedSub")} icon={Sparkles} />
          <PerksStat label={t("perks.statCategory")} value={String(CATEGORIES.length - 1)} sub={t("perks.statCategorySub")} icon={Layers} />
          <PerksStat label={t("perks.statSaved")} value={String(savedIds.length)} sub={t("perks.statSavedSub")} icon={Check} />
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <div className="grid grid-cols-1 gap-px panel-glass bg-[var(--ink)]/[0.08] sm:grid-cols-3">
          {[
            { step: "01", title: t("perks.step1Title"), body: t("perks.step1Body") },
            { step: "02", title: t("perks.step2Title"), body: t("perks.step2Body") },
            { step: "03", title: t("perks.step3Title"), body: t("perks.step3Body") },
          ].map((s) => (
            <div key={s.step} className="panel-glass p-4">
              <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {s.step}
              </p>
              <p className="text-sm text-[var(--ink)]">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-body)]">{s.body}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {featured.length > 0 && active === "Tümü" && !query && !showSavedOnly && (
        <FadeIn delay={0.05}>
          <section id="perks-featured" className="scroll-mt-6">
            <div className="mb-3 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("perks.featured")}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {featured.map((perk) => (
                <button
                  key={perk.id}
                  type="button"
                  onClick={() => setSelected(perk)}
                  className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden panel-glass-ink p-5 text-left text-[var(--bone)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bone)]"
                >
                  <AmbientCardBackground />
                  <div className="relative z-10">
                    <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57">
                      <span lang="en">{perk.brand}</span> · {perk.badge}
                    </p>
                    <h2
                      className="max-w-[18ch] font-serif text-2xl leading-snug md:text-3xl"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
                    >
                      {perk.title}
                    </h2>
                  </div>
                  <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone)]/70 transition-colors group-hover:text-[var(--bone)]">
                    {t("perks.openDetail")} <ArrowRight className="size-3" />
                  </span>
                  <span className="pointer-events-none absolute bottom-3 right-3 z-10 size-8 bg-[var(--inner-green)]" />
                </button>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.06}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("perks.searchPlaceholder")}
              className="w-full border-0 border-b border-[var(--ink)]/15 bg-transparent py-3 pl-6 font-light text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:border-[var(--ink)] focus-visible:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={[
                  "border px-3 py-1.5 font-mono text-label uppercase tracking-widest transition-colors",
                  active === cat
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {catLabel(cat, t)}
                <span className="ml-1.5 opacity-50">{counts[cat]}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowSavedOnly((v) => !v)}
              className={[
                "border px-3 py-1.5 font-mono text-label uppercase tracking-widest transition-colors",
                showSavedOnly
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {t("perks.saved")}
              <span className="ml-1.5 opacity-50">{savedIds.length}</span>
            </button>
            <span className="ml-auto font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("perks.count", { n: filtered.length })}
            </span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div id="perks-all" className="scroll-mt-6" />
        {filtered.length === 0 ? (
          <div className="panel-glass px-6 py-14 text-center">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("perks.empty")}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              {t("perks.emptyHint")}
            </p>
            <button
              type="button"
              onClick={() => {
                setActive("Tümü");
                setQuery("");
                setShowSavedOnly(false);
              }}
              className="mt-5 inline-flex border border-[var(--ink)] px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink)]"
            >
              {t("perks.showAll")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((perk) => (
              <PerkCard
                key={perk.id}
                perk={perk}
                saved={savedIds.includes(perk.id)}
                onOpen={() => setSelected(perk)}
              />
            ))}
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="border-t border-[var(--ink)]/[0.08] pt-4">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
            {t("perks.footer")}
          </p>
        </div>
      </FadeIn>

      <AnimatePresence>
        {selected && (
          <PerkDetail
            key={selected.id}
            perk={selected}
            saved={savedIds.includes(selected.id)}
            onClose={() => setSelected(null)}
            onToggleSave={() => toggleSave(selected.id)}
          />
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
