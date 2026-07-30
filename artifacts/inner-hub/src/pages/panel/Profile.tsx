import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { FadeIn } from "@/components/FadeIn";
import { Check, Plus, X, AlertCircle, Upload, Building2, Search, Linkedin, Unlink } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { MemberAvatar } from "@/components/panel/MemberAvatar";
import { useT } from "@/i18n";
import { useQueryClient } from "@tanstack/react-query";

const AVATAR_STYLES = ["lorelei", "shapes", "notionists", "avataaars", "bottts"] as const;
type AvatarStyle = (typeof AVATAR_STYLES)[number];
const ORG_TYPES = ["startup", "company", "fund", "studio"] as const;

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
  university: string;
  behance: string;
  instagram: string;
  phone: string;
  avatarStyle: AvatarStyle;
  visibility: "public" | "members" | "private";
};

type ApiOrg = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  type: string;
};

type ApiUser = {
  name?: string;
  email?: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  handle?: string | null;
  github?: string | null;
  website?: string | null;
  twitter?: string | null;
  university?: string | null;
  behance?: string | null;
  instagram?: string | null;
  phone?: string | null;
  skills?: string[];
  visibility?: string | null;
  profileCompletionPct?: number;
  avatarUrl?: string | null;
  resolvedAvatarUrl?: string | null;
  avatarStyle?: string | null;
  org?: ApiOrg | null;
  linkedinConnected?: boolean;
};

type OrgMine = ApiOrg & { membershipRole?: string };

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
  university: "",
  behance: "",
  instagram: "",
  phone: "",
  avatarStyle: "lorelei",
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
  const style = AVATAR_STYLES.includes(user.avatarStyle as AvatarStyle)
    ? (user.avatarStyle as AvatarStyle)
    : "lorelei";
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
    university: user.university ?? "",
    behance: stripPrefix(user.behance ?? "", ["https://", "http://", "www.", "behance.net/"]),
    instagram: stripPrefix(user.instagram ?? "", ["https://", "http://", "www.", "instagram.com/", "@"]),
    phone: user.phone ?? "",
    avatarStyle: style,
    visibility:
      user.visibility === "public" || user.visibility === "private" || user.visibility === "members"
        ? user.visibility
        : "members",
  };
}

