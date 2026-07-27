import { useEffect, useMemo, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  QrCode,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
  Check,
  X,
  Link2,
} from "lucide-react";
import { Link } from "wouter";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useLocale, useT } from "@/i18n";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  persona?: string | null;
  membershipPlan?: string | null;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  handle?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  twitter?: string | null;
  skills?: string[];
  visibility?: string | null;
  profileCompletionPct?: number;
  createdAt?: string;
};

type LinkKey = "linkedin" | "github" | "website";

function stripPrefix(value: string, prefixes: string[]): string {
  let v = value.trim();
  for (const p of prefixes) {
    if (v.toLowerCase().startsWith(p.toLowerCase())) v = v.slice(p.length);
  }
  return v.replace(/^\/+/, "");
}

function handleFromUser(user: ApiUser): string {
  if (user.handle?.trim()) return user.handle.trim().toLowerCase();
  return (user.email.split("@")[0] || "uye").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

function formatMemberSince(iso: string | undefined, locale: string, noneLabel: string): string {
  if (!iso) return noneLabel;
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    month: "long",
    year: "numeric",
  });
}

function buildSnippets(handle: string, name: string, badgeAlt: string) {
  const profile = `https://inner.digital/u/${handle}`;
  const badge = `https://inner.digital/api/badge/${handle}.svg`;
  return {
    html: `<a href="${profile}" target="_blank" rel="noopener">
  <img src="${badge}" alt="${badgeAlt}" height="28" />
</a>`,
    markdown: `[![${badgeAlt}](${badge})](${profile})`,
    json: `{
  "name": ${JSON.stringify(name)},
  "handle": ${JSON.stringify(handle)},
  "verified": true,
  "profile": ${JSON.stringify(profile)},
  "badge": ${JSON.stringify(badge)}
}`,
  } as const;
}

type SnippetTab = "html" | "markdown" | "json";

function IdCard({
  user,
  handle,
  skills,
}: {
  user: ApiUser;
  handle: string;
  skills: string[];
}) {
  const t = useT();
  const { locale } = useLocale();
  const isFounder =
    user.membershipPlan === "founder" || user.persona === "founder";
  const tier = isFounder ? t("id.tierFounder") : t("id.tierMember");
  const badges = [
    isFounder ? t("id.badgeFounder") : t("id.badgeMember"),
    ...(user.title ? [user.title] : []),
    ...skills.slice(0, 2),
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden panel-glass-ink p-6">
      <AmbientCardBackground />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 23px,var(--bone-fixed) 23px,var(--bone-fixed) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,var(--bone-fixed) 23px,var(--bone-fixed) 24px)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/47">
              <span lang="en">inner·id</span>
            </span>
            <span className="font-mono text-label text-[var(--bone-fixed)]/37">·</span>
            <span className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/47">
              #{String(user.id).padStart(3, "0")}
            </span>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span
              className="font-serif text-3xl text-[var(--bone-fixed)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
            >
              {user.name}
            </span>
            <CheckCircle2 className="size-4 shrink-0 text-[var(--success-ink)]" />
          </div>

          <p className="mb-4 font-mono text-caption text-[var(--bone-fixed)]/57">
            @{handle}
            {user.title || user.company
              ? ` · ${[user.title, user.company].filter(Boolean).join(", ")}`
              : ""}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className="border border-[var(--bone-fixed)]/15 px-2 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/50"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex size-16 items-center justify-center border border-[var(--bone-fixed)]/15 bg-[var(--bone-fixed)]/5">
            <QrCode className="size-8 text-[var(--bone-fixed)]/42" />
          </div>
          <span className="border border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
            {tier}
          </span>
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-[var(--bone-fixed)]/[0.08] pt-4">
        <div>
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/42">
            {t("id.profileCompletion")}
          </p>
          <p className="font-mono text-sm text-[var(--bone-fixed)]/70">%{user.profileCompletionPct ?? 0}</p>
        </div>
        <p className="font-mono text-label text-[var(--bone-fixed)]/37">
          {t("id.memberSince", {
            date: formatMemberSince(user.createdAt, locale, t("id.none")),
          })}
        </p>
      </div>
    </div>
  );
}

