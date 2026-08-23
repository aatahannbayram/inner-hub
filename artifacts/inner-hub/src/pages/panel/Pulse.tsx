import { useState } from "react";
import { Lockup } from "@/components/Lockup";
import { FadeIn } from "@/components/FadeIn";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Radio,
  MessageSquare,
  Users,
  Hash,
  ArrowUp,
} from "lucide-react";
import { ProceduralPortrait, type PortraitConfig } from "@/components/panel/ProceduralPortrait";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

const PHOSPHOR_CONFIG: PortraitConfig = {
  renderMode: "characters",
  bgMode: "solid",
  bgColor: "#0A0A0A",
  cellSize: 10,
  coverage: 100,
  invert: false,
  charSet: " .:-=+*#%@",
  brightness: 0,
  contrast: 115,
  saturation: 100,
  grayscale: 0,
  tint: "#33ff99",
  tintOpacity: 18,
  overlayBlend: "screen",
  color: "#18FF85",
  pfx: {
    vignette: { enabled: true, intensity: 50 },
    scanLines: { enabled: true, intensity: 45 },
    bloom: { enabled: true, intensity: 25 },
  },
  animStyle: "flicker",
  animSpeed: 100,
  animIntensity: 60,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trend {
  topic: string;
  mentions: number;
  delta: number; // % change vs last week
  category: "teknoloji" | "iş" | "yatırım" | "kültür";
}

interface ChannelStat {
  name: string;
  messages: number;
  activeMembers: number;
  trending: string;
}

interface WeeklySnapshot {
  label: string;
  activity: number;
}

interface TopContributor {
  name: string;
  contributions: number;
  streak: number;
}

interface PulseResponse {
  totalMessages: number;
  activeMembers: number;
  weeklyActivity: number;
  trends: Trend[];
  channels: ChannelStat[];
  weekly: WeeklySnapshot[];
  topContributors: TopContributor[];
  empty?: boolean;
}

const CAT_LABEL_KEYS: Record<Trend["category"], string> = {
  teknoloji: "pulse.catTech",
  iş: "pulse.catBiz",
  yatırım: "pulse.catInvest",
  kültür: "pulse.catCulture",
};

type CatFilter = Trend["category"] | "all";

const CAT_COLORS: Record<Trend["category"], string> = {
  teknoloji: "text-[var(--ink)] bg-[var(--ink)]/[0.06] border-[var(--ink)]/10",
  iş: "text-[var(--ink-body)] bg-[var(--ink)]/[0.03] border-[var(--ink)]/8",
  yatırım: "text-[var(--success-ink)] bg-[var(--inner-green)]/8 border-[var(--inner-green)]/20",
  kültür: "text-[var(--ink-body)] bg-transparent border-[var(--ink)]/[0.06]",
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBar({ pct, color = "var(--ink)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
      <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Trend row ────────────────────────────────────────────────────────────────

function TrendRow({
  trend,
  rank,
  maxMentions,
  categoryLabel,
}: {
  trend: Trend;
  rank: number;
  maxMentions: number;
  categoryLabel: string;
}) {
  const isUp = trend.delta > 0;
  const isFlat = trend.delta === 0;
  const DeltaIcon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const deltaColor = isFlat ? "text-[var(--ink-muted)]" : isUp ? "text-[var(--success-ink)]" : "text-[var(--error-ink)]";

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[var(--ink)]/[0.05] last:border-0">
      <span className="w-5 shrink-0 font-mono text-label text-[var(--ink-subtle)] text-right">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-serif text-sm text-[var(--ink)] truncate" style={{ fontWeight: 400 }}>{trend.topic}</p>
          <span className={`shrink-0 border px-1.5 py-0.5 font-mono text-label uppercase tracking-widest ${CAT_COLORS[trend.category]}`}>
            {categoryLabel}
          </span>
        </div>
        <MiniBar pct={maxMentions > 0 ? (trend.mentions / maxMentions) * 100 : 0} color={isUp ? "var(--inner-green)" : "var(--ink)"} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <DeltaIcon className={`size-3 ${deltaColor}`} />
        <span className={`font-mono text-label ${deltaColor}`}>
          {trend.delta > 0 ? "+" : ""}{trend.delta}%
        </span>
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-label text-[var(--ink-muted)]">{trend.mentions}</span>
    </div>
  );
}

// ─── Activity columns ─────────────────────────────────────────────────────────

function ActivityColumns({ weekly, emptyLabel }: { weekly: WeeklySnapshot[]; emptyLabel: string }) {
  if (weekly.length === 0) {
    return (
      <p className="font-mono text-label text-[var(--ink-subtle)] py-6 text-center">{emptyLabel}</p>
    );
  }
  const max = Math.max(...weekly.map((w) => w.activity), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {weekly.map((w) => (
        <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full transition-all"
            style={{
              height: `${(w.activity / max) * 64}px`,
              background: w.label === "Bu" ? "var(--inner-green)" : "var(--ink)",
              opacity: w.label === "Bu" ? 1 : 0.15 + (w.activity / max) * 0.25,
            }}
          />
          <span className="font-mono text-label text-[var(--ink-muted)]">{w.label}</span>
        </div>
      ))}
    </div>
  );
}

function weeklyChangeText(weekly: WeeklySnapshot[], t: ReturnType<typeof useT>): string | null {
  if (weekly.length < 2) return null;
  const prev = weekly[weekly.length - 2].activity;
  const curr = weekly[weekly.length - 1].activity;
  if (prev === 0) return curr > 0 ? t("pulse.firstActivity") : null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return t("pulse.sameLevel");
  return pct > 0 ? t("pulse.weekUp", { n: Math.abs(pct) }) : t("pulse.weekDown", { n: Math.abs(pct) });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Pulse() {
  const t = useT();
  const [catFilter, setCatFilter] = useState<CatFilter>("all");

  const { data, isLoading, isError, error, refetch, isSuccess } = useApiQuery<PulseResponse>(
    ["pulse"],
    "/api/pulse",
  );

  const trends = data?.trends ?? [];
  const channels = data?.channels ?? [];
  const weekly = data?.weekly ?? [];
  const topContributors = data?.topContributors ?? [];

  const filtered = catFilter === "all"
    ? trends
    : trends.filter((tr) => tr.category === catFilter);

  const maxMentions = filtered.length > 0 ? Math.max(...filtered.map((tr) => tr.mentions)) : 1;
  const totalMessages = data?.totalMessages ?? 0;
  const activeMembers = data?.activeMembers ?? 0;
  const weeklyActivity = data?.weeklyActivity ?? 0;
  const showEmpty = isSuccess && (data?.empty || trends.length === 0);
  const topMax = topContributors[0]?.contributions ?? 1;
  const weekChange = weeklyChangeText(weekly, t);

  const catFilters: CatFilter[] = ["all", "teknoloji", "iş", "yatırım", "kültür"];

  return (
    <div className="min-w-0 space-y-8 max-w-4xl overflow-x-hidden">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] mb-2">
              {t("pulse.eyebrow")}
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontWeight: 600 }}
            >
              <Lockup suffix="pulse" className="text-[var(--ink)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-muted)] font-light">
              {t("pulse.subtitle")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 panel-glass bg-[var(--ink)]/[0.03] px-3 py-2">
            <Radio className={`size-3 ${isSuccess ? "text-[var(--success-ink)]" : "text-[var(--ink-muted)]"}`} />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {isSuccess ? t("pulse.live") : "…"}
            </span>
          </div>
        </div>
      </FadeIn>

      {isLoading && !data && (
        <LoadingBlock label={t("pulse.loading")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse panel-glass" />
            ))}
          </div>
        </LoadingBlock>
      )}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("pulse.loadError")}
          onRetry={() => refetch()}
        />
      )}

      {/* Phosphor portrait - the community's pulse, rendered as a live signal.
          Bu yüzey her zaman koyu (ProceduralPortrait'in kendi #0A0A0A zemini);
          bu yüzden üstündeki metin tema ile ters dönen --bone/--success-ink
          değil, sabit kalan --bone-fixed/--inner-green token'larını kullanır -
          aksi halde karanlık temada metin neredeyse siyah render olup ASCII
          dokusunun içinde kayboluyordu. */}
      <FadeIn delay={0.03}>
        <div className="relative overflow-hidden panel-glass">
          <ProceduralPortrait
            src="/editorial/circle-portrait.jpg"
            config={PHOSPHOR_CONFIG}
            className="aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/15 to-transparent p-6 md:p-8">
            <p className="mb-1.5 font-mono text-label uppercase tracking-widest text-[var(--inner-green)]/90">
              {t("pulse.heroLabel")}
            </p>
            <p
              className="max-w-[26ch] font-serif text-2xl text-[var(--bone-fixed)] md:text-3xl"
              style={{ fontWeight: 600 }}
            >
              {t("pulse.heroQuote")}
            </p>
          </div>
        </div>
      </FadeIn>

      {showEmpty && (
        <div className="panel-glass flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Radio className="size-6 text-[var(--ink-subtle)]" />
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("pulse.empty")}
          </p>
          <p className="max-w-md text-sm text-[var(--ink-body)]">{t("pulse.emptyHint")}</p>
        </div>
      )}

      {!showEmpty && isSuccess && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("pulse.statMessages"), value: totalMessages, icon: MessageSquare, sub: t("pulse.statMessagesSub", { n: channels.length }) },
              { label: t("pulse.statActive"), value: activeMembers, icon: Users, sub: t("pulse.statActiveSub") },
              { label: t("pulse.statTrends"), value: trends.length, icon: TrendingUp, sub: t("pulse.statTrendsSub") },
              { label: t("pulse.statScore"), value: weeklyActivity, icon: ArrowUp, sub: t("pulse.statScoreSub") },
            ].map((s) => (
              <div key={s.label} className="panel-glass p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">{s.label}</p>
                  <s.icon className="size-3 text-[var(--ink-subtle)]" />
                </div>
                <p
                  className="font-serif text-2xl text-[var(--ink)]"
                  style={{ fontWeight: 600 }}
                >
                  {s.value}
                </p>
                <p className="mt-0.5 font-mono text-label text-[var(--ink-subtle)]">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Trends */}
            <section>
              <div className="mb-4 flex flex-col gap-3 border-t border-[var(--ink)]/[0.08] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                  {t("pulse.trending")}
                </p>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {catFilters.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCatFilter(c)}
                      className={[
                        "shrink-0 border px-2 py-1 font-mono text-sm uppercase tracking-widest transition-all sm:py-0.5 sm:text-label",
                        catFilter === c
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                          : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:border-[var(--ink)]/25",
                      ].join(" ")}
                    >
                      {c === "all" ? t("common.all") : t(CAT_LABEL_KEYS[c])}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {filtered.length === 0 ? (
                  <p className="font-mono text-label text-[var(--ink-subtle)] py-4">{t("pulse.noTrends")}</p>
                ) : (
                  filtered.map((trend, i) => (
                    <TrendRow
                      key={trend.topic}
                      trend={trend}
                      rank={i + 1}
                      maxMentions={maxMentions}
                      categoryLabel={t(CAT_LABEL_KEYS[trend.category])}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Weekly activity */}
              <section className="panel-glass p-4">
                <p className="mb-4 text-sm uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("pulse.weeklyActivity")}
                </p>
                <ActivityColumns weekly={weekly} emptyLabel={t("pulse.emptyActivity")} />
                {weekChange && (
                  <p className="mt-3 font-mono text-label text-[var(--ink-subtle)]">
                    {weekChange}
                  </p>
                )}
              </section>

              {/* Top channels */}
              <section>
                <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("pulse.topChannels")}
                </p>
                <div className="space-y-2">
                  {channels.length === 0 ? (
                    <p className="font-mono text-label text-[var(--ink-subtle)]">{t("pulse.noChannels")}</p>
                  ) : (
                    channels.map((ch, i) => (
                      <div key={ch.name} className="flex items-center gap-3 py-1.5 border-b border-[var(--ink)]/[0.05] last:border-0">
                        <span className="font-mono text-label text-[var(--ink-subtle)] w-3">{i + 1}</span>
                        <Hash className="size-3 text-[var(--ink-subtle)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-[var(--ink-strong)] truncate" style={{ fontWeight: 400 }}>{ch.name}</p>
                          <p className="font-mono text-label text-[var(--ink-subtle)] truncate">{ch.trending}</p>
                        </div>
                        <span className="shrink-0 font-mono text-label text-[var(--ink-body)]">{ch.messages}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Top contributors */}
              <section>
                <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("pulse.topContributors")}
                </p>
                <div className="space-y-2">
                  {topContributors.length === 0 ? (
                    <p className="font-mono text-label text-[var(--ink-subtle)]">{t("pulse.noContributors")}</p>
                  ) : (
                    topContributors.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <PersonAvatar
                          name={c.name}
                          initials={c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          className="size-6 text-label"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--ink-strong)] truncate">{c.name}</p>
                          <div className="mt-0.5 h-0.5 bg-[var(--ink)]/[0.06]">
                            <div
                              className="h-full"
                              style={{
                                width: `${(c.contributions / topMax) * 100}%`,
                                background: i === 0 ? "var(--inner-green)" : "var(--ink)",
                                opacity: i === 0 ? 1 : 0.3,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-label text-[var(--ink-muted)]">{t("pulse.streakDays", { n: c.streak })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·pulse</span> · {t("pulse.footer")}
        </p>
      </div>
    </div>
  );
}
