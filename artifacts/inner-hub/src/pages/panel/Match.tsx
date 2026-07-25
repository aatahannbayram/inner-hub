import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Sparkles, ArrowRight, Check } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { avatarColor } from "@/lib/avatarColor";

interface Match {
  name: string;
  company: string;
  matchType: "Co-founder" | "Mentor" | "Yatırımcı" | "İş birliği";
  score: number;
  why: string;
  commonGround: string[];
}

interface MatchData {
  matches: Match[];
}

const TYPE_CONFIG: Record<Match["matchType"], { color: string; bg: string; border: string }> = {
  "Co-founder": { color: "text-[var(--ink)]", bg: "bg-[var(--ink)]/[0.06]", border: "border-[var(--ink)]/15" },
  "Mentor": { color: "text-[var(--ink)]/60", bg: "bg-[var(--ink)]/[0.04]", border: "border-[var(--ink)]/10" },
  "Yatırımcı": { color: "text-[var(--inner-green)]", bg: "bg-[var(--inner-green)]/10", border: "border-[var(--inner-green)]/25" },
  "İş birliği": { color: "text-[var(--ink)]/50", bg: "bg-[var(--ink)]/[0.04]", border: "border-[var(--ink)]/10" },
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
        <div
          className="h-full bg-[var(--inner-green)] transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-[11px] text-[var(--ink)]/50">
        %{score}
      </span>
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const [introduced, setIntroduced] = useState(false);
  const cfg = TYPE_CONFIG[match.matchType];
  const initials = match.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      className="flex flex-col border border-[var(--ink)]/[0.08] p-5 transition-all duration-200 hover:border-[var(--ink)]/20"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className="flex size-12 items-center justify-center font-mono text-[13px] uppercase text-[var(--bone)]"
            style={{ backgroundColor: avatarColor(match.name) }}
          >
            {initials}
          </div>
          <div className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center bg-[var(--bone)] border border-[var(--ink)]/10">
            <Sparkles className="size-2.5 text-[var(--ink)]/40" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium leading-tight text-[var(--ink)]">{match.name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-[var(--ink)]/35">{match.company}</p>
            </div>
            <span
              className={[
                "shrink-0 border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest",
                cfg.color, cfg.bg, cfg.border,
              ].join(" ")}
            >
              {match.matchType}
            </span>
          </div>
          <div className="mt-3">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25">
              Uyumluluk
            </p>
            <ScoreBar score={match.score} />
          </div>
        </div>
      </div>

      {/* Why section */}
      <div className="mb-4 border-t border-[var(--ink)]/[0.06] pt-4">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
          Neden uyumlu?
        </p>
        <p className="text-sm leading-relaxed text-[var(--ink)]/55">{match.why}</p>
      </div>

      {/* Common ground */}
      <div className="mb-5">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
          Ortak Zemin
        </p>
        <div className="flex flex-wrap gap-1.5">
          {match.commonGround.map((tag) => (
            <span
              key={tag}
              className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[9px] text-[var(--ink)]/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <button
          onClick={() => setIntroduced(true)}
          disabled={introduced}
          className={[
            "flex w-full items-center justify-between border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all",
            introduced
              ? "border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 text-[var(--inner-green)] cursor-default"
              : "border-[var(--ink)]/15 text-[var(--ink)]/40 hover:border-[var(--ink)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          <span>{introduced ? "Tanışma Talebi Gönderildi" : "Tanıştır"}</span>
          {introduced ? (
            <Check className="size-3 text-[var(--inner-green)]" />
          ) : (
            <ArrowRight className="size-3" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function MatchHero() {
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
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
      />

      {/* Video is bright/white — scrim needed for text legibility */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[var(--ink)]/60 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              inner·match
            </p>
            <AnimatedHeading
              text={"Where trust\nfinds its people."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                Co-founder, mentor, and investor matching — curated inside the circle, guided by trust.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToId("match-results")}
                  className="group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  View Matches
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("match-preferences")}
                  className="liquid-glass group inline-flex items-center gap-2 border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  Set Preferences
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Co-founders. Mentors. Investors.
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

export default function Match() {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const PREF_OPTIONS = ["Co-founder", "Mentor", "Yatırımcı", "İş birliği"];

  const togglePref = (p: string) => {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "admin", preferences }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <MatchHero />

      {/* Utility row */}
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--ink)]/50 font-light">
            Topluluktaki en uyumlu bağlantıların AI ile seçilmiş listesi.
          </p>
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-30"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </FadeIn>

      {/* Preference filter */}
      <div id="match-preferences" className="scroll-mt-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
          Arıyor olduğun
        </p>
        <div className="flex flex-wrap gap-2">
          {PREF_OPTIONS.map((p) => {
            const active = preferences.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePref(p)}
                className={[
                  "border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-all",
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink)]/40 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}
          {preferences.length > 0 && (
            <button
              onClick={fetchMatches}
              className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)] transition-all hover:bg-[var(--inner-green)]/10"
            >
              Filtrele →
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-[var(--ink)]/30" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink)]/30">
            AI eşleşmeleri hesaplıyor…
          </span>
        </div>
      ) : error ? (
        <div className="border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">{error}</p>
        </div>
      ) : data?.matches ? (
        <>
          <div id="match-results" className="scroll-mt-6">
            <div className="mb-4 border-t border-[var(--ink)]/[0.08] pt-3 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                {data.matches.length} Eşleşme Bulundu
              </p>
              <p className="font-mono text-[9px] text-[var(--ink)]/20">
                AI güven skoru ile sıralandı
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.matches.map((match, i) => (
                <MatchCard key={`${match.name}-${i}`} match={match} index={i} />
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="border border-[var(--ink)]/[0.06] p-5">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              Nasıl Çalışır?
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-xs text-[var(--ink)]/40 leading-relaxed">
              <div>
                <span className="block font-mono text-[10px] text-[var(--ink)]/60 mb-1">01 Profil Analizi</span>
                Üye sektörü, deneyimi ve topluluk etkileşimleri analiz edilir.
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[var(--ink)]/60 mb-1">02 Vektör Eşleşme</span>
                Claude Haiku benzerlik skoru hesaplar, ortak zemin bulur.
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[var(--ink)]/60 mb-1">03 İnsan Onayı</span>
                "Tanıştır" butonuna basarsan inner ekibi devreye girer.
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·match — claude-haiku-4-5-20251001 ile güçlendirilmiş · Haftalık güncellenir
        </p>
      </div>
    </div>
  );
}
