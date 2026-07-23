import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import {
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Circle,
  ArrowUpRight,
  Building2,
  Filter,
} from "lucide-react";

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

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEALS: Deal[] = [
  {
    id: 1,
    company: "Hipo",
    tagline: "B2B SaaS işe alım platformu",
    stage: "Term Sheet",
    sector: "B2B SaaS",
    raise: "$500K",
    valuation: "$3.2M",
    founders: ["Zeynep Arslan", "Mert Demir"],
    leadInvestor: "Berk Yılmaz",
    round: "Pre-seed",
    score: 91,
    tags: ["revenue", "10+ müşteri"],
    updatedDays: 2,
    spv: true,
  },
  {
    id: 2,
    company: "Dopigo",
    tagline: "DevOps otomasyon altyapısı",
    stage: "Due Diligence",
    sector: "DeepTech",
    raise: "$1.2M",
    valuation: "$6M",
    founders: ["Selin Çelik"],
    round: "Seed",
    score: 84,
    tags: ["teknik", "açık kaynak"],
    updatedDays: 5,
  },
  {
    id: 3,
    company: "Pazarama AI",
    tagline: "E-ticaret için AI büyüme motoru",
    stage: "Pitch",
    sector: "AI/ML",
    raise: "$300K",
    valuation: "$1.8M",
    founders: ["Ozan Kırmızı"],
    round: "Pre-seed",
    score: 76,
    tags: ["traction", "MVP hazır"],
    updatedDays: 1,
  },
  {
    id: 4,
    company: "PayCore",
    tagline: "KOBİ'ler için gömülü finans altyapısı",
    stage: "Due Diligence",
    sector: "Fintech",
    raise: "$800K",
    valuation: "$4.5M",
    founders: ["Deniz Alp", "Ayşe Kaya"],
    round: "Seed",
    score: 88,
    tags: ["lisanslı", "B2B"],
    updatedDays: 3,
  },
  {
    id: 5,
    company: "TalentOS",
    tagline: "AI destekli performans yönetim sistemi",
    stage: "Kapandı",
    sector: "HR Tech",
    raise: "$250K",
    valuation: "$1.5M",
    founders: ["Ayşe Kaya"],
    leadInvestor: "Berk Yılmaz",
    round: "Pre-seed",
    score: 95,
    tags: ["kapalı", "inner portföy"],
    updatedDays: 14,
    spv: true,
  },
  {
    id: 6,
    company: "NeuralRoute",
    tagline: "Lojistik için route optimizasyon AI",
    stage: "Pitch",
    sector: "AI/ML",
    raise: "$600K",
    valuation: "$3M",
    founders: ["Yeni kurucu"],
    round: "Seed",
    score: 71,
    tags: ["erken", "prototip"],
    updatedDays: 0,
  },
];

const SPVS: SPV[] = [
  {
    id: 1,
    name: "inner·capital SPV #1 — TalentOS",
    target: "₺750K",
    raised: "₺680K",
    pct: 91,
    participants: 8,
    closing: "15 Tem 2026",
    sector: "HR Tech",
  },
  {
    id: 2,
    name: "inner·capital SPV #2 — Hipo",
    target: "₺1.5M",
    raised: "₺420K",
    pct: 28,
    participants: 4,
    closing: "30 Ağu 2026",
    sector: "B2B SaaS",
  },
];

const STAGES: Stage[] = ["Pitch", "Due Diligence", "Term Sheet", "Kapandı"];

const STAGE_CONFIG: Record<Stage, { dot: string; border: string; label: string }> = {
  Pitch: { dot: "bg-[var(--ink)]/25", border: "border-[var(--ink)]/10", label: "Pitch" },
  "Due Diligence": { dot: "bg-amber-400", border: "border-amber-200", label: "Due Diligence" },
  "Term Sheet": { dot: "bg-[var(--inner-green)]", border: "border-[var(--inner-green)]/30", label: "Term Sheet" },
  Kapandı: { dot: "bg-[var(--ink)]", border: "border-[var(--ink)]/20", label: "Kapandı" },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/35">{label}</p>
        <Icon className="size-3.5 text-[var(--ink)]/20" />
      </div>
      <p
        className="font-serif text-3xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] text-[var(--ink)]/30">{sub}</p>
    </div>
  );
}

