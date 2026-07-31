import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Sparkles, X } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";

type JourneyTask = {
  id: string;
  done: boolean;
  href: string;
  phase: 1 | 2;
};

type JourneyBadge = {
  id: string;
  unlocked: boolean;
};

type JourneySnapshot = {
  level: number;
  levelLabelKey: string;
  xp: number;
  xpToNext: number;
  completed: number;
  total: number;
  nextTaskId: string | null;
  tasks: JourneyTask[];
  badges: JourneyBadge[];
  dismissedCard: boolean;
  profileCompletionPct: number;
};

const ONBOARDING_LS = "inner_onboarding_v1";

function onboardingFinished(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_LS) === "done";
  } catch {
    return true;
  }
}

export function MemberJourneyCard() {
  const t = useT();
  const { data, isLoading, refetch } = useApiQuery<{ journey: JourneySnapshot }>(
    ["journey"],
    "/api/journey",
  );
  const [hiding, setHiding] = useState(false);
  const [tourDone, setTourDone] = useState(() =>
    typeof window === "undefined" ? true : onboardingFinished(),
  );

  useEffect(() => {
    setTourDone(onboardingFinished());
    const onStorage = () => setTourDone(onboardingFinished());
    window.addEventListener("storage", onStorage);
    const id = window.setInterval(() => {
      if (onboardingFinished()) {
        setTourDone(true);
        window.clearInterval(id);
      }
    }, 800);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, []);

  const journey = data?.journey;

  if (!tourDone) return null;
  if (isLoading && !journey) return null;
  if (!journey) return null;
  if (journey.dismissedCard && journey.completed < journey.total) return null;
  if (journey.completed >= journey.total && journey.dismissedCard) return null;

  const next = journey.tasks.find((task) => task.id === journey.nextTaskId);
  const phase1 = journey.tasks.filter((task) => task.phase === 1);
  const phase2 = journey.tasks.filter((task) => task.phase === 2);
  const progressPct = Math.round((journey.completed / Math.max(1, journey.total)) * 100);

  const dismiss = async () => {
    setHiding(true);
    try {
      await fetch(apiUrl("/api/journey/dismiss"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismiss: true }),
      });
      await refetch();
    } catch {
      setHiding(false);
    }
  };

  if (hiding) return null;

  return (
    <section className="panel-glass relative overflow-hidden p-5 sm:p-6">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--inner-green)]"
      />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            <Sparkles className="size-3 text-[var(--inner-green)]" />
            {t("journey.eyebrow")}
          </p>
          <h2
            className="font-display font-serif text-xl leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-2xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
          >
            {t(journey.levelLabelKey as "journey.level1")}
            <span className="ml-2 font-mono text-sm not-italic tracking-widest text-[var(--ink-muted)]">
              Lv.{journey.level}
            </span>
          </h2>
          <p className="mt-1 max-w-[48ch] text-sm text-[var(--ink-body)]">{t("journey.subtitle")}</p>
        </div>
        {journey.completed < journey.total && (
          <button
            type="button"
            onClick={() => void dismiss()}
            className="shrink-0 p-2 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            aria-label={t("journey.dismiss")}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-4 pl-1">
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          <span>
            {journey.completed}/{journey.total} · {t("journey.progress")}
          </span>
          <span>%{progressPct}</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--ink)]/[0.08]">
          <div
            className="h-full bg-[var(--inner-green)] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {next && (
        <Link
          href={next.href}
          className="mt-5 flex items-center justify-between gap-3 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-4 py-3 transition-colors hover:bg-[var(--inner-green)]/16"
        >
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--inner-green)]">
              {t("journey.nextUp")}
            </p>
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              {t(`journey.tasks.${next.id}.title` as "journey.tasks.bio.title")}
            </p>
            <p className="truncate text-xs text-[var(--ink-muted)]">
              {t(`journey.tasks.${next.id}.body` as "journey.tasks.bio.body")}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[var(--ink)]">
            {t("journey.doIt")} <ArrowRight className="size-3.5" />
          </span>
        </Link>
      )}

      <div className="mt-5 grid gap-4 pl-1 sm:grid-cols-2">
        <TaskList label={t("journey.phase1")} tasks={phase1} t={t} />
        <TaskList label={t("journey.phase2")} tasks={phase2} t={t} />
      </div>

      <div className="mt-5 border-t border-[var(--ink)]/10 pt-4 pl-1">
        <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          <Award className="size-3" />
          {t("journey.badges")}
        </p>
        <div className="flex flex-wrap gap-2">
          {journey.badges.map((badge) => (
            <span
              key={badge.id}
              className={`inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
                badge.unlocked
                  ? "border-[var(--ink)]/20 bg-[var(--ink)]/[0.04] text-[var(--ink)]"
                  : "border-[var(--ink)]/10 text-[var(--ink-muted)]/45"
              }`}
              title={t(`journey.badge.${badge.id}.body` as "journey.badge.first_words.body")}
            >
              {t(`journey.badge.${badge.id}.title` as "journey.badge.first_words.title")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TaskList({
  label,
  tasks,
  t,
}: {
  label: string;
  tasks: JourneyTask[];
  t: (key: string) => string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">{label}</p>
      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className={`flex items-center gap-2 text-sm transition-colors ${
                task.done ? "text-[var(--ink-muted)] line-through" : "text-[var(--ink)] hover:text-[var(--inner-green)]"
              }`}
            >
              <span
                aria-hidden
                className={`size-1.5 shrink-0 rounded-full ${
                  task.done ? "bg-[var(--inner-green)]" : "bg-[var(--ink)]/25"
                }`}
              />
              {t(`journey.tasks.${task.id}.title`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
