import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import {
  Search,
  Lock,
  Globe,
  Users,
  FileText,
  BarChart2,
  Presentation,
  BookOpen,
  Code2,
  Upload,
  ChevronRight,
  Tag,
  Clock,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccessLevel = "özel" | "topluluk" | "davetli";
type DocType = "Pitch Deck" | "Araştırma" | "Not" | "Şablon" | "Kod" | "Rapor";

interface VaultDoc {
  id: number;
  title: string;
  type: DocType;
  access: AccessLevel;
  author: string;
  tags: string[];
  excerpt: string;
  updatedDays: number;
  pages?: number;
  views: number;
  mine?: boolean;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const DOCS: VaultDoc[] = [
  {
    id: 1,
    title: "Pre-seed Yatırımcı Pitch Deck — inner·hub",
    type: "Pitch Deck",
    access: "davetli",
    author: "Ata Han Bayram",
    tags: ["yatırım", "topluluk", "SaaS"],
    excerpt: "inner·hub'ın 2026 yatırım turu için hazırlanan 18 sayfalık pitch deck. Problem, çözüm, GTM, finansallar.",
    updatedDays: 3,
    pages: 18,
    views: 24,
    mine: true,
  },
  {
    id: 2,
    title: "Türkiye B2B SaaS Pazar Analizi Q2 2026",
    type: "Araştırma",
    access: "topluluk",
    author: "Zeynep Arslan",
    tags: ["pazar", "B2B", "SaaS", "Türkiye"],
    excerpt: "Türkiye B2B SaaS ekosisteminde büyüme trendleri, rekabet haritası ve yatırım aktivitesi. 34 şirket analizi.",
    updatedDays: 7,
    pages: 22,
    views: 41,
  },
  {
    id: 3,
    title: "The Mom Test — Okuma Notları",
    type: "Not",
    access: "topluluk",
    author: "Mert Demir",
    tags: ["kitap", "müşteri görüşmesi", "ürün"],
    excerpt: "Rob Fitzpatrick'in The Mom Test kitabından inner·hub topluluğu için özet notlar ve actionable framework.",
    updatedDays: 14,
    views: 67,
    mine: false,
  },
  {
    id: 4,
    title: "AWS Activate Başvuru Şablonu",
    type: "Şablon",
    access: "topluluk",
    author: "Selin Çelik",
    tags: ["AWS", "kredi", "altyapı"],
    excerpt: "AWS Activate için doldurulmuş başvuru şablonu. $25K kredi başvurusunda başarıyla kullanıldı.",
    updatedDays: 21,
    pages: 4,
    views: 89,
  },
  {
    id: 5,
    title: "inner·hub API v1 Endpoint Dokümantasyonu",
    type: "Kod",
    access: "davetli",
    author: "Ata Han Bayram",
    tags: ["API", "teknik", "entegrasyon"],
    excerpt: "inner·hub platform API'sinin tüm endpoint'leri, auth akışı ve örnek request/response yapıları.",
    updatedDays: 1,
    views: 12,
    mine: true,
  },
  {
    id: 6,
    title: "Kurucu Zirvesi 2026 — Özet Rapor",
    type: "Rapor",
    access: "topluluk",
    author: "Ata Han Bayram",
    tags: ["zirve", "networking", "AI"],
    excerpt: "Eylül 2026 Kurucu Zirvesi'nin katılımcı geri bildirimleri, öne çıkan konuşmalar ve aksiyon maddeleri.",
    updatedDays: 0,
    pages: 11,
    views: 33,
  },
  {
    id: 7,
    title: "YC Application — Başarılı Örnek (Anonim)",
    type: "Şablon",
    access: "davetli",
    author: "Anonim Üye",
    tags: ["YC", "başvuru", "kurucu"],
    excerpt: "YC W25 batch'ine kabul edilen bir topluluğumuz üyesinin izniyle paylaşılan başvuru metni.",
    updatedDays: 45,
    pages: 6,
    views: 112,
  },
  {
    id: 8,
    title: "Fintech Regülasyon Rehberi — Türkiye 2026",
    type: "Araştırma",
    access: "topluluk",
    author: "Deniz Alp",
    tags: ["fintech", "regülasyon", "BDDK", "hukuk"],
    excerpt: "Türkiye'de fintech şirketleri için BDDK, SPK ve MASAK yükümlülüklerinin pratik özeti.",
    updatedDays: 10,
    pages: 28,
    views: 55,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<DocType, React.ComponentType<{ className?: string }>> = {
  "Pitch Deck": Presentation,
  "Araştırma": BarChart2,
  "Not": FileText,
  "Şablon": BookOpen,
  "Kod": Code2,
  "Rapor": FileText,
};

const ACCESS_CONFIG: Record<AccessLevel, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  özel: { icon: Lock, label: "Özel", color: "text-[var(--error)]" },
  topluluk: { icon: Users, label: "Topluluk", color: "text-[var(--ink)]/40" },
  davetli: { icon: Globe, label: "Davetli", color: "text-[var(--inner-green)]" },
};

const DOC_TYPES: (DocType | "Tümü")[] = ["Tümü", "Pitch Deck", "Araştırma", "Not", "Şablon", "Kod", "Rapor"];

// ─── Doc card ─────────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: VaultDoc }) {
  const TypeIcon = TYPE_ICONS[doc.type];
  const acc = ACCESS_CONFIG[doc.access];
  const AccIcon = acc.icon;

  return (
    <div className="group cursor-pointer border border-[var(--ink)]/[0.08] p-5 transition-all hover:border-[var(--ink)]/20">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03]">
            <TypeIcon className="size-3.5 text-[var(--ink)]/35" />
          </div>
          <div>
            <p className="text-sm font-medium leading-snug text-[var(--ink)] group-hover:underline decoration-[var(--ink)]/20 underline-offset-2">
              {doc.title}
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-[var(--ink)]/30">
              {doc.type} · {doc.author}
            </p>
          </div>
        </div>
        <div className={`flex shrink-0 items-center gap-1 ${acc.color}`}>
          <AccIcon className="size-3" />
          <span className="font-mono text-[8px] uppercase tracking-widest">{acc.label}</span>
        </div>
      </div>

      {/* Excerpt */}
      <p className="mb-3 text-xs leading-relaxed text-[var(--ink)]/45 line-clamp-2">{doc.excerpt}</p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {doc.tags.map((t) => (
          <span key={t} className="flex items-center gap-1 border border-[var(--ink)]/[0.07] px-1.5 py-0.5 font-mono text-[8px] text-[var(--ink)]/30">
            <Tag className="size-2" />{t}
          </span>
        ))}
        {doc.mine && (
          <span className="border border-[var(--inner-green)]/25 bg-[var(--inner-green)]/5 px-1.5 py-0.5 font-mono text-[8px] text-[var(--inner-green)]">
            benim
          </span>
        )}
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {doc.pages && (
            <span className="font-mono text-[8px] text-[var(--ink)]/20">{doc.pages} sayfa</span>
          )}
          <span className="font-mono text-[8px] text-[var(--ink)]/20">{doc.views} görüntülenme</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--ink)]/20">
          <Clock className="size-2.5" />
          <span className="font-mono text-[8px]">
            {doc.updatedDays === 0 ? "bugün" : `${doc.updatedDays}g önce`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Upload drawer (vaul) ─────────────────────────────────────────────────────

function UploadPrompt({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [access, setAccess] = useState<AccessLevel>("topluluk");
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none border-[var(--ink)]/15 bg-[var(--bone)]">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">inner·vault</p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            Belge Paylaş
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink)]/45">
            PDF, PPTX veya Markdown — maks 50MB
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-8">
          <div className="mb-4 flex flex-col items-center justify-center border border-dashed border-[var(--ink)]/20 py-8 text-center">
            <Upload className="mb-2 size-5 text-[var(--ink)]/25" />
            <p className="text-sm text-[var(--ink)]/40">Dosyayı buraya bırak</p>
          </div>

          <div className="mb-4">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">Erişim Seviyesi</p>
            <div className="flex gap-2">
              {(["özel", "topluluk", "davetli"] as AccessLevel[]).map((a) => {
                const cfg = ACCESS_CONFIG[a];
                const Icon = cfg.icon;
                return (
                  <button
                    key={a}
                    onClick={() => setAccess(a)}
                    className={[
                      "flex flex-1 flex-col items-center gap-1 border py-2.5 transition-all",
                      access === a
                        ? "border-[var(--ink)] bg-[var(--ink)]/[0.04]"
                        : "border-[var(--ink)]/10 hover:border-[var(--ink)]/25",
                    ].join(" ")}
                  >
                    <Icon className={`size-3.5 ${cfg.color}`} />
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/40">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-[var(--ink)]/15 py-2.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 transition-all hover:border-[var(--ink)]/30 hover:text-[var(--ink)]"
            >
              İptal
            </button>
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
            >
              <span>Yükle</span>
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Vault() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "Tümü">("Tümü");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = DOCS.filter((d) => {
    const matchType = typeFilter === "Tümü" || d.type === typeFilter;
    const matchQuery =
      !query ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      d.author.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const myDocs = DOCS.filter((d) => d.mine).length;
  const totalDocs = DOCS.length;
  const totalViews = DOCS.reduce((s, d) => s + d.views, 0);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
              inner·hub
            </p>
            <h1
              className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              inner·vault
              <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
            </h1>
            <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
              Topluluğun özel bilgi tabanı. Paylaş, öğren, referans al.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
          >
            <Upload className="size-3.5" />
            Paylaş
          </button>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Toplam Belge", value: totalDocs },
          { label: "Paylaşımlarım", value: myDocs },
          { label: "Toplam Görüntülenme", value: totalViews },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.08] p-4">
            <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/25">{s.label}</p>
            <p
              className="mt-1 font-serif text-2xl text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Featured strip — Embla */}
      <FadeIn delay={0.06}>
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
            Öne çıkan
          </p>
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3">
              {DOCS.slice(0, 5).map((doc, i) => {
                const Icon = TYPE_ICONS[doc.type];
                return (
                  <CarouselItem key={doc.id} className="basis-[78%] pl-3 sm:basis-[45%] md:basis-[38%]">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative h-40 overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)]"
                    >
                      <div
                        className="absolute inset-0 opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        style={{
                          background:
                            i % 2 === 0
                              ? "radial-gradient(circle at 20% 20%, rgba(24,255,133,0.18), transparent 45%), linear-gradient(135deg, #0A0A0A, #1a1a1a)"
                              : "radial-gradient(circle at 80% 30%, rgba(244,241,236,0.12), transparent 40%), linear-gradient(160deg, #111, #0A0A0A)",
                        }}
                      />
                      <div className="relative flex h-full flex-col justify-between p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-[var(--bone)]/50" />
                          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/40">
                            {doc.type}
                          </span>
                        </div>
                        <div>
                          <p className="line-clamp-2 font-serif text-lg leading-snug text-[var(--bone)]"
                            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 100 }}
                          >
                            {doc.title}
                          </p>
                          <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-[var(--bone)]/35">
                            {doc.author}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 hidden border-[var(--ink)]/15 bg-[var(--bone)] sm:flex" />
            <CarouselNext className="right-0 hidden border-[var(--ink)]/15 bg-[var(--bone)] sm:flex" />
          </Carousel>
        </div>
      </FadeIn>

      {/* Search + filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink)]/25" />
          <input
            type="text"
            placeholder="Belge, etiket veya yazar ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent py-2.5 pl-9 pr-4 font-light text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/25 focus:border-[var(--ink)]/25 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={[
                "border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-widest transition-all",
                typeFilter === t
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/10 text-[var(--ink)]/30 hover:border-[var(--ink)]/25 hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Doc grid */}
      <div>
        {filtered.length === 0 ? (
          <div className="border border-dashed border-[var(--ink)]/10 py-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/25">Sonuç bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => <DocCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>

      {/* Access legend */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4 flex items-center gap-5 flex-wrap">
        {(Object.entries(ACCESS_CONFIG) as [AccessLevel, typeof ACCESS_CONFIG[AccessLevel]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className={`flex items-center gap-1.5 ${cfg.color}`}>
              <Icon className="size-3" />
              <span className="font-mono text-[9px] uppercase tracking-widest">{cfg.label}</span>
            </div>
          );
        })}
        <p className="ml-auto font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·vault — yalnızca üyeler erişebilir
        </p>
      </div>

      <UploadPrompt open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}
