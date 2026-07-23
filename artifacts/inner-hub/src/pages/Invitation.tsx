"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lockup } from "@/components/Lockup";
import { useSubmitRequest } from "@workspace/api-client-react";

const ROLES = [
  { value: "operator", label: "Operator" },
  { value: "investor", label: "Yatırımcı" },
  { value: "founder", label: "Girişimci" },
  { value: "company", label: "Şirket" },
] as const;

type Role = (typeof ROLES)[number]["value"];

const fieldClass =
  "flex h-9 w-full rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-4 text-base md:text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white focus-visible:border-b-2 transition-[border-width]";

export default function Invitation() {
  const { mutate: submitRequest, isSuccess, isError, isPending } = useSubmitRequest();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [link, setLink] = useState("");
  const [whoYouAre, setWhoYouAre] = useState("");
  const [whoIntroduced, setWhoIntroduced] = useState("");
  const [company, setCompany] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest({
      data: {
        name,
        email,
        role,
        linkedin: linkedin || null,
        whoYouAre,
        link: link || null,
        whoIntroduced: whoIntroduced || null,
        company: company || null,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none fixed inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-between px-6 md:h-[72px] md:px-12 lg:px-[10%]">
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

      <main className="relative z-10 flex flex-1 items-center px-6 py-12 md:px-12 lg:px-[10%]">
        <div className="mx-auto w-full max-w-lg">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="size-2 rounded-full bg-[var(--inner-green)] animate-beacon" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white/60">Received</span>
                </div>
                <h1 className="font-display font-serif italic text-4xl md:text-5xl leading-[1.1] text-balance">
                  If it fits, we will be in touch.
                </h1>
              </motion.div>
            ) : (
              <motion.div key="form">
                <p
                  className="animate-blur-fade-up mb-6 font-mono text-xs uppercase tracking-widest text-white/60"
                  style={{ animationDelay: "100ms" }}
                >
                  Request an invitation
                </p>

                <h1
                  className="animate-blur-fade-up font-display font-serif italic text-4xl md:text-5xl leading-[1.1] text-balance mb-4"
                  style={{ animationDelay: "200ms" }}
                >
                  Tell us who you are.
                </h1>

                <p
                  className="animate-blur-fade-up mb-10 max-w-[46ch] text-lg leading-[1.6] text-white/70"
                  style={{ animationDelay: "300ms" }}
                >
                  Most people arrive by invitation, but good people also find us on their own.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "350ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/70">Ad Soyad</label>
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

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "400ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/70">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={fieldClass}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "450ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                      Ne olarak katılıyorsun?
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`liquid-glass border px-3 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                            role === r.value
                              ? "border-white text-white"
                              : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "500ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/70">LinkedIn</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className={fieldClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "550ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50">
                      Website / Portfolyo (Opsiyonel)
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://"
                      className={fieldClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "600ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/70">
                      Kimsin / Ne inşa ediyorsun?
                    </label>
                    <textarea
                      value={whoYouAre}
                      onChange={(e) => setWhoYouAre(e.target.value)}
                      placeholder="İşin ve niyetin hakkında kısa bir not."
                      className={`${fieldClass} min-h-[100px] resize-none py-3`}
                      required
                    />
                  </div>

                  <div className="animate-blur-fade-up space-y-2" style={{ animationDelay: "650ms" }}>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50">
                      Seni kim tanıttı? (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={whoIntroduced}
                      onChange={(e) => setWhoIntroduced(e.target.value)}
                      placeholder="Bağlantının adı"
                      className={fieldClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="sr-only" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  {isError && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
                      Bir şeyler ters gitti. Tekrar dene.
                    </p>
                  )}

                  <div className="animate-blur-fade-up pt-2" style={{ animationDelay: "700ms" }}>
                    <button
                      type="submit"
                      disabled={isPending || !role}
                      className="group/btn relative inline-flex h-auto min-h-9 w-full items-center justify-center overflow-hidden rounded-none border border-white bg-white px-12 py-4 font-mono text-xs uppercase tracking-widest text-black transition-colors duration-300 hover:opacity-90 disabled:opacity-50 sm:w-auto"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 h-full w-2 -translate-x-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
                      />
                      <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1">
                        {isPending ? "..." : "Send request"}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
