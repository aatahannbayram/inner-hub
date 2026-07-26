import { useState, useEffect } from "react";
import { RefreshCw, Sparkles, ArrowRight, Check } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { HeroVideo } from "@/components/HeroVideo";
import { CourseCardSkeleton, LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { apiUrl } from "@/lib/api";
import { cleanDisplayText } from "@/lib/displayText";
import { Lockup } from "@/components/Lockup";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import { useT } from "@/i18n";

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
  "Mentor": { color: "text-[var(--ink-body)]", bg: "bg-[var(--ink)]/[0.04]", border: "border-[var(--ink)]/10" },
  "Yatırımcı": { color: "text-[var(--success-ink)]", bg: "bg-[var(--inner-green)]/10", border: "border-[var(--inner-green)]/25" },
  "İş birliği": { color: "text-[var(--ink-muted)]", bg: "bg-[var(--ink)]/[0.04]", border: "border-[var(--ink)]/10" },
};

function matchTypeLabel(type: Match["matchType"], t: (key: string) => string) {
  switch (type) {
    case "Co-founder":
      return t("match.typeCofounder");
    case "Mentor":
      return t("match.typeMentor");
    case "Yatırımcı":
      return t("match.typeInvestor");
    case "İş birliği":
      return t("match.typeCollab");
  }
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
        <div
          className="h-full bg-[var(--inner-green)] transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-caption text-[var(--ink-muted)]">
        %{score}
      </span>
    </div>
  );
}

const TYPE_ACCENT: Record<Match["matchType"], string> = {
  "Co-founder": "var(--ink)",
  "Mentor": "rgba(10,10,10,0.35)",
  "Yatırımcı": "var(--inner-green)",
  "İş birliği": "rgba(10,10,10,0.22)",
};

