import { useEffect, useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Check, Plus, X, AlertCircle } from "lucide-react";
import { toUpperTR } from "@/lib/tr";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";

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
    "w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] outline-none transition-colors focus:border-[var(--ink)]/30",
    mono ? "font-mono text-caption" : "font-light",
  ].join(" ");

  return (
    <div>
      <label className="mb-1.5 block font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)]">
        {label}
      </label>
      {prefix ? (
        <div className="flex items-stretch border border-[var(--ink)]/[0.08] transition-colors focus-within:border-[var(--ink)]/30">
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
        Uzmanlıklar
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
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
              placeholder="Ekle..."
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
      <p className="font-mono text-label font-medium text-[var(--ink-muted)]">Maks. 10 etiket · Enter ile ekle</p>
    </div>
  );
}

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Herkese Açık", desc: "Herkes profilini görebilir" },
  { value: "members", label: "Yalnızca Üyeler", desc: "inner·hub üyeleri görebilir" },
  { value: "private", label: "Gizli", desc: "Yalnızca sen görürsün" },
] as const;

function VisibilitySelector({
  value,
  onChange,
}: {
  value: Profile["visibility"];
  onChange: (v: Profile["visibility"]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {VISIBILITY_OPTIONS.map((opt) => (
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
        <p className="mb-1 text-sm text-[var(--ink)]">Profil fotoğrafı</p>
        <p className="font-mono text-label font-medium text-[var(--ink-muted)]">Yakında — avatar URL ile</p>
      </div>
    </div>
  );
}

function CompletionBar({ pct }: { pct: number }) {
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
      <span className="shrink-0 font-mono text-label font-semibold text-[var(--ink-strong)]">%{pct} tamamlandı</span>
    </div>
  );
}

export default function ProfilePage() {
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
    if (v !== clean) setHandleError("Yalnızca küçük harf, rakam ve alt çizgi");
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
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi");
      if (json.user) setProfile(mapUserToProfile(json.user));
      setSaved(true);
      window.dispatchEvent(new CustomEvent("inner-profile-updated", { detail: json.user }));
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveError(e.message ?? "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const completion = calcCompletion(profile);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  if (isLoading && !hydrated) {
    return (
      <div className="max-w-xl">
        <LoadingBlock label="Profil yükleniyor" />
      </div>
    );
  }

  if (isError && !hydrated) {
    return (
      <div className="max-w-xl">
        <ErrorState
          message={error instanceof Error ? error.message : "Profil yüklenemedi"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <FadeIn>
        <div>
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            <span lang="en">inner·hub</span>
          </p>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            profil
            <span className="ml-[0.05em] inline-block size-[0.35em] translate-y-[0.08em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">inner·hub'daki kimliğini yönet.</p>
        </div>
      </FadeIn>

      <CompletionBar pct={completion} />
      <Avatar name={fullName || "Üye"} />

      <Section title="Temel Bilgiler">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" value={profile.firstName} onChange={(v) => set("firstName", v)} placeholder="Adın" maxLength={40} />
          <Field label="Soyad" value={profile.lastName} onChange={(v) => set("lastName", v)} placeholder="Soyadın" maxLength={40} />
        </div>
        <div className="mt-3">
          <Field
            label="Kullanıcı adı"
            value={profile.handle}
            onChange={validateHandle}
            prefix="inner.digital/u/"
            placeholder="handle"
            mono
            maxLength={20}
          />
          {handleError && (
            <p className="mt-1 flex items-center gap-1.5 font-mono text-label text-[var(--error-ink)]">
              <AlertCircle className="size-3" /> {handleError}
            </p>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Rol / Ünvan" value={profile.role} onChange={(v) => set("role", v)} placeholder="Kurucu, CPO..." maxLength={50} />
          <Field label="Şirket" value={profile.company} onChange={(v) => set("company", v)} placeholder="Şirket adı" maxLength={50} />
        </div>
        <div className="mt-3">
          <Field
            label="Biyografi"
            value={profile.bio}
            onChange={(v) => set("bio", v)}
            placeholder="Kısa bir tanıtım yaz..."
            textarea
            maxLength={160}
          />
        </div>
      </Section>

      <Section title="Uzmanlıklar" sub="inner·id kartında ve eşleşmelerde görünür">
        <SkillEditor skills={profile.skills} onChange={(s) => set("skills", s)} />
      </Section>

      <Section title="Sosyal Linkler" sub="inner·id rozetine bağlanır">
        <div className="space-y-3">
          <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => set("linkedin", v)} prefix="linkedin.com/in/" placeholder="profiladın" mono />
          <Field label="GitHub" value={profile.github} onChange={(v) => set("github", v)} prefix="github.com/" placeholder="kullanıcıadı" mono />
          <Field label="Kişisel site" value={profile.website} onChange={(v) => set("website", v)} prefix="https://" placeholder="siteadresin.com" mono />
          <Field label="X / Twitter" value={profile.twitter} onChange={(v) => set("twitter", v)} prefix="x.com/" placeholder="kullanıcıadı" mono />
        </div>
      </Section>

      <Section title="Profil Görünürlüğü" sub="Profilinin kim tarafından görüleceğini belirle">
        <VisibilitySelector value={profile.visibility} onChange={(v) => set("visibility", v)} />
      </Section>

      <div className="flex items-center gap-4 border-t border-[var(--ink)]/[0.08] pt-6">
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
              <Check className="size-3" /> Kaydedildi
            </>
          ) : saving ? (
            "Kaydediliyor…"
          ) : (
            "Kaydet"
          )}
        </button>
        {saved && (
          <p className="font-mono text-label text-[var(--ink-muted)]">Değişiklikler kaydedildi</p>
        )}
        {saveError && (
          <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
            {saveError}
          </p>
        )}
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · profil · davet bazlı
        </p>
      </div>
    </div>
  );
}
