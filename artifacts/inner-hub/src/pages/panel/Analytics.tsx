import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, CalendarCheck, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { LoadingBlock, ErrorState, StatCardSkeleton } from "@/components/panel/Skeletons";
import { Lockup } from "@/components/Lockup";

// ─── API tipleri ────────────────────────────────────────────────────────────

interface AnalyticsResponse {
  membersCount: number;
  newMembersThisMonth: number;
  messagesThisWeek: number;
  messagesLastWeek: number;
  eventRegistrationsTotal: number;
  eventRegistrationsThisWeek: number;
  courseEnrollmentsTotal: number;
  courseEnrollmentsThisWeek: number;
  matchIntroductionsTotal: number;
  matchIntroductionsThisMonth: number;
  applicationsPending: number | null;
  memberGrowth: { month: string; total: number }[];
  weeklyActivity: { week: string; activeMembers: number; messages: number; registrations: number }[];
  topMembers: { name: string; handle: string | null; contributions: number; events: number; joinedAt: string }[];
  channelActivity: { name: string; messages: number; members: number }[];
  empty: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "flat";

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

function memberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
}

function TrendIcon({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === "up") return <TrendingUp className={className} />;
  if (trend === "down") return <TrendingDown className={className} />;
  return <Minus className={className} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

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
    <div className="border border-[var(--ink)]/[0.08] p-5">
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

// ─── Bar chart (generic) ──────────────────────────────────────────────────────

function BarChart<T extends Record<string, number | string>>({
  data,
  labelKey,
  valueKey,
  color = "var(--ink)",
  formatValue,
}: {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const values = data.map((d) => d[valueKey] as number);
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d, i) => {
        const v = d[valueKey] as number;
        const pct = (v / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
              <div
                className="w-full transition-all duration-300"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  background: isLast ? "var(--inner-green)" : color,
                  opacity: isLast ? 1 : 0.25 + (i / (data.length - 1)) * 0.45,
                }}
              />
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-label text-[var(--ink-body)] opacity-0 group-hover:opacity-100 transition-opacity">
                {formatValue ? formatValue(v) : v}
              </span>
            </div>
            <span className="font-mono text-label text-[var(--ink-muted)]">{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { data, isLoading, isError, error, refetch } = useApiQuery<AnalyticsResponse>(
    ["analytics"],
    "/api/analytics",
  );

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">Admin</span>
          </div>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            analitik
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)] font-light">
            Topluluk büyümesi ve katılım · canlı veritabanından, gerçek zamanlı.
          </p>
        </div>
      </FadeIn>

      {isLoading && (
        <LoadingBlock label="Analitik yükleniyor">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </LoadingBlock>
      )}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : "Analitik yüklenemedi"}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Toplam Üye"
              value={data.membersCount}
              sub="dairenin içinde"
              trend={data.newMembersThisMonth > 0 ? "up" : "flat"}
              delta={data.newMembersThisMonth > 0 ? `+${data.newMembersThisMonth} bu ay` : "bu ay yeni yok"}
              icon={Users}
            />
            <StatCard
              label="Bu Hafta Mesaj"
              value={data.messagesThisWeek}
              sub="geçen haftaya göre"
              trend={trendFrom(data.messagesThisWeek, data.messagesLastWeek)}
              delta={deltaLabel(data.messagesThisWeek, data.messagesLastWeek)}
              icon={MessageSquare}
            />
            <StatCard
              label="Etkinlik Kaydı"
              value={data.eventRegistrationsTotal}
              sub="toplam"
              trend={data.eventRegistrationsThisWeek > 0 ? "up" : "flat"}
              delta={`+${data.eventRegistrationsThisWeek} bu hafta`}
              icon={CalendarCheck}
            />
            <StatCard
              label="AI Eşleşme"
              value={data.matchIntroductionsTotal}
              sub="toplam"
              trend={data.matchIntroductionsThisMonth > 0 ? "up" : "flat"}
              delta={`+${data.matchIntroductionsThisMonth} bu ay`}
              icon={Sparkles}
            />
          </div>

          {data.empty ? (
            <div className="border border-[var(--ink)]/[0.08] p-8 text-center">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                Henüz yeterli veri yok
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Topluluk hareketlendikçe büyüme, katılım ve aktif üye grafikleri burada dolacak.
              </p>
            </div>
          ) : (
            <>
              {/* Member growth chart */}
              <Section title="Üye Büyümesi" sub="Kümülatif üye sayısı · aylık, gerçek kayıt tarihlerinden">
                <div className="border border-[var(--ink)]/[0.08] p-5">
                  <div className="mb-4 flex items-baseline gap-3">
                    <span
                      className="font-serif text-4xl text-[var(--ink)]"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                    >
                      {data.membersCount}
                    </span>
                    {data.newMembersThisMonth > 0 && (
                      <span className="font-mono text-label text-[var(--success-ink)]">
                        +{data.newMembersThisMonth} bu ay
                      </span>
                    )}
                  </div>
                  <BarChart data={data.memberGrowth} labelKey="month" valueKey="total" />
                </div>
              </Section>

              {/* Revenue — henüz gerçek veri kaynağı yok, sahte sayı uydurmak yerine dürüst not */}
              <Section title="Gelir" sub="MRR takibi">
                <div className="border border-[var(--ink)]/[0.08] p-5">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    Gelir takibi yakında
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Üyelik ödemeleri Stripe üzerinden işleniyor; panel içi gelir raporu henüz bağlanmadı.
                  </p>
                </div>
              </Section>

              {/* Engagement */}
              <Section title="Haftalık Katılım" sub="Aktif üye · mesaj · etkinlik kaydı · son 4 hafta">
                <div className="grid grid-cols-3 gap-3">
                  {(["activeMembers", "messages", "registrations"] as const).map((key, ki) => {
                    const labels = ["Aktif Üye", "Mesaj", "Kayıt"];
                    return (
                      <div key={key} className="border border-[var(--ink)]/[0.08] p-4">
                        <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                          {labels[ki]}
                        </p>
                        <BarChart data={data.weeklyActivity} labelKey="week" valueKey={key} />
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Top members */}
              {data.topMembers.length > 0 && (
                <Section title="En Aktif Üyeler" sub="Son 30 günde mesaj katkısına göre">
                  <div className="border border-[var(--ink)]/[0.08]">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] border-b border-[var(--ink)]/[0.08] px-4 py-2">
                      {["Üye", "Katkı", "Etkinlik", "Katıldı"].map((h) => (
                        <p key={h} className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)] last:text-right">
                          {h}
                        </p>
                      ))}
                    </div>
                    {data.topMembers.map((m, i) => (
                      <div
                        key={m.name + i}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[var(--ink)]/[0.05] px-4 py-3 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-label text-[var(--ink-subtle)] tabular-nums w-3">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-[var(--ink)]">{m.name}</p>
                            {m.handle && (
                              <p className="font-mono text-label text-[var(--ink-muted)]">
                                @<span lang="en">{m.handle}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-caption tabular-nums text-[var(--ink-body)]">{m.contributions}</span>
                        <span className="font-mono text-caption tabular-nums text-[var(--ink-body)]">{m.events}</span>
                        <span className="font-mono text-label text-[var(--ink-subtle)] text-right">{memberSince(m.joinedAt)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Channel activity */}
              {data.channelActivity.length > 0 && (
                <Section title="Kanal Aktivitesi" sub="En aktif kanallar · toplam mesaj">
                  <div className="space-y-2">
                    {data.channelActivity.map((ch) => {
                      const max = data.channelActivity[0].messages || 1;
                      const pct = Math.round((ch.messages / max) * 100);
                      return (
                        <div key={ch.name} className="flex items-center gap-4">
                          <span className="w-32 shrink-0 truncate font-mono text-label text-[var(--ink-muted)]">{ch.name}</span>
                          <div className="flex-1 h-1.5 bg-[var(--ink)]/[0.06]">
                            <div className="h-full bg-[var(--ink)]/20" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-12 shrink-0 text-right font-mono text-label text-[var(--ink-muted)] tabular-nums">
                            {ch.messages}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {data.applicationsPending !== null && (
                <Section title="Bekleyen Başvurular" sub="Admin görünümü">
                  <div className="border border-[var(--ink)]/[0.08] p-5">
                    <span
                      className="font-serif text-4xl text-[var(--ink)]"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                    >
                      {data.applicationsPending}
                    </span>
                    <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">değerlendirme bekliyor</p>
                  </div>
                </Section>
              )}
            </>
          )}
        </>
      )}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · analitik · yalnızca admin
        </p>
      </div>
    </div>
  );
}
