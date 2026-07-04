import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Check, Plus, X, AlertCircle } from "lucide-react";

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL = {
  firstName: "Ata Han",
  lastName: "Bayram",
  handle: "atahan",
  role: "Kurucu",
  company: "inner·hub",
  bio: "Topluluk, ürün ve AI kesişiminde çalışıyorum. inner·hub'ı kuruyorum.",
  skills: ["Ürün", "AI", "Topluluk", "B2B SaaS"],
  linkedin: "linkedin.com/in/atahanbayram",
  github: "github.com/atahan",
  website: "atahan.co",
  twitter: "",
  visibility: "public" as "public" | "members" | "private",
};

type Profile = typeof INITIAL;

// ─── Completion calculator ─────────────────────────────────────────────────────

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

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-6">
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">{title}</p>
        {sub && <p className="mt-0.5 text-xs text-[var(--ink)]/30">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

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
    "w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink)]/25 outline-none transition-colors focus:border-[var(--ink)]/30",
    mono ? "font-mono text-[11px]" : "font-light",
  ].join(" ");

  return (
    <div>
      <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
        {label}
      </label>
      {prefix ? (
        <div className="flex items-stretch border border-[var(--ink)]/[0.08] focus-within:border-[var(--ink)]/30 transition-colors">
          <span className="flex items-center border-r border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 font-mono text-[10px] text-[var(--ink)]/30">
            {prefix}
          </span>
          <input
            className="flex-1 bg-transparent px-3 py-2.5 text-sm font-light text-[var(--ink)] placeholder:text-[var(--ink)]/25 outline-none"
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
        <p className="mt-1 text-right font-mono text-[9px] text-[var(--ink)]/20">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

// ─── Skill editor ─────────────────────────────────────────────────────────────

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
      <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
        Uzmanlıklar
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/60"
          >
            {s}
            <button
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors"
            >
              <X className="size-2.5" />
            </button>
          </span>
        ))}
        {skills.length < 10 && (
          <div className="flex items-stretch border border-dashed border-[var(--ink)]/15">
            <input
              className="w-28 bg-transparent px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)] placeholder:text-[var(--ink)]/20 outline-none"
              placeholder="Ekle..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              onClick={add}
              className="border-l border-dashed border-[var(--ink)]/15 px-2 text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors"
            >
              <Plus className="size-3" />
            </button>
          </div>
        )}
      </div>
      <p className="font-mono text-[9px] text-[var(--ink)]/20">Maks. 10 etiket · Enter ile ekle</p>
    </div>
  );
}

// ─── Visibility selector ──────────────────────────────────────────────────────

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
            <p className="font-mono text-[9px] text-[var(--ink)]/30">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-16 items-center justify-center bg-[var(--ink)] font-mono text-lg text-[var(--bone)]">
        {initials}
      </div>
      <div>
        <p className="mb-1 text-sm text-[var(--ink)]">Profil fotoğrafı</p>
        <p className="font-mono text-[9px] text-[var(--ink)]/30">JPG, PNG — maks. 2 MB</p>
        <button className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 underline underline-offset-2 hover:text-[var(--ink)] transition-colors">
          Değiştir
        </button>
      </div>
    </div>
  );
}

// ─── Completion bar ───────────────────────────────────────────────────────────

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
        <div
          className="h-full bg-[var(--inner-green)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-[10px] text-[var(--ink)]/40">%{pct} tamamlandı</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [handleError, setHandleError] = useState("");

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSaved(false);
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const validateHandle = (v: string) => {
    const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (v !== clean) setHandleError("Yalnızca küçük harf, rakam ve alt çizgi");
    else setHandleError("");
    set("handle", clean);
  };

  const save = () => {
    if (handleError) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const completion = calcCompletion(profile);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="max-w-xl space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            profil
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            inner·hub'daki kimliğini yönet.
          </p>
        </div>
      </FadeIn>

      {/* Completion */}
      <CompletionBar pct={completion} />

      {/* Avatar */}
      <Avatar name={fullName || "Üye"} />

      {/* Temel Bilgiler */}
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
            prefix="inner.co/u/"
            placeholder="handle"
            mono
            maxLength={20}
          />
          {handleError && (
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-[var(--error)]">
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

      {/* Uzmanlıklar */}
      <Section title="Uzmanlıklar" sub="inner·id kartında ve eşleşmelerde görünür">
        <SkillEditor skills={profile.skills} onChange={(s) => set("skills", s)} />
      </Section>

      {/* Sosyal Linkler */}
      <Section title="Sosyal Linkler" sub="inner·id rozetine bağlanır">
        <div className="space-y-3">
          <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => set("linkedin", v)} prefix="linkedin.com/in/" placeholder="profiladın" mono />
          <Field label="GitHub" value={profile.github} onChange={(v) => set("github", v)} prefix="github.com/" placeholder="kullanıcıadı" mono />
          <Field label="Kişisel site" value={profile.website} onChange={(v) => set("website", v)} prefix="https://" placeholder="siteadresin.com" mono />
          <Field label="X / Twitter" value={profile.twitter} onChange={(v) => set("twitter", v)} prefix="x.com/" placeholder="kullanıcıadı" mono />
        </div>
      </Section>

      {/* Gizlilik */}
      <Section title="Profil Görünürlüğü" sub="Profilinin kim tarafından görüleceğini belirle">
        <VisibilitySelector value={profile.visibility} onChange={(v) => set("visibility", v)} />
      </Section>

      {/* Save */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={!!handleError}
          className={[
            "flex items-center gap-2 border px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all",
            saved
              ? "border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 text-[var(--inner-green)]"
              : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] hover:bg-[var(--ink)]/85 disabled:opacity-30",
          ].join(" ")}
        >
          {saved ? (
            <>
              <Check className="size-3" /> Kaydedildi
            </>
          ) : (
            "Kaydet"
          )}
        </button>
        {saved && (
          <p className="font-mono text-[9px] text-[var(--ink)]/30">
            Değişiklikler inner·id'e yansıdı
          </p>
        )}
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·hub · profil · davet bazlı
        </p>
      </div>
    </div>
  );
}
