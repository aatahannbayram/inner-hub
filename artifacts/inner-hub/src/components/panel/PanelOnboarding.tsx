import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  LayoutDashboard,
  Menu,
  Sparkles,
  UserCircle,
  Users,
  Zap,
  X,
} from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";

const LS_KEY = "inner_onboarding_v1";
const EASE = [0.16, 1, 0.3, 1] as const;

type PrefsBlob = Record<string, unknown> & { onboardingCompleted?: boolean };
type Persona = "founder" | "investor" | "builder" | "company";

function isPersona(v: unknown): v is Persona {
  return v === "founder" || v === "investor" || v === "builder" || v === "company";
}

type WizardStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

type CoachTip = {
  id: string;
  target: string; // data-onboarding value
  title: string;
  body: string;
  prefer: "bottom" | "right" | "left" | "top";
};

function readLocalDone(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === "done";
  } catch {
    return false;
  }
}

function writeLocalDone() {
  try {
    localStorage.setItem(LS_KEY, "done");
  } catch {
    /* ignore */
  }
}

type Phase = "loading" | "wizard" | "coach" | "done";

export function PanelOnboarding({ userName }: { userName: string }) {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("loading");
  const [step, setStep] = useState(0);
  const [coachIdx, setCoachIdx] = useState(0);
  const [spot, setSpot] = useState<DOMRect | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const firstName = userName.trim().split(/\s+/)[0] || "orada";

  const wizard = useMemo<WizardStep[]>(() => {
    const steps: WizardStep[] = [
      {
        id: "welcome",
        eyebrow: t("onboarding.welcomeEyebrow"),
        title: t("onboarding.welcomeTitle"),
        body: t("onboarding.welcomeBody"),
        icon: Sparkles,
      },
      {
        id: "dashboard",
        eyebrow: t("onboarding.dashEyebrow"),
        title: t("onboarding.dashTitle"),
        body: t("onboarding.dashBody"),
        icon: LayoutDashboard,
      },
      {
        id: "signal",
        eyebrow: t("onboarding.signalEyebrow"),
        title: t("onboarding.signalTitle"),
        body: t("onboarding.signalBody"),
        icon: Zap,
      },
      {
        id: "community",
        eyebrow: t("onboarding.communityEyebrow"),
        title: t("onboarding.communityTitle"),
        body: t("onboarding.communityBody"),
        icon: Users,
      },
      {
        id: "profile",
        eyebrow: t("onboarding.profileEyebrow"),
        title: t("onboarding.profileTitle"),
        body: t("onboarding.profileBody"),
        icon: UserCircle,
      },
    ];
    if (persona) {
      steps.push({
        id: `persona-${persona}`,
        eyebrow: t("onboarding.persona.eyebrow"),
        title: t(`onboarding.persona.${persona}.title`),
        body: t(`onboarding.persona.${persona}.body`),
        icon: Briefcase,
      });
    }
    return steps;
  }, [t, persona]);

  const coach = useMemo<CoachTip[]>(() => {
    const tips: CoachTip[] = [
      {
        id: "nav",
        target: "nav",
        title: t("onboarding.coachNavTitle"),
        body: t("onboarding.coachNavBody"),
        prefer: "right",
      },
      {
        id: "notif",
        target: "notifications",
        title: t("onboarding.coachNotifTitle"),
        body: t("onboarding.coachNotifBody"),
        prefer: "bottom",
      },
      {
        id: "main",
        target: "main",
        title: t("onboarding.coachMainTitle"),
        body: t("onboarding.coachMainBody"),
        prefer: "top",
      },
    ];
    if (persona) {
      tips.splice(1, 0, {
        id: "persona",
        target: "nav",
        title: t(`onboarding.persona.${persona}.coachTitle`),
        body: t(`onboarding.persona.${persona}.coachBody`),
        prefer: "bottom",
      });
    }
    return tips;
  }, [t, persona]);

  useEffect(() => {
    if (readLocalDone()) {
      setPhase("done");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [settingsRes, meRes] = await Promise.all([
          fetch(apiUrl("/api/settings"), { credentials: "include" }),
          fetch(apiUrl("/api/auth/me"), { credentials: "include" }),
        ]);
        if (meRes.ok) {
          const meJson = (await meRes.json()) as { user?: { persona?: unknown } };
          if (!cancelled && isPersona(meJson.user?.persona)) {
            setPersona(meJson.user.persona);
          }
        }
        if (!settingsRes.ok) throw new Error("settings");
        const json = (await settingsRes.json()) as { prefs?: PrefsBlob };
        if (cancelled) return;
        if (json.prefs?.onboardingCompleted) {
          writeLocalDone();
          setPhase("done");
        } else {
          setPhase("wizard");
        }
      } catch {
        if (!cancelled) setPhase("wizard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistDone = useCallback(async () => {
    writeLocalDone();
    setPhase("done");
    try {
      const res = await fetch(apiUrl("/api/settings"), { credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as { prefs?: PrefsBlob };
      const prefs = { ...(json.prefs ?? {}), onboardingCompleted: true };
      await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs }),
      });
    } catch {
      /* local flag already set */
    }
  }, []);

  const finishWizard = () => {
    setCoachIdx(0);
    setPhase("coach");
  };

  const skipAll = () => {
    void persistDone();
  };

  // Measure coach target
  useEffect(() => {
    if (phase !== "coach") return;
    setSpot(null);
    const tip = coach[coachIdx];
    if (!tip) {
      void persistDone();
      return;
    }

    const measure = () => {
      const nodes = Array.from(
        document.querySelectorAll(`[data-onboarding="${tip.target}"]`),
      ) as HTMLElement[];
      const el = nodes.find((n) => {
        const r = n.getBoundingClientRect();
        const style = window.getComputedStyle(n);
        return r.width > 2 && r.height > 2 && style.visibility !== "hidden" && style.display !== "none";
      });
      if (!el) {
        if (coachIdx < coach.length - 1) setCoachIdx((i) => i + 1);
        else void persistDone();
        return;
      }
      setSpot(el.getBoundingClientRect());
    };

    // Allow layout to settle (esp. mobile)
    const timer = window.setTimeout(measure, 40);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [phase, coachIdx, coach, persistDone]);

  // Lock scroll while onboarding is open
  useEffect(() => {
    if (phase !== "wizard" && phase !== "coach") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "loading" || phase === "done") return null;

  const progress = ((step + 1) / wizard.length) * 100;
  const current = wizard[step];
  const Icon = current.icon;

  return (
    <AnimatePresence mode="wait">
      {phase === "wizard" ? (
        <motion.div
          key="wizard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[var(--ink-fixed)]/55 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden border border-white/10 panel-glass-strong shadow-2xl sm:max-h-[85svh]"
          >
            {/* Progress */}
            <div className="shrink-0 border-b border-[var(--ink)]/[0.08] px-5 pt-5 sm:px-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  Panel turu
                </p>
                <button
                  type="button"
                  onClick={skipAll}
                  className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                >
                  {t("onboarding.skip")}
                </button>
              </div>
              <div className="h-[2px] w-full overflow-hidden bg-[var(--ink)]/[0.08]">
                <motion.div
                  className="h-full bg-[var(--inner-green)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </div>
              <div className="mt-3 flex gap-1 overflow-x-auto pb-4">
                {wizard.map((s, i) => (
                  <span
                    key={s.id}
                    className={`shrink-0 font-mono text-[9px] uppercase tracking-widest sm:text-[10px] ${
                      i === step
                        ? "text-[var(--ink)]"
                        : i < step
                          ? "text-[var(--success-ink)]"
                          : "text-[var(--ink-subtle)]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                    {i < wizard.length - 1 ? <span className="mx-1.5 text-[var(--ink-subtle)]">·</span> : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-7 sm:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <div className="mb-5 flex size-11 items-center justify-center border border-[var(--ink)]/10 bg-[var(--ink)]/[0.04]">
                    <Icon className="size-5 text-[var(--ink)]" strokeWidth={1.5} />
                  </div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {current.eyebrow}
                  </p>
                  <h2
                    id="onboarding-title"
                    className="mb-3 font-serif text-3xl leading-[1.1] text-[var(--ink)] sm:text-4xl"
                  >
                    {step === 0 ? (
                      <>
                        Merhaba {firstName}.
                        <br />
                        <span className="italic">{current.title}</span>
                      </>
                    ) : (
                      <span className="italic">{current.title}</span>
                    )}
                  </h2>
                  <p className="max-w-[42ch] text-sm leading-relaxed text-[var(--ink-body)] sm:text-[15px]">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--ink)]/[0.08] px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:invisible"
              >
                Geri
              </button>
              {step < wizard.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 bg-[var(--ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-90"
                >
                  {t("onboarding.next")}
                  <ArrowUpRight className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishWizard}
                  className="inline-flex items-center gap-2 bg-[var(--ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-90"
                >
                  {t("onboarding.start")}
                  <ArrowUpRight className="size-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      {phase === "coach" && spot ? (
        <CoachOverlay
          key={`coach-${coachIdx}`}
          tip={coach[coachIdx]}
          spot={spot}
          index={coachIdx}
          total={coach.length}
          onNext={() => {
            if (coachIdx >= coach.length - 1) void persistDone();
            else setCoachIdx((i) => i + 1);
          }}
          onSkip={skipAll}
        />
      ) : null}
    </AnimatePresence>
  );
}

function CoachOverlay({
  tip,
  spot,
  index,
  total,
  onNext,
  onSkip,
}: {
  tip: CoachTip;
  spot: DOMRect;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const t = useT();
  const pad = 6;
  const hole = {
    top: Math.max(8, spot.top - pad),
    left: Math.max(8, spot.left - pad),
    width: spot.width + pad * 2,
    height: spot.height + pad * 2,
  };

  // Mobile: prefer bottom sheet-style placement; desktop respects tip.prefer
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  let cardTop = hole.top + hole.height + 12;
  let cardLeft = Math.min(hole.left, window.innerWidth - 300);
  if (isMobile) {
    cardTop = Math.min(hole.top + hole.height + 12, window.innerHeight - 200);
    cardLeft = 12;
  } else if (tip.prefer === "right") {
    cardTop = hole.top;
    cardLeft = hole.left + hole.width + 12;
  } else if (tip.prefer === "left") {
    cardTop = hole.top;
    cardLeft = Math.max(12, hole.left - 292);
  } else if (tip.prefer === "top") {
    cardTop = Math.max(12, hole.top - 140);
    cardLeft = hole.left;
  } else if (tip.prefer === "bottom") {
    cardTop = hole.top + hole.height + 12;
    cardLeft = hole.left;
  }
  // Clamp into viewport
  cardLeft = Math.max(12, Math.min(cardLeft, window.innerWidth - 292));
  cardTop = Math.max(12, Math.min(cardTop, window.innerHeight - 180));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90]"
      role="dialog"
      aria-modal="true"
      aria-label={tip.title}
    >
      {/* Darken with spotlight cutout via box-shadow trick on a clear rect */}
      <div
        className="pointer-events-none absolute rounded-none border border-[var(--inner-green)]/50"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          boxShadow: "0 0 0 9999px rgba(10, 10, 10, 0.62)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="absolute w-[min(280px,calc(100vw-24px))] border border-white/10 panel-glass-strong p-4 shadow-xl"
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            İpucu {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label={t("onboarding.skip")}
          >
            <X className="size-3.5" />
          </button>
        </div>
        <p className="mb-1 font-serif text-lg italic text-[var(--ink)]">
          {tip.title}
        </p>
        <p className="mb-4 text-xs leading-relaxed text-[var(--ink-body)]">{tip.body}</p>
        <div className="flex items-center justify-between gap-2">
          {tip.target === "nav" ? (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)] sm:hidden">
              <Menu className="size-3" /> Menü
            </span>
          ) : tip.target === "notifications" ? (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">
              <Bell className="size-3" />
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onNext}
            className="ml-auto inline-flex items-center gap-1.5 bg-[var(--ink)] px-3.5 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]"
          >
            {index >= total - 1 ? t("onboarding.done") : t("onboarding.next")}
            <ArrowUpRight className="size-3" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
