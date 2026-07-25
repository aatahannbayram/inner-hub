import { useState, useEffect } from "react";
import { Search, Linkedin, Briefcase, ArrowRight, Tag, CheckCircle2, MessageSquare, UserPlus, X, Users2 } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "@/components/panel/PersonAvatar";

type Tab = "uyeler" | "talent";

interface Member {
  id: number;
  name: string;
  initials: string;
  title: string;
  company: string;
  bio: string;
  tags: string[];
  linkedin: string | null;
  isAvailable?: boolean;
}

interface TalentPost {
  id: number;
  postedBy: string;
  postedByInitials: string;
  postedByCompany: string;
  type: "arıyor" | "sunuyor";
  role: string;
  description: string;
  tags: string[];
  postedAt: string;
}

const MEMBERS: Member[] = [
  {
    id: 1,
    name: "Ata Han Bayram",
    initials: "AT",
    title: "Founder & CEO",
    company: "inner·hub",
    bio: "Topluluk kurucusu. Ürün, yapay zeka ve ekosistem inşası üzerine çalışıyor.",
    tags: ["Ürün", "AI", "Topluluk"],
    linkedin: null,
    isAvailable: false,
  },
  {
    id: 2,
    name: "Zeynep Arslan",
    initials: "ZA",
    title: "Co-founder",
    company: "Hipo",
    bio: "B2B SaaS, yetenek yönetimi platformu. 50+ müşteri, ARR büyümesi devam ediyor.",
    tags: ["B2B SaaS", "Liderlik", "Satış"],
    linkedin: null,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Mert Demir",
    initials: "MD",
    title: "AI Product Manager",
    company: "Insider",
    bio: "Ürün geliştirme, ML entegrasyonu, Growth. Seed aşamasındaki girişimlere danışmanlık.",
    tags: ["AI", "Ürün", "Growth"],
    linkedin: null,
    isAvailable: true,
  },
  {
    id: 4,
    name: "Ayşe Kaya",
    initials: "AK",
    title: "HR Tech Lead",
    company: "Getir",
    bio: "Büyük ölçekli insan kaynakları dijital dönüşümü. HRIS, ATS ve çalışan deneyimi platformları.",
    tags: ["HR Tech", "Dijital Dönüşüm"],
    linkedin: null,
    isAvailable: false,
  },
  {
    id: 5,
    name: "Berk Yılmaz",
    initials: "BY",
    title: "Angel Investor",
    company: "Bağımsız",
    bio: "Erken aşama yatırımcı. Pre-seed ve seed. Fintech, SaaS ve AI odaklı.",
    tags: ["Yatırım", "Fintech", "AI"],
    linkedin: null,
    isAvailable: true,
  },
  {
    id: 6,
    name: "Selin Çelik",
    initials: "SC",
    title: "CTO",
    company: "Dopigo",
    bio: "Full-stack mühendislik, DevOps, platform altyapısı. Startup mühendislik ekibi kurulumu.",
    tags: ["Teknik", "CTO", "DevOps"],
    linkedin: null,
    isAvailable: false,
  },
  {
    id: 7,
    name: "Ozan Kırmızı",
    initials: "OK",
    title: "Growth Lead",
    company: "Pazarama",
    bio: "E-ticaret büyümesi, performance marketing, A/B testleri ve konversiyon optimizasyonu.",
    tags: ["Growth", "E-ticaret", "Pazarlama"],
    linkedin: null,
    isAvailable: true,
  },
  {
    id: 8,
    name: "Deniz Alp",
    initials: "DA",
    title: "Legal Counsel",
    company: "Alp Hukuk",
    bio: "Startup hukuku, yatırım anlaşmaları, KVKK ve GDPR uyumluluk danışmanlığı.",
    tags: ["Hukuk", "Yatırım", "KVKK"],
    linkedin: null,
    isAvailable: true,
  },
];

