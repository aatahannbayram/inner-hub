import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  QrCode,
  Code2,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
} from "lucide-react";

// ─── Mock identity data ───────────────────────────────────────────────────────

const IDENTITY = {
  name: "Ata Han Bayram",
  handle: "atahan",
  role: "Kurucu",
  company: "inner·hub",
  memberSince: "Ocak 2026",
  tier: "Kurucu Üye",
  cohort: "#001",
  verified: true,
  publicUrl: "inner.co/u/atahan",
  badges: ["Kurucu", "AI Builder", "Mentor", "Demo Day 2026"],
  skills: ["Ürün", "AI", "Topluluk", "B2B SaaS"],
  stats: { events: 12, courses: 4, contributions: 84, connections: 23 },
};

const EMBED_SNIPPETS = {
  html: `<a href="https://inner.co/u/atahan" target="_blank">
  <img src="https://inner.co/badge/atahan.svg"
       alt="inner·hub Üyesi"
       height="28" />
</a>`,
  markdown: `[![inner·hub Üyesi](https://inner.co/badge/atahan.svg)](https://inner.co/u/atahan)`,
  json: `{
  "name": "Ata Han Bayram",
  "handle": "atahan",
  "tier": "Kurucu Üye",
  "verified": true,
  "profile": "https://inner.co/u/atahan"
}`,
};

type SnippetTab = keyof typeof EMBED_SNIPPETS;

// ─── ID Card ─────────────────────────────────────────────────────────────────

function IdCard() {
  return (
    <div className="relative overflow-hidden border border-[var(--ink)]/15 bg-[var(--ink)] p-6 text-[var(--bone)]">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 23px,var(--bone) 23px,var(--bone) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,var(--bone) 23px,var(--bone) 24px)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Left — identity info */}
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/30">
              inner·id
            </span>
            <span className="font-mono text-[8px] text-[var(--bone)]/20">·</span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/30">
              {IDENTITY.cohort}
            </span>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span
              className="font-serif text-3xl text-[var(--bone)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              {IDENTITY.name}
            </span>
            {IDENTITY.verified && (
              <CheckCircle2 className="size-4 text-[var(--inner-green)] shrink-0" />
            )}
          </div>

          <p className="mb-4 font-mono text-[11px] text-[var(--bone)]/40">
            @{IDENTITY.handle} · {IDENTITY.role}, {IDENTITY.company}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {IDENTITY.badges.map((b) => (
              <span
                key={b}
                className="border border-[var(--bone)]/15 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/50"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Right — QR placeholder + tier */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* QR mock */}
          <div className="flex size-16 items-center justify-center border border-[var(--bone)]/15 bg-[var(--bone)]/5">
            <QrCode className="size-8 text-[var(--bone)]/25" />
          </div>
          <span className="border border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-[var(--inner-green)]">
            {IDENTITY.tier}
          </span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="relative mt-5 flex items-center justify-between border-t border-[var(--bone)]/[0.08] pt-4">
        <div className="flex items-center gap-4">
          {Object.entries(IDENTITY.stats).map(([k, v]) => (
            <div key={k}>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/25">{k}</p>
              <p className="font-mono text-sm text-[var(--bone)]/70">{v}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8px] text-[var(--bone)]/20">
          Üye: {IDENTITY.memberSince}
        </p>
      </div>
    </div>
  );
}

// ─── Embed snippet ────────────────────────────────────────────────────────────

function EmbedSection() {
  const [tab, setTab] = useState<SnippetTab>("html");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(EMBED_SNIPPETS[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[var(--ink)]/[0.08]">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--ink)]/[0.08]">
        {(Object.keys(EMBED_SNIPPETS) as SnippetTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest transition-colors border-r border-[var(--ink)]/[0.08] last:border-0",
              tab === t
                ? "bg-[var(--ink)] text-[var(--bone)]"
                : "text-[var(--ink)]/35 hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
        <button
          onClick={copy}
          className="ml-auto flex items-center gap-1.5 px-4 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 transition-colors hover:text-[var(--ink)]"
        >
          <Copy className="size-3" />
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--ink)]/60 bg-[var(--ink)]/[0.02]">
        {EMBED_SNIPPETS[tab]}
      </pre>
    </div>
  );
}

// ─── Platform links ───────────────────────────────────────────────────────────

function PlatformLink({ icon: Icon, label, desc, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-[var(--ink)]/[0.08] p-4 transition-all hover:border-[var(--ink)]/20">
      <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--ink)]/10">
        <Icon className="size-4 text-[var(--ink)]/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--ink)]">{label}</p>
        <p className="font-mono text-[9px] text-[var(--ink)]/30">{desc}</p>
      </div>
      <button className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors shrink-0">
        Bağla <ChevronRight className="size-3" />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InnerId() {
  const [publicUrl] = useState(IDENTITY.publicUrl);

  return (
    <div className="space-y-8 max-w-2xl">
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
            inner·id
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Doğrulanmış kimliğin. inner·hub dışında da geçerli.
          </p>
        </div>
      </FadeIn>

      {/* ID Card */}
      <IdCard />

      {/* Public profile URL */}
      <div>
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
          Herkese Açık Profil
        </p>
        <div className="flex items-center gap-2 border border-[var(--ink)]/[0.08] px-4 py-3">
          <Globe className="size-3.5 text-[var(--ink)]/25 shrink-0" />
          <span className="flex-1 font-mono text-[11px] text-[var(--ink)]/60">{publicUrl}</span>
          <button className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors">
            <ExternalLink className="size-3" /> Görüntüle
          </button>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
          Uzmanlıklar
        </p>
        <div className="flex flex-wrap gap-2">
          {IDENTITY.skills.map((s) => (
            <span key={s} className="border border-[var(--ink)]/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/50">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Platform integrations */}
      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
            Platform Bağlantıları
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink)]/30">inner·id rozetini platformlarda göster</p>
        </div>
        <div className="space-y-2">
          <PlatformLink icon={Linkedin} label="LinkedIn" desc="Profilinde inner·hub üyeliğini doğrulat" href="#" />
          <PlatformLink icon={Github} label="GitHub" desc="README'ne rozet ekle, profili verify et" href="#" />
          <PlatformLink icon={Globe} label="Kişisel Site" desc="HTML embed kodu ile siteye entegre et" href="#" />
        </div>
      </section>

      {/* Embed widget */}
      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
            Rozet & Embed
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink)]/30">
            Platformuna göre snippet'i seç ve kopyala
          </p>
        </div>
        <EmbedSection />
      </section>

      {/* Verification info */}
      <div className="flex items-start gap-3 border border-[var(--inner-green)]/20 bg-[var(--inner-green)]/5 p-4">
        <Shield className="size-4 shrink-0 text-[var(--inner-green)] mt-0.5" />
        <div>
          <p className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)]">
            Kimlik Doğrulandı
          </p>
          <p className="text-xs leading-relaxed text-[var(--ink)]/50">
            inner·id, inner·hub ekibi tarafından manuel olarak doğrulanmış bir kimlik belgesidir.
            Partnerler, API üzerinden üyeliği anlık olarak teyit edebilir.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·id — taşınabilir kimlik · davet bazlı · inner·hub ekosistemi
        </p>
      </div>
    </div>
  );
}
