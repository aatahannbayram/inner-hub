import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { HeroVideo } from "@/components/HeroVideo";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, StatCardSkeleton } from "@/components/panel/Skeletons";
import { Lockup } from "@/components/Lockup";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  Building2,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";
import { useT } from "@/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "Pitch" | "Due Diligence" | "Term Sheet" | "Kapandı";
type Sector = "AI/ML" | "B2B SaaS" | "Fintech" | "HR Tech" | "E-ticaret" | "DeepTech";

interface Deal {
  id: number;
  company: string;
  tagline: string;
  stage: Stage;
  sector: Sector;
  raise: string;
  valuation: string;
  founders: string[];
  leadInvestor?: string;
  round: string;
  score: number;
  tags: string[];
  updatedDays: number;
  spv?: boolean;
}

interface SPV {
  id: number;
  name: string;
  target: string;
  raised: string;
  pct: number;
  participants: number;
  closing: string;
  sector: Sector;
}

type CapitalResponse = { deals: Deal[]; spvs: SPV[] };

function parseRaiseUsd(raise: string): number | null {
  const m = raise.replace(/,/g, "").trim().match(/^\$?\s*([\d.]+)\s*([KkMm])?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  const suffix = m[2]?.toUpperCase();
  if (suffix === "K") n *= 1_000;
  else if (suffix === "M") n *= 1_000_000;
  return Number.isFinite(n) ? n : null;
}

function formatTotalRaise(deals: Deal[]): string {
  const active = deals.filter((d) => d.stage !== "Kapandı");
  const amounts = active.map((d) => parseRaiseUsd(d.raise)).filter((n): n is number => n != null);
  if (amounts.length === 0) return "·";
  const sum = amounts.reduce((a, b) => a + b, 0);
  if (sum >= 1_000_000) {
    const m = sum / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
  }
  if (sum >= 1_000) return `$${Math.round(sum / 1_000)}K`;
  return `$${Math.round(sum)}`;
}

const STAGES: Stage[] = ["Pitch", "Due Diligence", "Term Sheet", "Kapandı"];

function stageDisplayLabel(stage: Stage, t: ReturnType<typeof useT>): string {
  if (stage === "Kapandı") return t("capital.stageClosed");
  return stage;
}

const STAGE_CONFIG: Record<Stage, { dot: string; border: string; accent: string }> = {
  Pitch: {
    dot: "bg-[var(--ink)]/30",
    border: "border-[var(--ink)]/12",
    accent: "bg-[var(--ink)]/25",
  },
  "Due Diligence": {
    dot: "bg-amber-400",
    border: "border-amber-300/60",
    accent: "bg-amber-400",
  },
  "Term Sheet": {
    dot: "bg-[var(--inner-green)]",
    border: "border-[var(--inner-green)]/35",
    accent: "bg-[var(--inner-green)]",
  },
  Kapandı: {
    dot: "bg-[var(--ink)]",
    border: "border-[var(--ink)]/20",
    accent: "bg-[var(--ink)]",
  },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
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
    <div className="border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-display font-serif text-2xl leading-none text-[var(--ink)] sm:text-3xl"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
      >
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-wide text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

// ─── Deal card ────────────────────────────────────────────────────────────────

function DealCard({
  deal,
  onClick,
  showStage = false,
}: {
  deal: Deal;
  onClick: () => void;
  /** Liste görünümünde aşama rozeti göster; pipeline sütununda gereksiz. */
  showStage?: boolean;
}) {
  const t = useT();
  const cfg = STAGE_CONFIG[deal.stage];
  const visibleTags = deal.tags.slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 text-left transition-colors hover:border-[var(--ink)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${cfg.accent}`} />

      <div className="mb-3 flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            {deal.sector}
            <span className="mx-1.5 text-[var(--ink)]/20">·</span>
            {deal.round}
          </p>
          <h3
            className="mt-1 font-display font-serif text-lg leading-tight tracking-[-0.02em] text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
          >
            {deal.company}
          </h3>
          {deal.tagline ? (
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-[var(--ink-body)]">{deal.tagline}</p>
          ) : null}
        </div>
        {showStage ? (
          <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 ${cfg.border}`}>
            <span className={`size-1.5 ${cfg.dot}`} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
              {stageDisplayLabel(deal.stage, t)}
            </span>
          </span>
        ) : (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">
            {deal.updatedDays === 0 ? t("capital.today") : t("capital.daysAgoShort", { n: deal.updatedDays })}
          </span>
        )}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-px border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.08] pl-1 sm:grid-cols-3">
        <div className="bg-[var(--bone)] px-2.5 py-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">{t("capital.target")}</p>
          <p className="mt-0.5 truncate font-mono text-xs font-medium text-[var(--ink)]">{deal.raise || "·"}</p>
        </div>
        <div className="bg-[var(--bone)] px-2.5 py-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">{t("capital.valuation")}</p>
          <p className="mt-0.5 truncate font-mono text-xs font-medium text-[var(--ink)]">{deal.valuation || "·"}</p>
        </div>
        <div className="col-span-2 bg-[var(--bone)] px-2.5 py-2 sm:col-span-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">{t("capital.score")}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 bg-[var(--ink)]/[0.08]">
              <div className="h-full bg-[var(--inner-green)]" style={{ width: `${deal.score}%` }} />
            </div>
            <span className="font-mono text-xs text-[var(--ink)]">{deal.score}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pl-1">
        <div className="flex min-w-0 flex-wrap gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[9px] text-[var(--ink-muted)]"
            >
              {tag}
            </span>
          ))}
          {deal.spv && (
            <span className="border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-[9px] text-[var(--success-ink)]">
              SPV
            </span>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] opacity-0 transition-opacity group-hover:opacity-100">
          {t("capital.detail")} <ChevronRight className="size-3" />
        </span>
      </div>
    </button>
  );
}