const TALENT_POSTS: TalentPost[] = [
  {
    id: 1,
    postedBy: "Zeynep Arslan",
    postedByInitials: "ZA",
    postedByCompany: "Hipo",
    type: "arıyor",
    role: "Fullstack Developer (React + Node.js)",
    description: "Hipo ekibine katılacak, ürünü şekillendirmeye katkı sağlayacak fullstack developer arıyoruz. Remote, equity var.",
    tags: ["React", "Node.js", "Remote", "Equity"],
    postedAt: "2 gün önce",
  },
  {
    id: 2,
    postedBy: "Mert Demir",
    postedByInitials: "MD",
    postedByCompany: "Insider",
    type: "arıyor",
    role: "AI/ML Engineer (Part-time)",
    description: "Bir yan proje için haftalık 10-15 saat çalışabilecek ML mühendisi. LLM fine-tuning deneyimi şart.",
    tags: ["AI", "LLM", "Part-time"],
    postedAt: "5 gün önce",
  },
  {
    id: 3,
    postedBy: "Selin Çelik",
    postedByInitials: "SC",
    postedByCompany: "Dopigo",
    type: "sunuyor",
    role: "CTO Danışmanlığı — Erken Aşama Startuplar",
    description: "Pre-seed ve seed aşamasındaki girişimlere teknik liderlik ve mühendislik ekibi kurulumu konusunda destek.",
    tags: ["CTO", "Danışmanlık", "Teknik"],
    postedAt: "1 hafta önce",
  },
  {
    id: 4,
    postedBy: "Deniz Alp",
    postedByInitials: "DA",
    postedByCompany: "Alp Hukuk",
    type: "sunuyor",
    role: "Startup Hukuk Danışmanlığı",
    description: "Kuruluş sözleşmeleri, SAFE/KISS notları, yatırımcı tüm süreçlerde inner·hub üyelerine %20 indirim.",
    tags: ["Hukuk", "SAFE", "Yatırım"],
    postedAt: "1 hafta önce",
  },
  {
    id: 5,
    postedBy: "Ozan Kırmızı",
    postedByInitials: "OK",
    postedByCompany: "Pazarama",
    type: "arıyor",
    role: "Co-founder (Sales & Marketing)",
    description: "Yan proje için satış ve pazarlamaya odaklanacak co-founder arıyorum. B2B SaaS deneyimi artı.",
    tags: ["Co-founder", "B2B", "Satış"],
    postedAt: "3 gün önce",
  },
];

function MemberCard({ member, onSelect }: { member: Member; onSelect: (m: Member) => void }) {
  return (
    <div
      className="flex flex-col border border-[var(--ink)]/[0.08] p-5 transition-all duration-200 hover:border-[var(--ink)]/20 cursor-pointer"
      onClick={() => onSelect(member)}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="relative">
          <PersonAvatar name={member.name} initials={member.initials} className="size-10 text-[11px]" />
          {member.isAvailable && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--ink)]">{member.name}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
            {member.title}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <Briefcase className="size-2.5 text-[var(--ink-muted)]" />
            <span className="font-mono text-[9px] text-[var(--ink-muted)]">{member.company}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mb-3 flex-1 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-2">{member.bio}</p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {member.tags.map((tag) => (
          <span
            key={tag}
            className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-[var(--ink-body)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <button className="flex flex-1 items-center justify-center gap-1.5 border border-[var(--ink)]/15 py-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] transition-all hover:border-[var(--ink)] hover:text-[var(--ink)]">
          Bağlan <ArrowRight className="size-2.5" />
        </button>
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink-muted)] transition-colors hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
          >
            <Linkedin className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Member detail expertise (extended data keyed by id) ─────────────────────

