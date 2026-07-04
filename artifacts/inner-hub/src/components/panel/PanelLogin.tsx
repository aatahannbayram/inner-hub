"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type PanelLoginProps = {
  onLogin: (user: { email: string; role: "member" | "admin"; name: string }) => void;
};

// Dev credentials — backend auth entegrasyonunda API'ye taşınacak
const DEV_USERS = [
  { email: "admin@inner.co",  password: "inner2026", role: "admin"  as const, name: "Ata Han Bayram" },
  { email: "member@inner.co", password: "inner2026", role: "member" as const, name: "Demo Üye" },
];

export function PanelLogin({ onLogin }: PanelLoginProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const fieldClass =
    "w-full border-0 border-b border-[var(--ink)]/20 bg-transparent px-0 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink)]/30 focus:outline-none focus:border-[var(--ink)] transition-colors";

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bone)] px-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-12 flex items-baseline gap-0">
          <span
            className="font-serif text-2xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100, letterSpacing: "-0.015em" }}
          >
            innerhub
          </span>
          <span className="inline-block size-[0.42em] translate-y-[0.06em] bg-[var(--inner-green)]" />
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-3">
            Panel Girişi
          </p>
          <h1
            className="font-serif text-3xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            Devam etmek için giriş yap
            <span className="inline-block size-[0.3em] translate-y-[0.06em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sen@inner.co"
                className={fieldClass}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50">
                Şifre
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
          </div>

          {error && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-between overflow-hidden border border-[var(--ink)] bg-[var(--ink)] px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <span>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        <p className="mt-8 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25 text-center">
          Erişim sadece davet yoluyla · inner·hub
        </p>
      </div>
    </div>
  );
}