// ─── Deal detail panel ────────────────────────────────────────────────────────

function DealDetail({
  deal,
  onClose,
  isAdmin,
  onChanged,
}: {
  deal: Deal;
  onClose: () => void;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const t = useT();
  const cfg = STAGE_CONFIG[deal.stage];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchStage = async (stage: Stage) => {
    if (!isAdmin || busy || stage === deal.stage) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/capital/deals/${deal.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("capital.updateFailed"));
      onChanged();
      onClose();
    } catch (e: any) {
      setError(e.message ?? t("capital.updateFailed"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!isAdmin || busy) return;
    if (!window.confirm(t("capital.confirmDelete", { company: deal.company }))) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/capital/deals/${deal.id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("capital.deleteFailed"));
      onChanged();
      onClose();
    } catch (e: any) {
      setError(e.message ?? t("capital.deleteFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-[var(--ink)]/15 bg-[var(--bone)] p-5 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-6 min-h-10 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          {t("capital.close")}
        </button>

        <div className="mb-1 flex items-center gap-2">
          <div className={`size-2 rounded-full ${cfg.dot}`} />
          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{stageDisplayLabel(deal.stage, t)}</span>
        </div>
        <h2
          className="font-serif text-3xl text-[var(--ink)] mb-1"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
        >
          {deal.company}
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-6">{deal.tagline}</p>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { key: "capital.target", v: deal.raise },
            { key: "capital.valuation", v: deal.valuation },
            { key: "capital.round", v: deal.round },
          ].map((m) => (
            <div key={m.key} className="border border-[var(--ink)]/[0.08] p-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t(m.key)}</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--ink)]">{m.v}</p>
            </div>
          ))}
        </div>

        {/* Score bar */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between">
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.internalScore")}</span>
            <span className="font-mono text-label text-[var(--ink-muted)]">{deal.score}/100</span>
          </div>
          <div className="h-1.5 bg-[var(--ink)]/[0.06]">
            <div className="h-full bg-[var(--inner-green)] transition-all" style={{ width: `${deal.score}%` }} />
          </div>
        </div>

        {/* Founders */}
        <div className="mb-5">
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.founders")}</p>
          <div className="space-y-2">
            {deal.founders.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <PersonAvatar
                  name={f}
                  initials={f.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  className="size-7 text-label"
                />
                <span className="text-sm text-[var(--ink-strong)]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead investor */}
        {deal.leadInvestor && (
          <div className="mb-5">
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.leadInvestor")}</p>
            <div className="flex items-center gap-3">
              <PersonAvatar
                name={deal.leadInvestor}
                initials={deal.leadInvestor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                className="size-7 text-label"
              />
              <span className="text-sm text-[var(--ink-strong)]">{deal.leadInvestor}</span>
            </div>
          </div>
        )}

        {/* Sector */}
        <div className="mb-5">
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.sector")}</p>
          <span className="border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label text-[var(--ink-muted)]">
            {deal.sector}
          </span>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.tags")}</p>
          <div className="flex flex-wrap gap-1.5">
            {deal.tags.map((tag) => (
              <span key={tag} className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-label text-[var(--ink-body)]">
                {tag}
              </span>
            ))}
            {deal.spv && (
              <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-2 py-0.5 font-mono text-label text-[var(--success-ink)]">
                {t("capital.spvOpen")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between border border-[var(--ink)]/15 bg-[var(--ink)] px-5 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80 min-h-11"
          >
            <span>{t("capital.interested")}</span>
            <ArrowUpRight className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex w-full min-h-11 items-center justify-between border border-[var(--ink)]/15 px-5 py-3 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
          >
            <span>{t("capital.introduceFounder")}</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {isAdmin && (
          <div className="mt-8 space-y-3 border-t border-[var(--ink)]/[0.08] pt-5">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("capital.admin")}</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void patchStage(s)}
                  className={[
                    "border px-2.5 py-1 font-mono text-label uppercase tracking-widest disabled:opacity-40",
                    deal.stage === s
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                      : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:border-[var(--ink)]/30",
                  ].join(" ")}
                >
                  {stageDisplayLabel(s, t)}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void remove()}
              className="flex items-center gap-1.5 border border-[var(--error-ink)]/25 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--error-ink)] disabled:opacity-40"
            >
              <Trash2 className="size-3" /> {t("capital.deleteDeal")}
            </button>
            {error && (
              <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SPV card ─────────────────────────────────────────────────────────────────

function SpvCard({ spv }: { spv: SPV }) {
  const t = useT();
  return (
    <div className="border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="font-display font-serif text-lg text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
          >
            {spv.name}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            {spv.sector}
            <span className="mx-1.5 text-[var(--ink)]/20">·</span>
            {t("capital.participants", { n: spv.participants })}
            <span className="mx-1.5 text-[var(--ink)]/20">·</span>
            {t("capital.closing", { date: spv.closing })}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between gap-3">
          <span className="font-mono text-xs text-[var(--ink)]">
            {spv.raised}
            <span className="text-[var(--ink-muted)]"> / {spv.target}</span>
          </span>
          <span className="font-mono text-xs text-[var(--ink-muted)]">%{spv.pct}</span>
        </div>
        <div className="h-1.5 bg-[var(--ink)]/[0.08]">
          <div
            className="h-full transition-all"
            style={{
              width: `${spv.pct}%`,
              background: spv.pct >= 80 ? "var(--inner-green)" : "var(--ink)",
              opacity: spv.pct >= 80 ? 1 : 0.55,
            }}
          />
        </div>
      </div>
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-1.5 bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85"
      >
        {t("capital.joinSpv")} <ExternalLink className="size-3" />
      </button>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CapitalHero({ dealCount }: { dealCount: number }) {
  const t = useT();
  return (
    <div
      className="relative -mx-3 -mt-5 overflow-hidden sm:-mx-5 sm:-mt-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(62vh, 620px)", minHeight: 360 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <div className="mb-3">
              <Lockup suffix="capital" className="text-white" fontSize="clamp(1.75rem, 4vw, 2.5rem)" />
            </div>
            <AnimatedHeading
              text={t("capital.heroHeadline")}
              className="mb-4 font-display font-serif italic text-3xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-sm text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base md:text-lg">
                {t("capital.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToId("deal-pipeline")}
                  className="inline-flex min-h-11 items-center bg-white px-6 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:px-8"
                >
                  <span lang="en">{t("capital.viewPipeline")}</span>
                </button>
                <button
                  onClick={() => scrollToId("open-spvs")}
                  className="liquid-glass inline-flex min-h-11 items-center border border-white/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black sm:px-8"
                >
                  <span lang="en">{t("capital.viewSpvs")}</span>
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 hidden items-end justify-start sm:flex lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={dealCount}
              label={t("capital.activeDeals")}
              tagline={t("capital.heroTagline")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin compose ────────────────────────────────────────────────────────────

function DealCompose({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const [company, setCompany] = useState("");
  const [tagline, setTagline] = useState("");
  const [stage, setStage] = useState<Stage>("Pitch");
  const [sector, setSector] = useState<Sector>("B2B SaaS");
  const [raise, setRaise] = useState("");
  const [valuation, setValuation] = useState("");
  const [round, setRound] = useState("Pre-seed");
  const [founders, setFounders] = useState("");
  const [score, setScore] = useState("70");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!company.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/capital/deals"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          tagline: tagline.trim(),
          stage,
          sector,
          raise: raise.trim(),
          valuation: valuation.trim(),
          round: round.trim(),
          founders: founders.split(",").map((f) => f.trim()).filter(Boolean),
          score: Number(score) || 50,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("capital.saveFailed"));
      setCompany("");
      setTagline("");
      setRaise("");
      setValuation("");
      setFounders("");
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message ?? t("capital.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none border-[var(--ink)]/15 bg-[var(--bone)]">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            <span lang="en">inner·capital</span>
          </p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("capital.composeTitle")}
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink-body)]">
            {t("capital.composeSub")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 pb-8">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t("capital.phCompany")}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder={t("capital.phTagline")}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={[
                  "border px-2.5 py-1 font-mono text-label uppercase tracking-widest",
                  stage === s
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/10 text-[var(--ink-muted)]",
                ].join(" ")}
              >
                {stageDisplayLabel(s, t)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["AI/ML", "B2B SaaS", "Fintech", "HR Tech", "DeepTech", "E-ticaret"] as Sector[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSector(s)}
                className={[
                  "border px-2.5 py-1 font-mono text-label uppercase tracking-widest",
                  sector === s
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/10 text-[var(--ink-muted)]",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={raise}
              onChange={(e) => setRaise(e.target.value)}
              placeholder={t("capital.phRaise")}
              className="border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
            />
            <input
              value={valuation}
              onChange={(e) => setValuation(e.target.value)}
              placeholder={t("capital.phValuation")}
              className="border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
            />
          </div>
          <input
            value={round}
            onChange={(e) => setRound(e.target.value)}
            placeholder={t("capital.phRound")}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={founders}
            onChange={(e) => setFounders(e.target.value)}
            placeholder={t("capital.phFounders")}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={t("capital.phScore")}
            inputMode="numeric"
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--ink)]/15 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={busy || !company.trim()}
              onClick={() => void submit()}
              className="flex-1 min-h-11 border border-[var(--ink)]/15 bg-[var(--ink)] py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] disabled:opacity-40"
            >
              {busy ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Capital() {
  const t = useT();
  const queryClient = useQueryClient();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [sectorFilter, setSectorFilter] = useState<Sector | "all">("all");
  const [view, setView] = useState<"pipeline" | "liste">("pipeline");
  const [composeOpen, setComposeOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useApiQuery<CapitalResponse>(
    ["capital"],
    "/api/capital",
  );
  const { data: meData } = useApiQuery<{ user: { role: "member" | "admin" } }>(["auth-me"], "/api/auth/me");
  const isAdmin = meData?.user?.role === "admin";

  const deals = data?.deals ?? [];
  const spvs = data?.spvs ?? [];

  const sectors: (Sector | "all")[] = ["all", "AI/ML", "B2B SaaS", "Fintech", "HR Tech", "DeepTech", "E-ticaret"];

  const filtered = sectorFilter === "all"
    ? deals
    : deals.filter((d) => d.sector === sectorFilter);

  const totalRaise = formatTotalRaise(deals);
  const activeDeals = deals.filter((d) => d.stage !== "Kapandı").length;
  const closedDeals = deals.filter((d) => d.stage === "Kapandı").length;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["capital"] });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <CapitalHero dealCount={activeDeals} />

      {isLoading && deals.length === 0 && (
        <LoadingBlock label={t("capital.loading")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </LoadingBlock>
      )}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("capital.loadError")}
          onRetry={() => refetch()}
        />
      )}

      {/* View toggle */}
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="inline-flex min-h-11 items-center gap-1.5 bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85"
            >
              <Plus className="size-3.5" /> {t("capital.addDeal")}
            </button>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">{t("capital.membersOnly")}</p>
          )}
          <div className="flex border border-[var(--ink)]/15">
            {(["pipeline", "liste"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={[
                  "min-h-10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  view === v
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink-body)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {v === "pipeline" ? t("capital.viewPipelineTab") : t("capital.viewListTab")}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard label={t("capital.statActive")} value={String(activeDeals)} sub={t("capital.statActiveSub")} icon={TrendingUp} />
        <StatCard label={t("capital.statRaise")} value={totalRaise} sub={t("capital.statRaiseSub")} icon={DollarSign} />
        <StatCard label={t("capital.statClosed")} value={String(closedDeals)} sub={t("capital.statClosedSub")} icon={Building2} />
        <StatCard label={t("capital.statSpv")} value={String(spvs.length)} sub={t("capital.statSpvSub")} icon={Users} />
      </div>

      {/* Sector filter */}
      <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Filter className="size-3.5 shrink-0 text-[var(--ink-subtle)]" aria-hidden />
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSectorFilter(s)}
            className={[
              "shrink-0 min-h-10 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
              sectorFilter === s
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                : "border-[var(--ink)]/12 text-[var(--ink-muted)] hover:border-[var(--ink)]/30 hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {s === "all" ? t("common.all") : s}
          </button>
        ))}
      </div>

      {/* Pipeline view */}
      <div id="deal-pipeline" className="scroll-mt-6">
        {view === "pipeline" ? (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid-cols-4">
            {STAGES.map((stage) => {
              const stageDeals = filtered.filter((d) => d.stage === stage);
              const cfg = STAGE_CONFIG[stage];
              return (
                <div
                  key={stage}
                  className="w-[min(78vw,280px)] shrink-0 snap-start sm:w-auto"
                >
                  <div className={`mb-3 flex items-center justify-between border-b pb-2.5 ${cfg.border}`}>
                    <div className="flex items-center gap-2">
                      <span className={`size-2 ${cfg.dot}`} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink)]">
                        {stageDisplayLabel(stage, t)}
                      </span>
                    </div>
                    <span className="flex size-5 items-center justify-center bg-[var(--ink)] font-mono text-[10px] text-[var(--bone)]">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {stageDeals.length === 0 ? (
                      <div className="border border-dashed border-[var(--ink)]/[0.1] px-4 py-8 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-subtle)]">
                          {t("capital.emptyColumn")}
                        </p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} onClick={() => setSelectedDeal(deal)} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Liste view */
          <div className="space-y-2">
            <div className="hidden items-center gap-4 border-b border-[var(--ink)]/[0.1] pb-2 md:grid md:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr_auto]">
              {(
                [
                  "capital.colCompany",
                  "capital.colSector",
                  "capital.colTarget",
                  "capital.colValuation",
                  "capital.colStage",
                ] as const
              ).map((h) => (
                <span
                  key={h}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]"
                >
                  {t(h)}
                </span>
              ))}
            </div>
            {filtered.map((deal) => {
              const cfg = STAGE_CONFIG[deal.stage];
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => setSelectedDeal(deal)}
                  className="grid w-full grid-cols-1 gap-2 border border-[var(--ink)]/[0.08] bg-[var(--bone)] p-4 text-left transition-colors hover:border-[var(--ink)]/25 md:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr_auto] md:items-center md:gap-4 md:border-0 md:border-b md:border-[var(--ink)]/[0.06] md:bg-transparent md:px-0 md:py-3"
                >
                  <div className="min-w-0">
                    <p className="font-display font-serif text-base text-[var(--ink)] md:text-sm">{deal.company}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--ink-muted)]">{deal.round}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
                    {deal.sector}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink)]">{deal.raise || "·"}</span>
                  <span className="font-mono text-xs text-[var(--ink-muted)]">{deal.valuation || "·"}</span>
                  <div className={`inline-flex w-fit items-center gap-1.5 border px-2 py-0.5 ${cfg.border}`}>
                    <span className={`size-1.5 ${cfg.dot}`} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-body)]">
                      {stageDisplayLabel(deal.stage, t)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SPV section */}
      <section id="open-spvs" className="scroll-mt-6">
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
            {t("capital.openSpvs")}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {t("capital.openSpvsSub")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {spvs.map((spv) => (
            <SpvCard key={spv.id} spv={spv} />
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·capital</span>
          {" · "}
          {t("capital.disclaimer")}
        </p>
      </div>

      {/* Deal detail panel */}
      {selectedDeal && (
        <DealDetail
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          isAdmin={isAdmin}
          onChanged={invalidate}
        />
      )}

      <DealCompose
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={invalidate}
      />
    </div>
  );
}
