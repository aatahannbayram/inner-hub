import { useParams } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, Briefcase, Linkedin, Globe, Github, CheckCircle2, MessageSquare, UserPlus } from "lucide-react";
import { PersonAvatar } from "@/components/panel/PersonAvatar";

// ─── Member data (same as Members.tsx, extended) ──────────────────────────────

const MEMBERS_DETAIL = [
  {
    id: 1,
    name: "Ata Han Bayram",
    handle: "atahan",
    initials: "AH",
    title: "Founder & CEO",
    company: "inner·hub",
    bio: "Topluluk kurucusu. Ürün, yapay zeka ve ekosistem inşası üzerine çalışıyor. inner·hub'ı kurucu üyelerle birlikte sıfırdan inşa etti.",
    tags: ["Ürün", "AI", "Topluluk", "B2B SaaS"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: false,
    verified: true,
    tier: "Kurucu Üye",
    memberSince: "Ocak 2026",
    stats: { events: 12, courses: 4, contributions: 84, connections: 23 },
    activity: "Çok yüksek",
    expertise: ["Topluluk tasarımı", "Ürün yönetimi", "AI uygulamaları", "Startup büyümesi"],
  },
  {
    id: 2,
    name: "Zeynep Arslan",
    handle: "zeyneparslan",
    initials: "ZA",
    title: "Co-founder",
    company: "Hipo",
    bio: "B2B SaaS, yetenek yönetimi platformu. 50+ müşteri, ARR büyümesi devam ediyor. Daha önce Linkedin'de ürün yöneticisi olarak çalıştı.",
    tags: ["B2B SaaS", "Liderlik", "Satış"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: true,
    verified: true,
    tier: "Kurucu Üye",
    memberSince: "Ocak 2026",
    stats: { events: 9, courses: 2, contributions: 61, connections: 17 },
    activity: "Yüksek",
    expertise: ["B2B satış", "SaaS büyümesi", "İK teknolojileri"],
  },
  {
    id: 3,
    name: "Mert Demir",
    handle: "mertdemir",
    initials: "MD",
    title: "AI Product Manager",
    company: "Insider",
    bio: "Ürün geliştirme, ML entegrasyonu, Growth. Seed aşamasındaki girişimlere danışmanlık veriyor. Öncesinde Getir'de PM.",
    tags: ["AI", "Ürün", "Growth"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: true,
    verified: false,
    tier: "Üye",
    memberSince: "Şubat 2026",
    stats: { events: 7, courses: 3, contributions: 47, connections: 11 },
    activity: "Orta",
    expertise: ["ML ürün yönetimi", "Growth hacking", "Kullanıcı araştırması"],
  },
  {
    id: 4,
    name: "Ayşe Kaya",
    handle: "aysekaya",
    initials: "AK",
    title: "HR Tech Lead",
    company: "Getir",
    bio: "Büyük ölçekli insan kaynakları dijital dönüşümü. HRIS, ATS ve çalışan deneyimi platformları üzerine 8 yıl deneyim.",
    tags: ["HR Tech", "Dijital Dönüşüm"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: false,
    verified: true,
    tier: "Üye",
    memberSince: "Şubat 2026",
    stats: { events: 11, courses: 5, contributions: 38, connections: 8 },
    activity: "Orta",
    expertise: ["İK dönüşümü", "HRIS sistemleri", "Çalışan deneyimi"],
  },
  {
    id: 5,
    name: "Berk Yılmaz",
    handle: "berkyilmaz",
    initials: "BY",
    title: "Angel Investor",
    company: "Bağımsız",
    bio: "Erken aşama yatırımcı. Pre-seed ve seed. Fintech, SaaS ve AI odaklı. 12 portföy şirketi, 3 exit.",
    tags: ["Yatırım", "Fintech", "AI"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: true,
    verified: true,
    tier: "Kurucu Üye",
    memberSince: "Ocak 2026",
    stats: { events: 6, courses: 1, contributions: 29, connections: 31 },
    activity: "Yüksek",
    expertise: ["Angel yatırım", "Due diligence", "Startup değerleme"],
  },
  {
    id: 6,
    name: "Selin Çelik",
    handle: "selincelik",
    initials: "SC",
    title: "CTO",
    company: "Dopigo",
    bio: "Full-stack mühendislik, DevOps, platform altyapısı. Startup mühendislik ekibi kurulumu konusunda danışmanlık veriyor.",
    tags: ["Teknik", "CTO", "DevOps"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: false,
    verified: false,
    tier: "Üye",
    memberSince: "Mart 2026",
    stats: { events: 4, courses: 6, contributions: 22, connections: 9 },
    activity: "Düşük",
    expertise: ["Sistem mimarisi", "DevOps", "Mühendislik liderliği"],
  },
  {
    id: 7,
    name: "Ozan Kırmızı",
    handle: "ozankirmizi",
    initials: "OK",
    title: "Growth Lead",
    company: "Pazarama",
    bio: "E-ticaret büyümesi, performance marketing, A/B testleri ve konversiyon optimizasyonu. 5+ yıl e-ticaret deneyimi.",
    tags: ["Growth", "E-ticaret", "Pazarlama"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: true,
    verified: false,
    tier: "Üye",
    memberSince: "Mart 2026",
    stats: { events: 3, courses: 2, contributions: 18, connections: 6 },
    activity: "Düşük",
    expertise: ["Performance marketing", "A/B testleri", "E-ticaret büyümesi"],
  },
  {
    id: 8,
    name: "Deniz Alp",
    handle: "denizalp",
    initials: "DA",
    title: "Legal Counsel",
    company: "Alp Hukuk",
    bio: "Startup hukuku, yatırım anlaşmaları, KVKK ve GDPR uyumluluk danışmanlığı. Kurucular için özel fiyatlandırma.",
    tags: ["Hukuk", "Yatırım", "KVKK"],
    linkedin: null,
    github: null,
    website: null,
    isAvailable: true,
    verified: true,
    tier: "Üye",
    memberSince: "Nisan 2026",
    stats: { events: 5, courses: 1, contributions: 14, connections: 12 },
    activity: "Orta",
    expertise: ["Startup hukuku", "SAFE/KISS", "KVKK uyumu"],
  },
];

// ─── Activity badge ───────────────────────────────────────────────────────────

function ActivityDot({ level }: { level: string }) {
  const color =
    level === "Çok yüksek" ? "bg-[var(--inner-green)]"
    : level === "Yüksek" ? "bg-[var(--inner-green)]/70"
    : level === "Orta" ? "bg-[var(--ink)]/30"
    : "bg-[var(--ink)]/15";
  return <span className={`inline-block size-2 rounded-full ${color}`} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MemberProfile() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const member = MEMBERS_DETAIL.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="space-y-4">
        <Link
          href="/panel/members"
          className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="size-3" /> Katılımcılar
        </Link>
        <p className="text-sm text-[var(--ink-body)]">Üye bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Back */}
      <Link
        href="/panel/members"
        className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft className="size-3" /> Katılımcılar
      </Link>

      {/* Profile card */}
      <div className="border border-[var(--ink)]/[0.08] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <PersonAvatar name={member.name} initials={member.initials} className="size-14 text-base" />
              {member.isAvailable && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
              )}
            </div>

            {/* Identity */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl text-[var(--ink)] font-light">{member.name}</h1>
                {member.verified && <CheckCircle2 className="size-4 text-[var(--success-ink)] shrink-0" />}
              </div>
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {member.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Briefcase className="size-2.5 text-[var(--ink-muted)]" />
                <span className="font-mono text-label text-[var(--ink-muted)]">{member.company}</span>
              </div>
            </div>
          </div>

          {/* Tier */}
          <span className="shrink-0 border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {member.tier}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-4 border-t border-[var(--ink)]/[0.06] pt-4">
          {Object.entries(member.stats).map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">{k}</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--ink-body)] tabular-nums">{v}</p>
            </div>
          ))}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--ink)]/[0.06] pt-3">
          <div className="flex items-center gap-2">
            <ActivityDot level={member.activity} />
            <span className="font-mono text-label text-[var(--ink-muted)]">{member.activity} aktivite</span>
          </div>
          <span className="font-mono text-label text-[var(--ink-subtle)]">Üye: {member.memberSince}</span>
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">Hakkında</p>
        <p className="text-sm leading-relaxed text-[var(--ink-body)] font-light">{member.bio}</p>
      </div>

      {/* Tags */}
      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">Uzmanlıklar</p>
        <div className="flex flex-wrap gap-1.5">
          {member.tags.map((t) => (
            <span key={t} className="border border-[var(--ink)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Expertise */}
      <div className="border border-[var(--ink)]/[0.08] p-5">
        <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">Yetkinlik Alanları</p>
        <div className="space-y-1.5">
          {member.expertise.map((e, i) => (
            <div key={e} className="flex items-center gap-3">
              <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
                <div
                  className="h-full bg-[var(--ink)]/15 transition-all"
                  style={{ width: `${100 - i * 15}%` }}
                />
              </div>
              <span className="w-40 shrink-0 font-mono text-label text-[var(--ink-body)]">{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social */}
      {(member.linkedin || member.github || member.website) && (
        <div>
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">Bağlantılar</p>
          <div className="flex gap-2">
            {member.linkedin && (
              <a href={`https://${member.linkedin}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-3 py-2 font-mono text-label text-[var(--ink-body)] hover:text-[var(--ink)] hover:border-[var(--ink)]/20 transition-colors">
                <Linkedin className="size-3" /> LinkedIn
              </a>
            )}
            {member.github && (
              <a href={`https://${member.github}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-3 py-2 font-mono text-label text-[var(--ink-body)] hover:text-[var(--ink)] hover:border-[var(--ink)]/20 transition-colors">
                <Github className="size-3" /> GitHub
              </a>
            )}
            {member.website && (
              <a href={`https://${member.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-3 py-2 font-mono text-label text-[var(--ink-body)] hover:text-[var(--ink)] hover:border-[var(--ink)]/20 transition-colors">
                <Globe className="size-3" /> Site
              </a>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-[var(--ink)]/[0.08] pt-6">
        <button className="flex flex-1 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] py-3 font-mono text-label uppercase tracking-widest text-[var(--bone)] hover:bg-[var(--ink)]/85 transition-colors">
          <UserPlus className="size-3.5" /> Bağlan
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 border border-[var(--ink)]/15 py-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:border-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors">
          <MessageSquare className="size-3.5" /> Mesaj
        </button>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · üye profili · @{member.handle}
        </p>
      </div>
    </div>
  );
}
