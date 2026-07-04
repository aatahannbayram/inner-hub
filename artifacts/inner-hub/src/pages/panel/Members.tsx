import { useState } from "react";
import { Search, Linkedin, Briefcase, ArrowRight, Tag, CheckCircle2, MessageSquare, UserPlus, X } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { cn } from "@/lib/utils";

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
          <div className="flex size-10 items-center justify-center bg-[var(--ink)] font-mono text-[11px] uppercase text-[var(--bone)]">
            {member.initials}
          </div>
          {member.isAvailable && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--ink)]">{member.name}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
            {member.title}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <Briefcase className="size-2.5 text-[var(--ink)]/30" />
            <span className="font-mono text-[9px] text-[var(--ink)]/30">{member.company}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mb-3 flex-1 text-xs leading-relaxed text-[var(--ink)]/50 line-clamp-2">{member.bio}</p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {member.tags.map((tag) => (
          <span
            key={tag}
            className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-[var(--ink)]/40"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <button className="flex flex-1 items-center justify-center gap-1.5 border border-[var(--ink)]/15 py-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/50 transition-all hover:border-[var(--ink)] hover:text-[var(--ink)]">
          Bağlan <ArrowRight className="size-2.5" />
        </button>
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)]/30 transition-colors hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
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

  return (
    <>
      <div className="fixed inset-0 bg-[var(--ink)]/20 z-20" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--bone)] border-l border-[var(--ink)]/10 z-30 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4 shrink-0">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Üye Profili</p>
          <button onClick={onClose} className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors">
            ← Kapat
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 p-5">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="flex size-12 items-center justify-center bg-[var(--ink)] font-mono text-sm text-[var(--bone)]">
                {member.initials}
              </div>
              {member.isAvailable && (
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-base text-[var(--ink)] font-light">{member.name}</p>
                {ext?.verified && <CheckCircle2 className="size-3.5 text-[var(--inner-green)] shrink-0" />}
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">{member.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Briefcase className="size-2.5 text-[var(--ink)]/30" />
                <span className="font-mono text-[9px] text-[var(--ink)]/30">{member.company}</span>
              </div>
            </div>
            {ext && (
              <span className="shrink-0 border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest text-[var(--ink)]/30">
                {ext.tier}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span key={t} className="border border-[var(--ink)]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/50">
                {t}
              </span>
            ))}
          </div>

          {/* Bio */}
          <div className="border-l-2 border-[var(--ink)]/10 pl-4">
            <p className="text-sm leading-relaxed text-[var(--ink)]/60 font-light">{member.bio}</p>
          </div>

          {/* Stats */}
          {ext && (
            <div className="grid grid-cols-4 border border-[var(--ink)]/[0.08] py-3">
              {Object.entries(ext.stats).map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="font-mono text-[7px] uppercase tracking-widest text-[var(--ink)]/25">{k}</p>
                  <p className="mt-0.5 font-mono text-sm text-[var(--ink)]/60 tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Expertise */}
          {ext && (
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Yetkinlikler</p>
              <div className="space-y-1.5">
                {ext.expertise.map((e, i) => (
                  <div key={e} className="flex items-center gap-3">
                    <div className="h-1 flex-1 bg-[var(--ink)]/[0.06]">
                      <div className="h-full bg-[var(--ink)]/15" style={{ width: `${100 - i * 18}%` }} />
                    </div>
                    <span className="w-36 shrink-0 font-mono text-[9px] text-[var(--ink)]/40">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          {ext && (
            <p className="font-mono text-[9px] text-[var(--ink)]/20">Üye: {ext.memberSince}</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-[var(--ink)]/[0.08] flex shrink-0">
          <button className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/50 hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)] transition-colors">
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

function TalentCard({ post }: { post: TalentPost }) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-5 transition-all duration-200 hover:border-[var(--ink)]/20">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center bg-[var(--ink)] font-mono text-[10px] uppercase text-[var(--bone)]">
            {post.postedByInitials}
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--ink)]">{post.postedBy}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              {post.postedByCompany}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
            post.type === "arıyor"
              ? "border-[var(--ink)]/15 text-[var(--ink)]/50"
              : "border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 text-[var(--ink)]/60",
          )}
        >
          {post.type}
        </span>
      </div>

      <p className="mb-1.5 text-sm font-medium leading-snug text-[var(--ink)]">{post.role}</p>
      <p className="mb-3 text-xs leading-relaxed text-[var(--ink)]/50">{post.description}</p>

      <div className="mb-4 flex flex-wrap gap-1">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-[var(--ink)]/40"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-[var(--ink)]/25">{post.postedAt}</span>
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
            Katılımcılar
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Topluluk üyeleri ve iş birliği fırsatları.
          </p>
        </div>
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
                  : "text-[var(--ink)]/40 hover:text-[var(--ink)]",
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
                  : "text-[var(--ink)]/40 hover:text-[var(--ink)]",
              )}
            >
              Talent Board
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink)]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "uyeler" ? "İsim, şirket veya uzmanlık…" : "Rol veya beceri ara…"}
              className="border border-[var(--ink)]/15 bg-transparent py-2 pl-9 pr-4 font-mono text-[11px] text-[var(--ink)] placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)]/40 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </FadeIn>

      {/* Content */}
      <div>
        {tab === "uyeler" ? (
          <div>
            {/* Online indicator */}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                {filteredMembers.length} üye
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
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
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
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
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25">
                Başarılı eşleşmelerde platform %10 komisyon alır · inner·hub Talent Board
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
