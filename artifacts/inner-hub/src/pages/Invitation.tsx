"use client";

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Building2, Check, Rocket, TrendingUp, Wrench } from "lucide-react";
import { HeroVideo } from "@/components/HeroVideo";
import { Lockup } from "@/components/Lockup";
import { useSubmitRequest } from "@workspace/api-client-react";

const INVITE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";

const EASE = [0.16, 1, 0.3, 1] as const;

const ROLES = [
  {
    value: "founder",
    label: "Girişimci",
    en: "Founder",
    hint: "Building something. Early or scaling.",
    icon: Rocket,
  },
  {
    value: "investor",
    label: "Yatırımcı",
    en: "Investor",
    hint: "Angel, fund, or operator allocating capital.",
    icon: TrendingUp,
  },
  {
    value: "builder",
    label: "Builder",
    en: "Builder",
    hint: "Engineer, researcher veya operatör. Stack’in içinde üretenler.",
    icon: Wrench,
  },
  {
    value: "company",
    label: "Şirket",
    en: "Company",
    hint: "Team looking to enter the circle together.",
    icon: Building2,
  },
] as const;

type Role = (typeof ROLES)[number]["value"];

/** Steps after boot: 0 role → 1 identity → 2 presence → 3 story → 4 intro */
const STEPS = [
  { id: "role", title: "How do you enter?" },
  { id: "identity", title: "Who should we reach?" },
  { id: "org", title: "Which organization?" },
  { id: "story", title: "What are you building?" },
  { id: "intro", title: "How did you find us?" },
] as const;

const fieldClass =
  "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3.5 text-[15px] text-[var(--bone)] shadow-none placeholder:text-white/35 focus-visible:border-[var(--inner-green)] focus-visible:outline-none focus-visible:ring-0 transition-colors";

