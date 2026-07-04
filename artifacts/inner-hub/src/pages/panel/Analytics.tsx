import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { TrendingUp, TrendingDown, Minus, Users, CreditCard, Activity, Zap } from "lucide-react";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MEMBER_GROWTH = [
  { month: "Oca", total: 8, new: 8 },
  { month: "Şub", total: 14, new: 6 },
  { month: "Mar", total: 19, new: 5 },
  { month: "Nis", total: 24, new: 5 },
  { month: "May", total: 28, new: 4 },
  { month: "Haz", total: 34, new: 6 },
];

const REVENUE = [
  { month: "Oca", mrr: 0 },
  { month: "Şub", mrr: 4200 },
  { month: "Mar", mrr: 6800 },
  { month: "Nis", mrr: 9100 },
  { month: "May", mrr: 11400 },
  { month: "Haz", mrr: 14700 },
];

const ENGAGEMENT = [
  { week: "Hf 1", dau: 12, messages: 87, events: 1 },
  { week: "Hf 2", dau: 18, messages: 142, events: 0 },
  { week: "Hf 3", dau: 21, messages: 198, events: 2 },
  { week: "Hf 4", dau: 16, messages: 110, events: 1 },
];

const TOP_MEMBERS = [
  { name: "Ata Han Bayram", handle: "atahan", contributions: 84, events: 12, joined: "Oca 2026" },
  { name: "Selin Kaya", handle: "selinkaya", contributions: 61, events: 9, joined: "Şub 2026" },
  { name: "Mert Öztürk", handle: "mertozturk", contributions: 47, events: 7, joined: "Şub 2026" },
  { name: "Defne Arslan", handle: "defnearslan", contributions: 38, events: 11, joined: "Mar 2026" },
  { name: "Kerem Yıldız", handle: "keremyildiz", contributions: 29, events: 6, joined: "Mar 2026" },
];

