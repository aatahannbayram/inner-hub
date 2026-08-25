import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SitePublicShell } from "@/components/SitePublicShell";
import { FadeIn } from "@/components/FadeIn";
import { useLocale, useLocalizedHref, useT } from "@/i18n";
import { useSeo } from "@/lib/seo";
import { localizedPath } from "@/i18n/localePath";

type Section = { heading: string; body: string[] };

const TR: { title: string; updated: string; intro: string[]; sections: Section[] } = {
  title: "Gizlilik Politikası",
  updated: "Son güncelleme: 31 Temmuz 2026",
  intro: [
    "inner.hub (\"biz\", \"platform\"), davetiye ile katılan kurucular, yatırımcılar ve araştırmacılardan oluşan kapalı bir topluluk platformudur. Bu sayfa, inner.digital üzerinden bize sağladığınız kişisel verileri nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.",
    "Platformu kullanarak bu politikayı kabul etmiş olursunuz. Sorularınız için support@inner.digital adresinden bize ulaşabilirsiniz.",
  ],
  sections: [
    {
      heading: "1. Topladığımız Veriler",
      body: [
        "Hesap bilgileri: ad, e-posta adresi, şifre (hash'lenmiş olarak saklanır).",
        "Profil bilgileri: unvan, şirket, biyografi, uzmanlık alanları, üniversite, telefon, sosyal medya bağlantıları (LinkedIn, GitHub, Behance, Instagram, X, kişisel site).",
        "Google veya LinkedIn ile bağlandığınızda: ilgili sağlayıcının bize ilettiği ad, e-posta ve profil fotoğrafı URL'si. Şifrenize veya diğer hesap verilerinize erişimimiz olmaz.",
        "Kullanım verileri: etkinlik kayıtları, kurs ilerlemesi, topluluk sohbet mesajları, oylar, gönderilen ürünler (inner·stage) ve bildirim tercihleri.",
        "Ödeme bilgileri: üyelik ve Circle Pass satın alımları Stripe üzerinden işlenir; kart numaranız bizim sunucularımızda saklanmaz.",
        "Teknik veriler: oturum çerezi, IP adresi (güvenlik ve hız sınırlama amaçlı), tarayıcı bilgisi ve sayfa ziyaretlerine dair anonim analiz verisi (Google Analytics 4).",
      ],
    },
    {
      heading: "2. Verileri Nasıl Kullanıyoruz",
      body: [
        "Üyeliğinizi yönetmek, kimliğinizi doğrulamak ve hesabınızı güvenli tutmak.",
        "Topluluk içi eşleştirme, tanışma önerileri ve bildirimler sunmak.",
        "Etkinlik, kurs ve inner·stage gibi platform içi ürünleri işletmek.",
        "Üyelik ve Circle Pass ödemelerini Stripe aracılığıyla işlemek.",
        "Platformun kullanımını anlamak ve iyileştirmek için toplu, anonimleştirilmiş analiz yapmak.",
        "Yasal yükümlülüklere uymak ve kötüye kullanımı önlemek.",
      ],
    },
    {
      heading: "3. Üçüncü Taraf Hizmetler",
      body: [
        "Google ve LinkedIn: isteğe bağlı \"ile bağlan\" girişleri için kimlik doğrulama sağlayıcıları olarak kullanılır.",
        "Stripe: ödeme işleme. Kart verileriniz doğrudan Stripe'a gider, bizim sistemlerimize dokunmaz.",
        "Google Analytics 4: anonimleştirilmiş kullanım istatistikleri.",
        "Hostinger (SMTP): işlemsel e-postaların (davet, onay, bildirim) gönderimi.",
        "Mux: kurs videolarının barındırılması ve oynatılması.",
        "Higgsfield: platform içi görsel/medya üretim araçları (yalnızca siz talep ettiğinizde kullanılır).",
        "Bu sağlayıcıların her biri kendi gizlilik politikasına tabidir; verilerinizi yalnızca belirtilen amaçlar için onlarla paylaşırız.",
      ],
    },
    {
      heading: "4. Çerezler",
      body: [
        "Oturumunuzu açık tutmak için yalnızca zorunlu, HTTP-only bir oturum çerezi kullanırız. Bu çerez reklam veya izleme amacıyla kullanılmaz.",
        "Google Analytics, tarayıcınıza anonimleştirilmiş ölçüm çerezleri yerleştirebilir; bunları tarayıcı ayarlarınızdan reddedebilirsiniz.",
      ],
    },
    {
      heading: "5. Veri Saklama ve Silme",
      body: [
        "Verilerinizi hesabınız aktif olduğu sürece saklarız.",
        "Panel > Ayarlar bölümünden hesabınızı silme talebinde bulunabilirsiniz; bu işlem kişisel verilerinizi (ad, e-posta, sosyal bağlantılar, biyografi vb.) geri alınamaz şekilde anonimleştirir.",
        "Yasal veya muhasebe yükümlülükleri nedeniyle bazı işlem kayıtları (örn. ödeme geçmişi) daha uzun süre saklanabilir.",
      ],
    },
    {
      heading: "6. Haklarınız",
      body: [
        "6698 sayılı KVKK ve ilgili mevzuat kapsamında; verilerinize erişim, düzeltme, silme, işlemeye itiraz ve veri taşınabilirliği haklarına sahipsiniz.",
        "Bu haklarınızı kullanmak için support@inner.digital adresine yazabilirsiniz; talebinizi makul bir süre içinde yanıtlarız.",
      ],
    },
    {
      heading: "7. Çocukların Gizliliği",
      body: [
        "inner.hub davetiye ile katılan, profesyonel bir yetişkin topluluğudur. Platform 18 yaş altındaki kişilere yönelik değildir ve bilerek onlardan veri toplamayız.",
      ],
    },
    {
      heading: "8. Bu Politikadaki Değişiklikler",
      body: [
        "Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde üyeleri e-posta veya panel içi bildirim ile bilgilendiririz. Bu sayfanın üst kısmında en son güncelleme tarihi belirtilir.",
      ],
    },
  ],
};