function MatchCard({
  match,
  index,
  initiallyIntroduced,
}: {
  match: Match;
  index: number;
  initiallyIntroduced?: boolean;
}) {
  const t = useT();
  const [introduced, setIntroduced] = useState(!!initiallyIntroduced);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = TYPE_CONFIG[match.matchType];
  const initials = match.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  useEffect(() => {
    if (initiallyIntroduced) setIntroduced(true);
  }, [initiallyIntroduced]);

  const requestIntro = async () => {
    if (introduced || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/match/introduce"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetName: match.name,
          targetCompany: match.company,
          matchType: match.matchType,
          reason: match.why,
          score: match.score,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("match.introduceFailed"));
      setIntroduced(true);
    } catch (e: any) {
      setError(e.message ?? t("match.introduceFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative flex flex-col panel-glass border-l-[3px] p-5 transition-all duration-200 hover:border-[var(--ink)]/20"
      style={{ animationDelay: `${index * 0.07}s`, borderLeftColor: TYPE_ACCENT[match.matchType] }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        <div className="relative shrink-0">
          <PersonAvatar name={match.name} initials={initials} className="size-16 font-serif text-2xl italic" />
          <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center bg-[var(--bone)] panel-glass">
            <Sparkles className="size-3 text-[var(--success-ink)]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className="font-display font-serif text-lg leading-tight text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
              >
                {cleanDisplayText(match.name)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                {match.company ? cleanDisplayText(match.company) : "·"}
              </p>
            </div>
            <span
              className={[
                "shrink-0 border px-2 py-0.5 font-mono text-label uppercase tracking-widest",
                cfg.color, cfg.bg, cfg.border,
              ].join(" ")}
            >
              {matchTypeLabel(match.matchType, t)}
            </span>
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs text-[var(--ink-muted)]">{t("match.compatibility")}</p>
            <ScoreBar score={match.score} />
          </div>
        </div>
      </div>

      {/* Why section */}
      <div className="mb-4 border-t border-[var(--ink)]/[0.06] pt-4">
        <p className="mb-1.5 text-xs text-[var(--ink-muted)]">{t("match.whyCompatible")}</p>
        <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink-body)]">{match.why}</p>
      </div>

      {/* Common ground */}
      <div className="mb-5">
        <p className="mb-2 text-xs text-[var(--ink-muted)]">{t("match.commonGround")}</p>
        <div className="flex flex-wrap gap-1.5">
          {match.commonGround.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="panel-glass px-2 py-0.5 text-xs text-[var(--ink-body)]"
            >
              {tag}
            </span>
          ))}
          {match.commonGround.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-[var(--ink-muted)]">
              +{match.commonGround.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto space-y-2">
        {error && (
          <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void requestIntro()}
          disabled={introduced || busy}
          className={[
            "flex min-h-11 w-full items-center justify-between border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all",
            introduced
              ? "cursor-default border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 text-[var(--success-ink)]"
              : "border-[var(--ink)]/15 text-[var(--ink-body)] hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40",
          ].join(" ")}
        >
          <span>
            {introduced ? t("match.introduceSent") : busy ? t("match.introducing") : t("match.introduce")}
          </span>
          {introduced ? (
            <Check className="size-3 text-[var(--success-ink)]" />
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

function MatchHero({ matchCount }: { matchCount: number }) {
  const t = useT();
  return (
    <div
      className="relative -mx-3 -mt-5 overflow-hidden sm:-mx-5 sm:-mt-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(62vh, 620px)", minHeight: 360 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video is bright/white — scrim needed for text legibility */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink-fixed)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--ink-fixed)]/85 via-[var(--ink-fixed)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[var(--ink-fixed)]/60 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <div className="mb-3">
              <Lockup suffix="match" className="text-white" fontSize="clamp(1.75rem, 4vw, 2.5rem)" />
            </div>
            <AnimatedHeading
              text={t("match.heroTitle")}
              className="mb-4 font-display font-serif italic text-3xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-sm text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base md:text-lg">
                {t("match.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToId("match-results")}
                  className="group inline-flex min-h-11 items-center gap-2 bg-white px-6 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:px-8"
                >
                  {t("match.viewMatches")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("match-preferences")}
                  className="liquid-glass group inline-flex min-h-11 items-center gap-2 border border-white/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black sm:px-8"
                >
                  {t("match.setPreferences")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 hidden items-end justify-start sm:flex lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={matchCount}
              label={t("match.foundStat")}
              tagline={t("match.heroTagline")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Match() {
  const t = useT();
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [introducedNames, setIntroducedNames] = useState<Set<string>>(new Set());

  const PREF_OPTIONS: { value: Match["matchType"]; label: string }[] = [
    { value: "Co-founder", label: t("match.typeCofounder") },
    { value: "Mentor", label: t("match.typeMentor") },
    { value: "Yatırımcı", label: t("match.typeInvestor") },
    { value: "İş birliği", label: t("match.typeCollab") },
  ];

  const togglePref = (p: string) => {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const loadIntroductions = async () => {
    try {
      const res = await fetch(apiUrl("/api/match/introductions"), { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      const names = new Set<string>(
        (json.introductions ?? [])
          .filter((r: { status: string }) => r.status === "pending" || r.status === "done")
          .map((r: { targetName: string }) => r.targetName),
      );
      setIntroducedNames(names);
    } catch {
      /* ignore */
    }
  };

  const fetchMatches = async () => {
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
        // session yoksa guest
      }

      const res = await fetch(apiUrl("/api/ai/match"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, preferences }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      await loadIntroductions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("match.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <MatchHero matchCount={data?.matches?.length ?? 0} />

      {/* Utility row */}
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-sm font-light text-[var(--ink-muted)] sm:block">
            {t("match.pageSubtitle")}
          </p>
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex min-h-11 shrink-0 items-center gap-2 panel-glass px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-30"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            {t("match.refresh")}
          </button>
        </div>
      </FadeIn>

      {/* Preference filter */}
      <div id="match-preferences" className="scroll-mt-6">
        <p className="mb-3 text-xs text-[var(--ink-muted)]">{t("match.lookingFor")}</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PREF_OPTIONS.map((p) => {
            const active = preferences.includes(p.value);
            return (
              <button
                key={p.value}
                onClick={() => togglePref(p.value)}
                className={[
                  "shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-all min-h-10",
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-body)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
          {preferences.length > 0 && (
            <button
              onClick={fetchMatches}
              className="shrink-0 border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--success-ink)] transition-all hover:bg-[var(--inner-green)]/10 min-h-10"
            >
              {t("match.filter")}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingBlock label={t("match.loading")}>
          <div className="space-y-3">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMatches} />
      ) : data?.matches ? (
        <>
          <div id="match-results" className="scroll-mt-6">
            <div className="mb-4 flex flex-col gap-1 border-t border-[var(--ink)]/[0.08] pt-4 sm:flex-row sm:items-baseline sm:justify-between">
              <h2
                className="font-display font-serif text-xl text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
              >
                {t("match.countLabel", { n: data.matches.length })}
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">{t("match.sortedBy")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.matches.map((match, i) => (
                <MatchCard
                  key={`${match.name}-${i}`}
                  match={match}
                  index={i}
                  initiallyIntroduced={introducedNames.has(match.name)}
                />
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="panel-glass p-5 sm:p-6 md:p-8">
            <h2
              className="mb-6 font-display font-serif text-lg text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
            >
              {t("match.howItWorks")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[var(--ink)]/[0.08] text-xs text-[var(--ink-body)] leading-relaxed">
              <div className="sm:pr-6">
                <span
                  className="mb-1.5 block font-display font-serif text-base text-[var(--ink)]"
                  style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
                >
                  {t("match.step1Title")}
                </span>
                {t("match.step1Body")}
              </div>
              <div className="sm:px-6">
                <span
                  className="mb-1.5 block font-display font-serif text-base text-[var(--ink)]"
                  style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
                >
                  {t("match.step2Title")}
                </span>
                {t("match.step2Body")}
              </div>
              <div className="sm:pl-6">
                <span
                  className="mb-1.5 block font-display font-serif text-base text-[var(--ink)]"
                  style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
                >
                  {t("match.step3Title")}
                </span>
                {t("match.step3Body")}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="text-xs text-[var(--ink-subtle)]">
          <span lang="en">inner·match</span>
          {" · "}
          {t("match.footer")}
        </p>
      </div>
    </div>
  );
}
