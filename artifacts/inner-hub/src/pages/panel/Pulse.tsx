import { useState } from "react";
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

// ─── Mock data ─────────────────────────────────────────────────────────────────

const TRENDS: Trend[] = [
  { topic: "Claude 4 Opus", mentions: 47, delta: 85, category: "teknoloji" },
  { topic: "Cursor AI", mentions: 39, delta: 62, category: "teknoloji" },
  { topic: "Pre-seed valuations", mentions: 28, delta: 34, category: "yatırım" },
  { topic: "B2B SaaS churn", mentions: 24, delta: 18, category: "iş" },
  { topic: "Runway Gen-3", mentions: 21, delta: 71, category: "teknoloji" },
  { topic: "AWS Activate", mentions: 19, delta: -8, category: "iş" },
  { topic: "The Mom Test", mentions: 17, delta: 12, category: "kültür" },
  { topic: "YC W26 başvuruları", mentions: 15, delta: 44, category: "yatırım" },
  { topic: "Bolt.new", mentions: 14, delta: -15, category: "teknoloji" },
  { topic: "Demo Day hazırlık", mentions: 12, delta: 5, category: "iş" },
];

const CHANNELS: ChannelStat[] = [
  { name: "ai-tools", messages: 312, activeMembers: 22, trending: "Claude 4 Opus" },
  { name: "girisimler", messages: 187, activeMembers: 18, trending: "Pre-seed valuations" },
  { name: "genel", messages: 143, activeMembers: 30, trending: "Zirve hazırlığı" },
  { name: "tavsiyeler", messages: 96, activeMembers: 15, trending: "The Mom Test" },
  { name: "yatirim", messages: 74, activeMembers: 9, trending: "YC W26" },
];

const WEEKLY: WeeklySnapshot[] = [
  { label: "3H", activity: 68 },
  { label: "2H", activity: 81 },
  { label: "GH", activity: 74 },
  { label: "Bu", activity: 97 },
];

const TOP_CONTRIBUTORS: TopContributor[] = [
  { name: "Zeynep Arslan", contributions: 84, streak: 14 },
  { name: "Mert Demir", contributions: 71, streak: 9 },
  { name: "Selin Çelik", contributions: 58, streak: 21 },
  { name: "Ozan Kırmızı", contributions: 47, streak: 5 },
  { name: "Berk Yılmaz", contributions: 39, streak: 7 },
];

const CAT_COLORS: Record<Trend["category"], string> = {
  teknoloji: "text-[var(--ink)] bg-[var(--ink)]/[0.06] border-[var(--ink)]/10",
  iş: "text-[var(--ink)]/60 bg-[var(--ink)]/[0.03] border-[var(--ink)]/8",
  yatırım: "text-[var(--inner-green)] bg-[var(--inner-green)]/8 border-[var(--inner-green)]/20",
  kültür: "text-[var(--ink)]/40 bg-transparent border-[var(--ink)]/[0.06]",
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

function TrendRow({ trend, rank, maxMentions }: { trend: Trend; rank: number; maxMentions: number }) {
  const isUp = trend.delta > 0;
  const isFlat = trend.delta === 0;
  const DeltaIcon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const deltaColor = isFlat ? "text-[var(--ink)]/30" : isUp ? "text-[var(--inner-green)]" : "text-[var(--error)]";

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[var(--ink)]/[0.05] last:border-0">
      <span className="w-5 shrink-0 font-mono text-[9px] text-[var(--ink)]/20 text-right">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-[var(--ink)] truncate">{trend.topic}</p>
          <span className={`shrink-0 border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest ${CAT_COLORS[trend.category]}`}>
            {trend.category}
          </span>
        </div>
        <MiniBar pct={(trend.mentions / maxMentions) * 100} color={isUp ? "var(--inner-green)" : "var(--ink)"} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <DeltaIcon className={`size-3 ${deltaColor}`} />
        <span className={`font-mono text-[9px] ${deltaColor}`}>
          {trend.delta > 0 ? "+" : ""}{trend.delta}%
        </span>
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-[var(--ink)]/50">{trend.mentions}</span>
    </div>
  );
}

// ─── Activity columns ─────────────────────────────────────────────────────────

