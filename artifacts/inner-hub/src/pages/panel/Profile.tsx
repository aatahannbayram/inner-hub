import { useEffect, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { FadeIn } from "@/components/FadeIn";
import { Check, Plus, X, AlertCircle } from "lucide-react";
import { toUpperTR } from "@/lib/tr";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

type Profile = {
  firstName: string;
  lastName: string;
  handle: string;
  role: string;
  company: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
  visibility: "public" | "members" | "private";
};

type ApiUser = {
  name?: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  handle?: string | null;
  github?: string | null;
  website?: string | null;
  twitter?: string | null;
  skills?: string[];
  visibility?: string | null;
  profileCompletionPct?: number;
};

const EMPTY: Profile = {
  firstName: "",
  lastName: "",
  handle: "",
  role: "",
  company: "",
  bio: "",
  skills: [],
  linkedin: "",
  github: "",
  website: "",
  twitter: "",
  visibility: "members",
};

function splitName(name: string | undefined): { firstName: string; lastName: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function stripPrefix(value: string, prefixes: string[]): string {
  let v = value.trim();
  for (const p of prefixes) {
    if (v.toLowerCase().startsWith(p.toLowerCase())) {
      v = v.slice(p.length);
    }
  }
  return v.replace(/^\/+/, "");
}

function mapUserToProfile(user: ApiUser): Profile {
  const { firstName, lastName } = splitName(user.name);
  return {
    firstName,
    lastName,
    handle: user.handle ?? "",
    role: user.title ?? "",
    company: user.company ?? "",
    bio: user.bio ?? "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    linkedin: stripPrefix(user.linkedin ?? "", ["https://", "http://", "www.", "linkedin.com/in/"]),
    github: stripPrefix(user.github ?? "", ["https://", "http://", "www.", "github.com/"]),
    website: stripPrefix(user.website ?? "", ["https://", "http://"]),
    twitter: stripPrefix(user.twitter ?? "", ["https://", "http://", "www.", "x.com/", "twitter.com/"]),
    visibility:
      user.visibility === "public" || user.visibility === "private" || user.visibility === "members"
        ? user.visibility
        : "members",
  };
}

function calcCompletion(p: Profile): number {
  const checks = [
    p.firstName.trim().length > 0,
    p.lastName.trim().length > 0,
    p.handle.trim().length > 0,
    p.role.trim().length > 0,
    p.company.trim().length > 0,
    p.bio.trim().length > 20,
    p.skills.length >= 2,
    p.linkedin.trim().length > 0,
    p.github.trim().length > 0 || p.website.trim().length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-6">
      <div className="mb-4">
        <p className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-body)]">{title}</p>
        {sub && <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
  prefix,
  textarea,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  prefix?: string;
  textarea?: boolean;
  maxLength?: number;
}) {
  const cls = [
    "w-full panel-glass bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none transition-colors focus:border-[var(--ink)]/30",
    mono ? "font-mono text-caption" : "font-light",
  ].join(" ");

  return (
    <div>
      <label className="mb-1.5 block font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)]">
        {label}
      </label>
      {prefix ? (
        <div className="flex items-stretch panel-glass transition-colors focus-within:border-[var(--ink)]/30">
          <span className="flex items-center border-r border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 font-mono text-label font-medium text-[var(--ink-body)]">
            {prefix}
          </span>
          <input
            className="flex-1 bg-transparent px-3 py-2.5 text-sm font-light text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </div>
      ) : textarea ? (
        <textarea
          className={cls + " resize-none"}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
        <input
          className={cls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      )}
      {maxLength && (
        <p className="mt-1 text-right font-mono text-label font-medium text-[var(--ink-muted)]">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

function SkillEditor({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const t = useT();
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      onChange([...skills, trimmed]);
      setInput("");
    }
  };

  return (
    <div>
      <label className="mb-1.5 block font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)]">
        {t("profile.skills")}
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 panel-glass px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
          >
            {s}
            <button
              type="button"
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <X className="size-2.5" />
            </button>
          </span>
        ))}
        {skills.length < 10 && (
          <div className="flex items-stretch border border-dashed border-[var(--ink)]/15">
            <input
              className="w-28 bg-transparent px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none"
              placeholder={t("profile.skillAdd")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              type="button"
              onClick={add}
              className="border-l border-dashed border-[var(--ink)]/15 px-2 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <Plus className="size-3" />
            </button>
          </div>
        )}
      </div>
      <p className="font-mono text-label font-medium text-[var(--ink-muted)]">{t("profile.skillsHint")}</p>
    </div>
  );
}

function VisibilitySelector({
  value,
  onChange,
}: {
  value: Profile["visibility"];
  onChange: (v: Profile["visibility"]) => void;
}) {
  const t = useT();
  const options = [
    { value: "public" as const, label: t("profile.visibilityPublic"), desc: t("profile.visibilityPublicDesc") },
    { value: "members" as const, label: t("profile.visibilityMembers"), desc: t("profile.visibilityMembersDesc") },
    { value: "private" as const, label: t("profile.visibilityPrivate"), desc: t("profile.visibilityPrivateDesc") },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "flex items-center gap-3 border px-4 py-3 text-left transition-colors",
            value === opt.value
              ? "border-[var(--ink)]/30 bg-[var(--ink)]/[0.04]"
              : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/15",
          ].join(" ")}
        >
          <div
            className={[
              "flex size-4 shrink-0 items-center justify-center border",
              value === opt.value ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--ink)]/20",
            ].join(" ")}
          >
            {value === opt.value && <Check className="size-2.5 text-[var(--bone)]" />}
          </div>
          <div>
            <p className="text-sm text-[var(--ink)]">{opt.label}</p>
            <p className="font-mono text-label font-medium text-[var(--ink-muted)]">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const t = useT();
  const initials = toUpperTR(
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join(""),
  );

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-16 items-center justify-center bg-[var(--ink)] font-mono text-lg text-[var(--bone)]">
        {initials || "?"}
      </div>
      <div>
        <p className="mb-1 text-sm text-[var(--ink)]">{t("profile.photo")}</p>
        <p className="font-mono text-label font-medium text-[var(--ink-muted)]">{t("profile.photoSoon")}</p>
      </div>
    </div>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 flex-1 overflow-visible bg-[var(--ink)]/[0.08]">
        <div
          className="h-full bg-[var(--inner-green)] shadow-[0_0_8px_var(--inner-green)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-1.5 -translate-y-1/2 transition-all duration-500"
          style={{ left: `${pct}%`, transform: "translate(-100%, -50%)" }}
        >
          <span className="absolute inset-0 bg-[var(--inner-green)] animate-logo-ping" />
          <span className="relative block size-full bg-[var(--inner-green)]" />
        </span>
      </div>
      <span className="shrink-0 font-mono text-label font-semibold text-[var(--ink-strong)]">
        {t("profile.completionPct", { n: pct })}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const t = useT();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ user: ApiUser }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [handleError, setHandleError] = useState("");

  useEffect(() => {
    if (!data?.user) return;
    setProfile(mapUserToProfile(data.user));
    setHydrated(true);
  }, [data]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSaved(false);
    setSaveError(null);
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const validateHandle = (v: string) => {
    const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (v !== clean) setHandleError(t("profile.handleError"));
    else setHandleError("");
    set("handle", clean);
  };

  const save = async () => {
    if (handleError || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          handle: profile.handle,
          title: profile.role,
          company: profile.company,
          bio: profile.bio,
          skills: profile.skills,
          linkedin: profile.linkedin,
          github: profile.github,
          website: profile.website,
          twitter: profile.twitter,
          visibility: profile.visibility,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.saveError"));
      if (json.user) setProfile(mapUserToProfile(json.user));
      setSaved(true);
      window.dispatchEvent(new CustomEvent("inner-profile-updated", { detail: json.user }));
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveError(e.message ?? t("profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const completion = calcCompletion(profile);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  if (isLoading && !hydrated) {
    return (
      <div className="max-w-xl">
        <LoadingBlock label={t("profile.loading")} />
      </div>
    );
  }

  if (isError && !hydrated) {
    return (
      <div className="max-w-xl">
        <ErrorState
          message={error instanceof Error ? error.message : t("profile.loadError")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"><Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" /></div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("profile.title")}

          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("profile.subtitle")}</p>
        </div>
      </FadeIn>

      <CompletionBar pct={completion} />
      <Avatar name={fullName || t("common.member")} />

      <Section title={t("profile.sectionBasics")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("profile.firstName")} value={profile.firstName} onChange={(v) => set("firstName", v)} placeholder={t("profile.placeholderFirstName")} maxLength={40} />
          <Field label={t("profile.lastName")} value={profile.lastName} onChange={(v) => set("lastName", v)} placeholder={t("profile.placeholderLastName")} maxLength={40} />
        </div>
        <div className="mt-3">
          <Field
            label={t("profile.handle")}
            value={profile.handle}
            onChange={validateHandle}
            prefix="inner.digital/u/"
            placeholder={t("profile.placeholderHandle")}
            mono
            maxLength={20}
          />
          {handleError && (
            <p className="mt-1 flex items-center gap-1.5 font-mono text-label text-[var(--error-ink)]">
              <AlertCircle className="size-3" /> {handleError}
            </p>
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("profile.role")} value={profile.role} onChange={(v) => set("role", v)} placeholder={t("profile.placeholderRole")} maxLength={50} />
          <Field label={t("profile.company")} value={profile.company} onChange={(v) => set("company", v)} placeholder={t("profile.placeholderCompany")} maxLength={50} />
        </div>
        <div className="mt-3">
          <Field
            label={t("profile.bio")}
            value={profile.bio}
            onChange={(v) => set("bio", v)}
            placeholder={t("profile.placeholderBio")}
            textarea
            maxLength={160}
          />
        </div>
      </Section>

      <Section title={t("profile.sectionSkills")} sub={t("profile.sectionSkillsSub")}>
        <SkillEditor skills={profile.skills} onChange={(s) => set("skills", s)} />
      </Section>

      <Section title={t("profile.sectionSocial")} sub={t("profile.sectionSocialSub")}>
        <div className="space-y-3">
          <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => set("linkedin", v)} prefix="linkedin.com/in/" placeholder={t("profile.placeholderLinkedin")} mono />
          <Field label="GitHub" value={profile.github} onChange={(v) => set("github", v)} prefix="github.com/" placeholder={t("profile.placeholderGithub")} mono />
          <Field label={t("profile.personalSite")} value={profile.website} onChange={(v) => set("website", v)} prefix="https://" placeholder={t("profile.placeholderWebsite")} mono />
          <Field label={t("profile.twitter")} value={profile.twitter} onChange={(v) => set("twitter", v)} prefix="x.com/" placeholder={t("profile.placeholderTwitter")} mono />
        </div>
      </Section>

      <Section title={t("profile.visibility")} sub={t("profile.visibilityHint")}>
        <VisibilitySelector value={profile.visibility} onChange={(v) => set("visibility", v)} />
      </Section>

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--ink)]/[0.08] pt-6">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!!handleError || saving}
          className={[
            "flex items-center gap-2 border px-6 py-2.5 font-mono text-label uppercase tracking-widest transition-all",
            saved
              ? "border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
              : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] hover:bg-[var(--ink)]/85 disabled:opacity-30",
          ].join(" ")}
        >
          {saved ? (
            <>
              <Check className="size-3" /> {t("common.saved")}
            </>
          ) : saving ? (
            t("common.saving")
          ) : (
            t("common.save")
          )}
        </button>
        {saved && (
          <p className="font-mono text-label text-[var(--ink-muted)]">{t("profile.changesSaved")}</p>
        )}
        {saveError && (
          <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
            {saveError}
          </p>
        )}
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("profile.footer")}
        </p>
      </div>
    </div>
  );
}
