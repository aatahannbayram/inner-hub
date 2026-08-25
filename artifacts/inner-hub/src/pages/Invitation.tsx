"use client";

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Building2, Check, Rocket, TrendingUp, Wrench } from "lucide-react";
import { HeroVideo } from "@/components/HeroVideo";
import { Lockup } from "@/components/Lockup";
import { LocaleToggle, useLocale, useLocalizedHref, useT } from "@/i18n";
import { localizedPath } from "@/i18n/localePath";
import { useSeo } from "@/lib/seo";
import { useSubmitRequest } from "@workspace/api-client-react";
import { trackEvent } from "@/lib/analytics";

const INVITE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";

const EASE = [0.16, 1, 0.3, 1] as const;

const ROLE_DEFS = [
  { value: "founder" as const, icon: Rocket },
  { value: "investor" as const, icon: TrendingUp },
  { value: "builder" as const, icon: Wrench },
  { value: "company" as const, icon: Building2 },
];

type Role = (typeof ROLE_DEFS)[number]["value"];

const STEP_IDS = ["role", "identity", "org", "story", "intro"] as const;

/** Kullanıcı "flexlore.com" da yazsa "https://www.flexlore.com/" da yapıştırsa aynı çıplak domain'e indirger. */
function normalizeDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

const fieldClass =
  "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3.5 text-[15px] text-[var(--bone-fixed)] shadow-none placeholder:text-white/35 focus-visible:border-[var(--inner-green)] focus-visible:outline-none focus-visible:ring-0 transition-colors";

