import { useEffect, useState } from "react";
import { Lockup } from "@/components/Lockup";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Users,
  Target,
  Loader2,
  RefreshCw,
  ArrowRight,
  ImageIcon,
  X,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { CourseCardSkeleton, LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { apiUrl } from "@/lib/api";
import { cleanDisplayText } from "@/lib/displayText";

interface Theme {
  topic: string;
  momentum: "yüksek" | "orta" | "düşük";
  summary: string;
}

interface Connection {
  name: string;
  reason: string;
  matchScore: number;
}

interface SignalData {
  weeklyThemes: Theme[];
  connections: Connection[];
  insight: string;
}

const ACTIVITY_DATA = [
  [2, 5, 3, 7, 4, 1, 0],
  [3, 8, 6, 9, 5, 2, 1],
  [1, 4, 7, 11, 6, 3, 0],
  [4, 6, 5, 8, 9, 2, 1],
  [2, 3, 8, 12, 7, 4, 2],
];

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEKS = ["4h", "3h", "2h", "1h", "Bu"];

const MOMENTUM_CONFIG = {
  yüksek: {
    icon: TrendingUp,
    label: "Yükselen",
    tone: "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]",
    accent: "var(--inner-green)",
  },
  orta: {
    icon: Minus,
    label: "Stabil",
    tone: "border-[var(--ink)]/15 text-[var(--ink-body)]",
    accent: "rgba(10,10,10,0.22)",
  },
  düşük: {
    icon: TrendingDown,
    label: "Düşen",
    tone: "border-[var(--error)]/30 text-[var(--error-ink)]",
    accent: "var(--error)",
  },
} as const;

type SectionId = "insight" | "themes" | "people" | "activity";

function ActivityHeatmap() {
  const maxVal = Math.max(...ACTIVITY_DATA.flat());
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p
            className="font-display font-serif text-lg text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
          >
            Aktivite haritası
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            Son 5 haftalık topluluk yoğunluğu · gösterge amaçlı
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-label text-[var(--ink-subtle)]">Az</span>
          {[0.15, 0.3, 0.5, 0.7, 1].map((o, i) => (
            <span key={i} className="size-2.5 bg-[var(--ink)]" style={{ opacity: o }} />
          ))}
          <span className="font-mono text-label text-[var(--ink-subtle)]">Çok</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col justify-between py-0.5 pr-2">
          {WEEKS.map((w) => (
            <span key={w} className="font-mono text-label leading-none text-[var(--ink-subtle)]">
              {w}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <span key={d} className="text-center font-mono text-label text-[var(--ink-subtle)]">
                {d}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {ACTIVITY_DATA.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((val, di) => (
                  <div
                    key={di}
                    className="h-5 bg-[var(--ink)] transition-opacity"
                    style={{ opacity: val === 0 ? 0.04 : (val / maxVal) * 0.85 + 0.15 }}
                    title={`${val} etkileşim`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative size-11 shrink-0">
      <svg className="size-11 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-[var(--ink-subtle)]"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="square"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-label tabular-nums text-[var(--ink)]">
        {score}
      </span>
    </div>
  );
}

function SignalStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4">
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ink)]/12" />
      <div className="mb-2 flex items-center justify-between gap-2 pl-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="pl-1 font-display font-serif text-2xl leading-none text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
      >
        {value}
      </p>
      <p className="mt-1.5 pl-1 font-mono text-[9px] tracking-wide text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

function ThemeCard({ theme, index }: { theme: Theme; index: number }) {
  const cfg = MOMENTUM_CONFIG[theme.momentum];
  const Icon = cfg.icon;
  const rising = theme.momentum === "yüksek";

  return (
    <article
      className={[
        "group relative overflow-hidden border bg-[var(--bone)] p-4 transition-colors sm:p-5",
        rising
          ? "border-[var(--ink)]/[0.12] hover:border-[var(--ink)]/30"
          : "border-[var(--ink)]/[0.1] hover:border-[var(--ink)]/25",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: cfg.accent }}
      />

      <div className="flex flex-col gap-3 pl-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-[var(--ink-subtle)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={[
                "inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                cfg.tone,
              ].join(" ")}
            >
              <Icon className="size-2.5" />
              {cfg.label}
            </span>
          </div>
          <h3
            className="font-display font-serif text-lg leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
          >
            {cleanDisplayText(theme.topic)}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-[54ch] text-sm leading-relaxed text-[var(--ink-body)]">
            {theme.summary}
          </p>
        </div>

        <Link
          href="/panel/chat"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bone)] sm:self-center"
        >
          <MessageSquare className="size-3" />
          Chat&apos;te takip et
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

function ConnectionCard({ conn }: { conn: Connection }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 transition-colors hover:border-[var(--ink)]/28 sm:p-5">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--inner-green)]/50 transition-colors group-hover:bg-[var(--inner-green)]"
      />

      <div className="mb-3 flex items-start gap-3 pl-1">
        <PersonAvatar
          name={conn.name}
          initials={conn.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
          className="size-11 text-caption"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-display font-serif text-lg leading-tight text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            >
              {cleanDisplayText(conn.name)}
            </h3>
            <ScoreRing score={conn.matchScore} />
          </div>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
            Uyum %{conn.matchScore}
          </p>
        </div>
      </div>

      <p className="mb-4 flex-1 pl-1 text-sm leading-relaxed text-[var(--ink-body)] line-clamp-3">
        {conn.reason}
      </p>

      <Link
        href="/panel/match"
        className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-1.5 bg-[var(--ink)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85"
      >
        Tanışma talebi
        <ArrowRight className="size-3" />
      </Link>
    </article>
  );
}

const CACHE_PREFIX = "inner_signal_visual:";

function insightCacheKey(insight: string) {
  return `${CACHE_PREFIX}${insight.slice(0, 160)}`;
}

function readCachedVisual(insight: string): string | null {
  try {
    const raw = sessionStorage.getItem(insightCacheKey(insight));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { url: string; at: number };
    return parsed.url || null;
  } catch {
    return null;
  }
}

function writeCachedVisual(insight: string, url: string) {
  sessionStorage.setItem(
    insightCacheKey(insight),
    JSON.stringify({ url, at: Date.now() }),
  );
}

function scrollToSection(id: SectionId) {
  document.getElementById(`signal-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Signal() {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [activeJump, setActiveJump] = useState<SectionId>("insight");
  const reduce = useReducedMotion();

  const fetchSignal = async () => {
    setLoading(true);
    setError("");
    try {
      let userId: string | number = "guest";
      try {
        const meRes = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
        if (meRes.ok) {
          const me = await meRes.json();
          userId = me.user?.id ?? me.user?.email ?? "guest";
        }
      } catch {
        // Session yoksa guest ile devam
      }

      const res = await fetch(apiUrl("/api/ai/signal"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setUpdatedAt(new Date());
      const cached = readCachedVisual(json.insight);
      if (cached) {
        setImageUrl(cached);
        setFromCache(true);
      } else {
        setImageUrl(null);
        setFromCache(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sinyal alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const pollImage = async (requestId: string) => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const res = await fetch(apiUrl(`/api/ai/image/${requestId}`), {
        credentials: "include",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setImageStatus(json.status);
      if (json.status === "completed") {
        const url = json.images?.[0]?.url as string | undefined;
        if (!url) throw new Error("Görsel URL bulunamadı");
        setImageUrl(url);
        return url;
      }
      if (json.status === "failed" || json.status === "nsfw" || json.status === "canceled") {
        throw new Error(`Üretim başarısız: ${json.status}`);
      }
    }
    throw new Error("Zaman aşımı · görsel henüz hazır değil");
  };

  const generateInsightImage = async (force = false) => {
    if (!data?.insight) return;

    if (imageUrl && !force) {
      setImageError("Görsel hazır. Yeniden üretmek kredi harcar.");
      return;
    }

    const ok = window.confirm(
      force
        ? "Yeniden üretim ~0.25–1 kredi harcar. Devam?"
        : "Tek görsel üretilir (720p, kredi-tasarruflu). Devam?",
    );
    if (!ok) return;

    setImageLoading(true);
    setImageError("");
    if (force) setImageUrl(null);
    setFromCache(false);
    setImageStatus("queued");
    try {
      const res = await fetch(apiUrl("/api/ai/image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          insight: data.insight,
          cacheKey: insightCacheKey(data.insight),
          force,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Üretim başlatılamadı");
      let url: string | undefined = json.images?.[0]?.url;
      if (json.status === "completed" && url) {
        setImageUrl(url);
        setImageStatus("completed");
      } else {
        if (!json.request_id) throw new Error("request_id alınamadı");
        url = await pollImage(json.request_id);
      }
      if (url) writeCachedVisual(data.insight, url);
    } catch (e: unknown) {
      setImageError(e instanceof Error ? e.message : "Üretim hatası");
    } finally {
      setImageLoading(false);
      setImageStatus("");
    }
  };

  const copyInsight = async () => {
    if (!data?.insight) return;
    try {
      await navigator.clipboard.writeText(data.insight);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    fetchSignal();
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  const jumps: { id: SectionId; label: string }[] = [
    { id: "insight", label: "İçgörü" },
    { id: "themes", label: "Temalar" },
    { id: "people", label: "Bağlantılar" },
    { id: "activity", label: "Aktivite" },
  ];

  const risingCount = data?.weeklyThemes.filter((t) => t.momentum === "yüksek").length ?? 0;
  const avgMatchScore =
    data && data.connections.length > 0
      ? Math.round(data.connections.reduce((sum, c) => sum + c.matchScore, 0) / data.connections.length)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              AI layer
            </p>
            <h1
              className="font-display font-serif text-4xl text-[var(--ink)] md:text-5xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
            >
              <Lockup suffix="signal" className="text-[var(--ink)]" />
            </h1>
            <p className="mt-2 max-w-[42ch] text-sm font-light text-[var(--ink-muted)]">
              Topluluk hafızasından senin için çıkarılan sinyaller. Oku, kaydet, harekete geç.
            </p>
            {updatedAt && !loading && (
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                Son güncelleme ·{" "}
                {updatedAt.toLocaleString("tr-TR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={fetchSignal}
            disabled={loading}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85 disabled:opacity-35"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analiz…" : "Güncelle"}
          </button>
        </div>
      </FadeIn>

      {!loading && data && (
        <FadeIn delay={0.02}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SignalStat label="Aktif Sinyal" value={String(data.weeklyThemes.length)} sub="haftalık tema" icon={Zap} />
            <SignalStat label="Yükselen" value={String(risingCount)} sub="momentum yüksek" icon={TrendingUp} />
            <SignalStat label="Bağlantı" value={String(data.connections.length)} sub="bu hafta önerilen" icon={Users} />
            <SignalStat
              label="Ort. Uyum"
              value={avgMatchScore !== null ? String(avgMatchScore) : "·"}
              sub="eşleşme skoru"
              icon={Target}
            />
          </div>
        </FadeIn>
      )}

      {!loading && data && (
        <FadeIn delay={0.03}>
          <div className="-mx-1 flex gap-2 overflow-x-auto border-b border-[var(--ink)]/[0.08] px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {jumps.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => {
                  setActiveJump(j.id);
                  scrollToSection(j.id);
                }}
                className={[
                  "shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors min-h-10",
                  activeJump === j.id
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-body)] hover:border-[var(--ink)]/35 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {j.label}
              </button>
            ))}
          </div>
        </FadeIn>
      )}

      {loading ? (
        <LoadingBlock label="Sinyaller analiz ediliyor">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSignal} />
      ) : data ? (
        <>
          {/* Insight hero */}
          <FadeIn delay={0.04}>
            <section id="signal-insight" className="scroll-mt-4">
              <div className="relative overflow-hidden border border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--bone)] md:p-8">
                <AmbientCardBackground />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-10 select-none font-serif text-[10rem] italic leading-none text-[var(--bone)]/[0.06] md:text-[13rem]"
                >
                  &rdquo;
                </span>

                <div className="relative z-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Zap className="size-3.5 text-[var(--success-ink)]" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--bone)]/62">
                      Bu haftanın içgörüsü
                    </span>
                    <span className="ml-auto size-3 bg-[var(--inner-green)]" aria-hidden />
                  </div>
                  <p
                    className="max-w-[38ch] font-serif text-2xl leading-snug md:text-3xl"
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
                  >
                    {data.insight}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyInsight}
                      className="inline-flex items-center gap-2 border border-[var(--bone)]/25 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/80 transition-colors hover:border-[var(--bone)]/50 hover:text-[var(--bone)]"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied ? "Kopyalandı" : "İçgörüyü kopyala"}
                    </button>
                    <Link
                      href="/panel/chat"
                      className="inline-flex items-center gap-2 border border-[var(--bone)]/25 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/80 transition-colors hover:border-[var(--bone)]/50 hover:text-[var(--bone)]"
                    >
                      <MessageSquare className="size-3" /> Chat’te aç
                    </Link>
                    {!imageUrl ? (
                      <button
                        type="button"
                        onClick={() => generateInsightImage(false)}
                        disabled={imageLoading}
                        className="inline-flex items-center gap-2 border border-[var(--bone)] bg-[var(--bone)] px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        {imageLoading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <ImageIcon className="size-3" />
                        )}
                        {imageLoading
                          ? `Üretiliyor · ${imageStatus || "kuyruk"}`
                          : "Görsel üret · 720p"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => generateInsightImage(true)}
                        disabled={imageLoading}
                        className="inline-flex items-center gap-2 border border-[var(--bone)]/20 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/62 transition-colors hover:text-[var(--bone)]/80 disabled:opacity-40"
                      >
                        {imageLoading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3" />
                        )}
                        Yeniden üret
                      </button>
                    )}
                  </div>

                  {(fromCache || imageError) && (
                    <p className="mt-3 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57">
                      {imageError || (fromCache ? "Görsel önbellekten · ekstra kredi yok" : null)}
                    </p>
                  )}
                </div>
              </div>

              {imageUrl && (
                <>
                  {!lightboxOpen && (
                    <motion.button
                      type="button"
                      layoutId={reduce ? undefined : "signal-visual-frame"}
                      onClick={() => setLightboxOpen(true)}
                      className="group relative mt-3 block w-full overflow-hidden border border-[var(--ink)]/[0.1] text-left"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: reduce ? 0 : 0.45 }}
                    >
                      <img
                        src={imageUrl}
                        alt="Haftalık sinyal görseli"
                        className="aspect-[21/9] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--ink-fixed)]/60 to-transparent px-4 py-3">
                        <span className="font-mono text-label uppercase tracking-widest text-white/85">
                          Büyüt · editorial
                        </span>
                      </span>
                    </motion.button>
                  )}

                  <AnimatePresence>
                    {lightboxOpen && (
                      <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink)]/75 p-4"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        onClick={() => setLightboxOpen(false)}
                      >
                        <button
                          type="button"
                          className="absolute right-4 top-4 text-[var(--bone)]/70 hover:text-[var(--bone)]"
                          onClick={() => setLightboxOpen(false)}
                          aria-label="Kapat"
                        >
                          <X className="size-5" />
                        </button>
                        <motion.div
                          layoutId={reduce ? undefined : "signal-visual-frame"}
                          className="max-h-[85vh] w-full max-w-5xl overflow-hidden border border-[var(--bone)]/10"
                          onClick={(e) => e.stopPropagation()}
                          transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <img
                            src={imageUrl}
                            alt="Haftalık sinyal görseli"
                            className="max-h-[85vh] w-full object-contain"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </section>
          </FadeIn>

          {/* Themes */}
          <FadeIn delay={0.06}>
            <section id="signal-themes" className="scroll-mt-4">
              <div className="mb-4 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                    Haftalık temalar
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Topluluktan çıkan bu haftanın sinyalleri
                  </p>
                </div>
                <span className="flex size-6 shrink-0 items-center justify-center bg-[var(--ink)] font-mono text-[10px] text-[var(--bone)]">
                  {data.weeklyThemes.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {data.weeklyThemes.map((theme, i) => (
                  <ThemeCard key={`${theme.topic}-${i}`} theme={theme} index={i} />
                ))}
              </div>
            </section>
          </FadeIn>

          {/* Connections */}
          <FadeIn delay={0.08}>
            <section id="signal-people" className="scroll-mt-4">
              <div className="mb-4 flex items-end justify-between gap-3 border-t border-[var(--ink)]/[0.08] pt-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                    Bu hafta tanış
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Uyum skoruna göre önerilen bağlantılar
                  </p>
                </div>
                <Link
                  href="/panel/match"
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                >
                  Match <ArrowRight className="size-3" />
                </Link>
              </div>
              {data.connections.length === 0 ? (
                <p className="text-sm text-[var(--ink-muted)]">Bu hafta bağlantı önerisi yok.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.connections.map((conn, i) => (
                    <ConnectionCard key={`${conn.name}-${i}`} conn={conn} />
                  ))}
                </div>
              )}
            </section>
          </FadeIn>

          {/* Activity */}
          <FadeIn delay={0.1}>
            <section
              id="signal-activity"
              className="scroll-mt-4 border border-[var(--ink)]/[0.08] p-5"
            >
              <ActivityHeatmap />
            </section>
          </FadeIn>
        </>
      ) : null}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="text-xs text-[var(--ink-subtle)]">
          <span lang="en">inner·signal</span>
          {" · "}
          Claude + Higgsfield · haftalık güncellenir · görsel üretimi kredi kullanır
        </p>
      </div>
    </div>
  );
}
