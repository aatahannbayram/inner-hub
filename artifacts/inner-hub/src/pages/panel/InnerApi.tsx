import { useState } from "react";
import { Lockup } from "@/components/Lockup";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { AsciiField } from "@/components/AsciiField";
import { CurrencyValue } from "@/components/panel/CurrencyValue";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import {
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Code2,
  ArrowUpRight,
  Plus,
  KeyRound,
} from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState } from "@/components/panel/Skeletons";

// ─── API tipleri ────────────────────────────────────────────────────────────

interface ApiKeyRow {
  id: number;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

// ─── Dokümantasyon — sabit içerik, kullanıcıya özel veri değil ────────────────

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
    recommended: false,
  },
  {
    name: "Builder",
    price: "₺299",
    period: "/ ay",
    requests: "50.000 / ay",
    features: ["Tüm endpoint'ler", "inner·match API", "Webhook desteği", "Öncelikli destek"],
    recommended: true,
  },
  {
    name: "Scale",
    price: "₺999",
    period: "/ ay",
    requests: "Sınırsız",
    features: ["White-label", "Özel SLA", "Dedicated destek", "inner·pulse ham veri"],
    recommended: false,
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Anahtar oluşturma — plaintext yalnızca bu anda görünür ───────────────────

function NewKeyReveal({ plaintext, onDone }: { plaintext: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 p-4">
      <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--success-ink)]">
        Yeni anahtar oluşturuldu
      </p>
      <p className="mt-1 text-xs font-medium text-[var(--ink-muted)]">
        Bu anahtar bir daha gösterilmeyecek. Şimdi kopyala ve güvenli bir yere kaydet.
      </p>
      <div className="mt-3 flex items-center gap-2 border border-[var(--ink)]/[0.08] bg-[var(--bone)] px-3 py-2.5">
        <code className="flex-1 overflow-x-auto font-mono text-label font-medium text-[var(--ink-strong)] whitespace-nowrap">
          {plaintext}
        </code>
        <button
          onClick={() => void copy()}
          className="flex shrink-0 items-center gap-1.5 font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-body)] hover:text-[var(--ink)] transition-colors"
        >
          {copied ? <Check className="size-3.5 text-[var(--success-ink)]" /> : <Copy className="size-3.5" />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <button
        onClick={onDone}
        className="mt-3 font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
      >
        Kapat
      </button>
    </div>
  );
}

// ─── Tek anahtar satırı ────────────────────────────────────────────────────────

