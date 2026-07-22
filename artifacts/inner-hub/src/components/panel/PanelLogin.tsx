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
    "flex h-9 w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-4 text-base md:text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-foreground focus-visible:border-b-2 transition-[border-width]";

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
          theme: "outline",
          size: "large",
          width: 320,
          text: mode === "register" ? "signup_with" : "signin_with",
        });
      } catch {
        // Google yapılandırılmamışsa buton sessizce gösterilmez.
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
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="grain-overlay" aria-hidden="true" />

      <header className="relative z-10 flex h-[60px] items-center px-6 md:h-[72px] md:px-12 lg:px-[10%]">
        <a href="/" className="inline-flex group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Lockup
            className="text-foreground group-hover:opacity-80 transition-opacity"
            fontSize="clamp(24px, 2.6vw, 34px)"
          />
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center px-6 md:px-12 lg:px-[10%]">
        <div className="w-full max-w-md">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Panel · Members only
          </p>

          <h1 className="font-display font-serif italic text-4xl md:text-5xl leading-[1.1] text-balance mb-6">
            Continue inside the circle.
          </h1>

          <p className="mb-10 max-w-[40ch] text-lg leading-[1.6] text-foreground/80">
            Access is by invitation. Always.
          </p>

          <div ref={googleButtonRef} className="mb-8" />

          <div className="mb-8 flex items-center gap-4 text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest">veya</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-widest">Davet kodu</label>
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
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-widest">Ad Soyad</label>
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

            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest">Email</label>
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
              <label className="font-mono text-xs uppercase tracking-widest">Şifre</label>
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

            <div className="flex items-center justify-between gap-6 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative inline-flex h-auto min-h-9 items-center justify-center overflow-hidden rounded-none border border-foreground bg-foreground px-12 py-6 font-mono text-xs uppercase tracking-widest text-background transition-colors duration-300 hover:opacity-90 disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-2 -translate-x-full bg-background transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
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
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
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