const EN: typeof TR = {
  title: "Privacy Policy",
  updated: "Last updated: July 31, 2026",
  intro: [
    "inner.hub (\"we\", \"the platform\") is an invitation-only community of founders, investors, and researchers. This page explains how we collect, use, and protect the personal data you share with us through inner.digital.",
    "By using the platform, you agree to this policy. Questions can be sent to support@inner.digital.",
  ],
  sections: [
    {
      heading: "1. Data We Collect",
      body: [
        "Account information: name, email address, password (stored hashed).",
        "Profile information: title, company, bio, skills, university, phone, social links (LinkedIn, GitHub, Behance, Instagram, X, personal site).",
        "When you connect with Google or LinkedIn: the name, email, and profile picture URL provided by that service. We never see your password or other account data.",
        "Usage data: event registrations, course progress, community chat messages, votes, submitted products (inner·stage), and notification preferences.",
        "Payment information: membership and Circle Pass purchases are processed via Stripe; we never store your card number on our servers.",
        "Technical data: session cookie, IP address (for security and rate limiting), browser information, and anonymized page-visit analytics (Google Analytics 4).",
      ],
    },
    {
      heading: "2. How We Use Your Data",
      body: [
        "To manage your membership, verify your identity, and keep your account secure.",
        "To power community matching, introduction suggestions, and notifications.",
        "To operate in-platform products such as events, courses, and inner·stage.",
        "To process membership and Circle Pass payments through Stripe.",
        "To understand and improve the platform through aggregated, anonymized analytics.",
        "To comply with legal obligations and prevent misuse.",
      ],
    },
    {
      heading: "3. Third-Party Services",
      body: [
        "Google and LinkedIn: used as identity providers for the optional \"connect\" sign-in flows.",
        "Stripe: payment processing. Your card details go directly to Stripe and never touch our systems.",
        "Google Analytics 4: anonymized usage statistics.",
        "Hostinger (SMTP): delivery of transactional emails (invitations, approvals, notifications).",
        "Mux: hosting and playback of course videos.",
        "Higgsfield: in-platform media generation tools (used only when you explicitly request them).",
        "Each provider is subject to its own privacy policy; we only share your data with them for the purposes listed above.",
      ],
    },
    {
      heading: "4. Cookies",
      body: [
        "We use only a strictly necessary, HTTP-only session cookie to keep you signed in. It is never used for advertising or tracking.",
        "Google Analytics may set anonymized measurement cookies in your browser; you can opt out via your browser settings.",
      ],
    },
    {
      heading: "5. Data Retention & Deletion",
      body: [
        "We retain your data for as long as your account remains active.",
        "You can request account deletion from Panel > Settings; this irreversibly anonymizes your personal data (name, email, social links, bio, etc.).",
        "Some transaction records (e.g. payment history) may be retained longer where required by law or accounting obligations.",
      ],
    },
    {
      heading: "6. Your Rights",
      body: [
        "Depending on your jurisdiction, you may have rights to access, correct, delete, object to processing, and port your data (including under Turkish law, KVKK).",
        "To exercise these rights, email support@inner.digital; we respond within a reasonable timeframe.",
      ],
    },
    {
      heading: "7. Children's Privacy",
      body: [
        "inner.hub is an invitation-only, professional community for adults. The platform is not directed at anyone under 18, and we do not knowingly collect data from them.",
      ],
    },
    {
      heading: "8. Changes to This Policy",
      body: [
        "We may update this policy from time to time. We'll notify members of material changes by email or in-panel notification. The date at the top of this page reflects the latest revision.",
      ],
    },
  ],
};

export default function PrivacyPage() {
  const t = useT();
  const { locale } = useLocale();
  const homeHref = useLocalizedHref("/");
  const copy = locale === "en" ? EN : TR;

  useSeo({
    title: copy.title,
    description:
      locale === "en"
        ? "How inner.hub collects, uses, and protects your personal data."
        : "inner.hub kişisel verilerinizi nasıl topluyor, kullanıyor ve koruyor.",
    canonicalPath: localizedPath("/privacy", locale),
    type: "website",
  });

  return (
    <SitePublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-0">
        <Link
          href={homeHref}
          className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45 transition-colors hover:text-[var(--bone-fixed)]"
        >
          <ArrowLeft className="size-3" />
          {t("common.back")}
        </Link>

        <FadeIn>
          <h1
            className="font-serif font-display text-4xl text-[var(--bone-fixed)] md:text-5xl"
            style={{ fontWeight: 600 }}
          >
            {copy.title}
          </h1>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
            {copy.updated}
          </p>
        </FadeIn>

        <FadeIn delay={0.04}>
          <div className="mt-8 space-y-4">
            {copy.intro.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-[var(--bone-fixed)]/75">
                {p}
              </p>
            ))}
          </div>
        </FadeIn>

        <div className="mt-12 space-y-10">
          {copy.sections.map((section, i) => (
            <FadeIn key={section.heading} delay={0.06 + i * 0.02}>
              <section className="border-t border-white/10 pt-6">
                <h2 className="font-serif text-xl text-[var(--bone-fixed)]">{section.heading}</h2>
                <ul className="mt-3 space-y-2.5">
                  {section.body.map((line, j) => (
                    <li
                      key={j}
                      className="text-sm leading-relaxed text-[var(--bone-fixed)]/70"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>
          ))}
        </div>
      </article>
    </SitePublicShell>
  );
}