const CHANNEL_ACTIVITY = [
  { name: "#genel", messages: 312, members: 34 },
  { name: "#ai-tools", messages: 278, members: 29 },
  { name: "#yatırım", messages: 194, members: 22 },
  { name: "#build-in-public", messages: 156, members: 19 },
  { name: "#hiring", messages: 88, members: 14 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "flat";

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
  value: string;
  sub: string;
  trend: Trend;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const trendColor =
    trend === "up" ? "text-[var(--inner-green)]" : trend === "down" ? "text-[var(--error)]" : "text-[var(--ink)]/30";

  return (
    <div className="border border-[var(--ink)]/[0.08] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">{label}</p>
        <Icon className="size-3.5 text-[var(--ink)]/20" />
      </div>
      <p
        className="mb-1 font-serif text-3xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        <TrendIcon trend={trend} className={`size-3 ${trendColor}`} />
        <span className={`font-mono text-[9px] ${trendColor}`}>{delta}</span>
        <span className="font-mono text-[9px] text-[var(--ink)]/20">{sub}</span>
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
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] text-[var(--ink)]/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatValue ? formatValue(v) : v}
              </span>
            </div>
            <span className="font-mono text-[8px] text-[var(--ink)]/30">{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, sub, children, action }: { title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">{title}</p>
          {sub && <p className="mt-0.5 text-xs text-[var(--ink)]/30">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Time range selector ──────────────────────────────────────────────────────

const RANGES = ["7G", "30G", "90G", "Tümü"] as const;
type Range = (typeof RANGES)[number];

function RangeSelector({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={[
            "border-y border-r first:border-l first:border-l px-3 py-1 font-mono text-[8px] uppercase tracking-widest transition-colors",
            value === r
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
              : "border-[var(--ink)]/15 text-[var(--ink)]/30 hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [range, setRange] = useState<Range>("30G");

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
              inner·hub — Admin
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              analitik
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluk büyümesi, gelir ve katılım metrikleri.
            </p>
          </div>
          <RangeSelector value={range} onChange={setRange} />
        </div>
      </FadeIn>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Toplam Üye"
          value="34"
          sub="önceki aya göre"
          trend="up"
          delta="+6 bu ay"
          icon={Users}
        />
        <StatCard
          label="Aylık Gelir"
          value="₺14.7K"
          sub="MRR"
          trend="up"
          delta="+%29"
          icon={CreditCard}
        />
        <StatCard
          label="Aktif Üye"
          value="21"
          sub="bu hafta"
          trend="up"
          delta="%62 DAU"
          icon={Activity}
        />
        <StatCard
          label="AI Sinyali"
          value="47"
          sub="eşleşme bu ay"
          trend="up"
          delta="+12"
          icon={Zap}
        />
      </div>

      {/* Member growth chart */}
      <Section title="Üye Büyümesi" sub="Kümülatif üye sayısı — aylık">
        <div className="border border-[var(--ink)]/[0.08] p-5">
          <div className="mb-4 flex items-baseline gap-3">
            <span
              className="font-serif text-4xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              34
            </span>
            <span className="font-mono text-[10px] text-[var(--inner-green)]">+6 bu ay</span>
          </div>
          <BarChart data={MEMBER_GROWTH} labelKey="month" valueKey="total" />
        </div>
      </Section>

      {/* Revenue chart */}
      <Section title="Gelir (MRR)" sub="Aylık yinelenen gelir — ₺">
        <div className="border border-[var(--ink)]/[0.08] p-5">
          <div className="mb-4 flex items-baseline gap-3">
            <span
              className="font-serif text-4xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              ₺14.700
            </span>
            <span className="font-mono text-[10px] text-[var(--inner-green)]">+%29 önceki aya göre</span>
          </div>
          <BarChart
            data={REVENUE}
            labelKey="month"
            valueKey="mrr"
            formatValue={(v) => `₺${(v / 1000).toFixed(1)}K`}
          />
        </div>
      </Section>

      {/* Engagement */}
      <Section title="Haftalık Katılım" sub="Aktif üye · mesaj · etkinlik">
        <div className="grid grid-cols-3 gap-3">
          {["dau", "messages", "events"].map((key, ki) => {
            const labels = ["Aktif Üye", "Mesaj", "Etkinlik"];
            const colors = ["var(--ink)", "var(--ink)", "var(--ink)"];
            return (
              <div key={key} className="border border-[var(--ink)]/[0.08] p-4">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
                  {labels[ki]}
                </p>
                <BarChart
                  data={ENGAGEMENT}
                  labelKey="week"
                  valueKey={key as keyof (typeof ENGAGEMENT)[0]}
                  color={colors[ki]}
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Top members */}
      <Section title="En Aktif Üyeler" sub="Katkı puanına göre">
        <div className="border border-[var(--ink)]/[0.08]">
          <div className="grid grid-cols-[1fr_auto_auto_auto] border-b border-[var(--ink)]/[0.08] px-4 py-2">
            {["Üye", "Katkı", "Etkinlik", "Katıldı"].map((h) => (
              <p key={h} className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25 last:text-right">
                {h}
              </p>
            ))}
          </div>
          {TOP_MEMBERS.map((m, i) => (
            <div
              key={m.handle}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[var(--ink)]/[0.05] px-4 py-3 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[9px] text-[var(--ink)]/20 tabular-nums w-3">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--ink)]">{m.name}</p>
                  <p className="font-mono text-[9px] text-[var(--ink)]/30">@{m.handle}</p>
                </div>
              </div>
              <span className="font-mono text-[11px] tabular-nums text-[var(--ink)]/60">{m.contributions}</span>
              <span className="font-mono text-[11px] tabular-nums text-[var(--ink)]/40">{m.events}</span>
              <span className="font-mono text-[9px] text-[var(--ink)]/25 text-right">{m.joined}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Channel activity */}
      <Section title="Kanal Aktivitesi" sub="Bu ay en aktif kanallar">
        <div className="space-y-2">
          {CHANNEL_ACTIVITY.map((ch) => {
            const pct = Math.round((ch.messages / CHANNEL_ACTIVITY[0].messages) * 100);
            return (
              <div key={ch.name} className="flex items-center gap-4">
                <span className="w-32 shrink-0 font-mono text-[10px] text-[var(--ink)]/50">{ch.name}</span>
                <div className="flex-1 h-1.5 bg-[var(--ink)]/[0.06]">
                  <div className="h-full bg-[var(--ink)]/20" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[9px] text-[var(--ink)]/30 tabular-nums">
                  {ch.messages}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·hub · analitik · yalnızca admin
        </p>
      </div>
    </div>
  );
}