function ApiKeyRowView({ apiKey, onDeleted }: { apiKey: ApiKeyRow; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/api-keys/${apiKey.id}`), { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Silinemedi");
      onDeleted();
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border border-[var(--ink)]/[0.08] px-4 py-3">
      <KeyRound className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--ink)]">{apiKey.name}</p>
        <p className="font-mono text-label font-medium text-[var(--ink-muted)]">
          <span lang="en">{apiKey.prefix}</span> · oluşturuldu {formatDate(apiKey.createdAt)}
          {apiKey.lastUsedAt && ` · son kullanım ${formatDate(apiKey.lastUsedAt)}`}
        </p>
      </div>
      {confirming ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            disabled={busy}
            onClick={() => void remove()}
            className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--error-ink)] disabled:opacity-40"
          >
            {busy ? "Siliniyor…" : "Emin misin?"}
          </button>
          <button
            disabled={busy}
            onClick={() => setConfirming(false)}
            className="font-mono text-label font-medium uppercase tracking-widest text-[var(--ink-muted)]"
          >
            Vazgeç
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 p-1.5 text-[var(--ink-muted)] hover:text-[var(--error-ink)] transition-colors"
          title="Anahtarı sil"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InnerApi() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ keys: ApiKeyRow[] }>(
    ["api-keys"],
    "/api/api-keys",
  );
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const createKey = async () => {
    const name = newKeyName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch(apiUrl("/api/api-keys"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Anahtar oluşturulamadı");
      setRevealedKey(json.key);
      setNewKeyName("");
      await queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Anahtar oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  const keys = data?.keys ?? [];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero banner */}
      <FadeIn>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)] p-6 text-[var(--bone)] sm:p-8">
          <AsciiField tone="dark" />
          <AmbientCardBackground />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--bone)]/60 mb-2">
                Platform API
              </p>
              <h1
                className="font-serif font-display text-3xl text-[var(--bone)] sm:text-4xl md:text-5xl"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
              >
                <Lockup suffix="api" className="text-[var(--bone)]" />
              </h1>
              <p className="mt-2 max-w-md text-sm text-[var(--bone)]/65 font-light">
                Topluluk altyapısına programatik erişim. Kendi ürününe entegre et.
              </p>
            </div>
            <a
              href="#"
              className="flex shrink-0 items-center justify-center gap-1.5 border border-[var(--bone)]/25 px-3 py-2 font-mono text-label font-semibold uppercase tracking-widest text-[var(--bone)]/70 transition-all hover:border-[var(--bone)]/50 hover:text-[var(--bone)] sm:justify-start"
            >
              <Code2 className="size-3" /> Dokümantasyon <ArrowUpRight className="size-2.5" />
            </a>
          </div>
        </div>
      </FadeIn>

      {/* API Keys */}
      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-body)]">API Anahtarların</p>
          <p className="mt-0.5 text-xs font-medium text-[var(--ink-muted)]">Anahtarları güvende tut · kimseyle paylaşma</p>
        </div>

        {isLoading && <LoadingBlock label="Anahtarlar yükleniyor" />}
        {isError && (
          <ErrorState message={error instanceof Error ? error.message : "Anahtarlar yüklenemedi"} onRetry={() => refetch()} />
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {revealedKey && <NewKeyReveal plaintext={revealedKey} onDone={() => setRevealedKey(null)} />}

            {keys.length === 0 && !revealedKey && (
              <p className="border border-[var(--ink)]/[0.08] px-4 py-3 text-sm text-[var(--ink-muted)]">
                Henüz bir API anahtarın yok.
              </p>
            )}

            {keys.map((k) => (
              <ApiKeyRowView
                key={k.id}
                apiKey={k}
                onDeleted={() => void queryClient.invalidateQueries({ queryKey: ["api-keys"] })}
              />
            ))}

            <div className="flex items-center gap-2 border border-dashed border-[var(--ink)]/15 px-4 py-3">
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void createKey()}
                placeholder="Anahtar adı (ör. prod-server)"
                className="flex-1 bg-transparent font-mono text-caption text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
              />
              <button
                disabled={creating || !newKeyName.trim()}
                onClick={() => void createKey()}
                className="flex shrink-0 items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 font-mono text-label font-semibold uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                <Plus className="size-3" /> {creating ? "Oluşturuluyor…" : "Yeni Anahtar"}
              </button>
            </div>
            {createError && (
              <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
                {createError}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Endpoints */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-body)]">Endpoint'ler</p>
        </div>
        <div className="space-y-1">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="border border-[var(--ink)]/[0.06] px-4 py-3 transition-colors hover:border-[var(--ink)]/15"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`border px-2 py-0.5 font-mono text-label font-semibold uppercase tracking-widest ${
                    ep.method === "GET"
                      ? "text-[var(--success-ink)] border-[var(--inner-green)]/30 bg-[var(--inner-green)]/8"
                      : "text-amber-700 border-amber-300/50 bg-amber-50/60"
                  }`}
                >
                  {ep.method}
                </span>
                <span
                  className={`border px-1.5 py-0.5 font-mono text-label font-semibold uppercase tracking-widest ${
                    ep.status === "stable"
                      ? "text-[var(--ink-body)] border-[var(--ink)]/15"
                      : "text-amber-700 border-amber-300/50"
                  }`}
                >
                  {ep.status}
                </span>
                <span className="ml-auto font-mono text-label font-medium text-[var(--ink-muted)] shrink-0">{ep.rate}</span>
              </div>
              <p className="font-mono text-label font-medium text-[var(--ink-strong)] truncate">{ep.path}</p>
              <p className="text-xs text-[var(--ink-muted)] truncate">{ep.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing plans */}
      <section>
        <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-body)]">API Planları</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative overflow-hidden border p-5 transition-all",
                plan.recommended
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
              ].join(" ")}
            >
              {plan.recommended && (
                <>
                  <AsciiField tone="dark" cell={12} />
                  <AmbientCardBackground />
                </>
              )}
              <div className="relative z-10">
                <div className="mb-1 flex items-center justify-between">
                  <p className={`font-mono text-label font-semibold uppercase tracking-widest ${plan.recommended ? "text-[var(--bone)]/60" : "text-[var(--ink-body)]"}`}>
                    <span lang="en">{plan.name}</span>
                  </p>
                  {plan.recommended && (
                    <span className="border border-[var(--inner-green)]/40 px-1.5 py-0.5 font-mono text-label font-semibold uppercase tracking-widest text-[var(--success-ink)]">
                      Önerilen
                    </span>
                  )}
                </div>
                <div className="mb-3 flex items-baseline gap-1">
                  <span
                    className={`font-serif text-2xl ${plan.recommended ? "text-[var(--bone)]" : "text-[var(--ink)]"}`}
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                  >
                    <CurrencyValue value={plan.price} />
                  </span>
                  {plan.period && (
                    <span className={`font-mono text-label font-medium ${plan.recommended ? "text-[var(--bone)]/55" : "text-[var(--ink-muted)]"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mb-3 font-mono text-label font-medium ${plan.recommended ? "text-[var(--bone)]/65" : "text-[var(--ink-body)]"}`}>
                  {plan.requests} istek
                </p>
                <ul className="mb-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className={`mt-0.5 size-3 shrink-0 ${plan.recommended ? "text-[var(--success-ink)]" : "text-[var(--ink-muted)]"}`} />
                      <span className={`text-xs font-medium ${plan.recommended ? "text-[var(--bone)]/70" : "text-[var(--ink-body)]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:destek@inner.digital?subject=inner·api%20plan%20talebi"
                  className={[
                    "flex w-full items-center justify-between border px-3 py-2 font-mono text-label font-semibold uppercase tracking-widest transition-all",
                    plan.recommended
                      ? "border-[var(--bone)]/25 text-[var(--bone)]/70 hover:border-[var(--bone)]/50 hover:text-[var(--bone)]"
                      : "border-[var(--ink)]/15 text-[var(--ink-body)] hover:border-[var(--ink)] hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  <span>Destekle İletişime Geç</span>
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warning note */}
      <div className="flex items-start gap-3 border border-[var(--ink)]/[0.08] p-4">
        <AlertCircle className="size-4 shrink-0 text-[var(--ink-muted)] mt-0.5" />
        <p className="text-sm leading-relaxed font-medium text-[var(--ink-body)]">
          inner·api beta aşamasındadır. Anahtar oluşturma ve silme canlı çalışır; kullanım/rate-limit takibi ve
          faturalandırma henüz bağlanmadı. Plan yükseltmesi için destek ekibiyle iletişime geç.
        </p>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label font-medium uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·api</span> v1 · REST · JSON · Bearer Auth · <span lang="en">inner·hub</span> ekosistemi
        </p>
      </div>
    </div>
  );
}
