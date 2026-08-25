import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Contact,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Share2,
  Shield,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { apiUrl } from "@/lib/api";
import { SITE, useSeo } from "@/lib/seo";
import { useT, useLocale } from "@/i18n";

type PublicProfile = {
  id: number;
  name: string;
  handle: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  skills: string[];
  avatarUrl?: string | null;
  linkedin: string | null;
  linkedinLogoUrl: string | null;
  github: string | null;
  githubLogoUrl: string | null;
  website: string | null;
  websiteLogoUrl: string | null;
  twitter: string | null;
  instagram: string | null;
  behance?: string | null;
  profileLinks?: {
    id: string;
    label: string;
    url: string;
    featured?: boolean;
    sortOrder?: number;
  }[];
  cardTheme?: { accent: string; bg: string; layout: "stack" | "card" } | null;
  phone?: string | null;
  visibility: string;
  role: "member" | "admin";
  profileCompletionPct: number;
  createdAt: string;
  verified: boolean;
  tier: string;
};

function hrefFor(
  kind: "linkedin" | "github" | "website" | "twitter" | "instagram" | "behance",
  value: string,
): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === "linkedin") return `https://linkedin.com/in/${v.replace(/^\/+/, "")}`;
  if (kind === "github") return `https://github.com/${v.replace(/^\/+/, "")}`;
  if (kind === "instagram") return `https://instagram.com/${v.replace(/^@/, "").replace(/^\/+/, "")}`;
  if (kind === "twitter") return `https://x.com/${v.replace(/^@/, "").replace(/^\/+/, "")}`;
  if (kind === "behance") return `https://behance.net/${v.replace(/^\/+/, "")}`;
  return `https://${v.replace(/^\/+/, "")}`;
}

function toWhatsAppHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

function trackCardEvent(
  handle: string,
  type: "view" | "vcard" | "link" | "qr" | "share",
  linkKey?: string,
) {
  if (!handle) return;
  void fetch(apiUrl(`/api/public/profile/${encodeURIComponent(handle)}/event`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      linkKey,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    }),
    keepalive: true,
  }).catch(() => {});
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.527-8.612L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type LinkIcon = React.ComponentType<{ className?: string }>;

type LinkRow = {
  key: string;
  href: string;
  label: string;
  sub: string;
  icon: LinkIcon;
  logo: string | null;
  featured?: boolean;
};

function LinkMark({ logo, Icon }: { logo: string | null; Icon: LinkIcon }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="flex size-10 shrink-0 items-center justify-center border border-[var(--ink)]/10 bg-[var(--ink)]/[0.04]">
      {logo && !broken ? (
        <img
          src={logo}
          alt=""
          className="size-6 object-contain"
          onError={() => setBroken(true)}
        />
      ) : (
        <Icon className="size-4 text-[var(--ink)]" />
      )}
    </span>
  );
}

function BehanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M22 7h-5v1.5h5V7zM9.3 11.6c.9-.4 1.4-1.1 1.4-2.2C10.7 7.4 9.4 6.5 7.4 6.5H2v11h5.7c2.3 0 3.9-1.1 3.9-3.1 0-1.3-.6-2.3-2.3-2.8zM5.1 8.4h2c.9 0 1.4.4 1.4 1.1S8 10.6 7 10.6H5.1V8.4zm2.2 7.1H5.1v-2.7h2.3c1.1 0 1.6.5 1.6 1.4s-.6 1.3-1.7 1.3zM19.7 9.8c-2.2 0-3.7 1.5-3.7 3.7s1.5 3.7 3.8 3.7c1.5 0 2.7-.6 3.3-1.7l-1.5-.9c-.3.6-.9 1-1.7 1-1.1 0-1.9-.8-2-1.9h5.5c0-.2.1-.6.1-.9 0-2.2-1.4-3.9-3.8-3.9zm-1.9 2.9c.2-1 .9-1.6 1.9-1.6s1.6.6 1.8 1.6h-3.7z" />
    </svg>
  );
}

