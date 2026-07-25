import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Layers,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { avatarColor } from "@/lib/avatarColor";

type Category = "Tümü" | "Yazılım" | "Finans" | "Yaşam" | "Eğitim";

interface Perk {
  id: number;
  brand: string;
  title: string;
  description: string;
  howTo: string;
  category: Exclude<Category, "Tümü">;
  logoUrl: string | null;
  badge: string;
  code: string | null;
  partnerUrl: string;
  featured?: boolean;
  expiresAt?: string;
}

const PERKS: Perk[] = [
  {
    id: 1,
    brand: "Monolite",
    title: "Monolite İlk Ay Ücretsiz!",
    description:
      "Sunumlarınızı, etkinliklerinizi ve eğitimlerinizi Monolite ile profesyonel biçimde yönetin.",
    howTo:
      "Kodu kopyalayıp Monolite kayıt ekranında “Promo / Invite” alanına yapıştırın. İlk faturalandırma döneminde ücret alınmaz.",
    category: "Yazılım",
    logoUrl: null,
    badge: "1 Ay Ücretsiz",
    code: "INNER-MONOLITE",
    partnerUrl: "https://monolite.io",
    featured: true,
    expiresAt: "2026-12-31",
  },
  {
    id: 2,
    brand: "iyigo",
    title: "İyigo 2 Ay Ücretsiz",
    description:
      "Enocta'nın yeni iştiraki olan iyigo ile kurumsal öğrenme deneyimini keşfedin. Kullanıma hazır platform.",
    howTo: "Partner sayfasından “inner·hub” seçeneğini işaretleyin; aktivasyon 24 saat içinde e-postanıza gelir.",
    category: "Eğitim",
    logoUrl: null,
    badge: "2 Ay Ücretsiz",
    code: "INNER-IYIGO",
    partnerUrl: "https://iyigo.com",
  },
  {
    id: 3,
    brand: "Salary Insights",
    title: "Kurumsal Maaş Raporu %15 İndirimli",
    description:
      "Ara zam öncesi Nisan–Mayıs maaş raporu. 10.000'den fazla pozisyon verisi ile sektör karşılaştırması.",
    howTo: "Checkout’ta davet kodunu girin. Rapor PDF olarak anında indirilir.",
    category: "Finans",
    logoUrl: null,
    badge: "%15 İndirim",
    code: "INNER15",
    partnerUrl: "https://salaryinsights.com",
  },
  {
    id: 4,
    brand: "Dermolisa",
    title: "Kozmetik Ürünlerinde %30 İndirim",
    description:
      "Dr. Dennis Gross, Peter Thomas Roth ve Philip B gibi dünya markalarında üyeye özel indirim.",
    howTo: "Sepette kodu uygulayın. Kampanya stokla sınırlıdır.",
    category: "Yaşam",
    logoUrl: null,
    badge: "%30 İndirim",
    code: "INNER30",
    partnerUrl: "https://dermolisa.com",
  },
  {
    id: 5,
    brand: "Notion",
    title: "Notion Plus 6 Ay Ücretsiz",
    description:
      "Startup planına dahil tüm özellikleri, öncelikli destek ve ek depolamayı 6 ay boyunca ücretsiz kullanın.",
    howTo: "Notion Education / Startup formunda inner·hub e-postanızla başvurun; onay sonrası plan yükseltilir.",
    category: "Yazılım",
    logoUrl: null,
    badge: "6 Ay Ücretsiz",
    code: null,
    partnerUrl: "https://www.notion.so",
    featured: true,
  },
  {
    id: 6,
    brand: "AWS",
    title: "AWS Activate — $1.000 Kredi",
    description:
      "AWS Activate kapsamında seçili startuplara özel $1.000 kredi, teknik destek ve AWS ekibine erişim.",
    howTo: "Org ID’nizi panel üzerinden iletin; Activate org kodu 3–5 iş gününde Slack’e düşer.",
    category: "Yazılım",
    logoUrl: null,
    badge: "$1.000 Kredi",
    code: null,
    partnerUrl: "https://aws.amazon.com/activate",
  },
  {
    id: 7,
    brand: "Wise Business",
    title: "Wise Business İlk Yıl Ücretsiz",
    description:
      "Uluslararası para transferi ve çoklu para birimi hesabı. inner·hub üyelerine ilk yıl kart ücreti yok.",
    howTo: "Wise Business kayıt linkinden ilerleyin; referans alanına kodu yazın.",
    category: "Finans",
    logoUrl: null,
    badge: "1 Yıl Ücretsiz",
    code: "INNERWISE",
    partnerUrl: "https://wise.com/business",
  },
  {
    id: 8,
    brand: "Maven",
    title: "Maven Cohort Kurslarında %20 İndirim",
    description:
      "Dünyanın önde gelen uzmanlarından canlı cohort kursları. Liderlik, ürün, pazarlama ve daha fazlası.",
    howTo: "Kurs checkout sayfasında kodu girin. Tek seferlik kullanım.",
    category: "Eğitim",
    logoUrl: null,
    badge: "%20 İndirim",
    code: "INNERMAVEN",
    partnerUrl: "https://maven.com",
  },
];

