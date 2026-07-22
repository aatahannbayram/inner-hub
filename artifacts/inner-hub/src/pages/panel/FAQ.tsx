import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { ChevronDown } from "lucide-react";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    category: "Üyelik",
    items: [
      {
        q: "inner·hub'a nasıl üye olabilirim?",
        a: "inner·hub davet bazlı bir topluluktır. Mevcut üyelerden referans alarak başvurabilir veya web sitesindeki başvuru formunu doldurabilirsiniz. Başvurular inner·hub ekibi tarafından değerlendirilir.",
      },
      {
        q: "Üyelik ücretli mi?",
        a: "Evet. Kurucu üyeler için özel bir fiyatlandırma söz konusudur. Sonraki dalgalar için standart yıllık üyelik planları mevcuttur. Ayrıntılar için Üyelik sayfasını inceleyebilirsiniz.",
      },
      {
        q: "Üyeliğimi iptal edebilir miyim?",
        a: "Yıllık üyeliğinizi dönem sonunda iptal edebilirsiniz. İptal taleplerini destek ekibimize iletebilirsiniz. Dönem içi iade yapılmamaktadır.",
      },
      {
        q: "Kurumsal koltuk nedir?",
        a: "Bir şirket adına birden fazla çalışanın üyeliği için kurumsal koltuk planları mevcuttur. Bu plan dahilinde ekibinizin tamamı inner·hub ekosisteminden yararlanabilir.",
      },
    ],
  },
  {
    category: "Platform",
    items: [
      {
        q: "inner·signal nedir?",
        a: "inner·signal, etkileşimlerinizi analiz ederek size özel haftalık temalar, bağlantı önerileri ve ekosistem içgörüleri üreten AI katmanıdır. Profil verileriniz ve platform aktiviteniz temel alınır.",
      },
      {
        q: "inner·match nasıl çalışır?",
        a: "inner·match, profil bilgilerinizi ve AI analizini kullanarak size uygun co-founder, mentor, yatırımcı veya iş birliği önerileri sunar. Eşleşme onayı sonrası platform tanışma sürecini yönetir.",
      },
      {
        q: "inner·vault'taki belgeler güvende mi?",
        a: "Evet. inner·vault'a yüklenen belgeler yalnızca siz veya seçtiğiniz izin seviyesine göre topluluk üyeleri tarafından görülebilir. Hiçbir içerik dışarıya açık değildir.",
      },
      {
        q: "inner·id'i nerede kullanabilirim?",
        a: "inner·id rozetini LinkedIn, GitHub ve kişisel sitenize ekleyebilirsiniz. Ayrıca partner platformlar API üzerinden üyeliğinizi doğrulayabilir. Embed kodlarını inner·id sayfasından alabilirsiniz.",
      },
    ],
  },
  {
    category: "Etkinlikler & İçerik",
    items: [
      {
        q: "Etkinliklere nasıl kayıt olabilirim?",
        a: "Etkinlikler sayfasından açık etkinlikleri görebilir, doğrudan kayıt olabilirsiniz. Üyeler için etkinlik biletleri genellikle indirimlidir. Bazı özel etkinlikler yalnızca davetiye ile açık olabilir.",
      },
      {
        q: "Kursları sonradan izleyebilir miyim?",
        a: "Cohort bazlı kurslar belirli bir takvimde ilerler, ancak kayıt olduktan sonra içeriklere dilediğiniz zaman erişebilirsiniz. Canlı oturumlar kaydedilir ve platform üzerinden paylaşılır.",
      },
      {
        q: "Ben de içerik üretip paylaşabilir miyim?",
        a: "Evet. inner·vault üzerinden belgelerinizi, araştırmalarınızı ve notlarınızı toplulukla paylaşabilirsiniz. Workshop veya masterclass teklif etmek için destek ekibiyle iletişime geçebilirsiniz.",
      },
    ],
  },
  {
    category: "Teknik & API",
    items: [
      {
        q: "inner·api'ye nasıl erişebilirim?",
        a: "inner·api sayfasından API anahtarınızı görüntüleyebilir, kullanım istatistiklerinizi takip edebilir ve endpoint dokümantasyonuna ulaşabilirsiniz. Starter plan ücretsizdir.",
      },
      {
        q: "API rate limitleri nelerdir?",
        a: "Starter planda saatte 100 istek, Builder planda saatte 1.000 istek, Scale planda saatte 10.000 istek limitiniz vardır. Limitler aşıldığında 429 Too Many Requests döner.",
      },
      {
        q: "Webhook kurulumu nasıl yapılır?",
        a: "inner·api sayfasından Webhooks bölümüne gidin. HTTPS endpoint URL'inizi ekleyin ve dinlemek istediğiniz olayları seçin. Teslim loglarını ve yeniden deneme geçmişini aynı sayfada takip edebilirsiniz.",
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--ink)]/[0.06] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--ink)]"
      >
        <span className="text-sm text-[var(--ink)] font-light leading-relaxed">{q}</span>
        <ChevronDown
          className={`mt-0.5 size-4 shrink-0 text-[var(--ink)]/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[var(--ink)]/55 font-light">{a}</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div className="space-y-8 max-w-xl">
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
            sss
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Sıkça sorulan sorular.
          </p>
        </div>
      </FadeIn>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FAQS.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setActiveCategory(cat.category)}
            className={[
              "border px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-colors",
              activeCategory === cat.category
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                : "border-[var(--ink)]/15 text-[var(--ink)]/35 hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Questions */}
      {FAQS.filter((cat) => cat.category === activeCategory).map((cat) => (
        <div key={cat.category} className="border border-[var(--ink)]/[0.08] px-5">
          {cat.items.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      ))}

      {/* Contact */}
      <div className="border border-[var(--ink)]/[0.08] p-5">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
          Cevap bulamadın mı?
        </p>
        <p className="mb-3 text-sm text-[var(--ink)]/50 font-light">
          Topluluk Chat'ten bize ulaş veya e-posta gönder.
        </p>
        <a
          href="mailto:destek@inner.digital"
          className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 underline underline-offset-2 hover:text-[var(--ink)] transition-colors"
        >
          destek@inner.digital
        </a>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·hub · sık sorulan sorular
        </p>
      </div>
    </div>
  );
}
