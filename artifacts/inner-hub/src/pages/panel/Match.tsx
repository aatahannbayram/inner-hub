import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Sparkles, ArrowRight, Check } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

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
          <div className="flex size-12 items-center justify-center bg-[var(--ink)] font-mono text-[13px] uppercase text-[var(--bone)]">
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
        <p className="text-xs leading-relaxed text-[var(--ink)]/55">{match.why}</p>
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
              inner·match
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluktaki en uyumlu bağlantıların AI ile seçilmiş listesi.
            </p>
          </div>
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex items-center gap-2 border border-[var(--ink)]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-30"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </FadeIn>

      {/* Preference filter */}
      <div>
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
          <div>
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
