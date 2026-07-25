import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { AsciiField } from "@/components/AsciiField";
import { CurrencyValue } from "@/components/panel/CurrencyValue";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import {
  Copy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const API_KEY = "ihub_live_sk_xK9mP2qR7nL4vJ8wT1sY3dF6cA0bE5gH";
const API_KEY_MASKED = "ihub_live_sk_xK9m••••••••••••••••••••••••3dF6cA0bE5gH";

const USAGE_DATA = [
  { day: "Pzt", requests: 420 },
  { day: "Sal", requests: 680 },
  { day: "Çar", requests: 510 },
  { day: "Per", requests: 890 },
  { day: "Cum", requests: 740 },
  { day: "Cmt", requests: 320 },
  { day: "Paz", requests: 210 },
];

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/members",
    desc: "Topluluk üyelerini listele (anonim)",
    rate: "100/saat",
    status: "stable",
  },
  {
    method: "GET",
    path: "/v1/members/:handle",
    desc: "Üye profilini getir ve kimliği doğrula",
    rate: "500/saat",
    status: "stable",
  },
  {
    method: "POST",
    path: "/v1/match",
    desc: "AI eşleştirme algoritmasını çağır",
    rate: "20/saat",
    status: "beta",
  },
  {
    method: "GET",
    path: "/v1/pulse",
    desc: "Topluluk sinyal verilerini getir",
    rate: "60/saat",
    status: "stable",
  },
  {
    method: "POST",
    path: "/v1/verify",
    desc: "inner·id kimlik doğrulama",
    rate: "200/saat",
    status: "stable",
  },
  {
    method: "POST",
    path: "/v1/events/webhook",
    desc: "Topluluk event'lerine webhook al",
    rate: "∞",
    status: "beta",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Ücretsiz",
    period: "",
    requests: "1.000 / ay",
    features: ["Temel üye sorgusu", "Kimlik doğrulama", "E-posta desteği"],
    current: false,
  },
  {
    name: "Builder",
    price: "₺299",
    period: "/ ay",
    requests: "50.000 / ay",
    features: ["Tüm endpoint'ler", "inner·match API", "Webhook desteği", "Öncelikli destek"],
    current: true,
  },
  {
    name: "Scale",
    price: "₺999",
    period: "/ ay",
    requests: "Sınırsız",
    features: ["White-label", "Özel SLA", "Dedicated destek", "inner·pulse ham veri"],
    current: false,
  },
];

const STATS = [
  { label: "Bu Ay İstek", value: "12,480", sub: "50K limitin %25'i" },
  { label: "Ortalama Gecikme", value: "87ms", sub: "son 7 gün" },
  { label: "Başarı Oranı", value: "%99.7", sub: "son 30 gün" },
  { label: "Aktif Webhook", value: "3", sub: "endpoint dinliyor" },
];

// ─── Usage bar chart ──────────────────────────────────────────────────────────

