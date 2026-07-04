import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

type Category = "Tümü" | "Yazılım" | "Finans" | "Yaşam" | "Eğitim";

interface Perk {
  id: number;
  brand: string;
  title: string;
  description: string;
  category: Exclude<Category, "Tümü">;
  logoUrl: string | null;
  badge: string;
  link: string;
}

const PERKS: Perk[] = [
  {
    id: 1,
    brand: "Monolite",
    title: "Monolite İlk Ay Ücretsiz!",
    description: "Sunumlarınızı, etkinliklerinizi ve eğitimlerinizi Monolite ile profesyonel biçimde yönetin. inner·hub üyelerine özel aktivasyon kodu.",
    category: "Yazılım",
    logoUrl: null,
    badge: "1 Ay Ücretsiz",
    link: "#",
  },
  {
    id: 2,
    brand: "iyigo",
    title: "İyigo 2 Ay Ücretsiz",
    description: "Enocta'nın yeni iştiraki olan iyigo ile kurumsal öğrenme deneyimini keşfedin. Kullanıma hazır platform, anında başlayın.",
    category: "Eğitim",
    logoUrl: null,
    badge: "2 Ay Ücretsiz",
    link: "#",
  },
  {
    id: 3,
    brand: "Salary Insights",
    title: "Kurumsal Maaş Raporu %15 İndirimli",
    description: "Ara zam öncesi Nisan–Mayıs maaş raporu. 10.000'den fazla pozisyon verisi ile sektör karşılaştırması.",
    category: "Finans",
    logoUrl: null,
    badge: "%15 İndirim",
    link: "#",
  },
  {
    id: 4,
    brand: "Dermolisa",
    title: "Kozmetik Ürünlerinde %30 İndirim",
    description: "Dr. Dennis Gross, Peter Thomas Roth ve Philip B gibi dünya markalarında inner·hub üyelerine özel indirim.",
    category: "Yaşam",
    logoUrl: null,
    badge: "%30 İndirim",
    link: "#",
  },
  {
    id: 5,
    brand: "Notion",
    title: "Notion Plus 6 Ay Ücretsiz",
    description: "Startup planına dahil tüm özellikleri, öncelikli destek ve ek depolamayı 6 ay boyunca ücretsiz kullanın.",
    category: "Yazılım",
    logoUrl: null,
    badge: "6 Ay Ücretsiz",
    link: "#",
  },
  {
    id: 6,
    brand: "AWS",
    title: "AWS Activate — $1.000 Kredi",
    description: "AWS Activate kapsamında seçili startuplara özel $1.000 kredi, teknik destek ve AWS ekibine erişim.",
    category: "Yazılım",
    logoUrl: null,
    badge: "$1.000 Kredi",
    link: "#",
  },
  {
    id: 7,
    brand: "Wise Business",
    title: "Wise Business İlk Yıl Ücretsiz",
    description: "Uluslararası para transferi ve çoklu para birimi hesabı. inner·hub üyelerine ilk yıl kart ücreti yok.",
    category: "Finans",
    logoUrl: null,
    badge: "1 Yıl Ücretsiz",
    link: "#",
  },
  {
    id: 8,
    brand: "Maven",
    title: "Maven Cohort Kurslarında %20 İndirim",
    description: "Dünyanın önde gelen uzmanlarından canlı cohort kursları. Liderlik, ürün, pazarlama ve daha fazlası.",
    category: "Eğitim",
    logoUrl: null,
    badge: "%20 İndirim",
    link: "#",
  },
];

const CATEGORIES: Category[] = ["Tümü", "Yazılım", "Finans", "Yaşam", "Eğitim"];

function PerkCard({ perk }: { perk: Perk }) {
  return (
    <div className="group flex flex-col border border-[var(--ink)]/[0.08] bg-[var(--bone)] p-5 transition-all duration-200 hover:border-[var(--ink)]/20 hover:shadow-[0_2px_12px_rgba(10,10,10,0.06)]">
      {/* Logo + badge */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex size-12 shrink-0 items-center justify-center border border-[var(--ink)]/[0.08]">
          {perk.logoUrl ? (
            <img src={perk.logoUrl} alt={perk.brand} className="size-8 object-contain" />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--ink)]/50">
              {perk.brand.slice(0, 2)}
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--inner-green)] border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-2 py-0.5">
          {perk.badge}
        </span>
      </div>

      {/* Content */}
      <p className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
        {perk.brand}
      </p>
      <p className="mb-2 text-sm font-medium leading-snug text-[var(--ink)]">{perk.title}</p>
      <p className="mb-5 flex-1 text-xs leading-relaxed text-[var(--ink)]/50">{perk.description}</p>

      {/* CTA */}
      <a
        href={perk.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between border border-[var(--ink)]/10 px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50 transition-all hover:border-[var(--ink)] hover:text-[var(--ink)]"
      >
        <span>Detayları Gör</span>
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

export default function Perks() {
  const [active, setActive] = useState<Category>("Tümü");

  const filtered = active === "Tümü" ? PERKS : PERKS.filter((p) => p.category === active);

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
            Ayrıcalıklar
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Program katılımcılarına özel yazılım, finans ve yaşam fırsatları.
          </p>
        </div>
      </FadeIn>

      {/* Filter tabs */}
      <FadeIn delay={0.04}>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={[
                "font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors",
                active === cat
                  ? "bg-[var(--ink)] text-[var(--bone)] border-[var(--ink)]"
                  : "border-[var(--ink)]/15 text-[var(--ink)]/50 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto flex items-center font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
            {filtered.length} ayrıcalık
          </span>
        </div>
      </FadeIn>

      {/* Grid */}
      <FadeIn delay={0.08}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((perk) => (
            <PerkCard key={perk.id} perk={perk} />
          ))}
        </div>
      </FadeIn>

      {/* Bottom note */}
      <FadeIn delay={0.12}>
        <div className="border-t border-[var(--ink)]/[0.08] pt-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25">
            Yeni ayrıcalıklar her ay ekleniyor · Öneriniz mi var? Slack'ten bildirin.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
