import { useState, useEffect } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Check, X, ChevronRight, Clock, Search, SlidersHorizontal } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "beklemede" | "onaylandı" | "reddedildi";

type Application = {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  why: string;
  referrer: string | null;
  appliedAt: string;
  status: AppStatus;
  linkedinUrl: string;
  tags: string[];
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK: Application[] = [
  {
    id: 1,
    name: "Alara Demir",
    email: "alara@techstart.io",
    role: "CEO",
    company: "TechStart",
    why: "AI ve topluluk kesişiminde çalışıyorum. inner·hub'ın kurucularıyla fikirlerimi paylaşmak ve birlikte büyümek istiyorum.",
    referrer: "Ata Han Bayram",
    appliedAt: "2026-06-28",
    status: "beklemede",
    linkedinUrl: "linkedin.com/in/alarademir",
    tags: ["AI", "SaaS", "Kurucu"],
  },
  {
    id: 2,
    name: "Baran Şahin",
    email: "baran@buildco.io",
    role: "CTO",
    company: "BuildCo",
    why: "Teknik kurucular için kaliteli bir topluluk arıyorum. Kendi deneyimlerimi paylaşırken diğer builder'lardan öğrenmek istiyorum.",
    referrer: "Selin Kaya",
    appliedAt: "2026-06-25",
    status: "beklemede",
    linkedinUrl: "linkedin.com/in/baransahin",
    tags: ["Backend", "Developer", "CTO"],
  },
  {
    id: 3,
    name: "Ceren Yılmaz",
    email: "ceren@vc-istanbul.com",
    role: "Associate",
    company: "VC Istanbul",
    why: "Yatırım ekibinin bir parçası olarak erken aşama şirketleri yakından takip ediyorum. inner·hub deal flow için güçlü bir kaynak.",
    referrer: null,
    appliedAt: "2026-06-20",
    status: "onaylandı",
    linkedinUrl: "linkedin.com/in/cerenyilmaz",
    tags: ["VC", "Yatırımcı", "Fintech"],
  },
  {
    id: 4,
    name: "Deniz Aktaş",
    email: "deniz@growthco.co",
    role: "Head of Growth",
    company: "GrowthCo",
    why: "B2B SaaS büyüme konusunda 5 yıllık deneyimim var. Topluluğa katkı sunmak ve network'ümü genişletmek istiyorum.",
    referrer: null,
    appliedAt: "2026-06-15",
    status: "reddedildi",
    linkedinUrl: "linkedin.com/in/denizaktas",
    tags: ["Growth", "B2B", "Marketing"],
  },
  {
    id: 5,
    name: "Emir Doğan",
    email: "emir@deeptech.ai",
    role: "Founder",
    company: "DeepTech AI",
    why: "Yapay zeka alanında deep tech bir startup kuruyorum. inner·hub ekosistemi ile erken yatırımcı ve advisor bulmayı hedefliyorum.",
    referrer: "Mert Öztürk",
    appliedAt: "2026-07-01",
    status: "beklemede",
    linkedinUrl: "linkedin.com/in/emirdogan",
    tags: ["AI", "Deep Tech", "Kurucu"],
  },
  {
    id: 6,
    name: "Funda Arslan",
    email: "funda@product.xyz",
    role: "Product Manager",
    company: "Product XYZ",
    why: "Product-led growth ve community-led growth kesişiminde çalışıyorum. Deneyimlerimi paylaşmak için doğru platform.",
    referrer: "Defne Arslan",
    appliedAt: "2026-07-02",
    status: "beklemede",
    linkedinUrl: "linkedin.com/in/fundaarslan",
    tags: ["Product", "PLG", "Community"],
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string }> = {
  beklemede:   { label: "Beklemede",  color: "text-[var(--ink)]/50",          bg: "bg-[var(--ink)]/[0.06]" },
  onaylandı:   { label: "Onaylandı",  color: "text-[var(--inner-green)]",     bg: "bg-[var(--inner-green)]/10" },
  reddedildi:  { label: "Reddedildi", color: "text-[var(--error)]",           bg: "bg-[var(--error)]/10" },
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
      {status === "beklemede" && <Clock className="size-2.5" />}
      {status === "onaylandı" && <Check className="size-2.5" />}
      {status === "reddedildi" && <X className="size-2.5" />}
      {cfg.label}
    </span>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  app,
  onClose,
  onApprove,
  onReject,
}: {
  app: Application;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[var(--ink)]/20"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l border-[var(--ink)]/10 bg-[var(--bone)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Başvuru Detayı</p>
          <button
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors"
          >
            ← Kapat
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          {/* Identity */}
          <div>
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <p className="text-lg text-[var(--ink)] font-light">{app.name}</p>
                <p className="font-mono text-[10px] text-[var(--ink)]/40">{app.email}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <p className="mt-1 font-mono text-[9px] text-[var(--ink)]/40">{app.role}, {app.company}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {app.tags.map((t) => (
              <span key={t} className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/40">
                {t}
              </span>
            ))}
          </div>

          {/* Why */}
          <div className="border-l-2 border-[var(--ink)]/10 pl-4">
            <p className="mb-1 font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">Neden inner·hub?</p>
            <p className="text-sm leading-relaxed text-[var(--ink)]/70 font-light">{app.why}</p>
          </div>

          {/* Meta */}
          <div className="space-y-2 border border-[var(--ink)]/[0.08] p-3">
            <div className="flex justify-between">
              <span className="font-mono text-[9px] text-[var(--ink)]/30">Başvuru Tarihi</span>
              <span className="font-mono text-[9px] text-[var(--ink)]/50">{app.appliedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[9px] text-[var(--ink)]/30">Referans</span>
              <span className="font-mono text-[9px] text-[var(--ink)]/50">{app.referrer ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[9px] text-[var(--ink)]/30">LinkedIn</span>
              <span className="font-mono text-[9px] text-[var(--ink)]/50 truncate max-w-[140px]">{app.linkedinUrl}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {app.status === "beklemede" && (
          <div className="border-t border-[var(--ink)]/[0.08] flex">
            <button
              onClick={onReject}
              className="flex-1 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 hover:bg-[var(--error)]/5 hover:text-[var(--error)] transition-colors"
            >
              Reddet
            </button>
            <button
              onClick={onApprove}
              className="flex-1 py-3.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--inner-green)]/10 hover:text-[var(--inner-green)] transition-colors"
            >
              Onayla
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ["Tümü", "Beklemede", "Onaylandı", "Reddedildi"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(MOCK);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState<Filter>("Tümü");
  const [search, setSearch] = useState("");

  const counts = {
    Tümü: apps.length,
    Beklemede: apps.filter((a) => a.status === "beklemede").length,
    Onaylandı: apps.filter((a) => a.status === "onaylandı").length,
    Reddedildi: apps.filter((a) => a.status === "reddedildi").length,
  };

  const filtered = apps.filter((a) => {
    const matchFilter =
      filter === "Tümü" ||
      (filter === "Beklemede" && a.status === "beklemede") ||
      (filter === "Onaylandı" && a.status === "onaylandı") ||
      (filter === "Reddedildi" && a.status === "reddedildi");
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.company.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const updateStatus = (id: number, status: AppStatus) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub — Admin
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            başvurular
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Üyelik başvurularını incele ve onayla.
          </p>
        </div>
      </FadeIn>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Beklemede", val: counts.Beklemede, color: "text-[var(--ink)]" },
          { label: "Onaylandı", val: counts.Onaylandı, color: "text-[var(--inner-green)]" },
          { label: "Reddedildi", val: counts.Reddedildi, color: "text-[var(--error)]" },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.08] p-4">
            <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/30">{s.label}</p>
            <p className={`mt-1 font-serif text-2xl ${s.color}`}
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-3">
        {/* Filter pills */}
        <div className="flex">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "border-y border-r first:border-l px-3 py-1.5 font-mono text-[8px] uppercase tracking-widest transition-colors",
                filter === f
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/15 text-[var(--ink)]/30 hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {f}
              <span className="ml-1 opacity-50">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2 border border-[var(--ink)]/[0.08] px-3 py-1.5">
          <Search className="size-3 text-[var(--ink)]/25 shrink-0" />
          <input
            className="flex-1 bg-transparent text-xs text-[var(--ink)] placeholder:text-[var(--ink)]/25 outline-none font-light"
            placeholder="Ad, şirket, etiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Application list */}
      <div className="border border-[var(--ink)]/[0.08]">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <SlidersHorizontal className="mx-auto mb-3 size-6 text-[var(--ink)]/15" />
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25">Sonuç bulunamadı</p>
          </div>
        ) : (
          filtered.map((app, i) => (
            <div
              key={app.id}
              onClick={() => setSelected(app)}
              className={[
                "flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--ink)]/[0.03]",
                i < filtered.length - 1 ? "border-b border-[var(--ink)]/[0.05]" : "",
              ].join(" ")}
            >
              {/* Avatar */}
              <div className="flex size-8 shrink-0 items-center justify-center bg-[var(--ink)]/[0.06] font-mono text-[10px] text-[var(--ink)]/40">
                {app.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[var(--ink)] font-light">{app.name}</p>
                  {app.referrer && (
                    <span className="font-mono text-[8px] text-[var(--ink)]/30">ref: {app.referrer.split(" ")[0]}</span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-[var(--ink)]/35">{app.role}, {app.company}</p>
              </div>

              {/* Tags */}
              <div className="hidden sm:flex gap-1">
                {app.tags.slice(0, 2).map((t) => (
                  <span key={t} className="border border-[var(--ink)]/[0.08] px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest text-[var(--ink)]/30">
                    {t}
                  </span>
                ))}
              </div>

              {/* Status + date */}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={app.status} />
                <span className="font-mono text-[8px] text-[var(--ink)]/20">{app.appliedAt}</span>
              </div>

              <ChevronRight className="size-3.5 shrink-0 text-[var(--ink)]/20" />
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·hub · başvurular · yalnızca admin
        </p>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          app={selected}
          onClose={() => setSelected(null)}
          onApprove={() => updateStatus(selected.id, "onaylandı")}
          onReject={() => updateStatus(selected.id, "reddedildi")}
        />
      )}
    </div>
  );
}