export default function Invitation() {
  const { mutate: submitRequest, isSuccess, isError, isPending } = useSubmitRequest();

  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [link, setLink] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationDomain, setOrganizationDomain] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [whoYouAre, setWhoYouAre] = useState("");
  const [whoIntroduced, setWhoIntroduced] = useState("");
  const [fax, setFax] = useState(""); // honeypot

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const p = 1 - Math.pow(1 - t, 3);
      setBootProgress(Math.round(p * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setBooting(false), 180);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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

  // Resolve + preview logo when domain changes
  useEffect(() => {
    const domain = organizationDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!domain || !domain.includes(".")) {
      setOrganizationLogo(null);
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
        const data = (await res.json()) as { logoUrl?: string };
        if (!cancelled) setOrganizationLogo(data.logoUrl ?? null);
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

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

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
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!role || !canNext) return;
    submitRequest({
      data: {
        name: name.trim(),
        email: email.trim(),
        role,
        linkedin: linkedin || null,
        whoYouAre: whoYouAre.trim(),
        link: link || null,
        whoIntroduced: whoIntroduced || null,
        organization: organization.trim() || null,
        organizationDomain: organizationDomain.trim() || null,
        organizationLogo: organizationLogo || null,
        fax: fax || null,
        company: null,
      },
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();
    if (step < STEPS.length - 1) goNext();
    else handleSubmit();
  };

  return (
    <div lang="en" className="relative flex min-h-svh flex-col overflow-hidden bg-[var(--ink)] text-[var(--bone)]">
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
          <Lockup className="text-[var(--bone)]" fontSize="clamp(22px, 2.4vw, 30px)" />
        </a>
        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-white/55 transition-colors hover:text-white sm:text-xs"
        >
          Ana sayfa
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <AnimatePresence mode="wait">
          {booting ? (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md"
            >
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                Preparing invitation
              </p>
              <div className="mb-3 h-[2px] w-full overflow-hidden bg-white/15">
                <motion.div
                  className="h-full bg-[var(--inner-green)]"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
              <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest text-white/45">
                <span>inner · access</span>
                <span>{bootProgress}%</span>
              </div>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="w-full max-w-lg border border-white/10 bg-black/50 px-6 py-10 backdrop-blur-md sm:px-8 sm:py-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center bg-[var(--inner-green)]">
                  <Check className="size-3.5 text-black" strokeWidth={2.5} />
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-white/60">Received</span>
              </div>
              <h1 className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-balance md:text-5xl">
                If it fits, we will be in touch.
              </h1>
              <p className="max-w-[42ch] text-sm leading-relaxed text-white/60 md:text-base">
                We review every request carefully. No automated replies. Only a real answer when it
                matters.
              </p>
              <a
                href="/"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)]/70 transition-colors hover:text-[var(--bone)]"
              >
                Back to home
                <ArrowUpRight className="size-3.5" />
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-xl border border-white/10 bg-black/55 backdrop-blur-md"
              onKeyDown={onKeyDown}
            >
              {/* Progress */}
              <div className="border-b border-white/10 px-5 pt-5 sm:px-7">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                    Request an invitation
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
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
                  {STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (i < step) setStep(i);
                      }}
                      className={`shrink-0 px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors sm:text-[10px] ${
                        i === step
                          ? "text-[var(--bone)]"
                          : i < step
                            ? "text-[var(--inner-green)]/80 hover:text-[var(--inner-green)]"
                            : "text-white/25"
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
                    <h1 className="mb-2 font-display font-serif italic text-3xl leading-[1.1] text-balance sm:text-4xl">
                      {STEPS[step].title}
                    </h1>
                    <p className="mb-8 max-w-[46ch] text-sm leading-relaxed text-white/55">
                      {stepCopy(step, role)}
                    </p>

                    {step === 0 && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ROLES.map((r) => {
                          const Icon = r.icon;
                          const active = role === r.value;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setRole(r.value)}
                              className={`group flex flex-col items-start gap-3 border px-4 py-4 text-left transition-colors ${
                                active
                                  ? "border-[var(--inner-green)] bg-[var(--inner-green)]/10"
                                  : "border-white/15 bg-white/[0.02] hover:border-white/35 hover:bg-white/[0.04]"
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
                                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--bone)]">
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
                        <Field label="Ad Soyad" required>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Adınız ve soyadınız"
                            className={fieldClass}
                            autoComplete="name"
                            autoFocus
                          />
                        </Field>
                        <Field label="Email" required>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
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
                              {organizationLogo ? "Logo bulundu" : "Logo otomatik çekilir"}
                            </p>
                            <p className="mt-1 text-xs leading-snug text-white/50">
                              Domain girildiğinde sistem kurum logosunu getirir ve kaydeder. VS ve büyük şirketler için.
                            </p>
                          </div>
                        </div>

                        <Field
                          label="Kurum / Fon / Şirket"
                          hint={orgRequired ? "Zorunlu" : "Opsiyonel"}
                          required={orgRequired}
                        >
                          <input
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="Sequoia, a16z, Acme AI…"
                            className={fieldClass}
                            autoComplete="organization"
                            autoFocus
                          />
                        </Field>

                        <Field label="Kurum domaini" hint="Logo için">
                          <input
                            type="text"
                            value={organizationDomain}
                            onChange={(e) => setOrganizationDomain(e.target.value)}
                            placeholder="sequoiacap.com"
                            className={fieldClass}
                            autoComplete="off"
                          />
                        </Field>

                        <Field label="LinkedIn" hint="Opsiyonel">
                          <input
                            type="url"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            className={fieldClass}
                            autoComplete="off"
                          />
                        </Field>

                        <Field label="Website / Portfolyo" hint="Opsiyonel">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://"
                            className={fieldClass}
                            autoComplete="off"
                          />
                        </Field>
                      </div>
                    )}

                    {step === 3 && (
                      <Field
                        label={
                          role === "investor"
                            ? "Ne arıyorsun / nasıl katkı sağlıyorsun?"
                            : role === "company"
                              ? "Takımınız ne üzerine çalışıyor?"
                              : "Kimsin / Ne inşa ediyorsun?"
                        }
                        required
                      >
                        <textarea
                          value={whoYouAre}
                          onChange={(e) => setWhoYouAre(e.target.value)}
                          placeholder={
                            role === "investor"
                              ? "Yatırım tezin, aşama tercihin ve neden inner.hub..."
                              : "Kısa ama net: işin, niyetin, şu anki aşaman."
                          }
                          className={`${fieldClass} min-h-[140px] resize-none py-3 leading-relaxed`}
                          autoFocus
                        />
                        <p className="mt-2 font-mono text-[10px] tracking-widest text-white/35">
                          {whoYouAre.trim().length} karakter · en az 12
                        </p>
                      </Field>
                    )}

                    {step === 4 && (
                      <div className="space-y-6">
                        <Field label="Seni kim tanıttı?" hint="Opsiyonel">
                          <input
                            type="text"
                            value={whoIntroduced}
                            onChange={(e) => setWhoIntroduced(e.target.value)}
                            placeholder="Bir üye adı, ya da boş bırak"
                            className={fieldClass}
                            autoComplete="off"
                            autoFocus
                          />
                        </Field>

                        <div className="border border-white/10 bg-white/[0.03] px-4 py-4">
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
                            Özet
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
                              <p className="truncate text-sm text-[var(--bone)]">
                                {organization || "Kurum belirtilmedi"}
                              </p>
                              {organizationDomain ? (
                                <p className="font-mono text-[10px] text-white/40">{organizationDomain}</p>
                              ) : null}
                            </div>
                          </div>
                          <dl className="space-y-2 text-sm">
                            <SummaryRow label="Rol" value={ROLES.find((r) => r.value === role)?.label ?? "·"} />
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
                  Geri
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canNext}
                    className="inline-flex items-center gap-2 bg-[var(--bone)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-35"
                  >
                    Devam
                    <ArrowUpRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || !role}
                    className="inline-flex items-center gap-2 bg-[var(--bone)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-35"
                  >
                    {isPending ? "Gönderiliyor…" : "Gönder"}
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

function stepCopy(step: number, role: Role | null) {
  if (step === 0) return "Yatırımcı, girişimci, builder veya şirket. Her giriş ayrı bir kapı.";
  if (step === 1) return "Doğrudan sana ulaşabileceğimiz bilgiler. Spam yok; sadece gerçek yanıt.";
  if (step === 2) {
    if (role === "investor") return "Fon veya kurum adın + domain. Logoyu otomatik getiririz.";
    if (role === "company") return "Şirket adın ve domainin. Logo sisteme kaydolur.";
    return "Varsa kurumunu ekle. Domain ile logo otomatik yüklenir.";
  }
  if (step === 3) return "Kısa tut. Net tut. Circle bunu okuyacak.";
  return "Çoğu kişi davetle gelir. Kendi bulduysan da sorun değil. Söylemen yeterli.";
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
      <dd className="truncate text-right text-[var(--bone)]/85">{value}</dd>
    </div>
  );
}
