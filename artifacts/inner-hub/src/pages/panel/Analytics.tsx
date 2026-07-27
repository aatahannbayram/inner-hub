import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  MessageSquare,
  CalendarCheck,
  Sparkles,
  Eye,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LoadingBlock, ErrorState, StatCardSkeleton } from "@/components/panel/Skeletons";
import { Lockup } from "@/components/Lockup";
import { useT, useLocale } from "@/i18n";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CircleAnalytics {
  membersCount: number;
  newMembersThisMonth: number;
  messagesThisWeek: number;
  messagesLastWeek: number;
  eventRegistrationsTotal: number;
  eventRegistrationsThisWeek: number;
  matchIntroductionsTotal: number;
  matchIntroductionsThisMonth: number;
  applicationsPending: number | null;
  memberGrowth: { month: string; total: number }[];
  weeklyActivity: { week: string; activeMembers: number; messages: number; registrations: number }[];
  topMembers: { name: string; handle: string | null; contributions: number; events: number; joinedAt: string }[];
  channelActivity: { name: string; messages: number; members: number }[];
  empty: boolean;
}

interface WebAnalytics {
  rangeDays: number;
  measurementId: string | null;
  propertyId: string | null;
  source: "google" | "first_party";
  visitors: number;
  views: number;
  daily: { date: string; visitors: number; views: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  google: {
    connected: boolean;
    dataApiReady: boolean;
    error: string | null;
    openUrl: string;
  };
}

type Trend = "up" | "down" | "flat";
type Tab = "site" | "circle";
type Range = 7 | 28 | 90;

function trendFrom(current: number, previous: number): Trend {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function deltaLabel(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? `+${current}` : "±0";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function memberSince(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatDay(iso: string, locale: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

function TrendIcon({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === "up") return <TrendingUp className={className} />;
  if (trend === "down") return <TrendingDown className={className} />;
  return <Minus className={className} />;
}

function DeviceIcon({ device }: { device: string }) {
  const d = device.toLowerCase();
  if (d.includes("mobile")) return <Smartphone className="size-3.5 text-[var(--ink-subtle)]" />;
  if (d.includes("tablet")) return <Tablet className="size-3.5 text-[var(--ink-subtle)]" />;
  return <Monitor className="size-3.5 text-[var(--ink-subtle)]" />;
}

function StatCard({
  label,
  value,
  sub,
  trend,
  delta,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  trend: Trend;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const trendColor =
    trend === "up" ? "text-[var(--success-ink)]" : trend === "down" ? "text-[var(--error-ink)]" : "text-[var(--ink-muted)]";

  return (
    <div className="panel-glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="mb-1 font-serif text-3xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        <TrendIcon trend={trend} className={`size-3 ${trendColor}`} />
        <span className={`font-mono text-label ${trendColor}`}>{delta}</span>
        <span className="font-mono text-label text-[var(--ink-subtle)]">{sub}</span>
      </div>
    </div>
  );
}

function BarChart<T extends Record<string, number | string>>({
  data,
  labelKey,
  valueKey,
  color = "var(--ink)",
  formatValue,
  formatLabel,
}: {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  color?: string;
  formatValue?: (v: number) => string;
  formatLabel?: (v: string) => string;
}) {
  const values = data.map((d) => d[valueKey] as number);
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-36 items-end gap-px sm:gap-1">
      {data.map((d, i) => {
        const v = d[valueKey] as number;
        const pct = (v / max) * 100;
        const isLast = i === data.length - 1;
        const label = String(d[labelKey]);
        return (
          <div key={i} className="group flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full items-end justify-center" style={{ height: "112px" }}>
              <div
                className="w-full transition-all duration-300"
                style={{
                  height: `${Math.max(pct, v > 0 ? 4 : 1)}%`,
                  background: isLast ? "var(--inner-green)" : color,
                  opacity: isLast ? 1 : 0.2 + (i / Math.max(data.length - 1, 1)) * 0.5,
                }}
              />
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-label text-[var(--ink-body)] opacity-0 transition-opacity group-hover:opacity-100">
                {formatValue ? formatValue(v) : v}
              </span>
            </div>
            {(data.length <= 14 || i % Math.ceil(data.length / 7) === 0 || isLast) && (
              <span className="truncate font-mono text-[9px] text-[var(--ink-muted)]">
                {formatLabel ? formatLabel(label) : label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-6">
      <div className="mb-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{title}</p>
        {sub && <p className="mt-0.5 text-xs font-light text-[var(--ink-muted)]">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function RankList({
  items,
  valueKey,
}: {
  items: { label: string; value: number }[];
  valueKey: string;
}) {
  const max = items[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.label} className="flex min-w-0 items-center gap-3">
            <span className="w-[40%] shrink-0 truncate font-mono text-xs text-[var(--ink-muted)] sm:w-44">
              {item.label}
            </span>
            <div className="h-1.5 flex-1 bg-[var(--ink)]/[0.06]">
              <div className="h-full bg-[var(--ink)]/25" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-label tabular-nums text-[var(--ink-muted)]">
              {item.value}
            </span>
            <span className="sr-only">{valueKey}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const t = useT();
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("site");
  const [range, setRange] = useState<Range>(28);

  const web = useApiQuery<WebAnalytics>(
    ["analytics-web", range],
    `/api/analytics/web?range=${range}`,
    { enabled: tab === "site" },
  );
  const circle = useApiQuery<CircleAnalytics>(
    ["analytics"],
    "/api/analytics",
    { enabled: tab === "circle" },
  );

  const visitorsTrend = useMemo(() => {
    const daily = web.data?.daily ?? [];
    if (daily.length < 4) return { trend: "flat" as Trend, delta: "±0" };
    const half = Math.floor(daily.length / 2);
    const a = daily.slice(0, half).reduce((s, d) => s + d.visitors, 0);
    const b = daily.slice(half).reduce((s, d) => s + d.visitors, 0);
    return { trend: trendFrom(b, a), delta: deltaLabel(b, a) };
  }, [web.data?.daily]);

  return (
    <div className="min-w-0 max-w-4xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("analytics.admin")}
            </span>
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("analytics.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("analytics.subtitle")}</p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--ink)]/[0.08] pb-3">
        {(
          [
            { id: "site" as const, label: t("analytics.tabSite") },
            { id: "circle" as const, label: t("analytics.tabCircle") },
          ]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
              tab === item.id
                ? "bg-[var(--ink)] text-[var(--bone)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "site" && (
        <>
          {web.isLoading && (
            <LoadingBlock label={t("analytics.loading")}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            </LoadingBlock>
          )}
          {web.isError && (
            <ErrorState
              message={web.error instanceof Error ? web.error.message : t("analytics.loadError")}
              onRetry={() => web.refetch()}
            />
          )}
          {web.data && (
            <>
              {/* Google sync strip */}
              <div className="panel-glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    Google Analytics
                  </p>
                  <p className="mt-1 truncate text-sm text-[var(--ink)]">
                    {web.data.measurementId ?? "-"}
                    {web.data.google.connected
                      ? ` · ${t("analytics.syncedGoogle")}`
                      : ` · ${t("analytics.sendingGoogle")}`}
                  </p>
                  {!web.data.google.dataApiReady && (
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">{t("analytics.gaApiHint")}</p>
                  )}
                  {web.data.google.error && web.data.google.dataApiReady && (
                    <p className="mt-1 text-xs text-[var(--error-ink)]">{web.data.google.error}</p>
                  )}
                </div>
                <a
                  href={web.data.google.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/35 hover:text-[var(--ink)]"
                >
                  {t("analytics.openGoogle")}
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Range */}
              <div className="flex flex-wrap gap-2">
                {([7, 28, 90] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                      range === r
                        ? "border-[var(--ink)]/20 bg-[var(--ink)]/[0.06] text-[var(--ink)]"
                        : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
                    )}
                  >
                    {r === 7 ? t("analytics.range7") : r === 28 ? t("analytics.range28") : t("analytics.range90")}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard
                  label={t("analytics.visitors")}
                  value={web.data.visitors.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
                  sub={t("analytics.uniqueSessions")}
                  trend={visitorsTrend.trend}
                  delta={visitorsTrend.delta}
                  icon={Users}
                />
                <StatCard
                  label={t("analytics.pageViews")}
                  value={web.data.views.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
                  sub={t("analytics.inRange")}
                  trend={web.data.views > 0 ? "up" : "flat"}
                  delta={web.data.source === "google" ? "GA4" : "live"}
                  icon={Eye}
                />
                <StatCard
                  label={t("analytics.source")}
                  value={web.data.source === "google" ? "Google" : "Site"}
                  sub={
                    web.data.source === "google"
                      ? t("analytics.sourceGoogleSub")
                      : t("analytics.sourceSiteSub")
                  }
                  trend="flat"
                  delta={web.data.measurementId ?? ""}
                  icon={Sparkles}
                />
              </div>

              <Section title={t("analytics.visitorsOverTime")} sub={t("analytics.visitorsOverTimeSub")}>
                <div className="panel-glass p-5">
                  <div className="mb-4 flex items-baseline gap-3">
                    <span
                      className="font-serif text-4xl text-[var(--ink)]"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                    >
                      {web.data.visitors}
                    </span>
                    <span className="font-mono text-label text-[var(--ink-muted)]">
                      {t("analytics.visitors")}
                    </span>
                  </div>
                  <BarChart
                    data={web.data.daily}
                    labelKey="date"
                    valueKey="visitors"
                    formatLabel={(d) => formatDay(d, locale)}
                  />
                </div>
              </Section>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Section title={t("analytics.topPages")} sub={t("analytics.topPagesSub")}>
                  {web.data.topPages.length === 0 ? (
                    <p className="text-sm text-[var(--ink-muted)]">{t("analytics.webEmpty")}</p>
                  ) : (
                    <RankList
                      valueKey="views"
                      items={web.data.topPages.map((p) => ({ label: p.path, value: p.views }))}
                    />
                  )}
                </Section>
                <Section title={t("analytics.topReferrers")} sub={t("analytics.topReferrersSub")}>
                  {web.data.topReferrers.length === 0 ? (
                    <p className="text-sm text-[var(--ink-muted)]">{t("analytics.webEmpty")}</p>
                  ) : (
                    <RankList
                      valueKey="visitors"
                      items={web.data.topReferrers.map((r) => ({
                        label: r.source,
                        value: r.visitors,
                      }))}
                    />
                  )}
                </Section>
              </div>

              {web.data.devices.length > 0 && (
                <Section title={t("analytics.devices")} sub={t("analytics.devicesSub")}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {web.data.devices.map((d) => (
                      <div key={d.device} className="panel-glass flex items-center justify-between gap-3 p-4">
                        <div className="flex items-center gap-2">
                          <DeviceIcon device={d.device} />
                          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                            {d.device}
                          </span>
                        </div>
                        <span className="font-mono text-sm tabular-nums text-[var(--ink)]">{d.visitors}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </>
      )}

      {tab === "circle" && (
        <>
          {circle.isLoading && (
            <LoadingBlock label={t("analytics.loading")}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            </LoadingBlock>
          )}
          {circle.isError && (
            <ErrorState
              message={circle.error instanceof Error ? circle.error.message : t("analytics.loadError")}
              onRetry={() => circle.refetch()}
            />
          )}
          {circle.data && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label={t("analytics.totalMembers")}
                  value={circle.data.membersCount}
                  sub={t("analytics.membersInCircle")}
                  trend={circle.data.newMembersThisMonth > 0 ? "up" : "flat"}
                  delta={
                    circle.data.newMembersThisMonth > 0
                      ? t("analytics.newThisMonth", { n: circle.data.newMembersThisMonth })
                      : t("analytics.noNewThisMonth")
                  }
                  icon={Users}
                />
                <StatCard
                  label={t("analytics.messagesThisWeek")}
                  value={circle.data.messagesThisWeek}
                  sub={t("analytics.vsLastWeek")}
                  trend={trendFrom(circle.data.messagesThisWeek, circle.data.messagesLastWeek)}
                  delta={deltaLabel(circle.data.messagesThisWeek, circle.data.messagesLastWeek)}
                  icon={MessageSquare}
                />
                <StatCard
                  label={t("analytics.eventRegs")}
                  value={circle.data.eventRegistrationsTotal}
                  sub={t("analytics.total")}
                  trend={circle.data.eventRegistrationsThisWeek > 0 ? "up" : "flat"}
                  delta={t("analytics.thisWeekDelta", { n: circle.data.eventRegistrationsThisWeek })}
                  icon={CalendarCheck}
                />
                <StatCard
                  label={t("analytics.aiMatch")}
                  value={circle.data.matchIntroductionsTotal}
                  sub={t("analytics.total")}
                  trend={circle.data.matchIntroductionsThisMonth > 0 ? "up" : "flat"}
                  delta={t("analytics.thisMonthDelta", { n: circle.data.matchIntroductionsThisMonth })}
                  icon={Sparkles}
                />
              </div>

              {circle.data.empty ? (
                <div className="panel-glass p-8 text-center">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("analytics.empty")}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">{t("analytics.emptyHint")}</p>
                </div>
              ) : (
                <>
                  <Section title={t("analytics.memberGrowth")} sub={t("analytics.memberGrowthSub")}>
                    <div className="panel-glass p-5">
                      <BarChart data={circle.data.memberGrowth} labelKey="month" valueKey="total" />
                    </div>
                  </Section>

                  <Section title={t("analytics.weeklyEngagement")} sub={t("analytics.weeklyEngagementSub")}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {(["activeMembers", "messages", "registrations"] as const).map((key, ki) => {
                        const labelKeys = [
                          "analytics.activeMembers",
                          "analytics.messages",
                          "analytics.registrations",
                        ] as const;
                        return (
                          <div key={key} className="panel-glass p-4">
                            <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                              {t(labelKeys[ki])}
                            </p>
                            <BarChart data={circle.data.weeklyActivity} labelKey="week" valueKey={key} />
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  {circle.data.topMembers.length > 0 && (
                    <Section title={t("analytics.topMembers")} sub={t("analytics.topMembersSub")}>
                      <div className="panel-glass overflow-x-auto">
                        <div className="grid min-w-[520px] grid-cols-[1fr_auto_auto_auto] border-b border-[var(--ink)]/[0.08] px-4 py-2">
                          {(
                            [
                              "analytics.colMember",
                              "analytics.colContribution",
                              "analytics.colEvent",
                              "analytics.colJoined",
                            ] as const
                          ).map((h) => (
                            <p
                              key={h}
                              className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)] last:text-right"
                            >
                              {t(h)}
                            </p>
                          ))}
                        </div>
                        {circle.data.topMembers.map((m, i) => (
                          <div
                            key={m.name + i}
                            className="grid min-w-[520px] grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[var(--ink)]/[0.05] px-4 py-3 last:border-0"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="w-3 font-mono text-label tabular-nums text-[var(--ink-subtle)]">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm text-[var(--ink)]">{m.name}</p>
                                {m.handle && (
                                  <p className="font-mono text-label text-[var(--ink-muted)]">
                                    @<span lang="en">{m.handle}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-caption tabular-nums text-[var(--ink-body)]">
                              {m.contributions}
                            </span>
                            <span className="font-mono text-caption tabular-nums text-[var(--ink-body)]">
                              {m.events}
                            </span>
                            <span className="text-right font-mono text-label text-[var(--ink-subtle)]">
                              {memberSince(m.joinedAt, locale)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {circle.data.channelActivity.length > 0 && (
                    <Section title={t("analytics.channelActivity")} sub={t("analytics.channelActivitySub")}>
                      <RankList
                        valueKey="messages"
                        items={circle.data.channelActivity.map((c) => ({
                          label: c.name,
                          value: c.messages,
                        }))}
                      />
                    </Section>
                  )}

                  {circle.data.applicationsPending !== null && (
                    <Section title={t("analytics.pendingApps")} sub={t("analytics.pendingAppsSub")}>
                      <div className="panel-glass p-5">
                        <span
                          className="font-serif text-4xl text-[var(--ink)]"
                          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                        >
                          {circle.data.applicationsPending}
                        </span>
                        <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">
                          {t("analytics.awaitingReview")}
                        </p>
                      </div>
                    </Section>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("analytics.footer")}
        </p>
      </div>
    </div>
  );
}