export default function Invitation() {
  const t = useT();
  const { locale } = useLocale();
  const homeHref = useLocalizedHref("/");
  const { mutate: submitRequest, isSuccess, isError, isPending } = useSubmitRequest();

  useSeo({
    title: t("invite.metaTitle"),
    description: t("invite.metaDescription"),
    canonicalPath: localizedPath("/invitation", locale),
  });

  const roles = useMemo(
    () =>
      ROLE_DEFS.map((r) => ({
        ...r,
        label:
          r.value === "founder"
            ? t("invite.roleFounder")
            : r.value === "investor"
              ? t("invite.roleInvestor")
              : r.value === "builder"
                ? t("invite.roleBuilder")
                : t("invite.roleCompany"),
        hint:
          r.value === "founder"
            ? t("invite.roleFounderHint")
            : r.value === "investor"
              ? t("invite.roleInvestorHint")
              : r.value === "builder"
                ? t("invite.roleBuilderHint")
                : t("invite.roleCompanyHint"),
      })),
    [t],
  );

  const steps = useMemo(
    () => [
      { id: STEP_IDS[0], title: t("invite.stepRole") },
      { id: STEP_IDS[1], title: t("invite.stepIdentity") },
      { id: STEP_IDS[2], title: t("invite.stepOrg") },
      { id: STEP_IDS[3], title: t("invite.stepStory") },
      { id: STEP_IDS[4], title: t("invite.stepIntro") },
    ],
    [t],
  );

  const stepCopy = (s: number, r: Role | null) => {
    if (s === 0) return t("invite.copyRole");
    if (s === 1) return t("invite.copyIdentity");
    if (s === 2) {
      if (r === "investor") return t("invite.copyOrgInvestor");
      if (r === "company") return t("invite.copyOrgCompany");
      return t("invite.copyOrgDefault");
    }
    if (s === 3) return t("invite.copyStory");
    return t("invite.copyIntro");
  };

  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationDomain, setOrganizationDomain] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [organizationDescription, setOrganizationDescription] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [whoYouAre, setWhoYouAre] = useState("");
  const [whoIntroduced, setWhoIntroduced] = useState("");
  const [fax, setFax] = useState(""); // honeypot

  useEffect(() => {
    if (!isSuccess) return;
    trackEvent("invite_request_submitted", { role: role ?? "unknown" });
  }, [isSuccess, role]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBootProgress(100);
      setBooting(false);
      return;
    }

    let raf = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;
    let finished = false;
    const start = performance.now();
    const duration = 1100;

    const finish = () => {
      if (finished) return;
      finished = true;
      setBootProgress(100);
      finishTimer = setTimeout(() => setBooting(false), 120);
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const p = 1 - Math.pow(1 - t, 3);
      setBootProgress(Math.round(p * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    raf = requestAnimationFrame(tick);
    const failsafe = setTimeout(finish, 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, []);

  // Auto-suggest domain from corporate email once identity is filled
  useEffect(() => {
    if (organizationDomain.trim()) return;
    const at = email.lastIndexOf("@");
    if (at < 0) return;
    const d = email.slice(at + 1).toLowerCase();
    const consumer = [
      "gmail.com",
      "googlemail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "proton.me",
      "protonmail.com",
    ];
    if (d && d.includes(".") && !consumer.includes(d)) {
      setOrganizationDomain(d);
    }
  }, [email, organizationDomain]);

  // Domain değiştiğinde kurum adı + logosunu otomatik çek (Stage'deki link
  // önizleme modülüyle aynı altyapı: og:site_name/<title> + favicon fallback).
  useEffect(() => {
    const domain = normalizeDomainInput(organizationDomain);
    if (!domain || !domain.includes(".")) {
      setOrganizationLogo(null);
      setOrganizationDescription(null);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLogoLoading(true);
      try {
        const res = await fetch(`/api/org-logo?domain=${encodeURIComponent(domain)}`);
        if (!res.ok) {
          if (!cancelled) setOrganizationLogo(null);
          return;
        }
        const data = (await res.json()) as { logoUrl?: string; name?: string; description?: string };
        if (cancelled) return;
        setOrganizationLogo(data.logoUrl ?? null);
        setOrganizationDescription(data.description?.trim() || null);
        if (data.name) {
          // Kullanıcı zaten kurum adı yazdıysa üzerine yazma.
          setOrganization((current) => (current.trim() ? current : data.name ?? current));
        }
      } catch {
        if (!cancelled) setOrganizationLogo(null);
      } finally {
        if (!cancelled) setLogoLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [organizationDomain]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  const orgRequired = role === "investor" || role === "company";

  const canNext = (() => {
    if (step === 0) return role != null;
    if (step === 1) return name.trim().length > 1 && email.includes("@");
    if (step === 2) {
      if (orgRequired) return organization.trim().length > 1;
      return true;
    }
    if (step === 3) return whoYouAre.trim().length >= 12;
    if (step === 4) return true;
    return false;
  })();

  const goNext = () => {
    if (!canNext) return;
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!role || !canNext) return;
    const domain = normalizeDomainInput(organizationDomain);
    submitRequest({
      data: {
        name: name.trim(),
        email: email.trim(),
        role,
        linkedin: linkedin || null,
        whoYouAre: whoYouAre.trim(),
        link: domain ? `https://${domain}` : null,
        whoIntroduced: whoIntroduced || null,
        organization: organization.trim() || null,
        organizationDomain: organizationDomain.trim() || null,
        organizationLogo: organizationLogo || null,
        organizationDescription: organizationDescription || null,
        fax: fax || null,
        company: null,
      },
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();
    if (step < steps.length - 1) goNext();
    else handleSubmit();
  };

  return (
    <div lang={locale} className="cinematic-surface relative flex min-h-svh flex-col overflow-hidden bg-[var(--ink-fixed)] text-[var(--bone-fixed)]">
      <HeroVideo
        src={INVITE_VIDEO}
        className="fixed inset-0 z-0 h-full w-full scale-[1.03] object-cover"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] bg-black/55" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/45 to-black/75"
      />
      <div
        aria-hidden
        className="noise-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.25] mix-blend-overlay"
      />

      <header className="relative z-20 flex h-[60px] shrink-0 items-center justify-between px-5 md:h-[72px] md:px-10 lg:px-[8%]">
        <a href="/" className="inline-flex focus-visible:outline-none">
          <Lockup className="text-[var(--bone-fixed)]" fontSize="clamp(22px, 2.4vw, 30px)" pulse />
        </a>
        <div className="flex items-center gap-3 sm:gap-4">
          <LocaleToggle tone="dark" />
          <a
            href="/panel"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white/80 sm:text-xs"
          >
            {t("invite.memberLogin")}
          </a>
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-widest text-white/55 transition-colors hover:text-white sm:text-xs"
          >
            {t("invite.homeLink")}
          </a>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 md:px-10 md:py-14">
        {/* Boot overlay — form stays mounted underneath so JS/boot failure never hides CTA */}
        <AnimatePresence>
          {booting && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--ink-fixed)]/92 px-4 backdrop-blur-sm"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="w-full max-w-md">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                  {t("invite.preparing")}
                </p>
                <div className="mb-3 h-[2px] w-full overflow-hidden bg-white/15">
                  <div className="h-full bg-[var(--inner-green)]" style={{ width: `${bootProgress}%` }} />
                </div>
                <div className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-white/45">
                  <span lang="en">{t("invite.access")}</span>
                  <span>{bootProgress}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="w-full max-w-lg panel-glass-ink px-6 py-10 sm:px-8 sm:py-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center bg-[var(--inner-green)]">
                  <Check className="size-3.5 text-black" strokeWidth={2.5} />
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                  {t("invite.received")}
                </span>
              </div>
              <h1 className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-balance text-[var(--bone-fixed)] md:text-5xl">
                {t("invite.successTitle")}
              </h1>
              <p className="max-w-[42ch] text-sm leading-relaxed text-white/60 md:text-base">
                {t("invite.successBody")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--bone-fixed)]/70 transition-colors hover:text-[var(--bone-fixed)]"
                >
                  {t("invite.backHome")}
                  <ArrowUpRight className="size-3.5" />
                </a>
                <a
                  href="/panel"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40 transition-colors hover:text-white/75"
                >
                  {t("invite.successPanelHint")}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={false}
              animate={{ opacity: booting ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-xl panel-glass-ink"
              onKeyDown={onKeyDown}
              aria-hidden={booting}
            >
              {/* Progress */}
              <div className="border-b border-white/10 px-5 pt-5 sm:px-7">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                    {t("invite.requestTitle")}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="h-[2px] w-full overflow-hidden bg-white/10">
                  <motion.div
                    className="h-full bg-[var(--inner-green)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>
                <div className="mt-4 flex gap-1.5 overflow-x-auto pb-4">
                  {steps.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (i < step) setStep(i);
                      }}
                      className={`shrink-0 border-b px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors sm:text-[10px] ${
                        i === step
                          ? "border-[var(--inner-green)] text-[var(--bone-fixed)]"
                          : i < step
                            ? "border-transparent text-[var(--inner-green)]/80 hover:text-[var(--inner-green)]"
                            : "border-transparent text-white/25"
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 py-7 sm:px-7 sm:py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <h1 className="mb-2 font-display font-serif italic text-3xl leading-[1.1] text-balance text-[var(--bone-fixed)] sm:text-4xl">
                      {steps[step].title}
                    </h1>
                    <p className="mb-8 max-w-[46ch] text-sm leading-relaxed text-white/55">
                      {stepCopy(step, role)}
                    </p>

                    {step === 0 && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {roles.map((r) => {
                          const Icon = r.icon;
                          const active = role === r.value;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setRole(r.value)}
                              className={`group flex flex-col items-start gap-3 border px-4 py-4 text-left transition-all duration-300 ${
                                active
                                  ? "border-[var(--inner-green)]/70 bg-[var(--inner-green)]/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                  : "border-white/12 bg-white/[0.03] backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.06]"
                              }`}
                            >
                              <div className="flex w-full items-center justify-between">
                                <Icon
                                  className={`size-4 ${active ? "text-[var(--inner-green)]" : "text-white/50"}`}
                                  strokeWidth={1.6}
                                />
                                {active ? (
                                  <Check className="size-3.5 text-[var(--inner-green)]" strokeWidth={2.5} />
                                ) : null}
                              </div>
                              <div>
                                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--bone-fixed)]">
                                  {r.label}
                                </p>
                                <p className="mt-1 text-xs leading-snug text-white/45">{r.hint}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <Field label={t("invite.fullName")} required>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("invite.phName")}
                            className={fieldClass}
                            autoComplete="name"
                            autoFocus
                          />
                        </Field>
                        <Field label={t("invite.email")} required>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("invite.phEmail")}
                            className={fieldClass}
                            autoComplete="email"
                          />
                        </Field>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex size-14 shrink-0 items-center justify-center border border-white/15 bg-black/40">
                            {logoLoading ? (
                              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">…</span>
                            ) : organizationLogo ? (
                              <img
                                src={organizationLogo}
                                alt=""
                                className="size-10 object-contain"
                              />
                            ) : (
                              <Building2 className="size-5 text-white/35" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                              {organizationLogo ? t("invite.logoFound") : t("invite.logoAuto")}
                            </p>
                            <p className="mt-1 text-xs leading-snug text-white/50">
                              {t("invite.logoHint")}
                            </p>
                          </div>
                        </div>

                        <Field
                          label={t("invite.orgLabel")}
                          hint={orgRequired ? t("invite.required") : t("invite.optional")}
                          required={orgRequired}
                        >
                          <input
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder={t("invite.phOrg")}
                            className={fieldClass}
                            autoComplete="organization"
                            autoFocus
                          />
                        </Field>

                        <Field label={t("invite.orgDomain")} hint={t("invite.forLogo")}>
                          <input
                            type="text"
                            value={organizationDomain}
                            onChange={(e) => setOrganizationDomain(e.target.value)}
                            placeholder={t("invite.phDomain")}
                            className={fieldClass}
                            autoComplete="off"
                          />
                        </Field>

                        <Field label={t("invite.linkedin")} hint={t("invite.optional")}>
                          <input
                            type="url"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            className={fieldClass}
                            autoComplete="off"
                          />
                        </Field>
                      </div>
                    )}

                    {step === 3 && (
                      <Field label={t("invite.storyLabel")} required>
                        <textarea
                          value={whoYouAre}
                          onChange={(e) => setWhoYouAre(e.target.value)}
                          placeholder={t("invite.phStory")}
                          className={`${fieldClass} min-h-[140px] resize-none py-3 leading-relaxed`}
                          autoFocus
                        />
                      </Field>
                    )}

                    {step === 4 && (
                      <div className="space-y-6">
                        <Field label={t("invite.introLabel")} hint={t("invite.optional")}>
                          <input
                            type="text"
                            value={whoIntroduced}
                            onChange={(e) => setWhoIntroduced(e.target.value)}
                            placeholder={t("invite.phIntro")}
                            className={fieldClass}
                            autoComplete="off"
                            autoFocus
                          />
                        </Field>

                        <div className="border border-white/12 bg-white/[0.04] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
                            {t("invite.intro")}
                          </p>
                          <div className="mb-3 flex items-center gap-3">
                            {organizationLogo ? (
                              <img
                                src={organizationLogo}
                                alt=""
                                className="size-9 border border-white/10 bg-white object-contain p-1"
                              />
                            ) : null}
                            <div className="min-w-0">
                              <p className="truncate text-sm text-[var(--bone-fixed)]">
                                {organization || "Kurum belirtilmedi"}
                              </p>
                              {organizationDomain ? (
                                <p className="font-mono text-[10px] text-white/40">{organizationDomain}</p>
                              ) : null}
                            </div>
                          </div>
                          <dl className="space-y-2 text-sm">
                            <SummaryRow label={t("invite.howEnter")} value={roles.find((r) => r.value === role)?.label ?? "·"} />
                            <SummaryRow label="İsim" value={name || "·"} />
                            <SummaryRow label="Email" value={email || "·"} />
                            {linkedin ? <SummaryRow label="LinkedIn" value={linkedin} /> : null}
                          </dl>
                        </div>

                        <div className="sr-only" aria-hidden>
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={fax}
                            onChange={(e) => setFax(e.target.value)}
                          />
                        </div>

                        {isError ? (
                          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--error)]">
                            Bir şeyler ters gitti. Tekrar dene.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:text-white disabled:invisible"
                >
                  <ArrowLeft className="size-3.5" />
                  {t("common.back")}
                </button>

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canNext}
                    className="inline-flex items-center gap-2 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 disabled:opacity-35"
                  >
                    {t("invite.continue")}
                    <ArrowUpRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || !role}
                    className="inline-flex items-center gap-2 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 disabled:opacity-35"
                  >
                    {isPending ? t("invite.submitting") : t("invite.submit")}
                    {!isPending ? <ArrowUpRight className="size-3.5" /> : null}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]">
          {label}
          {required ? <span className="text-[var(--inner-green)]"> *</span> : null}
        </label>
        {hint ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</dt>
      <dd className="truncate text-right text-[var(--bone-fixed)]/85">{value}</dd>
    </div>
  );
}
