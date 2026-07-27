"use client";

import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { apiUrl } from "@/lib/api";
import { posterForVideo } from "@/lib/videoPosters";
import { useScrubVideo } from "@/hooks/useScrubVideo";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useT } from "@/i18n";

const LOGIN_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";

type SessionUser = { email: string; role: "member" | "admin"; name: string };

type PanelLoginProps = {
  onLogin: (user: SessionUser) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById("google-identity-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script yüklenemedi"));
    document.head.appendChild(script);
  });
}

async function apiRequest(path: string, body: unknown) {
  const res = await fetch(apiUrl(`/api/auth/${path}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Bir şeyler ters gitti.");
  return data;
}

export function PanelLogin({ onLogin }: PanelLoginProps) {
  const t = useT();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const inviteCodeRef = useRef(inviteCode);
  const modeRef = useRef(mode);
  const scrubVideoRef = useScrubVideo();
  const { displayed: typedIntro, done: typedDone } = useTypewriter(t("login.typewriter"));
  const ambientLines = t("login.ambientWelcome").split("\n");
  const googleLabel = mode === "register" ? t("login.googleRegister") : t("login.googleContinue");

  const copySupportEmail = async () => {
    try {
      await navigator.clipboard.writeText("support@inner.digital");
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1600);
    } catch {
      setEmailCopied(false);
    }
  };

  useEffect(() => {
    inviteCodeRef.current = inviteCode;
  }, [inviteCode]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const fieldClass =
    "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3.5 text-[15px] text-[var(--bone-fixed)] shadow-none placeholder:text-white/35 focus-visible:border-[var(--inner-green)] focus-visible:outline-none focus-visible:ring-0 transition-colors";

  useEffect(() => {
    let cancelled = false;

    async function setupGoogle() {
      try {
        const res = await fetch(apiUrl("/api/auth/config"));
        const { googleClientId } = await res.json();
        if (!googleClientId || cancelled) return;

        await loadGoogleScript();
        if (cancelled || !window.google || !googleButtonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setLoading(true);
            setError("");
            try {
              const body: Record<string, string> = { credential: response.credential };
              if (modeRef.current === "register") {
                body.inviteCode = inviteCodeRef.current.trim();
              }
              const { user } = await apiRequest("google", body);
              onLogin(user);
            } catch (err) {
              setError(err instanceof Error ? err.message : t("login.googleFailed"));
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 400,
          text: mode === "register" ? "signup_with" : "signin_with",
        });
        setGoogleReady(true);
      } catch {
        // Google yapılandırılmamışsa özel buton gösterilmez.
      }
    }

    setupGoogle();
    return () => {
      cancelled = true;
    };
  }, [mode, onLogin, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } =
        mode === "login"
          ? await apiRequest("login", { email, password })
          : await apiRequest("register", {
              email,
              password,
              name,
              inviteCode: inviteCode.trim(),
            });
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-[#12100e] text-white">
      <video
        ref={scrubVideoRef}
        muted
        playsInline
        poster={posterForVideo(LOGIN_VIDEO_SRC)}
        preload="auto"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: "70% center" }}
        src={LOGIN_VIDEO_SRC}
      />
      {/* Alt bölgede hafif blur - üstte karakter net kalsın (mouse scrub görünsün) */}
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/25 backdrop-blur-md"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-transparent to-black/40"
      />

      <header className="relative z-20 flex h-[60px] shrink-0 items-center justify-between px-6 md:h-[72px] md:px-12 lg:px-[10%]">
        <a
          href="/"
          className="animate-blur-fade-up inline-flex group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ animationDelay: "0ms" }}
        >
          <Lockup
            className="text-white transition-opacity group-hover:opacity-80"
            fontSize="clamp(24px, 2.6vw, 34px)"
          />
        </a>
        <a
          href="/"
          className="animate-blur-fade-up font-mono text-caption uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          style={{ animationDelay: "150ms" }}
        >
          {t("common.home")}
        </a>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-8 overflow-y-auto px-6 pb-10 pt-2 md:px-12 md:pb-16 lg:px-[10%]">
        {/* Üst: ambient typewriter - absolute değil, form ile çakışmaz */}
        <div className="max-w-md shrink-0">
          <p
            aria-hidden="true"
            className="mb-4 select-none font-serif italic leading-[1.3] text-white/35"
            style={{ fontSize: "clamp(16px, 2vw, 22px)", filter: "blur(2px)" }}
          >
            {ambientLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <p
            className="text-white"
            style={{ fontSize: "clamp(17px, 2.2vw, 24px)", lineHeight: 1.4, minHeight: "2.8em" }}
          >
            {typedIntro}
            {!typedDone && (
              <span className="animate-blink ml-[2px] inline-block h-[1.1em] w-[2px] bg-white align-middle" />
            )}
          </p>
          <button
            type="button"
            onClick={copySupportEmail}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 font-mono text-caption uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-black"
          >
            {emailCopied ? (
              t("common.copied")
            ) : (
              <>
                {t("login.support")}: <span lang="en">support@inner.digital</span>
              </>
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="3" y="3" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <p className="mt-3 font-mono text-label uppercase tracking-widest text-white/35">
            {t("login.mouseHint")}
          </p>
        </div>

        {/* Alt: login formu - davet sayfası glass kartı */}
        <div
          className="animate-blur-fade-up w-full max-w-md shrink-0 panel-glass-ink"
          style={{ animationDelay: "200ms" }}
        >
          <div className="border-b border-white/10 px-5 pt-5 sm:px-7">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                {t("login.membersOnly")}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                {mode === "login" ? "01 / 02" : "02 / 02"}
              </p>
            </div>
            <div className="mb-5 h-[2px] w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-[var(--inner-green)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: mode === "login" ? "50%" : "100%" }}
              />
            </div>
          </div>

          <div className="px-5 py-7 sm:px-7 sm:py-8">
            <h1 className="mb-2 font-display font-serif italic text-3xl leading-[1.1] text-balance text-[var(--bone-fixed)] sm:text-4xl">
              {t("login.continueInside")}
            </h1>
            <p className="mb-8 max-w-[40ch] text-sm leading-relaxed text-white/55">
              {t("login.accessByInvite")}
            </p>

            <div
              className={`liquid-glass group relative mb-4 h-11 w-full ${googleReady ? "visible" : "invisible"}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 border border-white/15 bg-white/[0.03] transition-all duration-300 group-hover:border-white/35 group-hover:bg-white/[0.06]"
              >
                <GoogleGlyph />
                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--bone-fixed)]">
                  {googleLabel}
                </span>
              </div>
              <div
                ref={googleButtonRef}
                className="absolute inset-0 overflow-hidden opacity-0"
                aria-label={googleLabel}
              />
            </div>

            <div
              className={`mb-6 flex items-center gap-4 text-white/35 ${googleReady ? "" : "hidden"}`}
            >
              <span className="h-px flex-1 bg-white/15" />
              <span className="font-mono text-[10px] uppercase tracking-widest">{t("login.or")}</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>

            <form id="panel-login-form" onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]">
                      {t("login.inviteCode")}
                      <span className="text-[var(--inner-green)]"> *</span>
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder={t("login.invitePlaceholder")}
                      className={fieldClass}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]">
                      {t("login.fullName")}
                      <span className="text-[var(--inner-green)]"> *</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("login.fullName")}
                      className={fieldClass}
                      required
                      autoComplete="name"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]">
                  {t("login.email")}
                  <span className="text-[var(--inner-green)]"> *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@inner.digital"
                  className={fieldClass}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]">
                  {t("login.password")}
                  <span className="text-[var(--inner-green)]"> *</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={fieldClass}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {error && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)]">
                  {error}
                </p>
              )}
            </form>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:text-white"
            >
              {mode === "login" ? t("login.noAccount") : t("login.haveAccount")}
            </button>

            <button
              type="submit"
              form="panel-login-form"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 disabled:opacity-35"
            >
              {loading ? "..." : mode === "login" ? t("login.signIn") : t("login.createAccount")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