function ActivityColumns() {
  const max = Math.max(...WEEKLY.map((w) => w.activity));
  return (
    <div className="flex items-end gap-2 h-20">
      {WEEKLY.map((w) => (
        <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full transition-all"
            style={{
              height: `${(w.activity / max) * 64}px`,
              background: w.label === "Bu" ? "var(--inner-green)" : "var(--ink)",
              opacity: w.label === "Bu" ? 1 : 0.15 + (w.activity / max) * 0.25,
            }}
          />
          <span className="font-mono text-[8px] text-[var(--ink)]/30">{w.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Pulse() {
  const [catFilter, setCatFilter] = useState<Trend["category"] | "Tümü">("Tümü");

  const filtered = catFilter === "Tümü"
    ? TRENDS
    : TRENDS.filter((t) => t.category === catFilter);

  const maxMentions = Math.max(...filtered.map((t) => t.mentions));
  const totalMessages = CHANNELS.reduce((s, c) => s + c.messages, 0);
  const activeMembers = 34;
  const weeklyActivity = WEEKLY[WEEKLY.length - 1].activity;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
              inner·hub
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              inner·pulse
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluğun anonim nabzı. Bu hafta ne konuşuluyor?
            </p>
          </div>
          <div className="flex items-center gap-2 border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-3 py-2">
            <Radio className="size-3 text-[var(--inner-green)]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)]">Canlı</span>
          </div>
        </div>
      </FadeIn>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Bu Hafta Mesaj", value: totalMessages, icon: MessageSquare, sub: "5 kanalda" },
          { label: "Aktif Üye", value: activeMembers, icon: Users, sub: "toplulukta" },
          { label: "Trend Konu", value: TRENDS.length, icon: TrendingUp, sub: "takip ediliyor" },
          { label: "Aktivite Skoru", value: weeklyActivity, icon: ArrowUp, sub: "bu hafta" },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.08] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">{s.label}</p>
              <s.icon className="size-3 text-[var(--ink)]/15" />
            </div>
            <p
              className="font-serif text-2xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 font-mono text-[8px] text-[var(--ink)]/25">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Trends */}
        <section>
          <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
              Trending Konular
            </p>
            <div className="flex gap-1.5">
              {(["Tümü", "teknoloji", "iş", "yatırım", "kültür"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={[
                    "border px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest transition-all",
                    catFilter === c
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                      : "border-[var(--ink)]/10 text-[var(--ink)]/30 hover:border-[var(--ink)]/25",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            {filtered.map((trend, i) => (
              <TrendRow key={trend.topic} trend={trend} rank={i + 1} maxMentions={maxMentions} />
            ))}
          </div>
        </section>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Weekly activity */}
          <section className="border border-[var(--ink)]/[0.08] p-4">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              Haftalık Aktivite
            </p>
            <ActivityColumns />
            <p className="mt-3 font-mono text-[8px] text-[var(--ink)]/20">
              Bu hafta %{Math.round(((WEEKLY[3].activity - WEEKLY[2].activity) / WEEKLY[2].activity) * 100)} artış
            </p>
          </section>

          {/* Top channels */}
          <section>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              En Aktif Kanallar
            </p>
            <div className="space-y-2">
              {CHANNELS.map((ch, i) => (
                <div key={ch.name} className="flex items-center gap-3 py-1.5 border-b border-[var(--ink)]/[0.05] last:border-0">
                  <span className="font-mono text-[8px] text-[var(--ink)]/20 w-3">{i + 1}</span>
                  <Hash className="size-3 text-[var(--ink)]/25 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--ink)]/70 truncate">{ch.name}</p>
                    <p className="font-mono text-[7px] text-[var(--ink)]/25 truncate">{ch.trending}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] text-[var(--ink)]/40">{ch.messages}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top contributors */}
          <section>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              Bu Hafta Öne Çıkanlar
            </p>
            <div className="space-y-2">
              {TOP_CONTRIBUTORS.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center bg-[var(--ink)] font-mono text-[8px] uppercase text-[var(--bone)]">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--ink)]/70 truncate">{c.name}</p>
                    <div className="mt-0.5 h-0.5 bg-[var(--ink)]/[0.06]">
                      <div
                        className="h-full"
                        style={{
                          width: `${(c.contributions / TOP_CONTRIBUTORS[0].contributions) * 100}%`,
                          background: i === 0 ? "var(--inner-green)" : "var(--ink)",
                          opacity: i === 0 ? 1 : 0.3,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[8px] text-[var(--ink)]/35">{c.streak}g</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·pulse — veriler anonimleştirilmiş · gerçek zamanlı · yalnızca üyeler görür
        </p>
      </div>
    </div>
  );
}