function EmbedSection({ handle, name }: { handle: string; name: string }) {
  const t = useT();
  const badgeAlt = `inner·hub ${t("common.member")}`;
  const snippets = useMemo(() => buildSnippets(handle, name, badgeAlt), [handle, name, badgeAlt]);
  const [tab, setTab] = useState<SnippetTab>("html");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="panel-glass">
      <div className="flex border-b border-[var(--ink)]/[0.08]">
        {(Object.keys(snippets) as SnippetTab[]).map((snippetTab) => (
          <button
            key={snippetTab}
            type="button"
            onClick={() => setTab(snippetTab)}
            className={[
              "border-r border-[var(--ink)]/[0.08] px-4 py-2.5 font-mono text-label uppercase tracking-widest transition-colors last:border-0",
              tab === snippetTab
                ? "bg-[var(--ink)] text-[var(--bone)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {snippetTab}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void copy()}
          className="ml-auto flex items-center gap-1.5 px-4 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
        >
          <Copy className="size-3" />
          {copied ? t("common.copied") : t("common.copy")}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[var(--ink)]/[0.02] p-4 font-mono text-caption leading-relaxed text-[var(--ink-body)]">
        {snippets[tab]}
      </pre>
    </div>
  );
}

function PlatformBindRow({
  icon: Icon,
  label,
  desc,
  brandColor,
  prefix,
  value,
  placeholder,
  connected,
  onSave,
  onUnlink,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  brandColor?: string;
  prefix: string;
  value: string;
  placeholder: string;
  connected: boolean;
  onSave: (v: string) => Promise<void>;
  onUnlink: () => Promise<void>;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? t("id.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setError(null);
    try {
      await onUnlink();
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? t("id.removeFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel-glass p-4 transition-all hover:border-[var(--ink)]/20">
      <div className="flex items-center gap-4">
        <div
          className={
            brandColor
              ? "flex size-9 shrink-0 items-center justify-center border"
              : "flex size-9 shrink-0 items-center justify-center panel-glass"
          }
          style={brandColor ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
        >
          <Icon className={brandColor ? "size-4 text-[var(--bone)]" : "size-4 text-[var(--ink-body)]"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-[var(--ink)]">{label}</p>
            {connected && (
              <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
                {t("id.connected")}
              </span>
            )}
          </div>
          <p className="font-mono text-label text-[var(--ink-muted)]">
            {connected ? `${prefix}${value}` : desc}
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
              setError(null);
            }}
            className="flex shrink-0 items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            {connected ? t("common.edit") : t("id.connect")} <ChevronRight className="size-3" />
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 space-y-2 border-t border-[var(--ink)]/[0.06] pt-3">
          <div className="flex items-stretch panel-glass focus-within:border-[var(--ink)]/30">
            <span className="flex items-center border-r border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 font-mono text-label text-[var(--ink-body)]">
              {prefix}
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-2 font-mono text-caption text-[var(--ink)] outline-none"
              autoFocus
            />
          </div>
          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void save()}
              className="flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] disabled:opacity-40"
            >
              <Check className="size-3" /> {busy ? t("common.saving") : t("common.save")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 panel-glass px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
            >
              <X className="size-3" /> {t("common.cancel")}
            </button>
            {connected && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void unlink()}
                className="ml-auto font-mono text-label uppercase tracking-widest text-[var(--error-ink)]"
              >
                {t("id.unlink")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InnerId() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ user: ApiUser }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const user = data?.user;
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handle = user ? handleFromUser(user) : "";
  const skills = Array.isArray(user?.skills) ? user!.skills! : [];
  const linkedin = stripPrefix(user?.linkedin ?? "", ["https://", "http://", "www.", "linkedin.com/in/"]);
  const github = stripPrefix(user?.github ?? "", ["https://", "http://", "www.", "github.com/"]);
  const website = stripPrefix(user?.website ?? "", ["https://", "http://"]);
  const publicUrl = handle ? `inner.digital/u/${handle}` : "inner.digital/u/…";

  const patchLinks = async (patch: Partial<Record<LinkKey, string | null>>) => {
    if (!user) return;
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    const res = await fetch(apiUrl("/api/auth/me"), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: parts[0] ?? user.name,
        lastName: parts.slice(1).join(" "),
        handle: user.handle ?? handle,
        title: user.title ?? "",
        company: user.company ?? "",
        bio: user.bio ?? "",
        skills,
        linkedin: patch.linkedin !== undefined ? patch.linkedin ?? "" : linkedin,
        github: patch.github !== undefined ? patch.github ?? "" : github,
        website: patch.website !== undefined ? patch.website ?? "" : website,
        twitter: stripPrefix(user.twitter ?? "", ["https://", "http://", "www.", "x.com/", "twitter.com/"]),
        visibility:
          user.visibility === "public" || user.visibility === "private" || user.visibility === "members"
            ? user.visibility
            : "members",
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? t("id.saveFailed"));
    await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    window.dispatchEvent(new CustomEvent("inner-profile-updated", { detail: json.user }));
  };

  if (isLoading && !user) {
    return (
      <div className="max-w-2xl">
        <LoadingBlock label={t("id.loading")} />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl">
        <ErrorState
          message={error instanceof Error ? error.message : t("id.loadError")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-2xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("id.eyebrow")}
            </p>
            <h1
              className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
            >
              <Lockup suffix="id" className="text-[var(--ink)]" />
            </h1>
            <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">
              {t("id.subtitle")}
            </p>
          </div>
          <Link
            href="/panel/profile"
            className="flex shrink-0 items-center gap-1.5 self-start panel-glass px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
          >
            <Link2 className="size-3" /> {t("id.editProfile")}
          </Link>
        </div>
      </FadeIn>

      <IdCard user={user} handle={handle} skills={skills} />

      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("id.publicProfile")}
        </p>
        <div className="flex flex-col gap-3 panel-glass px-4 py-3 sm:flex-row sm:items-center sm:gap-2">
          <Globe className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
          <span className="min-w-0 flex-1 break-all font-mono text-sm text-[var(--ink-body)] sm:text-caption">{publicUrl}</span>
          <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`https://${publicUrl}`);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              } catch {
                /* ignore */
              }
            }}
            className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <Copy className="size-3" /> {copiedUrl ? t("common.copied") : t("common.copy")}
          </button>
          <a
            href={`https://${publicUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ExternalLink className="size-3" /> {t("common.view")}
          </a>
          </div>
        </div>
        {!user.handle && (
          <p className="mt-2 font-mono text-label text-[var(--ink-muted)]">
            <Link href="/panel/profile" className="underline underline-offset-2">
              {t("id.setHandle")}
            </Link>
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("id.skills")}
        </p>
        {skills.length === 0 ? (
          <p className="font-mono text-label text-[var(--ink-muted)]">
            {t("id.noSkills")}{" "}
            <Link href="/panel/profile" className="underline underline-offset-2">
              {t("id.addInProfile")}
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="panel-glass px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("id.platformLinks")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {t("id.platformLinksHint")}
          </p>
        </div>
        <div className="space-y-2">
          <PlatformBindRow
            icon={Linkedin}
            label="LinkedIn"
            desc={t("id.linkedinDesc")}
            brandColor="#0A66C2"
            prefix="linkedin.com/in/"
            placeholder="profiladin"
            value={linkedin}
            connected={!!linkedin}
            onSave={(v) => patchLinks({ linkedin: stripPrefix(v, ["linkedin.com/in/", "https://", "http://"]) })}
            onUnlink={() => patchLinks({ linkedin: "" })}
          />
          <PlatformBindRow
            icon={Github}
            label="GitHub"
            desc={t("id.githubDesc")}
            brandColor="#181717"
            prefix="github.com/"
            placeholder="kullaniciadi"
            value={github}
            connected={!!github}
            onSave={(v) => patchLinks({ github: stripPrefix(v, ["github.com/", "https://", "http://"]) })}
            onUnlink={() => patchLinks({ github: "" })}
          />
          <PlatformBindRow
            icon={Globe}
            label={t("id.personalSite")}
            desc={t("id.websiteDesc")}
            prefix="https://"
            placeholder="siteadresin.com"
            value={website}
            connected={!!website}
            onSave={(v) => patchLinks({ website: stripPrefix(v, ["https://", "http://"]) })}
            onUnlink={() => patchLinks({ website: "" })}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("id.badgeEmbed")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {t("id.badgeEmbedHint")}
          </p>
        </div>
        <EmbedSection handle={handle} name={user.name} />
      </section>

      <div className="flex items-start gap-3 border border-[var(--inner-green)]/20 bg-[var(--inner-green)]/5 p-4">
        <Shield className="mt-0.5 size-4 shrink-0 text-[var(--success-ink)]" />
        <div>
          <p className="mb-0.5 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
            {t("id.verified")}
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            {t("id.verifiedBody")}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·id</span> · {t("id.footer")}
        </p>
      </div>
    </div>
  );
}
