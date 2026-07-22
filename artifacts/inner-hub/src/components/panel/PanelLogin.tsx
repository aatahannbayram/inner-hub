"use client";

import { useState } from "react";
import { Lockup } from "@/components/Lockup";

type PanelLoginProps = {
  onLogin: (user: { email: string; role: "member" | "admin"; name: string }) => void;
};

// Dev credentials — backend auth entegrasyonunda API'ye taşınacak
const DEV_USERS = [
  { email: "admin@inner.digital",  password: "inner2026", role: "admin"  as const, name: "Ata Han Bayram" },
  { email: "member@inner.digital", password: "inner2026", role: "member" as const, name: "Demo Üye" },
];

export function PanelLogin({ onLogin }: PanelLoginProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const fieldClass =
    "flex h-9 w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-4 text-base md:text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-foreground focus-visible:border-b-2 transition-[border-width]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const user = DEV_USERS.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password,
      );
      if (user) {
        sessionStorage.setItem("inner_session", JSON.stringify({ email: user.email, role: user.role, name: user.name }));
        onLogin(user);
      } else {
        setError("E-posta veya şifre hatalı.");
      }
      setLoading(false);
    }, 400);
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

          <p className="mb-12 max-w-[40ch] text-lg leading-[1.6] text-foreground/80">
            Access is by invitation. Always.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest">
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

            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
                {error}
              </p>
            )}

            <div className="pt-2">
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
                  {loading ? "Signing in…" : "Enter"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
