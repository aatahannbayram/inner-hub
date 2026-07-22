import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Zap, Users, Loader2, RefreshCw, ArrowRight, ImageIcon } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

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
const WEEKS = ["4 hafta önce", "3 hafta önce", "2 hafta önce", "Geçen hafta", "Bu hafta"];

const MOMENTUM_CONFIG = {
  yüksek: { icon: TrendingUp, color: "text-[var(--inner-green)]", bg: "bg-[var(--inner-green)]/10 border-[var(--inner-green)]/20", label: "Yükselen" },
  orta: { icon: Minus, color: "text-[var(--ink)]/50", bg: "bg-[var(--ink)]/[0.04] border-[var(--ink)]/10", label: "Stabil" },
  düşük: { icon: TrendingDown, color: "text-[var(--error)]", bg: "bg-[var(--error)]/5 border-[var(--error)]/15", label: "Düşen" },
};

function ActivityHeatmap() {
  const maxVal = Math.max(...ACTIVITY_DATA.flat());
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          Aktivite Haritası
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[var(--ink)]/25">Az</span>
          {[0.15, 0.3, 0.5, 0.7, 1].map((o, i) => (
            <span key={i} className="size-2.5 bg-[var(--ink)]" style={{ opacity: o }} />
          ))}
          <span className="font-mono text-[9px] text-[var(--ink)]/25">Çok</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col justify-between py-0.5 pr-2">
          {WEEKS.map((w) => (
            <span key={w} className="font-mono text-[8px] text-[var(--ink)]/20 leading-none">
              {w.slice(0, 2)}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <span key={d} className="text-center font-mono text-[8px] text-[var(--ink)]/25">{d}</span>
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
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--ink)]/10" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke="var(--inner-green)" strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="square"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="central" className="rotate-90 origin-center font-mono text-[10px] fill-[var(--ink)]" transform="rotate(90, 22, 22)">
        {score}
      </text>
    </svg>
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

export default function Signal() {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [fromCache, setFromCache] = useState(false);

  const fetchSignal = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "admin" }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      const cached = readCachedVisual(json.insight);
      if (cached) {
        setImageUrl(cached);
        setFromCache(true);
      } else {
        setImageUrl(null);
        setFromCache(false);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const pollImage = async (requestId: string) => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const res = await fetch(`/api/ai/image/${requestId}`);
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
    throw new Error("Zaman aşımı — görsel henüz hazır değil");
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
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (e: any) {
      setImageError(e.message);
    } finally {
      setImageLoading(false);
      setImageStatus("");
    }
  };

  useEffect(() => { fetchSignal(); }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
              inner·hub AI
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              inner·signal
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluk hafızasından senin için çıkarılan sinyaller.
            </p>
          </div>
          <button
            onClick={fetchSignal}
            disabled={loading}
            className="flex items-center gap-2 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-30"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Güncelle
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-[var(--ink)]/30" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink)]/30">
            AI sinyalleri analiz ediyor…
          </span>
        </div>
      ) : error ? (
        <div className="border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Insight banner */}
          <div className="border-l-2 border-[var(--inner-green)] bg-[var(--inner-green)]/5 px-5 py-4">
            <div className="mb-1 flex items-center gap-2">
              <Zap className="size-3.5 text-[var(--inner-green)]" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)]">
                Bu haftanın içgörüsü
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--ink)]/70">{data.insight}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!imageUrl ? (
                <button
                  onClick={() => generateInsightImage(false)}
                  disabled={imageLoading}
                  className="flex items-center gap-2 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-30"
                >
                  {imageLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <ImageIcon className="size-3" />
                  )}
                  {imageLoading
                    ? `Üretiliyor · ${imageStatus || "kuyruk"}`
                    : "Görsel üret (1× · 720p)"}
                </button>
              ) : (
                <button
                  onClick={() => generateInsightImage(true)}
                  disabled={imageLoading}
                  className="flex items-center gap-2 border border-[var(--ink)]/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30 transition-all hover:border-[var(--ink)]/30 hover:text-[var(--ink)]/60 disabled:opacity-30"
                >
                  {imageLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3" />
                  )}
                  Yeniden üret (kredi harcar)
                </button>
              )}
              {fromCache && imageUrl && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
                  Önbellekten · kredi yok
                </span>
              )}
              {imageError && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--error)]">
                  {imageError}
                </span>
              )}
            </div>
            {imageUrl && (
              <div className="mt-4 overflow-hidden border border-[var(--ink)]/10">
                <img
                  src={imageUrl}
                  alt="Haftalık sinyal görseli"
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Weekly themes */}
          <section>
            <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Haftalık Temalar
              </p>
            </div>
            <div className="space-y-3">
              {data.weeklyThemes.map((theme, i) => {
                const cfg = MOMENTUM_CONFIG[theme.momentum];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`flex gap-4 border p-4 ${cfg.bg}`}>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <Icon className={`size-4 ${cfg.color}`} />
                      <span className={`font-mono text-[8px] uppercase tracking-widest ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium text-[var(--ink)]">{theme.topic}</p>
                      <p className="text-xs leading-relaxed text-[var(--ink)]/50">{theme.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Activity heatmap */}
          <section className="border border-[var(--ink)]/[0.08] p-5">
            <ActivityHeatmap />
          </section>

          {/* Connection suggestions */}
          <section>
            <div className="mb-4 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <Users className="size-4 text-[var(--ink)]/40" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Bu Hafta Tanışman Gereken
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.connections.map((conn, i) => (
                <div key={i} className="flex items-start gap-4 border border-[var(--ink)]/[0.08] p-4 hover:border-[var(--ink)]/20 transition-colors">
                  <div className="flex size-10 shrink-0 items-center justify-center bg-[var(--ink)] font-mono text-[11px] uppercase text-[var(--bone)]">
                    {conn.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-[var(--ink)]">{conn.name}</p>
                      <ScoreRing score={conn.matchScore} />
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--ink)]/50">{conn.reason}</p>
                    <button className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors">
                      Tanışma Talebi <ArrowRight className="size-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·signal — Claude + Higgsfield · Haftalık güncellenir
        </p>
      </div>
    </div>
  );
}