function UsageChart() {
  const max = Math.max(...USAGE_DATA.map((d) => d.requests));
  return (
    <div>
      <div className="mb-2 flex items-end gap-1.5 h-16">
        {USAGE_DATA.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full bg-[var(--ink)] transition-all"
              style={{ height: `${(d.requests / max) * 52}px`, opacity: 0.15 + (d.requests / max) * 0.5 }}
              title={`${d.requests} istek`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {USAGE_DATA.map((d) => (
          <span key={d.day} className="flex-1 text-center font-mono text-[7px] font-medium text-[var(--ink-muted)]">{d.day}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InnerApi() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(API_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rotateKey = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 1500);
  };

  const METHOD_COLORS: Record<string, string> = {
    GET: "text-[var(--inner-green)] border-[var(--inner-green)]/30 bg-[var(--inner-green)]/8",
    POST: "text-amber-700 border-amber-300/50 bg-amber-50/60",
  };

  const STATUS_COLORS: Record<string, string> = {
    stable: "text-[var(--ink-body)] border-[var(--ink)]/15",
    beta: "text-amber-700 border-amber-300/50",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero banner */}
      <FadeIn>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)] p-6 text-[var(--bone)] sm:p-8">
          <AsciiField tone="dark" />
          <AmbientCardBackground />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--bone)]/60 mb-2">
                <span lang="en">inner·hub</span>
              </p>
              <h1
                className="font-serif font-display text-3xl text-[var(--bone)] sm:text-4xl md:text-5xl"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
              >
                inner·api
                <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
              </h1>
              <p className="mt-2 max-w-md text-sm text-[var(--bone)]/65 font-light">
                Topluluk altyapısına programatik erişim. Kendi ürününe entegre et.
              </p>
            </div>
            <a
              href="#"
              className="flex shrink-0 items-center justify-center gap-1.5 border border-[var(--bone)]/25 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-widest text-[var(--bone)]/70 transition-all hover:border-[var(--bone)]/50 hover:text-[var(--bone)] sm:justify-start"
            >
              <Code2 className="size-3" /> Dokümantasyon <ArrowUpRight className="size-2.5" />
            </a>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.08] p-4">
            <p className="font-mono text-[8px] font-medium uppercase tracking-widest text-[var(--ink-muted)]">{s.label}</p>
            <p
              className="mt-1 font-serif text-xl text-[var(--ink)] sm:text-2xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 font-mono text-[8px] font-medium text-[var(--ink-muted)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* API Key */}
      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-body)]">API Anahtarı</p>
          <p className="mt-0.5 text-xs font-medium text-[var(--ink-muted)]">Anahtarı güvende tut — kimseyle paylaşma</p>
        </div>
        <div className="flex items-center gap-2 border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] px-4 py-3">
          <Code2 className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
          <code className="flex-1 font-mono text-[10px] font-medium text-[var(--ink-body)] truncate">
            {showKey ? API_KEY : API_KEY_MASKED}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowKey((v) => !v)}
              className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
              title={showKey ? "Gizle" : "Göster"}
            >
              {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
            <button
              onClick={copyKey}
              className="flex items-center gap-1 p-1.5 font-mono text-[8px] font-medium uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <Copy className="size-3.5" />
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
            <button
              onClick={rotateKey}
              className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--error-ink)] transition-colors"
              title="Anahtarı yenile"
            >
              <RefreshCw className={`size-3.5 ${rotating ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        {rotating && (
          <p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-widest text-amber-700">
            Eski anahtar 5 dakika içinde devre dışı kalacak
          </p>
        )}
      </section>

      {/* Usage chart */}
      <section className="border border-[var(--ink)]/[0.08] p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-[var(--ink-body)]">Bu Hafta Kullanım</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-16 bg-[var(--ink)]/[0.06]">
              <div className="h-full bg-[var(--inner-green)]" style={{ width: "25%" }} />
            </div>
            <span className="font-mono text-[9px] font-medium text-[var(--ink-body)]">12.480 / 50.000</span>
          </div>
        </div>
        <UsageChart />
      </section>

      {/* Endpoints */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-body)]">Endpoint'ler</p>
        </div>
        <div className="space-y-1">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="border border-[var(--ink)]/[0.06] px-4 py-3 transition-colors hover:border-[var(--ink)]/15"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className={`border px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-widest ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <span className={`border px-1.5 py-0.5 font-mono text-[7px] font-semibold uppercase tracking-widest ${STATUS_COLORS[ep.status]}`}>
                  {ep.status}
                </span>
                <span className="ml-auto font-mono text-[8px] font-medium text-[var(--ink-muted)] shrink-0">{ep.rate}</span>
              </div>
              <p className="font-mono text-[10px] font-medium text-[var(--ink-strong)] truncate">{ep.path}</p>
              <p className="font-mono text-[8px] font-medium text-[var(--ink-muted)] truncate">{ep.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing plans */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-body)]">API Planları</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative overflow-hidden border p-5 transition-all",
                plan.current
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
              ].join(" ")}
            >
              {plan.current && (
                <>
                  <AsciiField tone="dark" cell={12} />
                  <AmbientCardBackground />
                </>
              )}
              <div className="relative z-10">
                <div className="mb-1 flex items-center justify-between">
                  <p className={`font-mono text-[9px] font-semibold uppercase tracking-widest ${plan.current ? "text-[var(--bone)]/60" : "text-[var(--ink-body)]"}`}>
                    <span lang="en">{plan.name}</span>
                  </p>
                  {plan.current && (
                    <span className="border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-[7px] font-semibold uppercase tracking-widest text-[var(--inner-green)]">
                      Mevcut
                    </span>
                  )}
                </div>
                <div className="mb-3 flex items-baseline gap-1">
                  <span
                    className={`font-serif text-2xl ${plan.current ? "text-[var(--bone)]" : "text-[var(--ink)]"}`}
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                  >
                    <CurrencyValue value={plan.price} />
                  </span>
                  {plan.period && (
                    <span className={`font-mono text-[9px] font-medium ${plan.current ? "text-[var(--bone)]/55" : "text-[var(--ink-muted)]"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mb-3 font-mono text-[9px] font-medium ${plan.current ? "text-[var(--bone)]/65" : "text-[var(--ink-body)]"}`}>
                  {plan.requests} istek
                </p>
                <ul className="mb-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className={`mt-0.5 size-3 shrink-0 ${plan.current ? "text-[var(--inner-green)]" : "text-[var(--ink-muted)]"}`} />
                      <span className={`text-xs font-medium ${plan.current ? "text-[var(--bone)]/70" : "text-[var(--ink-body)]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button className={[
                    "flex w-full items-center justify-between border px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-widest transition-all",
                    "border-[var(--ink)]/15 text-[var(--ink-body)] hover:border-[var(--ink)] hover:text-[var(--ink)]",
                  ].join(" ")}>
                    <span>{plan.name === "Starter" ? "Downgrade" : "Upgrade"}</span>
                    <ArrowUpRight className="size-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warning note */}
      <div className="flex items-start gap-3 border border-[var(--ink)]/[0.08] p-4">
        <AlertCircle className="size-4 shrink-0 text-[var(--ink-muted)] mt-0.5" />
        <p className="text-sm leading-relaxed font-medium text-[var(--ink-body)]">
          inner·api beta aşamasındadır. Breaking change'ler versiyonlanır ve 30 gün önceden bildirilir.
          Üretim kullanımı için Builder veya Scale planı önerilir.
        </p>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·api</span> v1 — REST · JSON · Bearer Auth · Rate limited · <span lang="en">inner·hub</span> ekosistemi
        </p>
      </div>
    </div>
  );
}
