"use client";

import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { apiUrl } from "@/lib/api";

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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const inviteCodeRef = useRef(inviteCode);
  const modeRef = useRef(mode);

  useEffect(() => {
    inviteCodeRef.current = inviteCode;
  }, [inviteCode]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const fieldClass =
    "flex h-9 w-full rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-4 text-base md:text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white focus-visible:border-b-2 transition-[border-width]";

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
              setError(err instanceof Error ? err.message : "Google ile giriş başarısız.");
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
  }, [mode, onLogin]);

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
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <header className="relative z-10 flex h-[60px] items-center justify-between px-6 md:h-[72px] md:px-12 lg:px-[10%]">
        <a
          href="/"
          className="animate-blur-fade-up inline-flex group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ animationDelay: "0ms" }}
        >
          <Lockup
            className="text-white group-hover:opacity-80 transition-opacity"
            fontSize="clamp(24px, 2.6vw, 34px)"
          />
        </a>
        <a
          href="/"
          className="animate-blur-fade-up font-mono text-[11px] uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          style={{ animationDelay: "150ms" }}
        >
          Ana sayfa
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-end px-6 pb-12 md:px-12 md:pb-20 lg:px-[10%]">
        <div className="w-full max-w-md">
          <p
            className="animate-blur-fade-up mb-6 font-mono text-xs uppercase tracking-widest text-white/60"
            style={{ animationDelay: "200ms" }}
          >
            Panel · Members only
          </p>

          <h1
            className="animate-blur-fade-up font-display font-serif italic text-4xl md:text-5xl leading-[1.1] text-balance mb-4"
            style={{ animationDelay: "300ms" }}
          >
            Continue inside the circle.
          </h1>

          <p
            className="animate-blur-fade-up mb-8 max-w-[40ch] text-lg leading-[1.6] text-white/70"
            style={{ animationDelay: "400ms" }}
          >
            Access is by invitation. Always.
          </p>

          <div
            className={`liquid-glass group relative mb-4 h-11 w-full animate-blur-fade-up ${googleReady ? "visible" : "invisible"}`}
            style={{ animationDelay: "500ms" }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 border border-white/20 transition-all duration-300 group-hover:-translate-y-px group-hover:border-white/40 group-hover:shadow-[0_3px_0_0_var(--inner-green)]"
            >
              <GoogleGlyph />
              <span className="font-mono text-xs uppercase tracking-widest text-white">
                {mode === "register" ? "Google ile kayıt ol" : "Google ile devam et"}
              </span>
            </div>
            <div
              ref={googleButtonRef}
              className="absolute inset-0 overflow-hidden opacity-0"
              aria-label={mode === "register" ? "Google ile kayıt ol" : "Google ile devam et"}
            />
          </div>

          <div
            className={`animate-blur-fade-up mb-6 flex items-center gap-4 text-white/40 ${googleReady ? "" : "hidden"}`}
            style={{ animationDelay: "550ms" }}
          >
            <span className="h-px flex-1 bg-white/20" />
            <span className="font-mono text-[10px] uppercase tracking-widest">veya</span>
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "register" && (
              <>
                <div
                  className="animate-blur-fade-up space-y-2"
                  style={{ animationDelay: "600ms" }}
                >
                  <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                    Davet kodu
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Davet kodunuz"
                    className={fieldClass}
                    required
                    autoComplete="off"
                  />
                </div>
                <div
                  className="animate-blur-fade-up space-y-2"
                  style={{ animationDelay: "650ms" }}
                >
                  <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ad Soyad"
                    className={fieldClass}
                    required
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "600ms" }}>
              <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                Email
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

            <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "650ms" }}>
              <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                Şifre
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
                {error}
              </p>
            )}

            <div
              className="animate-blur-fade-up flex items-center justify-between gap-6 pt-2"
              style={{ animationDelay: "700ms" }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative inline-flex h-auto min-h-9 items-center justify-center overflow-hidden rounded-none border border-white bg-white px-12 py-6 font-mono text-xs uppercase tracking-widest text-black transition-colors duration-300 hover:opacity-90 disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-2 -translate-x-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
                />
                <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1">
                  {loading ? "..." : mode === "login" ? "Enter" : "Hesap oluştur"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="font-mono text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
              >
                {mode === "login" ? "Hesabın yok mu?" : "Zaten üye misin?"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
