import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  Github,
  Globe,
  Linkedin,
  Shield,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { apiUrl } from "@/lib/api";
import { useT, useLocale } from "@/i18n";

type PublicProfile = {
  id: number;
  name: string;
  handle: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  skills: string[];
  linkedin: string | null;
  github: string | null;
  website: string | null;
  twitter: string | null;
  visibility: string;
  role: "member" | "admin";
  profileCompletionPct: number;
  createdAt: string;
  verified: boolean;
  tier: string;
};

function hrefFor(kind: "linkedin" | "github" | "website", value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === "linkedin") return `https://linkedin.com/in/${v.replace(/^\/+/, "")}`;
  if (kind === "github") return `https://github.com/${v.replace(/^\/+/, "")}`;
  return `https://${v.replace(/^\/+/, "")}`;
}

export default function PublicProfilePage() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ handle: string }>();
  const handle = (params.handle ?? "").toLowerCase();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "members" | "missing" | "error">("loading");
  const [message, setMessage] = useState("");

  const memberSince = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    if (!handle) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(apiUrl(`/api/public/profile/${encodeURIComponent(handle)}`), {
      credentials: "include",
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 401 && json.code === "MEMBERS_ONLY") {
          setStatus("members");
          setMessage(json.error ?? t("publicProfile.membersOnly"));
          return;
        }
        if (res.status === 404) {
          setStatus("missing");
          setMessage(json.error ?? t("publicProfile.notFound"));
          return;
        }
        if (!res.ok) {
          setStatus("error");
          setMessage(json.error ?? t("publicProfile.loadError"));
          return;
        }
        setProfile(json.profile);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage(t("publicProfile.networkError"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [handle, t]);

  return (
    <div className="min-h-svh bg-[var(--bone)] text-[var(--ink)]">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <FadeIn>
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <ArrowLeft className="size-3.5" />
              <span lang="en">inner·hub</span>
            </Link>
            <Link
              href="/panel"
              className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              {t("publicProfile.enterPanel")}
            </Link>
          </div>
        </FadeIn>

        {status === "loading" && (
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("publicProfile.loading")}
          </p>
        )}

        {status === "missing" && (
          <div className="border border-[var(--ink)]/[0.08] p-8 text-center">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {message || t("publicProfile.notFound")}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-body)]">@{handle || "·"}</p>
          </div>
        )}

        {status === "members" && (
          <div className="border border-[var(--ink)]/[0.08] p-8">
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("publicProfile.membersOnly")}
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--ink-muted)]">
              {t("publicProfile.membersOnlyBody", { handle })}
            </p>
            <Link
              href="/panel"
              className="inline-flex border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
            >
              {t("publicProfile.login")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <p className="font-mono text-label text-[var(--error-ink)]">{message}</p>
        )}

        {status === "ok" && profile && (
          <FadeIn>
            <div className="space-y-8">
              <div>
                <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                  <span lang="en">inner·id</span>
                </p>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1
                    className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
                  >
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <CheckCircle2
                      className="size-5 text-[var(--success-ink)]"
                      aria-label={t("publicProfile.linkedinVerified")}
                    >
                      <title>{t("publicProfile.linkedinVerified")}</title>
                    </CheckCircle2>
                  )}
                </div>
                <p className="font-mono text-caption text-[var(--ink-muted)]">
                  @{profile.handle}
                  {profile.title || profile.company
                    ? ` · ${[profile.title, profile.company].filter(Boolean).join(", ")}`
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
                    {profile.tier}
                  </span>
                  <span className="border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("publicProfile.memberSince", { date: memberSince(profile.createdAt) })}
                  </span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm font-light leading-relaxed text-[var(--ink-body)]">{profile.bio}</p>
              )}

              {profile.skills.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("publicProfile.skills")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s) => (
                      <span
                        key={s}
                        className="border border-[var(--ink)]/10 px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile.linkedin || profile.github || profile.website) && (
                <div>
                  <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("publicProfile.links")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {profile.linkedin && (
                      <a
                        href={hrefFor("linkedin", profile.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-[var(--ink)]/[0.08] px-3 py-2 font-mono text-caption text-[var(--ink-body)] hover:border-[var(--ink)]/25"
                      >
                        <Linkedin className="size-3.5" /> linkedin.com/in/{profile.linkedin.replace(/^.*\//, "")}
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={hrefFor("github", profile.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-[var(--ink)]/[0.08] px-3 py-2 font-mono text-caption text-[var(--ink-body)] hover:border-[var(--ink)]/25"
                      >
                        <Github className="size-3.5" /> github.com/{profile.github.replace(/^.*\//, "")}
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={hrefFor("website", profile.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-[var(--ink)]/[0.08] px-3 py-2 font-mono text-caption text-[var(--ink-body)] hover:border-[var(--ink)]/25"
                      >
                        <Globe className="size-3.5" /> {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 border border-[var(--inner-green)]/20 bg-[var(--inner-green)]/5 p-4">
                <Shield className="mt-0.5 size-4 shrink-0 text-[var(--success-ink)]" />
                <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                  {t("publicProfile.verifiedNote")}{" "}
                  <a
                    className="underline underline-offset-2"
                    href={apiUrl(`/api/badge/${profile.handle}.svg`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /api/badge/{profile.handle}.svg
                  </a>
                </p>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