const CATEGORIES: Category[] = ["Tümü", "Yazılım", "Finans", "Yaşam", "Eğitim"];
const SAVED_KEY = "inner_perks_saved";

function loadSaved(): number[] {
  try {
    const raw = sessionStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function BrandMark({ brand }: { brand: string }) {
  const initials = brand.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, "").slice(0, 2).toUpperCase();
  const color = avatarColor(brand);
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center border text-[var(--bone)]"
      style={{ backgroundColor: color, borderColor: color }}
    >
      <span className="font-mono text-[11px] uppercase tracking-widest">{initials}</span>
    </div>
  );
}

function formatExpiry(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PerkCard({
  perk,
  saved,
  onOpen,
}: {
  perk: Perk;
  saved: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col border border-[var(--ink)]/[0.08] bg-[var(--bone)] p-5 text-left transition-colors duration-200 hover:border-[var(--ink)]/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <BrandMark brand={perk.brand} />
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)] border border-[var(--ink)]/15 bg-[var(--ink)]/[0.03] px-2 py-0.5">
          {perk.badge}
        </span>
      </div>

      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
        <span lang="en">{perk.brand}</span> · {perk.category}
      </p>
      <p className="mb-2 text-sm font-medium leading-snug text-[var(--ink)] group-hover:underline decoration-[var(--ink)]/20 underline-offset-4">
        {perk.title}
      </p>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-3">
        {perk.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--ink)]/[0.08] pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] transition-colors group-hover:text-[var(--ink)]">
          İncele <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </span>
        {saved ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--success-ink)]">
            Kaydedildi
          </span>
        ) : perk.code ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
            Kod var
          </span>
        ) : null}
      </div>
    </button>
  );
}