// ─── Deal card ────────────────────────────────────────────────────────────────

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const cfg = STAGE_CONFIG[deal.stage];
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border border-[var(--ink)]/[0.08] bg-[var(--bone)] p-4 transition-all hover:border-[var(--ink)]/25 hover:shadow-sm"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">{deal.company}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-[var(--ink)]/40">{deal.tagline}</p>
        </div>
        <div className={`mt-0.5 flex shrink-0 items-center gap-1.5 border px-2 py-0.5 ${cfg.border}`}>
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/50">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="mb-3 flex items-center gap-3">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">Hedef</p>
          <p className="font-mono text-[11px] text-[var(--ink)]">{deal.raise}</p>
        </div>
        <div className="h-8 w-px bg-[var(--ink)]/[0.06]" />
        <div>
          <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">Değerleme</p>
          <p className="font-mono text-[11px] text-[var(--ink)]">{deal.valuation}</p>
        </div>
        <div className="h-8 w-px bg-[var(--ink)]/[0.06]" />
        <div>
          <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">Tur</p>
          <p className="font-mono text-[11px] text-[var(--ink)]">{deal.round}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-1 w-12 bg-[var(--ink)]/[0.06]">
            <div className="h-full bg-[var(--inner-green)]" style={{ width: `${deal.score}%` }} />
          </div>
          <span className="font-mono text-[9px] text-[var(--ink)]/40">{deal.score}</span>
        </div>
      </div>

      {/* Tags + meta */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {deal.tags.map((t) => (
            <span key={t} className="border border-[var(--ink)]/8 px-1.5 py-0.5 font-mono text-[8px] text-[var(--ink)]/35">
              {t}
            </span>
          ))}
          {deal.spv && (
            <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-1.5 py-0.5 font-mono text-[8px] text-[var(--inner-green)]">
              SPV
            </span>
          )}
        </div>
        <span className="font-mono text-[8px] text-[var(--ink)]/20">
          {deal.updatedDays === 0 ? "bugün" : `${deal.updatedDays}g önce`}
        </span>
      </div>
    </div>
  );
}

// ─── Deal detail panel ────────────────────────────────────────────────────────