const MEMBER_EXPERTISE: Record<number, { verified: boolean; tier: string; memberSince: string; stats: Record<string, number>; expertise: string[] }> = {
  1: { verified: true,  tier: "Kurucu Üye", memberSince: "Ocak 2026",   stats: { events: 12, courses: 4,  contributions: 84, connections: 23 }, expertise: ["Topluluk tasarımı", "Ürün yönetimi", "AI uygulamaları"] },
  2: { verified: true,  tier: "Kurucu Üye", memberSince: "Ocak 2026",   stats: { events: 9,  courses: 2,  contributions: 61, connections: 17 }, expertise: ["B2B satış", "SaaS büyümesi", "İK teknolojileri"] },
  3: { verified: false, tier: "Üye",        memberSince: "Şubat 2026",  stats: { events: 7,  courses: 3,  contributions: 47, connections: 11 }, expertise: ["ML ürün yönetimi", "Growth hacking", "Kullanıcı araştırması"] },
  4: { verified: true,  tier: "Üye",        memberSince: "Şubat 2026",  stats: { events: 11, courses: 5,  contributions: 38, connections: 8  }, expertise: ["İK dönüşümü", "HRIS sistemleri", "Çalışan deneyimi"] },
  5: { verified: true,  tier: "Kurucu Üye", memberSince: "Ocak 2026",   stats: { events: 6,  courses: 1,  contributions: 29, connections: 31 }, expertise: ["Angel yatırım", "Due diligence", "Startup değerleme"] },
  6: { verified: false, tier: "Üye",        memberSince: "Mart 2026",   stats: { events: 4,  courses: 6,  contributions: 22, connections: 9  }, expertise: ["Sistem mimarisi", "DevOps", "Mühendislik liderliği"] },
  7: { verified: false, tier: "Üye",        memberSince: "Mart 2026",   stats: { events: 3,  courses: 2,  contributions: 18, connections: 6  }, expertise: ["Performance marketing", "A/B testleri", "E-ticaret büyümesi"] },
  8: { verified: true,  tier: "Üye",        memberSince: "Nisan 2026",  stats: { events: 5,  courses: 1,  contributions: 14, connections: 12 }, expertise: ["Startup hukuku", "SAFE/KISS", "KVKK uyumu"] },
};

// ─── Member detail panel ──────────────────────────────────────────────────────

function MemberDetailPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const ext = MEMBER_EXPERTISE[member.id];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink)]/20" onClick={onClose} />
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l border-[var(--ink)]/10 bg-[var(--bone)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4 shrink-0">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Üye Profili</p>
          <button onClick={onClose} className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
            ← Kapat
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 p-5">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <PersonAvatar name={member.name} initials={member.initials} className="size-12 text-sm" />
              {member.isAvailable && (
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-base text-[var(--ink)] font-light">{member.name}</p>
                {ext?.verified && <CheckCircle2 className="size-3.5 text-[var(--inner-green)] shrink-0" />}
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-body)]">{member.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Briefcase className="size-2.5 text-[var(--ink-muted)]" />
                <span className="font-mono text-[9px] text-[var(--ink-muted)]">{member.company}</span>
              </div>
            </div>
            {ext && (
              <span className="shrink-0 border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest text-[var(--ink-muted)]">
                {ext.tier}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span key={t} className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[var(--ink-muted)]">
                {t}
              </span>
            ))}
          </div>

          {/* Bio */}
          <div className="border-l-2 border-[var(--ink)]/10 pl-4">
            <p className="text-sm leading-relaxed text-[var(--ink-body)] font-light">{member.bio}</p>
          </div>

          {/* Stats */}
          {ext && (
            <div className="grid grid-cols-4 border border-[var(--ink)]/[0.08] py-3">
              {Object.entries(ext.stats).map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="font-mono text-[7px] uppercase tracking-widest text-[var(--ink-subtle)]">{k}</p>
                  <p className="mt-0.5 font-mono text-sm text-[var(--ink-body)] tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Expertise */}
          {ext && (
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Yetkinlikler</p>
              <div className="space-y-1.5">
                {ext.expertise.map((e, i) => (
                  <div key={e} className="flex items-center gap-3">
                    <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
                      <div className="h-full bg-[var(--ink)]/15" style={{ width: `${100 - i * 18}%` }} />
                    </div>
                    <span className="w-36 shrink-0 font-mono text-[9px] text-[var(--ink-body)]">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          {ext && (
            <p className="font-mono text-[9px] text-[var(--ink-subtle)]">Üye: {ext.memberSince}</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-[var(--ink)]/[0.08] flex shrink-0">
          <button className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)] transition-colors">
            <MessageSquare className="size-3.5" /> Mesaj
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 py-3.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] transition-colors">
            <UserPlus className="size-3.5" /> Bağlan
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function MembersHero({ onTalentClick }: { onTalentClick: () => void }) {
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink)]/40" />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              Katılımcılar
            </p>
            <AnimatedHeading
              text={"Where builders\nfind each other."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                Kurucular, mühendisler, yatırımcılar — daire içinde birbirini bulur ve büyür.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToId("members-grid")}
                  className="group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  Üyeleri Gör
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={onTalentClick}
                  className="liquid-glass group inline-flex items-center gap-2 border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  Talent Board
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Kurucular. Mühendisler. Yatırımcılar.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

function TalentCard({ post }: { post: TalentPost }) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-5 transition-all duration-200 hover:border-[var(--ink)]/20">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={post.postedBy} initials={post.postedByInitials} className="size-8 text-[10px]" />
          <div>
            <p className="text-xs font-medium text-[var(--ink)]">{post.postedBy}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
              {post.postedByCompany}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
            post.type === "arıyor"
              ? "border-[var(--ink)]/15 text-[var(--ink-muted)]"
              : "border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 text-[var(--ink-body)]",
          )}
        >
          {post.type}
        </span>
      </div>

      <p className="mb-1.5 text-sm font-medium leading-snug text-[var(--ink)]">{post.role}</p>
      <p className="mb-3 text-sm leading-relaxed text-[var(--ink-muted)]">{post.description}</p>

      <div className="mb-4 flex flex-wrap gap-1">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-[var(--ink-body)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-[var(--ink-subtle)]">{post.postedAt}</span>
        <button className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
          İletişime Geç <ArrowRight className="size-2.5" />
        </button>
      </div>
    </div>
  );
}

export default function Members() {
  const [tab, setTab] = useState<Tab>("uyeler");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredTalent = TALENT_POSTS.filter(
    (p) =>
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero */}
      <MembersHero onTalentClick={() => { setTab("talent"); requestAnimationFrame(() => scrollToId("members-talent")); }} />

      <FadeIn delay={0.02}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MembersStat label="Toplam Üye" value={String(MEMBERS.length)} sub="dairenin içinde" icon={Users2} />
          <MembersStat label="Çevrimiçi" value={String(MEMBERS.filter((m) => m.isAvailable).length)} sub="şu anda aktif" icon={Users2} />
          <MembersStat label="Talent İlanı" value={String(TALENT_POSTS.length)} sub="açık pozisyon" icon={Tag} />
          <MembersStat
            label="Kurucu Üye"
            value={String(Object.values(MEMBER_EXPERTISE).filter((e) => e.tier === "Kurucu Üye").length)}
            sub="ilk otuz dörtten"
            icon={CheckCircle2}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <p className="text-sm text-[var(--ink-muted)] font-light">
          Topluluk üyeleri ve iş birliği fırsatları.
        </p>
      </FadeIn>

      {/* Tabs + Search */}
      <FadeIn delay={0.04}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex border border-[var(--ink)]/15">
            <button
              onClick={() => setTab("uyeler")}
              className={cn(
                "px-5 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                tab === "uyeler"
                  ? "bg-[var(--ink)] text-[var(--bone)]"
                  : "text-[var(--ink-body)] hover:text-[var(--ink)]",
              )}
            >
              Üyeler
            </button>
            <button
              onClick={() => setTab("talent")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                tab === "talent"
                  ? "bg-[var(--ink)] text-[var(--bone)]"
                  : "text-[var(--ink-body)] hover:text-[var(--ink)]",
              )}
            >
              Talent Board
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "uyeler" ? "İsim, şirket veya uzmanlık…" : "Rol veya beceri ara…"}
              className="border border-[var(--ink)]/15 bg-transparent py-2 pl-9 pr-4 font-mono text-[11px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--ink)]/40 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </FadeIn>

      {/* Content */}
      <div id={tab === "uyeler" ? "members-grid" : "members-talent"} className="scroll-mt-6">
        {tab === "uyeler" ? (
          <div>
            {/* Online indicator */}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
                {filteredMembers.length} üye
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                <span className="size-1.5 rounded-full bg-[var(--inner-green)]" />
                {MEMBERS.filter((m) => m.isAvailable).length} çevrimiçi
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} onSelect={setSelectedMember} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
                {filteredTalent.length} ilan
              </span>
              <button className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
                <Tag className="size-3" /> İlan Ver
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredTalent.map((post) => (
                <TalentCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-6 border-t border-[var(--ink)]/[0.08] pt-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">
                Başarılı eşleşmelerde platform %10 komisyon alır · <span lang="en">inner·hub</span> Talent Board
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedMember && (
        <MemberDetailPanel member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}