function PerkDetail({
  perk,
  saved,
  onClose,
  onToggleSave,
}: {
  perk: Perk;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const copyCode = async () => {
    if (!perk.code) return;
    try {
      await navigator.clipboard.writeText(perk.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const expiry = formatExpiry(perk.expiresAt);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink)]/25" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="perk-detail-title"
        initial={reduce ? false : { x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={reduce ? undefined : { x: 16, opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--ink)]/10 bg-[var(--bone)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
            Ayrıcalık · {perk.category}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <X className="size-3" /> Kapat
            </span>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex items-start gap-4">
            <BrandMark brand={perk.brand} />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                <span lang="en">{perk.brand}</span>
              </p>
              <h2
                id="perk-detail-title"
                className="mt-1 font-serif text-2xl leading-snug text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
              >
                {perk.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]">
              {perk.badge}
            </span>
            {expiry && (
              <span className="border border-[var(--ink)]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-body)]">
                Son: {expiry}
              </span>
            )}
          </div>

          <p className="text-sm font-light leading-relaxed text-[var(--ink-strong)]">{perk.description}</p>

          <div className="border border-[var(--ink)]/[0.08] p-4">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
              Nasıl kullanılır
            </p>
            <p className="text-sm leading-relaxed text-[var(--ink-body)]">{perk.howTo}</p>
          </div>

          {perk.code && (
            <div className="border border-[var(--ink)] bg-[var(--ink)] p-4 text-[var(--bone)]">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--bone)]/62">
                Aktivasyon kodu
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm tracking-wider text-[var(--bone)]">{perk.code}</code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 border border-[var(--bone)]/25 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-[var(--ink)]/[0.08] p-5">
          <a
            href={perk.partnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85"
          >
            Partner sitesine git <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={onToggleSave}
            className="flex w-full items-center justify-center gap-2 border border-[var(--ink)]/20 px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-strong)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            {saved ? "Kaydedilenlerden çıkar" : "Daha sonra için kaydet"}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PerksHero() {
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
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
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
              Ayrıcalıklar
            </p>
            <AnimatedHeading
              text={"Perks worth\nbeing inside for."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                Program katılımcılarına özel yazılım, finans ve yaşam fırsatları. Kodu al, partnerde kullan.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToId("perks-featured")}
                  className="group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                >
                  Öne Çıkanlar
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToId("perks-all")}
                  className="liquid-glass group inline-flex items-center gap-2 border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  Tüm Fırsatlar
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Yazılım. Finans. Yaşam.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerksStat({
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

export default function Perks() {
  const [active, setActive] = useState<Category>("Tümü");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Perk | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>(() => loadSaved());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const counts = useMemo(() => {
    const map: Record<Category, number> = {
      Tümü: PERKS.length,
      Yazılım: 0,
      Finans: 0,
      Yaşam: 0,
      Eğitim: 0,
    };
    for (const p of PERKS) map[p.category] += 1;
    return map;
  }, []);

  const featured = PERKS.filter((p) => p.featured);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PERKS.filter((p) => {
      if (active !== "Tümü" && p.category !== active) return false;
      if (showSavedOnly && !savedIds.includes(p.id)) return false;
      if (!q) return true;
      return (
        p.brand.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q)
      );
    });
  }, [active, query, showSavedOnly, savedIds]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      sessionStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <PerksHero />

      <FadeIn delay={0.01}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PerksStat label="Toplam Fırsat" value={String(PERKS.length)} sub="aktif ayrıcalık" icon={Gift} />
          <PerksStat label="Öne Çıkan" value={String(featured.length)} sub="bu dönem" icon={Sparkles} />
          <PerksStat label="Kategori" value={String(CATEGORIES.length - 1)} sub="yazılım, finans, yaşam…" icon={Layers} />
          <PerksStat label="Kaydettiğin" value={String(savedIds.length)} sub="favorilerinde" icon={Check} />
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <div className="grid grid-cols-1 gap-px border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.08] sm:grid-cols-3">
          {[
            { step: "01", title: "Seç", body: "Kategori veya aramayla fırsatı bulun." },
            { step: "02", title: "Kod al", body: "Detayda aktivasyon kodunu kopyalayın." },
            { step: "03", title: "Kullan", body: "Partner sitesinde kodu uygulayın." },
          ].map((s) => (
            <div key={s.step} className="bg-[var(--bone)] p-4">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                {s.step}
              </p>
              <p className="text-sm text-[var(--ink)]">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-body)]">{s.body}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {featured.length > 0 && active === "Tümü" && !query && !showSavedOnly && (
        <FadeIn delay={0.05}>
          <section id="perks-featured" className="scroll-mt-6">
            <div className="mb-3 flex items-baseline justify-between border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
                Öne çıkan
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {featured.map((perk) => (
                <button
                  key={perk.id}
                  type="button"
                  onClick={() => setSelected(perk)}
                  className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden border border-[var(--ink)] bg-[var(--ink)] p-5 text-left text-[var(--bone)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bone)]"
                >
                  <AmbientCardBackground />
                  <div className="relative z-10">
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--bone)]/57">
                      <span lang="en">{perk.brand}</span> · {perk.badge}
                    </p>
                    <h2
                      className="max-w-[18ch] font-serif text-2xl leading-snug md:text-3xl"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
                    >
                      {perk.title}
                    </h2>
                  </div>
                  <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/70 transition-colors group-hover:text-[var(--bone)]">
                    Detayı aç <ArrowRight className="size-3" />
                  </span>
                  <span className="pointer-events-none absolute bottom-3 right-3 z-10 size-8 bg-[var(--inner-green)]" />
                </button>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.06}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Marka, teklif veya kod ara…"
              className="w-full border-0 border-b border-[var(--ink)]/15 bg-transparent py-3 pl-6 font-light text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:border-[var(--ink)] focus-visible:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={[
                  "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  active === cat
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {cat}
                <span className="ml-1.5 opacity-50">{counts[cat]}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowSavedOnly((v) => !v)}
              className={[
                "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                showSavedOnly
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
              ].join(" ")}
            >
              Kaydedilenler
              <span className="ml-1.5 opacity-50">{savedIds.length}</span>
            </button>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {filtered.length} ayrıcalık
            </span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div id="perks-all" className="scroll-mt-6" />
        {filtered.length === 0 ? (
          <div className="border border-[var(--ink)]/[0.08] px-6 py-14 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
              Sonuç yok
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Filtreyi veya aramayı temizleyip tekrar deneyin.
            </p>
            <button
              type="button"
              onClick={() => {
                setActive("Tümü");
                setQuery("");
                setShowSavedOnly(false);
              }}
              className="mt-5 inline-flex border border-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]"
            >
              Tümünü göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((perk) => (
              <PerkCard
                key={perk.id}
                perk={perk}
                saved={savedIds.includes(perk.id)}
                onOpen={() => setSelected(perk)}
              />
            ))}
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="border-t border-[var(--ink)]/[0.08] pt-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">
            Yeni ayrıcalıklar her ay ekleniyor · Öneri için Slack veya destek kanalını kullanın.
          </p>
        </div>
      </FadeIn>

      <AnimatePresence>
        {selected && (
          <PerkDetail
            key={selected.id}
            perk={selected}
            saved={savedIds.includes(selected.id)}
            onClose={() => setSelected(null)}
            onToggleSave={() => toggleSave(selected.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
