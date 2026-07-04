import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import {
  Copy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  Zap,
  Users,
  BarChart2,
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
          <span key={d.day} className="flex-1 text-center font-mono text-[7px] text-[var(--ink)]/25">{d.day}</span>
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
    GET: "text-[var(--inner-green)] border-[var(--inner-green)]/25 bg-[var(--inner-green)]/8",
    POST: "text-amber-600 border-amber-300/40 bg-amber-50/60",
  };

  const STATUS_COLORS: Record<string, string> = {
    stable: "text-[var(--ink)]/40 border-[var(--ink)]/10",
    beta: "text-amber-600 border-amber-300/40",
  };

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
              inner·api
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluk altyapısına programatik erişim. Kendi ürününe entegre et.
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/30 hover:text-[var(--ink)]"
          >
            <Code2 className="size-3" /> Dokümantasyon <ArrowUpRight className="size-2.5" />
          </a>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.08] p-4">
            <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">{s.label}</p>
            <p
              className="mt-1 font-serif text-2xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 font-mono text-[8px] text-[var(--ink)]/25">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* API Key */}
      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">API Anahtarı</p>
          <p className="mt-0.5 text-xs text-[var(--ink)]/30">Anahtarı güvende tut — kimseyle paylaşma</p>
        </div>
        <div className="flex items-center gap-2 border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] px-4 py-3">
          <Code2 className="size-3.5 shrink-0 text-[var(--ink)]/20" />
          <code className="flex-1 font-mono text-[10px] text-[var(--ink)]/55 truncate">
            {showKey ? API_KEY : API_KEY_MASKED}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowKey((v) => !v)}
              className="p-1.5 text-[var(--ink)]/25 hover:text-[var(--ink)] transition-colors"
              title={showKey ? "Gizle" : "Göster"}
            >
              {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
            <button
              onClick={copyKey}
              className="flex items-center gap-1 p-1.5 font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25 hover:text-[var(--ink)] transition-colors"
            >
              <Copy className="size-3.5" />
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
            <button
              onClick={rotateKey}
              className="p-1.5 text-[var(--ink)]/25 hover:text-[var(--error)] transition-colors"
              title="Anahtarı yenile"
            >
              <RefreshCw className={`size-3.5 ${rotating ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        {rotating && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-amber-600">
            Eski anahtar 5 dakika içinde devre dışı kalacak
          </p>
        )}
      </section>

      {/* Usage chart */}
      <section className="border border-[var(--ink)]/[0.08] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">Bu Hafta Kullanım</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-16 bg-[var(--ink)]/[0.06]">
              <div className="h-full bg-[var(--inner-green)]" style={{ width: "25%" }} />
            </div>
            <span className="font-mono text-[9px] text-[var(--ink)]/40">12.480 / 50.000</span>
          </div>
        </div>
        <UsageChart />
      </section>

      {/* Endpoints */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Endpoint'ler</p>
        </div>
        <div className="space-y-1">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border border-[var(--ink)]/[0.06] px-4 py-3 transition-colors hover:border-[var(--ink)]/15"
            >
              <span className={`border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest ${METHOD_COLORS[ep.method]}`}>
                {ep.method}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-[var(--ink)]/70 truncate">{ep.path}</p>
                <p className="font-mono text-[8px] text-[var(--ink)]/30 truncate">{ep.desc}</p>
              </div>
              <span className="font-mono text-[8px] text-[var(--ink)]/25 shrink-0">{ep.rate}</span>
              <span className={`border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest ${STATUS_COLORS[ep.status]}`}>
                {ep.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing plans */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">API Planları</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                "border p-5 transition-all",
                plan.current
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
              ].join(" ")}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className={`font-mono text-[9px] uppercase tracking-widest ${plan.current ? "text-[var(--bone)]/50" : "text-[var(--ink)]/40"}`}>
                  {plan.name}
                </p>
                {plan.current && (
                  <span className="border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest text-[var(--inner-green)]">
                    Mevcut
                  </span>
                )}
              </div>
              <div className="mb-3 flex items-baseline gap-1">
                <span
                  className={`font-serif text-2xl ${plan.current ? "text-[var(--bone)]" : "text-[var(--ink)]"}`}
                  style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`font-mono text-[9px] ${plan.current ? "text-[var(--bone)]/30" : "text-[var(--ink)]/30"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mb-3 font-mono text-[9px] ${plan.current ? "text-[var(--bone)]/40" : "text-[var(--ink)]/35"}`}>
                {plan.requests} istek
              </p>
              <ul className="mb-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className={`mt-0.5 size-3 shrink-0 ${plan.current ? "text-[var(--inner-green)]" : "text-[var(--ink)]/25"}`} />
                    <span className={`text-xs ${plan.current ? "text-[var(--bone)]/60" : "text-[var(--ink)]/50"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button className={[
                  "flex w-full items-center justify-between border px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-all",
                  "border-[var(--ink)]/15 text-[var(--ink)]/40 hover:border-[var(--ink)] hover:text-[var(--ink)]",
                ].join(" ")}>
                  <span>{plan.name === "Starter" ? "Downgrade" : "Upgrade"}</span>
                  <ArrowUpRight className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Warning note */}
      <div className="flex items-start gap-3 border border-[var(--ink)]/[0.08] p-4">
        <AlertCircle className="size-4 shrink-0 text-[var(--ink)]/25 mt-0.5" />
        <p className="text-xs leading-relaxed text-[var(--ink)]/40">
          inner·api beta aşamasındadır. Breaking change'ler versiyonlanır ve 30 gün önceden bildirilir.
          Üretim kullanımı için Builder veya Scale planı önerilir.
        </p>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·api v1 — REST · JSON · Bearer Auth · Rate limited · inner·hub ekosistemi
        </p>
      </div>
    </div>
  );
}