function DealDetail({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const cfg = STAGE_CONFIG[deal.stage];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-[var(--ink)]/10 bg-[var(--bone)] p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="mb-6 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors"
        >
          ← Kapat
        </button>

        <div className="mb-1 flex items-center gap-2">
          <div className={`size-2 rounded-full ${cfg.dot}`} />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">{deal.stage}</span>
        </div>
        <h2
          className="font-serif text-3xl text-[var(--ink)] mb-1"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
        >
          {deal.company}
        </h2>
        <p className="text-sm text-[var(--ink)]/50 mb-6">{deal.tagline}</p>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { l: "Hedef", v: deal.raise },
            { l: "Değerleme", v: deal.valuation },
            { l: "Tur", v: deal.round },
          ].map((m) => (
            <div key={m.l} className="border border-[var(--ink)]/[0.08] p-3">
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/30">{m.l}</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--ink)]">{m.v}</p>
            </div>
          ))}
        </div>

        {/* Score bar */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">İç Değerlendirme Skoru</span>
            <span className="font-mono text-[9px] text-[var(--ink)]/50">{deal.score}/100</span>
          </div>
          <div className="h-1.5 bg-[var(--ink)]/[0.06]">
            <div className="h-full bg-[var(--inner-green)] transition-all" style={{ width: `${deal.score}%` }} />
          </div>
        </div>

        {/* Founders */}
        <div className="mb-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Kurucular</p>
          <div className="space-y-2">
            {deal.founders.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center bg-[var(--ink)] font-mono text-[9px] uppercase text-[var(--bone)]">
                  {f.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-sm text-[var(--ink)]/70">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead investor */}
        {deal.leadInvestor && (
          <div className="mb-5">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Lead Yatırımcı</p>
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center bg-[var(--ink)] font-mono text-[9px] uppercase text-[var(--bone)]">
                {deal.leadInvestor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-sm text-[var(--ink)]/70">{deal.leadInvestor}</span>
            </div>
          </div>
        )}

        {/* Sector */}
        <div className="mb-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Sektör</p>
          <span className="border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-[9px] text-[var(--ink)]/50">
            {deal.sector}
          </span>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Etiketler</p>
          <div className="flex flex-wrap gap-1.5">
            {deal.tags.map((t) => (
              <span key={t} className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[9px] text-[var(--ink)]/40">
                {t}
              </span>
            ))}
            {deal.spv && (
              <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-2 py-0.5 font-mono text-[9px] text-[var(--inner-green)]">
                SPV açık
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="flex w-full items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
            <span>İlgileniyorum</span>
            <ArrowUpRight className="size-3.5" />
          </button>
          <button className="flex w-full items-center justify-between border border-[var(--ink)]/15 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)]">
            <span>Kurucuyu Tanıştır</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SPV card ─────────────────────────────────────────────────────────────────

function SpvCard({ spv }: { spv: SPV }) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">{spv.name}</p>
          <p className="mt-0.5 font-mono text-[9px] text-[var(--ink)]/30">{spv.sector} · {spv.participants} katılımcı · Kapanış: {spv.closing}</p>
        </div>
      </div>
      <div className="mb-3">
        <div className="mb-1 flex justify-between">
          <span className="font-mono text-[9px] text-[var(--ink)]/30">
            {spv.raised} / {spv.target}
          </span>
          <span className="font-mono text-[9px] text-[var(--ink)]/50">%{spv.pct}</span>
        </div>
        <div className="h-1 bg-[var(--ink)]/[0.06]">
          <div
            className="h-full transition-all"
            style={{
              width: `${spv.pct}%`,
              background: spv.pct >= 80 ? "var(--inner-green)" : "var(--ink)",
              opacity: spv.pct >= 80 ? 1 : 0.5,
            }}
          />
        </div>
      </div>
      <button className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors">
        SPV'ye Katıl <ExternalLink className="size-2.5" />
      </button>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CapitalHero() {
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              inner·capital
            </p>
            <AnimatedHeading
              text={"Where conviction\nmeets capital."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                Private deal flow, SPVs, and co-investment — curated inside the circle, invited by trust.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToId("deal-pipeline")}
                  className="bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  View Pipeline
                </button>
                <button
                  onClick={() => scrollToId("open-spvs")}
                  className="liquid-glass border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  View SPVs
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Deal Flow. SPVs. Co-Investment.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Capital() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [sectorFilter, setSectorFilter] = useState<Sector | "Tümü">("Tümü");
  const [view, setView] = useState<"pipeline" | "liste">("pipeline");

  const sectors: (Sector | "Tümü")[] = ["Tümü", "AI/ML", "B2B SaaS", "Fintech", "HR Tech", "DeepTech", "E-ticaret"];

  const filtered = sectorFilter === "Tümü"
    ? DEALS
    : DEALS.filter((d) => d.sector === sectorFilter);

  const totalRaise = "$3.65M";
  const activeDeals = DEALS.filter((d) => d.stage !== "Kapandı").length;
  const closedDeals = DEALS.filter((d) => d.stage === "Kapandı").length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero */}
      <CapitalHero />

      {/* View toggle */}
      <FadeIn>
        <div className="flex items-center justify-end">
          <div className="flex border border-[var(--ink)]/15">
            {(["pipeline", "liste"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "px-4 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors",
                  view === v
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {v === "pipeline" ? "Pipeline" : "Liste"}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Aktif Deal" value={String(activeDeals)} sub="pipeline'da" icon={TrendingUp} />
        <StatCard label="Toplam Hedef" value={totalRaise} sub="aktif turlar" icon={DollarSign} />
        <StatCard label="Kapanan" value={String(closedDeals)} sub="inner portföyü" icon={Building2} />
        <StatCard label="SPV" value={String(SPVS.length)} sub="açık yatırım aracı" icon={Users} />
      </div>

      {/* Sector filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-3 text-[var(--ink)]/20 shrink-0" />
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={[
              "border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition-all",
              sectorFilter === s
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                : "border-[var(--ink)]/10 text-[var(--ink)]/35 hover:border-[var(--ink)]/30 hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Pipeline view */}
      <div id="deal-pipeline" className="scroll-mt-6">
      {view === "pipeline" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage) => {
            const stageDeals = filtered.filter((d) => d.stage === stage);
            const cfg = STAGE_CONFIG[stage];
            return (
              <div key={stage}>
                <div className={`mb-3 flex items-center justify-between border-b pb-2 ${cfg.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/50">
                      {stage}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[var(--ink)]/25">{stageDeals.length}</span>
                </div>
                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="border border-dashed border-[var(--ink)]/[0.06] p-4 text-center">
                      <p className="font-mono text-[8px] text-[var(--ink)]/20">boş</p>
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
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-[var(--ink)]/[0.08] pb-2">
            {["Şirket", "Sektör", "Hedef", "Değerleme", "Aşama"].map((h) => (
              <span key={h} className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">{h}</span>
            ))}
          </div>
          {filtered.map((deal) => {
            const cfg = STAGE_CONFIG[deal.stage];
            return (
              <div
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className="grid cursor-pointer grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-[var(--ink)]/[0.04] py-3 transition-colors hover:bg-[var(--ink)]/[0.02]"
              >
                <div>
                  <p className="text-sm text-[var(--ink)]">{deal.company}</p>
                  <p className="font-mono text-[9px] text-[var(--ink)]/30">{deal.round}</p>
                </div>
                <span className="font-mono text-[9px] text-[var(--ink)]/40">{deal.sector}</span>
                <span className="font-mono text-[9px] text-[var(--ink)]">{deal.raise}</span>
                <span className="font-mono text-[9px] text-[var(--ink)]/50">{deal.valuation}</span>
                <div className={`flex items-center gap-1.5 border px-2 py-0.5 ${cfg.border}`}>
                  <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                  <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/40">{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* SPV section */}
      <section id="open-spvs" className="scroll-mt-6">
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
            Açık SPV'ler
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink)]/30">Özel amaçlı araçlarla toplu yatırım katılımı</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SPVS.map((spv) => <SpvCard key={spv.id} spv={spv} />)}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·capital — yalnızca inner·hub üyeleri için · bilgi amaçlıdır, yatırım tavsiyesi değildir
        </p>
      </div>

      {/* Deal detail panel */}
      {selectedDeal && (
        <DealDetail deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}
    </div>
  );
}