export default function PublicProfilePage() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ handle: string }>();
  const handle = (params.handle ?? "").toLowerCase();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "members" | "missing" | "error">("loading");
  const [message, setMessage] = useState("");
  const [shareFlash, setShareFlash] = useState(false);

  const memberSince = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
      month: "long",
      year: "numeric",
    });

  const publicUrl = handle ? `${SITE}/u/${handle}` : SITE;
  const seoTitle = profile
    ? `${profile.name}${profile.title ? ` · ${profile.title}` : ""}`
    : handle
      ? `@${handle}`
      : t("publicProfile.title");
  const seoDesc = profile
    ? [profile.title, profile.company, profile.bio?.slice(0, 140)].filter(Boolean).join(" · ") ||
      t("publicProfile.verifiedNote")
    : t("publicProfile.loading");

  useSeo({
    title: seoTitle,
    description: seoDesc,
    canonicalPath: `/u/${handle || "…"}`,
    ogImage: profile?.avatarUrl || undefined,
    noIndex: status !== "ok",
    jsonLd:
      status === "ok" && profile
        ? {
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            url: publicUrl,
            jobTitle: profile.title ?? undefined,
            worksFor: profile.company
              ? { "@type": "Organization", name: profile.company }
              : undefined,
            image: profile.avatarUrl ?? undefined,
            sameAs: [
              profile.behance && hrefFor("behance", profile.behance),
              profile.linkedin && hrefFor("linkedin", profile.linkedin),
              profile.github && hrefFor("github", profile.github),
              profile.website && hrefFor("website", profile.website),
              profile.twitter && hrefFor("twitter", profile.twitter),
              profile.instagram && hrefFor("instagram", profile.instagram),
              ...(profile.profileLinks ?? []).map((l) =>
                /^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`,
              ),
            ].filter(Boolean),
          }
        : undefined,
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
        if (json.profile?.visibility === "public" && json.profile?.handle) {
          trackCardEvent(String(json.profile.handle), "view");
        }
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

  const primaryCta = useMemo(() => {
    if (!profile) return null;
    const featured = (profile.profileLinks ?? []).find((l) => l.featured);
    if (featured) {
      const href = /^https?:\/\//i.test(featured.url) ? featured.url : `https://${featured.url}`;
      let host = featured.url;
      try {
        host = new URL(href).hostname.replace(/^www\./, "");
      } catch {
        /* keep */
      }
      return {
        href,
        label: featured.label || host,
        icon: Globe,
        linkKey: `custom-${featured.id}`,
      };
    }
    if (profile.phone) {
      const wa = toWhatsAppHref(profile.phone);
      if (wa) {
        return {
          href: wa,
          label: t("publicProfile.whatsappCta"),
          icon: MessageCircle,
          linkKey: "whatsapp",
        };
      }
    }
    if (profile.website) {
      return {
        href: hrefFor("website", profile.website),
        label: t("publicProfile.openWebsite"),
        icon: Globe,
        linkKey: "website",
      };
    }
    if (profile.linkedin) {
      return {
        href: hrefFor("linkedin", profile.linkedin),
        label: t("publicProfile.openLinkedin"),
        icon: Linkedin,
        linkKey: "linkedin",
      };
    }
    if (profile.github) {
      return {
        href: hrefFor("github", profile.github),
        label: t("publicProfile.openGithub"),
        icon: Github,
        linkKey: "github",
      };
    }
    return null;
  }, [profile, t]);

  const socialIcons = useMemo(() => {
    if (!profile) return [];
    const icons: { key: string; href: string; label: string; icon: LinkIcon }[] = [];
    if (profile.linkedin) {
      icons.push({
        key: "linkedin",
        href: hrefFor("linkedin", profile.linkedin),
        label: "LinkedIn",
        icon: Linkedin,
      });
    }
    if (profile.github) {
      icons.push({
        key: "github",
        href: hrefFor("github", profile.github),
        label: "GitHub",
        icon: Github,
      });
    }
    if (profile.twitter) {
      icons.push({
        key: "twitter",
        href: hrefFor("twitter", profile.twitter),
        label: "X",
        icon: XIcon,
      });
    }
    if (profile.instagram) {
      icons.push({
        key: "instagram",
        href: hrefFor("instagram", profile.instagram),
        label: "Instagram",
        icon: Instagram,
      });
    }
    if (profile.behance) {
      icons.push({
        key: "behance",
        href: hrefFor("behance", profile.behance),
        label: "Behance",
        icon: BehanceIcon,
      });
    }
    if (profile.website) {
      icons.push({
        key: "website",
        href: hrefFor("website", profile.website),
        label: "Web",
        icon: Globe,
      });
    }
    return icons;
  }, [profile]);

  const shareCard = async () => {
    if (!profile?.handle) return;
    trackCardEvent(profile.handle, "share");
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: profile.name,
          text: [profile.title, profile.company].filter(Boolean).join(" · "),
          url: publicUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(publicUrl);
      setShareFlash(true);
      setTimeout(() => setShareFlash(false), 2000);
    } catch {
      /* ignore cancel / clipboard */
    }
  };

  const linkRows = useMemo<LinkRow[]>(() => {
    if (!profile) return [];
    const rows: LinkRow[] = [];
    for (const l of profile.profileLinks ?? []) {
      const href = /^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`;
      let host = l.url.replace(/^https?:\/\//i, "");
      try {
        host = new URL(href).hostname.replace(/^www\./, "");
      } catch {
        /* keep host */
      }
      rows.push({
        key: `custom-${l.id}`,
        href,
        label: l.label || host,
        sub: host,
        icon: Globe,
        logo: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
        featured: Boolean(l.featured),
      });
    }
    const primaryHref = primaryCta?.href.replace(/\/+$/, "").toLowerCase();
    if (!primaryHref) return rows;
    return rows.filter((row) => row.href.replace(/\/+$/, "").toLowerCase() !== primaryHref);
  }, [profile, primaryCta]);

  const theme = profile?.cardTheme ?? { accent: "#0A0A0A", bg: "#F4F1EC", layout: "stack" as const };
  const themeStyle = {
    ["--card-accent" as string]: theme.accent,
    ["--card-bg" as string]: theme.bg,
    backgroundColor: theme.bg,
  };

  return (
    <div className="min-h-dvh overflow-x-clip text-[var(--ink)]" style={themeStyle}>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,10,10,0.07),_transparent_58%)]" />
        <div
          className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 opacity-70"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, var(--card-accent) 22%, transparent), transparent 68%)`,
          }}
        />
      </div>
      <div className="relative mx-auto w-full max-w-[420px] px-4 pb-28 pt-[max(2rem,calc(1.5rem+env(safe-area-inset-top)))] sm:px-5 sm:pt-12">
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
            <article
              className={[
                "overflow-hidden border border-[var(--ink)]/10 shadow-[0_24px_80px_-40px_rgba(10,10,10,0.45)] backdrop-blur-sm",
                theme.layout === "card" ? "bg-[var(--bone)]/90" : "bg-[var(--bone)]/80",
              ].join(" ")}
              style={{ borderColor: `color-mix(in srgb, var(--card-accent) 18%, transparent)` }}
            >
              <header className="relative flex flex-col items-center px-5 pb-6 pt-8 text-center">
                <div className="relative mb-6">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -m-10 blur-xl"
                    style={{
                      background: `radial-gradient(circle, color-mix(in srgb, var(--card-accent) 28%, transparent), transparent 64%)`,
                    }}
                  />
                  <div
                    className="relative size-[5.5rem] overflow-hidden bg-[var(--ink)]/[0.03] sm:size-24"
                    style={{
                      border: `1px solid color-mix(in srgb, var(--card-accent) 40%, transparent)`,
                      boxShadow: `0 0 0 1px color-mix(in srgb, var(--card-accent) 12%, transparent)`,
                    }}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center font-serif text-3xl text-[var(--ink-muted)]">
                        {profile.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mb-2 font-mono text-label uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                  <span lang="en">inner·id</span>
                </p>

                <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
                  <h1
                    className="font-serif font-display text-3xl text-[var(--ink)] sm:text-[2.35rem]"
                    style={{ fontWeight: 600 }}
                  >
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <CheckCircle2
                      className="size-5 text-[var(--success-ink)]"
                      aria-label={t("publicProfile.linkedinVerified")}
                    />
                  )}
                </div>

                <p className="font-mono text-caption text-[var(--ink-muted)]">
                  @{profile.handle}
                  {profile.title || profile.company
                    ? ` · ${[profile.title, profile.company].filter(Boolean).join(", ")}`
                    : ""}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span
                    className="border px-2.5 py-1 font-mono text-label uppercase tracking-widest"
                    style={{
                      borderColor: `color-mix(in srgb, var(--card-accent) 35%, transparent)`,
                      background: `color-mix(in srgb, var(--card-accent) 12%, transparent)`,
                      color: "var(--ink)",
                    }}
                  >
                    {profile.tier}
                  </span>
                  <span className="border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("publicProfile.memberSince", { date: memberSince(profile.createdAt) })}
                  </span>
                </div>

                {socialIcons.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {socialIcons.map((s) => (
                      <a
                        key={s.key}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        onClick={() =>
                          profile.handle && trackCardEvent(profile.handle, "link", `social-${s.key}`)
                        }
                        className="flex size-10 items-center justify-center border border-[var(--ink)]/12 text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40 hover:bg-[var(--ink)]/[0.04]"
                      >
                        <s.icon className="size-4" />
                      </a>
                    ))}
                  </div>
                )}
              </header>

              <div className="space-y-4 px-4 pb-5">
                {primaryCta && (
                  <a
                    href={primaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      profile.handle &&
                      trackCardEvent(profile.handle, "link", primaryCta.linkKey ?? "primary")
                    }
                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 font-mono text-label uppercase tracking-widest transition-transform active:scale-[0.98]"
                    style={{
                      background: "var(--card-accent)",
                      color: theme.accent.toUpperCase() === "#18FF85" ? "#0A0A0A" : "var(--bone)",
                      border: `1px solid var(--card-accent)`,
                    }}
                  >
                    <primaryCta.icon className="size-3.5" />
                    {primaryCta.label}
                  </a>
                )}

                {profile.bio && (
                  <p className="text-center text-sm font-light leading-relaxed text-[var(--ink-body)]">
                    {profile.bio}
                  </p>
                )}

                {profile.skills.length > 0 && (
                  <div>
                    <p className="mb-2 text-center font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                      {t("publicProfile.skills")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
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

                {linkRows.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                        {t("publicProfile.links")}
                      </p>
                      <p className="font-mono text-label tabular-nums text-[var(--ink-subtle)]">
                        {String(linkRows.length).padStart(2, "0")}
                      </p>
                    </div>
                    <div
                      className={`overflow-hidden border border-[var(--ink)]/[0.1] ${
                        linkRows.length > 6 ? "max-h-[min(52vh,24rem)] overflow-y-auto" : ""
                      }`}
                    >
                      <div className="divide-y divide-[var(--ink)]/[0.08]">
                        {linkRows.map((row, index) => (
                          <a
                            key={row.key}
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              profile.handle && trackCardEvent(profile.handle, "link", row.key)
                            }
                            className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[var(--ink)]/[0.045] active:bg-[var(--ink)]/[0.07]"
                          >
                            <span className="w-5 shrink-0 font-mono text-label tabular-nums text-[var(--ink-subtle)]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <LinkMark logo={row.logo} Icon={row.icon} />
                            <span className="min-w-0 flex-1 text-left">
                              <span className="block truncate text-sm text-[var(--ink)]">
                                {row.label}
                              </span>
                              <span className="block truncate font-mono text-caption text-[var(--ink-muted)]">
                                {row.sub}
                              </span>
                            </span>
                            <ArrowUpRight className="size-4 shrink-0 text-[var(--ink-subtle)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--ink)]" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 border-t border-[var(--inner-green)]/20 bg-[var(--inner-green)]/8 px-4 py-4">
                <Shield className="mt-0.5 size-4 shrink-0 text-[var(--success-ink)]" />
                <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                  {t("publicProfile.verifiedNote")}
                </p>
              </div>

              {profile.visibility === "public" && profile.handle && (
                <div className="flex flex-col items-center gap-2 border-t border-[var(--ink)]/[0.08] py-5">
                  <img
                    src={apiUrl(`/api/public/profile/${encodeURIComponent(profile.handle)}/qr.svg`)}
                    alt=""
                    width={120}
                    height={120}
                    className="size-[120px]"
                  />
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("publicProfile.scanHint")}
                  </p>
                </div>
              )}
            </article>
          </FadeIn>
        )}
      </div>

      {status === "ok" && profile?.handle && profile.visibility === "public" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--ink)]/[0.08] bg-[var(--bone)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[420px] gap-2 px-4 py-3 sm:px-5">
            <a
              href={apiUrl(`/api/public/profile/${encodeURIComponent(profile.handle)}.vcf`)}
              className="flex flex-1 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-3 py-3 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
            >
              <Contact className="size-3.5" />
              {t("publicProfile.addToContacts")}
            </a>
            <button
              type="button"
              onClick={() => void shareCard()}
              className="flex flex-1 items-center justify-center gap-2 border border-[var(--ink)]/20 px-3 py-3 font-mono text-label uppercase tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40"
            >
              <Share2 className="size-3.5" />
              {shareFlash ? t("publicProfile.copied") : t("publicProfile.share")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