function calcCompletion(p: Profile, hasAvatar: boolean): number {
  const checks = [
    p.firstName.trim().length > 0,
    p.lastName.trim().length > 0,
    p.handle.trim().length > 0,
    p.role.trim().length > 0,
    p.company.trim().length > 0,
    p.bio.trim().length > 20,
    p.skills.length >= 2,
    p.linkedin.trim().length > 0,
    p.github.trim().length > 0 || p.website.trim().length > 0 || p.behance.trim().length > 0,
    p.university.trim().length > 0,
    hasAvatar || p.handle.trim().length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/** Compress image to JPEG data URL under ~160KB string length. */
async function compressImageToDataUrl(file: File, maxChars = 160_000): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let w = bitmap.width;
  let h = bitmap.height;
  const maxDim = 640;
  if (Math.max(w, h) > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  let quality = 0.82;
  let dataUrl = "";
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= maxChars) break;
    if (quality > 0.45) quality -= 0.1;
    else {
      w = Math.max(96, Math.round(w * 0.75));
      h = Math.max(96, Math.round(h * 0.75));
    }
  }
  bitmap.close();
  if (dataUrl.length > maxChars) throw new Error("too_large");
  return dataUrl;
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
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  prefix?: string;
  textarea?: boolean;
  maxLength?: number;
  type?: string;
  hint?: string;
}) {
  const cls = [
    "w-full min-h-11 panel-glass bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none transition-colors focus:border-[var(--ink)]/30",
    mono ? "font-mono text-caption" : "font-light",
  ].join(" ");

  return (
    <div>
      <label className="mb-1.5 block font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)]">
        {label}
      </label>
      {prefix ? (
        <div className="flex min-h-11 items-stretch panel-glass transition-colors focus-within:border-[var(--ink)]/30">
          <span className="flex items-center border-r border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 font-mono text-label font-medium text-[var(--ink-body)]">
            {prefix}
          </span>
          <input
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-light text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            type={type}
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
          type={type}
        />
      )}
      {maxLength && (
        <p className="mt-1 text-right font-mono text-label font-medium text-[var(--ink-muted)]">
          {value.length}/{maxLength}
        </p>
      )}
      {hint && <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">{hint}</p>}
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
            "flex min-h-11 items-center gap-3 border px-4 py-3 text-left transition-colors",
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

function OrgSection() {
  const t = useT();
  const qc = useQueryClient();
  const { data, refetch } = useApiQuery<{ primaryOrgId: number | null; orgs: OrgMine[] }>(
    ["orgs-mine"],
    "/api/orgs/mine",
  );
  const orgs = data?.orgs ?? [];
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [type, setType] = useState<(typeof ORG_TYPES)[number]>("startup");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiOrg[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(apiUrl("/api/orgs"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl.trim() || undefined,
          type,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.orgCreateError"));
      setName("");
      setLogoUrl("");
      setMsg(t("profile.orgCreated"));
      await refetch();
      await qc.invalidateQueries({ queryKey: ["auth-me"] });
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : t("profile.orgCreateError"));
    } finally {
      setBusy(false);
    }
  };

  const search = async (query: string) => {
    setQ(query);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/orgs/search?q=${encodeURIComponent(query.trim())}`), {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      setResults(json.orgs ?? []);
    } catch {
      setResults([]);
    }
  };

  const join = async (id: number) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(apiUrl(`/api/orgs/${id}/join`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.orgJoinError"));
      setMsg(t("profile.orgJoined"));
      setQ("");
      setResults([]);
      await refetch();
      await qc.invalidateQueries({ queryKey: ["auth-me"] });
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : t("profile.orgJoinError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title={t("profile.org")} sub={t("profile.orgSub")}>
      {orgs.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {orgs.map((o) => (
            <li key={o.id} className="flex items-center gap-3 panel-glass px-3 py-2.5">
              {o.logoUrl ? (
                <img src={o.logoUrl} alt="" className="size-8 shrink-0 rounded-sm object-cover" />
              ) : (
                <Building2 className="size-4 shrink-0 text-[var(--ink-muted)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--ink)]">{o.name}</p>
                <p className="font-mono text-label text-[var(--ink-muted)]">
                  {o.type}
                  {o.membershipRole ? ` · ${o.membershipRole}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-[var(--ink-muted)]">{t("profile.orgEmpty")}</p>
      )}

      <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-strong)]">
        {t("profile.createOrg")}
      </p>
      <div className="space-y-3">
        <Field label={t("profile.orgName")} value={name} onChange={setName} placeholder={t("profile.orgNamePlaceholder")} maxLength={80} />
        <Field label={t("profile.orgLogo")} value={logoUrl} onChange={setLogoUrl} placeholder="https://…" mono />
        <div>
          <label className="mb-1.5 block font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)]">
            {t("profile.orgType")}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as (typeof ORG_TYPES)[number])}
            className="min-h-11 w-full panel-glass bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
          >
            {ORG_TYPES.map((ot) => (
              <option key={ot} value={ot}>
                {t(`profile.orgType_${ot}`)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={busy || name.trim().length < 2}
          onClick={() => void create()}
          className="min-h-11 w-full border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] disabled:opacity-30 sm:w-auto"
        >
          {t("profile.createOrg")}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-strong)]">
          {t("profile.joinOrg")}
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            value={q}
            onChange={(e) => void search(e.target.value)}
            placeholder={t("profile.joinOrgPlaceholder")}
            className="min-h-11 w-full panel-glass bg-transparent py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] outline-none"
          />
        </div>
        {results.length > 0 && (
          <ul className="divide-y divide-[var(--ink)]/[0.06] border border-[var(--ink)]/[0.08]">
            {results.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="truncate text-sm text-[var(--ink)]">{r.name}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void join(r.id)}
                  className="shrink-0 font-mono text-label uppercase tracking-widest text-[var(--ink)] underline-offset-2 hover:underline disabled:opacity-40"
                >
                  {t("profile.join")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {msg && <p className="mt-3 font-mono text-label text-[var(--ink-muted)]">{msg}</p>}
    </Section>
  );
}

export default function ProfilePage() {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ user: ApiUser }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const [profile, setProfile] = useState<Profile>(EMPTY);
  /** Uploaded photo only (not DiceBear resolved URL). */
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [org, setOrg] = useState<ApiOrg | null>(null);
  const [seed, setSeed] = useState("inner");
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [handleError, setHandleError] = useState("");
  const [linkedinEnabled, setLinkedinEnabled] = useState(false);
  const [linkedinNotice, setLinkedinNotice] = useState<"connected" | "error" | null>(null);
  const [linkedinBusy, setLinkedinBusy] = useState(false);

  useEffect(() => {
    if (!data?.user) return;
    setProfile(mapUserToProfile(data.user));
    setCustomAvatar(data.user.avatarUrl ?? null);
    setOrg(data.user.org ?? null);
    setSeed(data.user.handle || data.user.email || data.user.name || "inner");
    setHydrated(true);
  }, [data]);

  useEffect(() => {
    fetch(apiUrl("/api/auth/config"))
      .then((res) => res.json())
      .then((cfg: { linkedinEnabled?: boolean }) => setLinkedinEnabled(Boolean(cfg.linkedinEnabled)))
      .catch(() => {});
  }, []);

  // LinkedIn OAuth callback'inden dönünce (?linkedin=connected|error) bir kere göster, URL'i temizle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("linkedin");
    if (status === "connected" || status === "error") {
      setLinkedinNotice(status);
      window.history.replaceState({}, "", window.location.pathname);
      if (status === "connected") void refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnectLinkedin = async () => {
    setLinkedinBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/linkedin/disconnect"), {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) void refetch();
    } finally {
      setLinkedinBusy(false);
    }
  };

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

  const applyUser = (user: ApiUser) => {
    setProfile(mapUserToProfile(user));
    setCustomAvatar(user.avatarUrl ?? null);
    if (user.org !== undefined) setOrg(user.org);
    setSeed(user.handle || user.email || user.name || "inner");
    window.dispatchEvent(new CustomEvent("inner-profile-updated", { detail: user }));
  };

  const uploadAvatar = async (file: File) => {
    setAvatarBusy(true);
    setSaveError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const res = await fetch(apiUrl("/api/auth/me/avatar"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.avatarError"));
      if (json.user) applyUser(json.user);
    } catch (e: unknown) {
      const msg =
        e instanceof Error && e.message === "too_large"
          ? t("profile.avatarTooLarge")
          : e instanceof Error
            ? e.message
            : t("profile.avatarError");
      setSaveError(msg);
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const useGenerated = async (style?: AvatarStyle) => {
    setAvatarBusy(true);
    setSaveError(null);
    try {
      const st = style ?? profile.avatarStyle;
      const res = await fetch(apiUrl("/api/auth/me/avatar"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useGenerated: true, avatarStyle: st }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.avatarError"));
      if (json.user) applyUser(json.user);
      set("avatarStyle", st);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t("profile.avatarError"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const pickStyle = (st: AvatarStyle) => {
    set("avatarStyle", st);
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
          university: profile.university,
          behance: profile.behance,
          instagram: profile.instagram,
          phone: profile.phone,
          avatarStyle: profile.avatarStyle,
          visibility: profile.visibility,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.saveError"));
      if (json.user) applyUser(json.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t("profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const hasCustomAvatar = Boolean(customAvatar);
  const completion = calcCompletion(profile, hasCustomAvatar || Boolean(profile.handle));
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <MemberAvatar
          seed={seed}
          avatarUrl={customAvatar}
          avatarStyle={profile.avatarStyle}
          orgLogoUrl={org?.logoUrl}
          orgName={org?.name}
          size="lg"
          alt={fullName}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("profile.avatar")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-1.5 panel-glass px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] disabled:opacity-40"
            >
              <Upload className="size-3" />
              {avatarBusy ? t("common.loading") : t("profile.uploadAvatar")}
            </button>
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => void useGenerated(profile.avatarStyle)}
              className="inline-flex min-h-11 items-center panel-glass px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] disabled:opacity-40"
            >
              {t("profile.useGenerated")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadAvatar(f);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_STYLES.map((st) => (
              <button
                key={st}
                type="button"
                disabled={avatarBusy}
                onClick={() => pickStyle(st)}
                className={[
                  "border px-2.5 py-1.5 font-mono text-label uppercase tracking-widest transition-colors",
                  profile.avatarStyle === st
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {st}
              </button>
            ))}
          </div>
          <p className="font-mono text-label text-[var(--ink-muted)]">{t("profile.avatarHint")}</p>
        </div>
      </div>

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
          <Field label={t("profile.university")} value={profile.university} onChange={(v) => set("university", v)} placeholder={t("profile.placeholderUniversity")} maxLength={120} />
        </div>
        <div className="mt-3">
          <Field
            label={t("profile.phone")}
            value={profile.phone}
            onChange={(v) => set("phone", v)}
            placeholder={t("profile.placeholderPhone")}
            type="tel"
            hint={t("profile.phoneHint")}
            maxLength={40}
          />
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
          {linkedinEnabled && (
            <div className="flex flex-wrap items-center justify-between gap-3 panel-glass p-3">
              <div className="flex items-center gap-2.5">
                <Linkedin className="size-4 shrink-0 text-[var(--ink-muted)]" />
                <div>
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink)]">
                    {data?.user?.linkedinConnected
                      ? t("profile.linkedinConnected")
                      : t("profile.linkedinConnectTitle")}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">{t("profile.linkedinConnectHint")}</p>
                </div>
              </div>
              {data?.user?.linkedinConnected ? (
                <button
                  type="button"
                  disabled={linkedinBusy}
                  onClick={() => void disconnectLinkedin()}
                  className="inline-flex shrink-0 items-center gap-1.5 border border-[var(--error-ink)]/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)] transition-colors hover:bg-[var(--error-ink)]/5 disabled:opacity-40"
                >
                  <Unlink className="size-3" />
                  {t("profile.linkedinDisconnect")}
                </button>
              ) : (
                <a
                  href={apiUrl("/api/auth/linkedin/start")}
                  className="inline-flex shrink-0 items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                >
                  <Linkedin className="size-3" />
                  {t("profile.linkedinConnect")}
                </a>
              )}
            </div>
          )}
          {linkedinNotice === "connected" && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--success-ink)]">
              <Check className="size-3.5" /> {t("profile.linkedinConnectedToast")}
            </p>
          )}
          {linkedinNotice === "error" && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--error-ink)]">
              <AlertCircle className="size-3.5" /> {t("profile.linkedinErrorToast")}
            </p>
          )}
          <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => set("linkedin", v)} prefix="linkedin.com/in/" placeholder={t("profile.placeholderLinkedin")} mono />
          <Field label="GitHub" value={profile.github} onChange={(v) => set("github", v)} prefix="github.com/" placeholder={t("profile.placeholderGithub")} mono />
          <Field label={t("profile.behance")} value={profile.behance} onChange={(v) => set("behance", v)} prefix="behance.net/" placeholder={t("profile.placeholderBehance")} mono />
          <Field label={t("profile.instagram")} value={profile.instagram} onChange={(v) => set("instagram", v)} prefix="instagram.com/" placeholder={t("profile.placeholderInstagram")} mono />
          <Field label={t("profile.personalSite")} value={profile.website} onChange={(v) => set("website", v)} prefix="https://" placeholder={t("profile.placeholderWebsite")} mono />
          <Field label={t("profile.twitter")} value={profile.twitter} onChange={(v) => set("twitter", v)} prefix="x.com/" placeholder={t("profile.placeholderTwitter")} mono />
        </div>
      </Section>

      <OrgSection />

      <Section title={t("profile.visibility")} sub={t("profile.visibilityHint")}>
        <VisibilitySelector value={profile.visibility} onChange={(v) => set("visibility", v)} />
      </Section>

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--ink)]/[0.08] pt-6">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!!handleError || saving}
          className={[
            "flex min-h-11 items-center gap-2 border px-6 py-2.5 font-mono text-label uppercase tracking-widest transition-all",
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
