import { jsx, jsxs, Fragment as Fragment$1 } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Link, useParams, Router, Switch, Route } from "wouter";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { createContext, useState, useCallback, useEffect, useMemo, useContext, useRef, Fragment } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Mail, Linkedin, Instagram, ArrowRight, ArrowUpRight, Check, Zap, Users, TrendingUp, BookOpen, Radio, Fingerprint, Code2, Target, Rocket, Wrench, Building2, ArrowLeft, Play, Pause, VolumeX, Volume2, AlertCircle } from "lucide-react";
import { useReducedMotion, motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const DEFAULT_LOCALE = "tr";
const LOCALE_STORAGE_KEY = "inner.locale";
function isLocale(v) {
  return v === "tr" || v === "en";
}
function readStoredLocale() {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}
function writeStoredLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
  }
}
function getByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return void 0;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : void 0;
}
function interpolate$1(template, values) {
  if (!values) return template;
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => values[key] !== void 0 ? String(values[key]) : `{${key}}`
  );
}
const tr = {
  common: {
    save: "Kaydet",
    saving: "Kaydediliyor…",
    saved: "Kaydedildi",
    cancel: "İptal",
    edit: "Düzenle",
    delete: "Sil",
    copy: "Kopyala",
    copied: "Kopyalandı",
    loading: "Yükleniyor…",
    retry: "Tekrar dene",
    back: "Geri",
    next: "İleri",
    close: "Kapat",
    view: "Görüntüle",
    open: "Aç",
    search: "Ara",
    all: "Tümü",
    soon: "Yakında",
    member: "Üye",
    admin: "Admin",
    logout: "Çıkış",
    logoutLong: "Çıkış yap",
    online: "online",
    errorGeneric: "Bir şeyler ters gitti",
    comingSoon: "Bu sayfa yakında hazır olacak.",
    home: "Ana sayfa",
    skipToContent: "İçeriğe atla",
    sectionIndex: "Bölüm dizini",
    privateCircle: "inner.hub özel çember",
    yes: "Evet",
    no: "Hayır",
    searchPlaceholder: "Ara…"
  },
  nav: {
    sectionMain: "Ana",
    sectionPlatform: "Platform",
    sectionAccount: "Hesap",
    sectionAdmin: "Admin",
    dashboard: "Dashboard",
    community: "Topluluk",
    courses: "Kurslar",
    events: "Etkinlikler",
    members: "Katılımcılar",
    org: "Organizasyon",
    perks: "Ayrıcalıklar",
    profile: "Profil",
    membership: "Üyelik",
    faq: "SSS",
    applications: "Başvurular",
    coursesAdmin: "Kurs Yönetimi",
    eventsAdmin: "Etkinlik Yönetimi",
    haberlerAdmin: "Haberler",
    analytics: "Analitik",
    settings: "Ayarlar"
  },
  shell: {
    notifications: "Bildirimler",
    markAllRead: "Tümünü oku",
    noNotifications: "Bildirim yok",
    profileCompletion: "Profil tamamlanma",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    collapseSidebar: "Kenar çubuğunu daralt",
    expandSidebar: "Kenar çubuğunu genişlet",
    justNow: "az önce",
    minutesAgo: "{n} dk önce",
    hoursAgo: "{n} saat önce",
    daysAgo: "{n} gün önce",
    unreadCount: "{n} okunmamış",
    openNotif: "Aç",
    notifLoading: "Bildirimler yükleniyor…",
    notifError: "Yüklenemedi · tekrar dene"
  },
  search: {
    title: "Ara",
    open: "Ara",
    close: "Kapat",
    placeholder: "Üye, kurs, etkinlik, perk, sayfa…",
    placeholderShort: "Her şeyi ara…",
    hint: "Sayfa, üye veya içeriğe yazmaya başla. Mobilde en hızlı yol burası.",
    empty: "Sonuç yok. AI ile dene veya başka bir kelime yaz.",
    ai: "AI",
    aiFailed: "AI yanıt veremedi; yapılandırılmış sonuçlar aşağıda.",
    footerNav: "↑↓ gezin · Enter aç",
    footerAi: "AI · Enter veya AI butonu",
    kind: {
      page: "Sayfa",
      member: "Üye",
      course: "Kurs",
      event: "Etkinlik",
      perk: "Perk",
      stage: "Stage",
      org: "Org",
      faq: "SSS",
      ai: "AI"
    }
  },
  settings: {
    title: "ayarlar",
    subtitle: "Hesap ve platform tercihlerini yönet.",
    loading: "Ayarlar yükleniyor",
    loadError: "Ayarlar alınamadı",
    saveError: "Kaydedilemedi",
    prefsUpdated: "Tercihler güncellendi",
    sectionNotif: "Bildirimler",
    sectionNotifSub: "Hangi olaylarda bildirim almak istediğini seç",
    notifMatch: "inner·match önerileri",
    notifMatchSub: "Yeni eşleşme geldiğinde",
    notifEvents: "Etkinlik hatırlatmaları",
    notifEventsSub: "Katıldığın etkinliklerden 1 gün önce",
    notifMessages: "Chat mesajları",
    notifMessagesSub: "@bahsedilme ve DM",
    notifCapital: "inner·capital güncellemeleri",
    notifCapitalSub: "SPV ve deal flow aktivitesi",
    notifDigest: "Haftalık digest",
    notifDigestSub: "Haftanın özeti her Pazartesi",
    notifEmail: "E-posta bildirimleri",
    notifEmailSub: "Platform bildirimlerini e-posta ile al",
    sectionPrivacy: "Gizlilik",
    sectionPrivacySub: "Platform içinde görünürlüğünü kontrol et",
    showOnline: "Çevrimiçi durumu göster",
    showOnlineSub: "Diğer üyeler seni ONLINE olarak görür",
    allowMatch: "inner·match'e dahil ol",
    allowMatchSub: "AI eşleştirme motorunda göründüğünde",
    analyticsConsent: "Anonim analitik",
    analyticsConsentSub: "Platform iyileştirmesi için anonim kullanım verisi",
    sectionAppearance: "Görünüm",
    sectionAppearanceSub: "Platform arayüz tercihleri",
    theme: "Tema",
    themeSub: "Açık, koyu veya sistem tercihi",
    themeLight: "Açık",
    themeDark: "Koyu",
    themeSystem: "Sistem",
    compactMode: "Kompakt mod",
    compactModeSub: "Daha yoğun içerik düzeni",
    sectionLang: "Dil",
    sectionLangSub: "Platform arayüz dili",
    uiLang: "Arayüz dili",
    langTr: "Türkçe",
    langEn: "English",
    danger: "Tehlikeli Alan",
    suspend: "Hesabı askıya al",
    suspendSub: "Üyeliğini geçici olarak durdur",
    logoutSub: "Bu cihazdan oturumu kapat",
    footer: "ayarlar",
    whatsapp: "WhatsApp",
    whatsappSub: "Kampanya ve duyuru bildirimleri",
    whatsappOptIn: "WhatsApp bildirimleri",
    whatsappOptInSub: "Önemli güncellemeleri WhatsApp ile al",
    whatsappPhone: "Telefon",
    whatsappPhoneHint: "Opt-in için geçerli bir numara gerekli (profilde de düzenlenir)",
    whatsappError: "WhatsApp tercihi kaydedilemedi",
    deleteAccount: "Hesabı sil",
    deleteAccountSub: "Profilin ve verilerin kalıcı olarak kaldırılır",
    deleteAccountConfirmHint: "Onaylamak için DELETE yaz",
    deleteAccountAction: "Hesabı kalıcı sil",
    deleteAccountError: "Hesap silinemedi"
  },
  legal: {
    eyebrow: "Yasal",
    title: "Devam etmeden önce",
    subtitle: "Güncel belgelerimizi okuyup kabul etmen gerekiyor.",
    acceptAll: "Tümünü kabul et",
    accepting: "Kaydediliyor…",
    acceptError: "Onay kaydedilemedi",
    required: "Panele devam etmek için onay zorunlu"
  },
  org: {
    title: "organizasyon",
    subtitle: "Şirketin ve ekip üyelerin.",
    loading: "Organizasyon yükleniyor",
    loadError: "Organizasyon yüklenemedi",
    empty: "Henüz organizasyon yok",
    emptyHint: "Profil sayfasından oluştur veya katıl.",
    goProfile: "Profile git",
    mine: "Organizasyonlarım",
    primary: "birincil",
    members: "Üyeler",
    loadingMembers: "Üyeler yükleniyor",
    membersError: "Üyeler yüklenemedi",
    noMembers: "Henüz üye yok",
    footer: "organizasyon"
  },
  campaigns: {
    create: "Kampanya yayınla",
    costHint: "1 Circle Pass",
    titlePlaceholder: "Kampanya başlığı",
    pitchPlaceholder: "Kısa pitch",
    ctaPlaceholder: "https://…",
    codePlaceholder: "Kod (opsiyonel)",
    publish: "Yayınla",
    created: "Kampanya yayınlandı",
    createError: "Kampanya oluşturulamadı"
  },
  publicNav: {
    idea: "Fikir",
    circle: "Çember",
    platform: "Platform",
    gathering: "Buluşma",
    next: "Sıradaki",
    artifacts: "Haberler",
    invitation: "Davetiye",
    requestInvitation: "Davetiye talep et",
    primaryNav: "Ana menü",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat"
  },
  artifacts: {
    nav: "Haberler",
    eyebrow: "08 · Haberler",
    title: "Sinyal, not, video.",
    subtitle: "Blog, post ve caption - çemberden erken sinyal. Flexlore ile üretilir; SEO ve cevap motorları için net özetlerle yayınlanır.",
    metaTitle: "Haberler · inner.hub",
    metaDescription: "inner.hub haberler: davetiye, gathering ve çember üzerine yazılar ile video haberler.",
    article: "Yazı",
    video: "Video",
    back: "Tüm haberler",
    ctaHint: "Erişim davetiye ile. Her zaman.",
    empty: "Yakında - Flexlore Content Creator Flow ile yazılar buraya akacak.",
    faqTitle: "Sık sorulanlar"
  },
  haberlerAdmin: {
    title: "Haberler",
    subtitle: "Blog / yazı / video yapısı. Flexlore bağlanana kadar draft kaydet veya JSON export et; yayına content dosyasına eklenir.",
    viewPublic: "Herkese açık sayfa",
    published: "Yayında",
    open: "Aç",
    create: "Yeni içerik",
    createHint: "AEO için önce net cevap (answer), sonra uzun gövde. Export JSON → src/content/artifacts.",
    fieldTitleTr: "Başlık (TR)",
    fieldTitleEn: "Başlık (EN)",
    fieldAnswer: "AEO cevabı",
    fieldDescription: "Meta description",
    fieldBody: "Gövde (satır = paragraf)",
    saveDraft: "Draft kaydet",
    exportJson: "JSON kopyala",
    copied: "Kopyalandı",
    drafts: "Draft’lar",
    delete: "Sil"
  },
  home: {
    heroTag: "İstanbul → Global · Est. 2026",
    heroBody: "Kurucular, builder’lar ve yatırımcılardan oluşan özel bir çember. Yer veya statüyle değil; erken buluşup sonraki adımı inşa etme açlığıyla bağlı.",
    requestInvitation: "Davetiye talep et",
    ideaEyebrow: "01 · Fikir",
    ideaTitle: "Özel bir çember.",
    ideaBody: "inner·hub, davetle girilen bir ağdır. Kurucular, builder’lar ve yatırımcılar buraya erken sinyal, derin bağlantı ve birlikte inşa etmek için gelir.",
    ideaLine1: "AI merkezdir.",
    ideaLine2: "Etrafında: kurucular, builder’lar, yatırımcılar.",
    ideaLine3: "inner.hub onları erken bir araya getirir.",
    ideaReveal: "İstanbul’da başlar. Tek tek seçilen otuz dört kişi kurucu çemberi oluşturur: bir platformun üyeleri değil, sıradakini mümkün kılan insanlar.",
    seatsEyebrow: "02 · İlk otuz dört",
    seatsTitle: "Kimler için.",
    seatsLine1: "Erken buluşanlar için kurucu koltuklar.",
    seatsLine2: "Bilet değil. Katman değil. Çember.",
    seatFounders: "Kurucular.",
    seatFounders1: "AI ve ötesinde girişim kuranlar",
    seatFounders2: "Gürültü gelmeden shipping edenler",
    seatFounders3: "Kalabalık değil, birlikte üreten ortak arayanlar",
    seatFounders4: "Tek tek seçilir. Açık başvuru yok",
    seatBuilders: "Builder’lar.",
    seatBuilders1: "Ciddi AI alanında mühendis ve araştırmacılar",
    seatBuilders2: "Demo değil derinlik. Bileşik zanaat",
    seatBuilders3: "Sinyal önce çember içinde paylaşılır",
    seatInvestors: "Yatırımcılar.",
    seatInvestors1: "Melekler ve venture operatörleri",
    seatInvestors2: "Erken inanç, sabırlı sermaye",
    seatInvestors3: "Erişim biletle değil güvenle şekillenir",
    circleStartsHere: "Çemberin burada başlar.",
    learnMore: "Daha fazla",
    seatsFooter: "Bu otuz dört kişi sadece üye değil. inner·hub’ın kurucu üyeleri.",
    platformEyebrow: "03 · Platform",
    platformTitle: "Kapalı bir çemberin temposuna göre inşa edildi.",
    platformAccess: "Erişim davetiye ile. Her zaman.",
    moreTools: "+{n} araç daha",
    modSignalTag: "AI katmanı",
    modSignalDesc: "Yapay zeka destekli fırsat ve anlaşma akışı. Herkesten önce doğru sinyaller.",
    modMatchTag: "Eşleştirme",
    modMatchDesc: "Kapalı çemberde kurucu, mentor ve yatırımcı eşleşmesi. Güvene dayalı bağlantılar.",
    modCapitalTag: "Yatırımlar",
    modCapitalDesc: "Özel deal flow ve yatırım hattı. SPV’ler, demo day’ler ve ortak yatırım fırsatları.",
    modVaultTag: "Bilgi",
    modVaultDesc: "Ortak bilgi tabanı. Pitch deck’ler, pazar araştırması ve belgeler. Yetkilendirilmiş ve aranabilir.",
    modPulseTag: "Zeka",
    modPulseDesc: "Canlı ekosistem sinyal panosu. Ne hareket ediyor, ne trend, ne önemli. Yalnızca içeride.",
    modIdTag: "Kimlik",
    modIdDesc: "Taşınabilir, doğrulanmış üyelik kimliği. inner.hub üyeliğin platformun ötesinde ağırlık taşır.",
    modApiTag: "Platform",
    modApiDesc: "Entegrasyonlar ve ortaklar için platform API’si. inner.hub altyapısının üstüne inşa et.",
    modBountyTag: "Pazar yeri",
    modBountyDesc: "Topluluk görev sistemi. Şirketler challenge açar, üyeler çözer, platform kolaylaştırır.",
    whatThisIs: "Bu nedir",
    whatThisIsEyebrow: "04 · Bu nedir",
    thePoint: "Öz",
    bigThings: "Büyük işler burada başlar.",
    whatThisIsBody: "Yeni fikirler burada konuşulur, burada test edilir ve onları gerçekten kurup fonlayabilecek insanlar tarafından burada desteklenir.",
    byInvitation: "Davetiye ile",
    entryEyebrow: "05 · Giriş",
    entryTitle: "Giriş davetiye iledir. Her zaman.",
    entryBody: "Bilet yok, katman yok, açık liste yok. Üyeler çemberin içinden önerilir, özenle değerlendirilir ve kişisel olarak davet edilir.",
    entryStepName: "Adın",
    entryStepNameLine: "Çemberin içinden biri adını öne sürer.",
    entryStepConsider: "Değerlendirme",
    entryStepConsiderLine: "Acele etmeyiz. Uyum, şöhretten önce gelir.",
    entryStepInvite: "Davetiye",
    entryStepInviteLine: "Uygunsa, doğrudan bizden duyarsın.",
    theGathering: "Buluşma",
    gatheringEyebrow: "06 · Buluşma",
    gatheringDate: "Eyl 2026 · İstanbul",
    gatheringTitle: "İlk inner.hub buluşması. İstanbul, Eylül 2026.",
    gatheringLine: "Otuz dört kişi. İki gün. Bir çember. Birçoklarının ilki.",
    oneCircle: "34 · Bir çember",
    oneCircleSr: "Otuz dört kare, bir çember.",
    whatsNext: "Sırada ne var",
    people: "Kişi",
    days: "Gün",
    modules: "Modül",
    footerTagline: "Davetli üyelik. Erken sinyal. Birlikte inşa.",
    footerNavigate: "Gezin",
    footerConnect: "Bağlan",
    footerRights: "© 2026 inner hub · Tüm hakları saklıdır",
    langSwitch: "Dil",
    panel: "Panel"
  },
  invite: {
    preparing: "Davetiye hazırlanıyor",
    access: "inner · erişim",
    homeLink: "Ana sayfa",
    memberLogin: "Üye girişi",
    requestTitle: "Davetiye talep et",
    received: "Alındı",
    successTitle: "Uygunsa, sizinle iletişime geçeriz",
    successBody: "Her talebi dikkatle inceliyoruz. Onaylanırsa bu e-postaya davet kodu gelir; panele o kodla kayıt olursun.",
    successPanelHint: "Zaten kodun varsa üye girişinden panele geç.",
    backHome: "Ana sayfaya dön",
    howEnter: "Nasıl giriyorsun?",
    roleFounder: "Girişimci",
    roleFounderEn: "Founder",
    roleFounderHint: "Bir şeyler kuruyor. Erken veya ölçekleniyor.",
    roleInvestor: "Yatırımcı",
    roleInvestorEn: "Investor",
    roleInvestorHint: "Melek, fon veya sermaye ayıran operatör.",
    roleBuilder: "Builder",
    roleBuilderEn: "Builder",
    roleBuilderHint: "Mühendis, araştırmacı veya operatör. Stack’in içinde üretenler.",
    roleCompany: "Şirket",
    roleCompanyEn: "Company",
    roleCompanyHint: "Çembere birlikte girmek isteyen ekip.",
    fullName: "Ad Soyad",
    email: "E-posta",
    org: "Kurum",
    linkedin: "LinkedIn",
    city: "Şehir",
    story: "Hikâyen",
    intro: "Kısa tanıtım",
    submit: "Gönder",
    submitting: "Gönderiliyor…",
    continue: "Devam",
    stepRole: "Nasıl giriyorsun?",
    stepIdentity: "Kime ulaşalım?",
    stepOrg: "Hangi kurum?",
    stepStory: "Ne inşa ediyorsun?",
    stepIntro: "Bizi nasıl buldun?",
    copyRole: "Yatırımcı, girişimci, builder veya şirket. Her giriş ayrı bir kapı.",
    copyIdentity: "Doğrudan sana ulaşabileceğimiz bilgiler. Spam yok; sadece gerçek yanıt.",
    copyOrgInvestor: "Fon veya kurum adın + domain. Logoyu otomatik getiririz.",
    copyOrgCompany: "Şirket adın ve domainin. Logo sisteme kaydolur.",
    copyOrgDefault: "Varsa kurumunu ekle. Domain ile logo otomatik yüklenir.",
    copyStory: "Kısa tut. Net tut. Circle bunu okuyacak.",
    copyIntro: "Çoğu kişi davetle gelir. Kendi bulduysan da sorun değil. Söylemen yeterli.",
    phName: "Adınız ve soyadınız",
    phEmail: "you@company.com",
    orgLabel: "Kurum / Fon / Şirket",
    orgDomain: "Kurum domaini",
    forLogo: "Logo için",
    required: "Zorunlu",
    optional: "Opsiyonel",
    logoFound: "Logo bulundu",
    logoAuto: "Logo otomatik çekilir",
    logoHint: "Domain girildiğinde sistem kurum logosunu getirir ve kaydeder.",
    storyLabel: "Hikâyen",
    introLabel: "Kısa tanıtım",
    phStory: "Ne kuruyorsun, neden şimdi?",
    phIntro: "Bir isim, bir bağ… veya kendi buldum",
    phOrg: "Sequoia, a16z, Acme AI…",
    phDomain: "sequoiacap.com"
  },
  homeWhatsNext: {
    eyebrow: "07 · Sırada ne var · Zamanla",
    titleBefore: "Sıradaki zaten",
    titleEm: "oluşuyor.",
    body: "Gerçek olduğunda duyururuz.\nÇember genişler: buluşmalar, sermaye ve araçlar. Bilinçli bir adım bir adım.",
    access: "Erişim davetiye ile. Her zaman.",
    accessShort: "Yalnızca davetiye.",
    cta: "Davetiye talep et"
  },
  onboarding: {
    welcomeEyebrow: "01 · Hoş geldin",
    welcomeTitle: "Circle’a girdin.",
    welcomeBody: "inner·hub paneli; sinyal, eşleşme, sermaye ve topluluk · hepsi tek yerde. Kısa bir tur seni hızlandırır.",
    dashEyebrow: "02 · Dashboard",
    dashTitle: "Üssün burası.",
    dashBody: "Özet kartlar, yaklaşan etkinlikler ve hızlı geçişler. Her şeyin nabzını buradan tutarsın.",
    signalEyebrow: "03 · Signal & Match",
    signalTitle: "Doğru insan, doğru fırsat.",
    signalBody: "inner·signal fırsatları öne çıkarır; inner·match güven temelli bağlantılar kurmana yardım eder.",
    communityEyebrow: "04 · Topluluk",
    communityTitle: "Chat, üyeler, etkinlikler.",
    communityBody: "Soldaki menüden Topluluk Chat, Katılımcılar ve Etkinlikler’e geç. Circle burada canlı kalır.",
    profileEyebrow: "05 · Profil",
    profileTitle: "Kendini görünür kıl.",
    profileBody: "Profilini tamamladıkça eşleşme ve güven artar. Sol alttaki tamamlanma çubuğu seni hatırlatır.",
    coachNavTitle: "Ana menü",
    coachNavBody: "Tüm modüller burada. Dar ekranda hamburger ile açılır.",
    coachNotifTitle: "Bildirimler",
    coachNotifBody: "Match, etkinlik ve sermaye sinyalleri buraya düşer.",
    coachMainTitle: "İçerik alanı",
    coachMainBody: "Seçtiğin sayfa burada açılır. Dashboard ile başla · gerisi menüde.",
    skip: "Atla",
    next: "Devam",
    done: "Bitir",
    start: "Tura başla",
    persona: {
      eyebrow: "06 · Persona",
      founder: {
        title: "Kurucu rotası.",
        body: "Signal, Match ve Capital senin için öncelikli. Profilini net tut; doğru yatırımcı ve ortaklar seni bulsun.",
        coachTitle: "Kurucu menüsü",
        coachBody: "Signal ve Match ile fırsatları tara; Capital deal flow için hazır ol."
      },
      investor: {
        title: "Yatırımcı bakışı.",
        body: "Deal flow, kurucu sinyalleri ve güven skoru burada toplanır. Match ile doğru kuruculara ulaş.",
        coachTitle: "Yatırımcı menüsü",
        coachBody: "Capital ve Signal ile deal flow'u takip et; Match güven temelli bağ kurar."
      },
      builder: {
        title: "Builder modu.",
        body: "Kurslar, craft ve ürün odaklı içerikler senin hızını artırır. Talent ve Members ile ekip bul.",
        coachTitle: "Builder menüsü",
        coachBody: "Courses ve Members ile öğren ve bağlan; Signal fırsatları öne çıkarır."
      },
      company: {
        title: "Şirket hesabı.",
        body: "Org sayfası, kampanyalar ve ekip üyeleri buradan yönetilir. Perks ekosisteminde görünür ol.",
        coachTitle: "Şirket menüsü",
        coachBody: "Org ve Perks ile ekosisteme katkı ver; kampanya yayınlamak 1 Pass."
      }
    }
  },
  login: {
    continueInside: "Çemberin içine devam et.",
    accessByInvite: "Erişim davetiye ile. Her zaman.",
    membersOnly: "Panel · Members only",
    googleContinue: "Google ile devam et",
    googleRegister: "Google ile kayıt ol",
    or: "veya",
    inviteCode: "Davet kodu",
    invitePlaceholder: "Davet kodunuz",
    fullName: "Ad Soyad",
    email: "E-posta",
    password: "Şifre",
    signIn: "Enter",
    createAccount: "Hesap oluştur",
    register: "Kayıt ol",
    haveAccount: "Zaten üye misin?",
    noAccount: "Hesabın yok mu?",
    support: "Bize ulaş",
    typewriter: "Girişimciler, yatırımcılar ve kuranlar için kapalı bir daire. Şimdi, sırada ne var?",
    ambientWelcome: "Sana özel bir davet,\ninner·hub'ın dairesine hoş geldin.",
    mouseHint: "Fareyi hareket ettir · bakış seni takip eder",
    googleFailed: "Google ile giriş başarısız."
  },
  id: {
    eyebrow: "Taşınabilir kimlik",
    subtitle: "Doğrulanmış kimliğin. Profilini paylaş, platform bağlarını buradan yönet.",
    editProfile: "Profili düzenle",
    publicProfile: "Herkese açık profil",
    completion: "Tamamlanma",
    connections: "Bağlantı",
    skills: "Uzmanlıklar",
    platformLinks: "Platform bağlantıları",
    platformLinksHint: "LinkedIn, GitHub ve site hesabını inner·id’ye bağla",
    badgeEmbed: "Rozet & embed",
    badgeEmbedHint: "Platformuna göre snippet'i seç ve kopyala",
    verified: "Kimlik doğrulandı",
    verifiedBody: "inner·id, davetli üyelik oturumuna bağlıdır. Platform bağlantıları profil kaydında saklanır; rozet snippet’leri handle’ına göre üretilir.",
    footer: "taşınabilir kimlik · davet bazlı · inner·hub ekosistemi",
    profileCompletion: "Profil tamamlanma",
    memberSince: "Üye · {date}",
    scanVerify: "Tara · doğrula",
    connected: "Bağlı",
    empty: "Boş",
    connect: "Bağla",
    unlink: "Bağlantıyı kaldır",
    noSkills: "Henüz uzmanlık yok.",
    addInProfile: "Profilde ekle",
    setHandle: "Kalıcı handle için Profil sayfasından kullanıcı adı belirle.",
    loading: "inner·id yükleniyor",
    loadError: "Kimlik yüklenemedi",
    tierMember: "Üye",
    tierFounder: "Kurucu Üye",
    badgeMember: "Üye",
    badgeFounder: "Kurucu",
    personalSite: "Kişisel site",
    linkedinDesc: "Profilinde inner·hub üyeliğini doğrulat",
    githubDesc: "README'ne rozet ekle, profili verify et",
    websiteDesc: "HTML embed kodu ile siteye entegre et",
    none: "Yok",
    removeFailed: "Kaldırılamadı",
    saveFailed: "Kaydedilemedi"
  },
  dashboard: {
    title: "Dashboard",
    greetingMorning: "Günaydın",
    greetingAfternoon: "İyi günler",
    greetingEvening: "İyi akşamlar",
    greetingFallback: "Merhaba",
    greetingLine: "Selam, {name}. Daire hareketli. Peki bugün ne inşa ediyoruz?",
    ambientLine: "İyi seçilenler burada buluşur,\n{name}, bugün de aralarındasın.",
    subtitle: "Çemberdeki günün özeti.",
    quickActions: "Hızlı aksiyonlar",
    openMatch: "inner·match",
    goToSignal: "'i gör",
    goToMatch: "'e git",
    goToCapital: "'i incele",
    openEvents: "Etkinlikleri gör",
    openChat: "Chat",
    openSignal: "inner·signal",
    emptyFeed: "Henüz bir aktivite yok.",
    emptyFeedHint: "Etkinliklere katıl veya profilini tamamla.",
    completeProfile: "Profilini tamamla",
    viewAll: "Tümü",
    featured: "Öne çıkan",
    signalEyebrow: "Bu hafta",
    signalDesc: "Topluluk hafızasından çıkan sinyaller ve bağlantı önerileri.",
    vaultEyebrow: "Bilgi tabanı",
    vaultDesc: "Pitch deck’ler, araştırmalar ve notlar · yalnızca daire içinde.",
    newTerm: "Yeni Dönem",
    enrollCourse2: "2. Kursa Kayıt Ol",
    termApplicationsOpen: "2. dönem başvuruları açık",
    apply: "Başvur",
    myCourses: "Kurslarım",
    enrolled: "kayıtlı",
    upcoming: "yaklaşan",
    activePerks: "aktif fırsat",
    noCoursesYet: "Henüz kursun yok",
    noUpcomingEvents: "Yaklaşan etkinlik yok",
    programProgress: "Program ilerlemesi",
    continueFrom: "Kaldığın yerden devam et",
    notStarted: "Henüz başlanmadı",
    inProgress: "Devam ediyor",
    completed: "Tamamlandı",
    continue: "Devam et",
    details: "Detay",
    perksSubtitle: "Program katılımcılarına özel fırsatlar",
    gatheringEyebrow: "Sep 2026 · İstanbul",
    gatheringDesc: "Otuz dört kişi. İki gün. Bir daire. İlk buluşma."
  },
  events: {
    title: "Etkinlikler",
    subtitle: "Topluluk buluşmaları, workshoplar ve networking etkinlikleri.",
    heroTitle: "Where the circle\ngathers in person.",
    heroBody: "Topluluk buluşmaları, workshoplar ve networking. Dairenin içinde, güvenle kurulan bağlar.",
    seeUpcoming: "Yaklaşanları Gör",
    openCalendar: "Takvimi Aç",
    upcomingStat: "Yaklaşan etkinlik",
    heroTagline: "Buluşmalar. Workshoplar. Networking.",
    rsvp: "Katılacağım",
    rsvpCancel: "Kaydı İptal Et",
    full: "Kontenjan dolu",
    join: "Kayıt Ol",
    joined: "Kayıtlı",
    empty: "Yaklaşan etkinlik yok.",
    emptyPublished: "Henüz yayınlanmış etkinlik yok.",
    emptyHint: "Yeni bir buluşma duyurulduğunda burada görünür.",
    filterAll: "Tümü",
    filterUpcoming: "Yaklaşan",
    filterPast: "Geçmiş",
    filterJoined: "Katıldıklarım",
    seatsLeft: "{n} yer kaldı",
    list: "Liste",
    calendar: "Takvim",
    loading: "Etkinlikler yükleniyor",
    loadError: "Etkinlikler yüklenemedi",
    upcomingSection: "Yaklaşan Etkinlikler",
    pastSection: "Geçmiş Etkinlikler",
    typeGathering: "Buluşma",
    typeWorkshop: "Workshop",
    typeOnline: "Online",
    typeHybrid: "Hybrid",
    typeInPerson: "Yüz yüze",
    locationSoon: "Konum yakında",
    peopleCount: "{registered}/{capacity} kişi",
    thisMonth: "Bu Ay",
    onCalendar: "takvimde",
    youreRegistered: "Kayıtlısın",
    atEvent: "etkinlikte",
    past: "Geçmiş",
    completed: "tamamlandı",
    planned: "planlanan etkinlik",
    registerFailed: "Kayıt başarısız",
    cancelFailed: "İptal başarısız",
    roomMine: "Odam",
    roomAll: "Tümü",
    joinMeet: "Meet'e katıl",
    passRequired: "Circle Pass bakiyen yetersiz. Üyelik sayfasından pass alabilirsin.",
    getPass: "Circle Pass al →",
    dayMon: "Pzt",
    dayTue: "Sal",
    dayWed: "Çar",
    dayThu: "Per",
    dayFri: "Cum",
    daySat: "Cmt",
    daySun: "Paz"
  },
  match: {
    title: "inner·match",
    subtitle: "Tercihlerine göre uyumlu üyeler.",
    prefsTitle: "Tercihler",
    prefsLookingFor: "Ne arıyorsun",
    prefsIndustry: "Sektör",
    prefsStage: "Aşama",
    prefsLocation: "Konum",
    prefsSave: "Tercihleri kaydet",
    compatibility: "Uyumluluk",
    compatibilityScore: "%{n} uyum",
    introduce: "Tanıştır",
    introduceSent: "Tanışma talebi gönderildi",
    empty: "Henüz eşleşme yok.",
    emptyHint: "Tercihlerini güncelle; yeni öneriler gelecek.",
    refresh: "Yenile",
    heroTitle: "Where trust\nfinds its people.",
    heroBody: "Co-founder, mentor ve yatırımcı eşleşmesi · dairenin içinde, güvenle seçilmiş.",
    viewMatches: "Eşleşmeleri Gör",
    setPreferences: "Tercihleri Ayarla",
    foundStat: "Eşleşme bulundu",
    heroTagline: "Co-founders. Mentors. Investors.",
    pageSubtitle: "Topluluktaki en uyumlu bağlantıların AI ile seçilmiş listesi.",
    lookingFor: "Arıyor olduğun",
    filter: "Filtrele →",
    loading: "AI eşleşmeleri hesaplanıyor",
    loadError: "Eşleşmeler alınamadı",
    countLabel: "{n} eşleşme",
    sortedBy: "AI güven skoru ile sıralandı",
    howItWorks: "Nasıl çalışır?",
    step1Title: "01 · Profil analizi",
    step1Body: "Üye sektörü, deneyimi ve topluluk etkileşimleri analiz edilir.",
    step2Title: "02 · Vektör eşleşme",
    step2Body: "Claude Haiku benzerlik skoru hesaplar, ortak zemin bulur.",
    step3Title: "03 · İnsan onayı",
    step3Body: "“Tanıştır” butonuna basarsan inner ekibi devreye girer.",
    whyCompatible: "Neden uyumlu?",
    commonGround: "Ortak zemin",
    introducing: "Gönderiliyor…",
    introduceFailed: "Talep gönderilemedi",
    typeCofounder: "Co-founder",
    typeMentor: "Mentor",
    typeInvestor: "Yatırımcı",
    typeCollab: "İş birliği",
    footer: "claude-haiku-4-5-20251001 · haftalık güncellenir"
  },
  capital: {
    title: "inner·capital",
    subtitle: "Deal flow ve kurucu tanıştırmaları.",
    heroHeadline: "Where conviction\nmeets capital.",
    heroBody: "Private deal flow, SPVs, and co-investment. Curated inside the circle, invited by trust.",
    viewPipeline: "View Pipeline",
    viewSpvs: "View SPVs",
    activeDeals: "Aktif Deal",
    heroTagline: "Deal Flow. SPVs. Co-Investment.",
    loading: "Deal flow yükleniyor",
    loadError: "Capital yüklenemedi",
    addDeal: "Deal Ekle",
    membersOnly: "Kapalı deal flow · yalnızca daire üyeleri",
    viewPipelineTab: "Pipeline",
    viewListTab: "Liste",
    statActive: "Aktif Deal",
    statActiveSub: "pipeline'da",
    statRaise: "Toplam Hedef",
    statRaiseSub: "aktif turlar",
    statClosed: "Kapanan",
    statClosedSub: "inner portföyü",
    statSpv: "SPV",
    statSpvSub: "açık yatırım aracı",
    stageClosed: "Kapandı",
    today: "bugün",
    daysAgoShort: "{n}g",
    target: "Hedef",
    valuation: "Değerleme",
    score: "Skor",
    detail: "Detay",
    close: "← Kapat",
    round: "Tur",
    internalScore: "İç Değerlendirme Skoru",
    founders: "Kurucular",
    leadInvestor: "Lead Yatırımcı",
    sector: "Sektör",
    tags: "Etiketler",
    spvOpen: "SPV açık",
    interested: "İlgileniyorum",
    introduceFounder: "Kurucuyu Tanıştır",
    admin: "Admin",
    investorBanner: "Yatırımcı odası vurgusu",
    deleteDeal: "Deal'i sil",
    confirmDelete: "{company} deal'ini silmek istiyor musun?",
    updateFailed: "Güncellenemedi",
    deleteFailed: "Silinemedi",
    participants: "{n} katılımcı",
    closing: "Kapanış {date}",
    joinSpv: "SPV'ye Katıl",
    emptyColumn: "Boş",
    colCompany: "Şirket",
    colSector: "Sektör",
    colTarget: "Hedef",
    colValuation: "Değerleme",
    colStage: "Aşama",
    openSpvs: "Açık SPV'ler",
    openSpvsSub: "Özel amaçlı araçlarla toplu yatırım katılımı",
    disclaimer: "yalnızca inner·hub üyeleri için · bilgi amaçlıdır, yatırım tavsiyesi değildir",
    empty: "Açık fırsat yok.",
    viewDeal: "Detayı gör",
    composeTitle: "Deal Ekle",
    composeSub: "Pipeline'a yeni deal ekle (yalnızca admin).",
    phCompany: "Şirket",
    phTagline: "Kısa tagline",
    phRaise: "Hedef ($500K)",
    phValuation: "Değerleme",
    phRound: "Tur (Pre-seed / Seed)",
    phFounders: "Kurucular (virgülle)",
    phScore: "Skor 0-100",
    saveFailed: "Deal kaydedilemedi"
  },
  vault: {
    title: "inner·vault",
    eyebrow: "Knowledge base",
    subtitle: "Topluluğun özel bilgi tabanı. Paylaş, öğren, referans al.",
    share: "Paylaş",
    loading: "Vault yükleniyor",
    loadError: "Vault yüklenemedi",
    heroLabel: "D60 · arşivin haritası",
    heroQuote: "Her belge, dairenin bir katmanı.",
    statTotal: "Toplam Belge",
    statMine: "Paylaşımlarım",
    statViews: "Görüntülenme",
    featured: "Öne çıkan",
    searchPlaceholder: "Belge, etiket veya yazar ara…",
    empty: "Belge bulunamadı.",
    emptyHint: "Yüklenen kaynaklar burada listelenir.",
    private: "Özel",
    community: "Topluluk",
    inviteOnly: "Davetli",
    mine: "benim",
    file: "dosya",
    pages: "{n} sayfa",
    views: "{n} görüntülenme",
    today: "bugün",
    daysAgo: "{n}g önce",
    download: "İndir",
    downloadFailed: "İndirme başarısız",
    uploadTitle: "Belge Paylaş",
    uploadSub: "Metadata + isteğe bağlı dosya (PDF, Office, görsel · en fazla 12 MB)",
    phTitle: "Başlık",
    phExcerpt: "Kısa özet",
    fileOptional: "Dosya (opsiyonel)",
    filePick: "PDF, DOCX, PPTX, PNG… seç",
    accessLevel: "Erişim Seviyesi",
    fileTooLarge: "Dosya en fazla 12 MB olabilir",
    saveFailed: "Kaydedilemedi",
    uploadFailed: "Dosya yüklenemedi",
    save: "Kaydet",
    saved: "Kaydedildi",
    footer: "yalnızca üyeler",
    typePitch: "Pitch Deck",
    typeResearch: "Araştırma",
    typeNote: "Not",
    typeTemplate: "Şablon",
    typeCode: "Kod",
    typeReport: "Rapor"
  },
  signal: {
    title: "inner·signal",
    eyebrow: "AI layer",
    subtitle: "Topluluk hafızasından senin için çıkarılan sinyaller. Oku, kaydet, harekete geç.",
    insight: "İçgörü",
    themes: "Temalar",
    people: "Bağlantılar",
    activity: "Aktivite",
    refresh: "Güncelle",
    analyzing: "Analiz…",
    loading: "Sinyaller analiz ediliyor",
    lastUpdated: "Son güncelleme · {date}",
    empty: "Henüz sinyal yok.",
    emptyHint: "Yeni içgörüler oluştukça burada görünür.",
    emptyConnections: "Bu hafta bağlantı önerisi yok.",
    activeSignal: "Aktif Sinyal",
    weeklyTheme: "haftalık tema",
    rising: "Yükselen",
    momentumHigh: "momentum yüksek",
    connection: "Bağlantı",
    suggestedThisWeek: "bu hafta önerilen",
    avgMatch: "Ort. Uyum",
    matchScoreLabel: "eşleşme skoru",
    weekInsight: "Bu haftanın içgörüsü",
    copyInsight: "İçgörüyü kopyala",
    openInChat: "Chat’te aç",
    followInChat: "Chat'te takip et",
    generateVisual: "Görsel üret · 720p",
    generating: "Üretiliyor · {status}",
    queued: "kuyruk",
    regenerate: "Yeniden üret",
    fromCache: "Görsel önbellekten · ekstra kredi yok",
    visualReady: "Görsel hazır. Yeniden üretmek kredi harcar.",
    confirmGenerate: "Tek görsel üretilir (720p, kredi-tasarruflu). Devam?",
    confirmRegenerate: "Yeniden üretim ~0.25-1 kredi harcar. Devam?",
    expandEditorial: "Büyüt · editorial",
    visualAlt: "Haftalık sinyal görseli",
    weeklyThemes: "Haftalık temalar",
    weeklyThemesSub: "Topluluktan çıkan bu haftanın sinyalleri",
    meetThisWeek: "Bu hafta tanış",
    meetThisWeekSub: "Uyum skoruna göre önerilen bağlantılar",
    compatibilityPct: "Uyum %{n}",
    requestIntro: "Tanışma talebi",
    momentumRising: "Yükselen",
    momentumStable: "Stabil",
    momentumFalling: "Düşen",
    activityMap: "Aktivite haritası",
    activityMapSub: "Son 5 haftalık topluluk yoğunluğu · gösterge amaçlı",
    low: "Az",
    high: "Çok",
    interactions: "{n} etkileşim",
    week4: "4h",
    week3: "3h",
    week2: "2h",
    week1: "1h",
    weekThis: "Bu",
    dayMon: "Pzt",
    dayTue: "Sal",
    dayWed: "Çar",
    dayThu: "Per",
    dayFri: "Cum",
    daySat: "Cmt",
    daySun: "Paz",
    fetchError: "Sinyal alınamadı",
    footer: "Claude + Higgsfield · haftalık güncellenir · görsel üretimi kredi kullanır"
  },
  profile: {
    title: "profil",
    subtitle: "inner·hub'daki kimliğini yönet.",
    save: "Kaydet",
    saving: "Kaydediliyor…",
    saved: "Kaydedildi",
    visibility: "Profil görünürlüğü",
    visibilityPublic: "Herkese açık",
    visibilityMembers: "Yalnızca üyeler",
    visibilityPrivate: "Gizli",
    visibilityHint: "Profilinin kim tarafından görüleceğini belirle.",
    visibilityPublicDesc: "Herkes profilini görebilir",
    visibilityMembersDesc: "inner·hub üyeleri görebilir",
    visibilityPrivateDesc: "Yalnızca sen görürsün",
    loading: "Profil yükleniyor",
    loadError: "Profil yüklenemedi",
    completionPct: "%{n} tamamlandı",
    photo: "Profil fotoğrafı",
    photoSoon: "Yakında · avatar URL ile",
    avatar: "Avatar",
    uploadAvatar: "Fotoğraf yükle",
    useGenerated: "Generated kullan",
    avatarHint: "JPEG sıkıştırılır · stil kaydet ile uygulanır",
    avatarError: "Avatar güncellenemedi",
    avatarTooLarge: "Görsel çok büyük (max 160KB)",
    university: "Üniversite",
    behance: "Behance",
    instagram: "Instagram",
    phone: "Telefon",
    phoneHint: "WhatsApp opt-in için kullanılır",
    placeholderUniversity: "Üniversite adı",
    placeholderBehance: "kullanıcıadı",
    placeholderInstagram: "kullanıcıadı",
    placeholderPhone: "+90…",
    org: "Organizasyon",
    orgSub: "Şirket oluştur veya mevcut birine katıl",
    orgEmpty: "Henüz bir organizasyona bağlı değilsin.",
    createOrg: "Organizasyon oluştur",
    orgName: "Ad",
    orgNamePlaceholder: "Şirket / stüdyo adı",
    orgLogo: "Logo URL",
    orgType: "Tür",
    orgType_startup: "Startup",
    orgType_company: "Şirket",
    orgType_fund: "Fon",
    orgType_studio: "Stüdyo",
    orgCreateError: "Organizasyon oluşturulamadı",
    orgCreated: "Organizasyon oluşturuldu",
    joinOrg: "Organizasyona katıl",
    joinOrgPlaceholder: "İsim ara…",
    join: "Katıl",
    orgJoinError: "Katılım başarısız",
    orgJoined: "Katıldın",
    sectionBasics: "Temel bilgiler",
    sectionSkills: "Uzmanlıklar",
    sectionSkillsSub: "inner·id kartında ve eşleşmelerde görünür",
    sectionSocial: "Sosyal linkler",
    sectionSocialSub: "inner·id rozetine bağlanır",
    firstName: "Ad",
    lastName: "Soyad",
    handle: "Kullanıcı adı",
    role: "Rol / ünvan",
    company: "Şirket",
    bio: "Biyografi",
    placeholderFirstName: "Adın",
    placeholderLastName: "Soyadın",
    placeholderHandle: "handle",
    placeholderRole: "Kurucu, CPO…",
    placeholderCompany: "Şirket adı",
    placeholderBio: "Kısa bir tanıtım yaz…",
    placeholderLinkedin: "profiladın",
    placeholderGithub: "kullanıcıadı",
    placeholderWebsite: "siteadresin.com",
    placeholderTwitter: "kullanıcıadı",
    personalSite: "Kişisel site",
    twitter: "X / Twitter",
    skills: "Uzmanlıklar",
    skillAdd: "Ekle…",
    skillsHint: "Maks. 10 etiket · Enter ile ekle",
    handleError: "Yalnızca küçük harf, rakam ve alt çizgi",
    changesSaved: "Değişiklikler kaydedildi",
    saveError: "Kaydedilemedi",
    footer: "profil · davet bazlı"
  },
  faq: {
    title: "sss",
    subtitle: "Sıkça sorulan sorular.",
    loading: "SSS yükleniyor",
    loadError: "SSS yüklenemedi",
    empty: "Henüz SSS yok.",
    noAnswer: "Cevap bulamadın mı?",
    contactHint: "Topluluk Chat'ten bize ulaş veya e-posta gönder.",
    footer: "sık sorulan sorular"
  },
  membership: {
    title: "Üyelik",
    subtitle: "inner·hub'a katıl. Yıllık planını seç, toplulukla büyü.",
    popular: "En Popüler",
    buy: "Satın Al",
    redirecting: "Yönlendiriliyor…",
    current: "Mevcut plan",
    perMonth: "/ ay",
    perYear: "/ yıl",
    checkoutFailed: "Ödeme başlatılamadı",
    trust: "Ödemeler Stripe ile güvenli şekilde işlenir · SSL şifreli · İstediğinde iptal et",
    planAnnual: "Yıllık Üyelik",
    planAnnualDesc: "inner·hub'a tam erişim. Etkinlikler, kurslar, ayrıcalıklar ve topluluk.",
    planFounder: "Kurucu Üyelik",
    planFounderDesc: "inner·hub'un ilk katmanı. Kurucu topluluğa özel ekstra avantajlar.",
    feat1: "Tüm etkinliklere öncelikli kayıt",
    feat2: "Tüm kurs içeriklerine erişim",
    feat3: "Ayrıcalıklar kataloğu",
    feat4: "Topluluk chat kanalları",
    feat5: "Katılımcı dizini",
    feat6: "Talent Board ilanları",
    feat7: "Aylık networking kahvaltısı",
    featPasses: "Her ay 3 Circle Pass",
    featF1: "Yıllık üyeliğin tüm özellikleri",
    featF2: "Kurucu rozeti ve profil etiketi",
    featF3: "inner·capital deal flow erişimi",
    featF4: "Özel kurucu dinner davetleri",
    featF5: "inner·studio öncelikli danışmanlık",
    featF6: "Demo Day'e sunum hakkı",
    featF7: "Co-founder matching önceliği",
    circlePass: "Circle Pass",
    passBalance: "Bakiye · {n} pass",
    passMonthly: "Bu ay {balance}/{grant}",
    passHint: "Live kurs ve etkinlik kayıtları için",
    buyPass: "+1 Pass · {price} TL",
    paymentSuccessTitle: "Ödeme alındı",
    paymentSuccessEvent: "Etkinlik kaydın onaylandı.",
    paymentSuccessMembership: "{plan} aktif.",
    paymentSuccessEmail: " Onay {email} adresine gönderildi.",
    paymentVerifyFailed: "Ödeme doğrulanamadı",
    backToMembership: "← Üyelik sayfasına dön",
    backToPanel: "Panele dön",
    planFallback: "Üyelik"
  },
  chat: {
    title: "Chat",
    subtitle: "Kanallar ve doğrudan mesajlar.",
    channels: "Kanallar",
    empty: "Henüz mesaj yok.",
    emptyHint: "İlk mesajı sen gönder.",
    emptyChannels: "Henüz kanal yok.",
    emptyChannel: "#{name} henüz boş",
    placeholder: "#{name} kanalına mesaj gönder…",
    send: "Gönder",
    sendHint: "Enter ile gönder · Shift+Enter yeni satır",
    loadingChannels: "Kanallar yükleniyor",
    loadChannelsError: "Kanallar yüklenemedi",
    loadingMessages: "Mesajlar yükleniyor",
    loadMessagesError: "Mesajlar yüklenemedi",
    sendError: "Mesaj gönderilemedi",
    aiDigest: "AI Özet · #{name}",
    aiDigestHint: "Yeterli mesaj birikince kanal özeti burada görünecek."
  },
  courses: {
    title: "Kurslar",
    subtitle: "Öğrenme yolları ve oturumlar.",
    heroEyebrow: "Kurslarım",
    heroHeadline: "Where knowledge\nmeets momentum.",
    heroBody: "inner·hub eğitim içerikleri · kendi hızında, kendi zamanında, dairenin bilgisiyle.",
    heroStat: "Kayıtlı kurs",
    heroTagline: "Kendi hızında, kendi zamanında.",
    continueCta: "Devam Et",
    exploreCta: "Kursları Keşfet",
    enroll: "Kayıt Ol",
    continue: "Devam Et",
    start: "Başla",
    completed: "tamamlandı",
    inProgress: "Devam ediyor",
    empty: "Henüz yayınlanmış kurs yok.",
    loading: "Kurslar yükleniyor",
    loadError: "Kurslar yüklenemedi",
    enrollFailed: "Kayıt başarısız",
    enrollRequired: "Kayıt gerekli",
    hide: "Gizle",
    viewCurriculum: "Müfredatı Gör",
    curriculumSoon: "Müfredat yakında yayınlanacak.",
    lessons: "{done}/{total} ders",
    tag: "Kurs",
    education: "Eğitim",
    term: "Dönem {n}",
    myEnrolled: "Kayıtlı Kurslarım",
    otherCourses: "Diğer Kurslar",
    statEnrolled: "Kayıtlı Kurs",
    statEnrolledSub: "devam ediyor",
    statProgress: "Ort. İlerleme",
    statProgressSub: "kayıtlı kurslarda",
    statOther: "Diğer Kurslar",
    statOtherSub: "keşfedilmeyi bekliyor",
    statTotal: "Toplam",
    statTotalSub: "inner·hub kataloğu",
    loadFailed: "Kurslar yüklenemedi",
    saveFailed: "Kaydedilemedi",
    noVideo: "Bu derste video yok",
    markComplete: "Tamamlandı olarak işaretle",
    markCompleteFailed: "İşaretlenemedi",
    completedLabel: "Tamamlandı",
    adminEyebrow: "Admin",
    adminTitle: "Kurs Yönetimi",
    adminSubtitle: "Kurs, modül ve ders ekle · videoları Mux'a yükle.",
    addCourse: "Kurs Ekle",
    courseTitlePlaceholder: "Kurs başlığı",
    courseDescriptionPlaceholder: "Kurs açıklaması",
    addModule: "Modül Ekle",
    moduleTitlePlaceholder: "Modül başlığı",
    addLesson: "Ders Ekle",
    lessonTitlePlaceholder: "Ders başlığı",
    lessonContentPlaceholder: "Kısa not (opsiyonel)",
    lessonsCount: "ders",
    chooseVideo: "Video Seç",
    uploading: "Yükleniyor…",
    processingVideo: "İşleniyor…",
    uploadFailed: "Video yüklenemedi",
    published: "Yayında",
    draft: "Taslak",
    format: "Format",
    audience: "Oda",
    startsAt: "Başlangıç",
    meetUrl: "Meet URL",
    passCost: "Pass",
    notify: "Bildir",
    saveLive: "Kaydet",
    roomMine: "Odam",
    roomAll: "Tümü",
    joinMeet: "Meet'e katıl",
    passCostHint: "{n} pass",
    passRequired: "Circle Pass bakiyen yetersiz. Üyelik sayfasından pass alabilirsin.",
    getPass: "Circle Pass al →",
    categoryLabel: "Kategori",
    category: {
      business: "Business",
      product: "Product",
      art: "Art",
      craft: "Craft",
      capital: "Capital",
      ops: "Ops"
    }
  },
  eventsAdmin: {
    eyebrow: "Admin",
    title: "Etkinlik Yönetimi",
    subtitle: "Etkinlik ekle · yayınla · kayıtlılara bildir.",
    loading: "Etkinlikler yükleniyor",
    loadFailed: "Etkinlikler yüklenemedi",
    saveFailed: "Kaydedilemedi",
    addEvent: "Etkinlik Ekle",
    titlePlaceholder: "Etkinlik başlığı",
    descriptionPlaceholder: "Açıklama",
    locationPlaceholder: "Konum",
    startAt: "Başlangıç",
    endAt: "Bitiş",
    format: "Format",
    audience: "Oda",
    meetUrl: "Meet URL",
    passCost: "Pass",
    publishNow: "Hemen yayınla",
    notify: "Bildir",
    published: "Yayında",
    draft: "Taslak"
  },
  stage: {
    title: "Stage",
    subtitle: "Ürünlerini dairenin önüne koy · oy topla · vitrine çık.",
    loading: "Stage yükleniyor",
    loadFailed: "Stage yüklenemedi",
    showcase: "Vitrin",
    showcaseHint: "Son 7 günün en çok oy alanları",
    allProducts: "Tüm ürünler",
    empty: "Henüz ürün yok · ilk sen gönder.",
    submit: "Ürün Gönder",
    titlePlaceholder: "Ürün adı",
    urlPlaceholder: "https://…",
    pitchPlaceholder: "Kısa pitch",
    submitFailed: "Gönderilemedi",
    openLink: "Bağlantı"
  },
  members: {
    title: "Katılımcılar",
    subtitle: "Topluluk üyeleri ve iş birliği fırsatları.",
    heroBody: "Kurucular, mühendisler, yatırımcılar · daire içinde birbirini bulur ve büyür.",
    heroHeadline: "Where builders\nfind each other.",
    viewMembers: "Üyeleri Gör",
    talentBoard: "Talent Board",
    heroStat: "Dairenin içinde",
    heroTagline: "Kurucular. Mühendisler. Yatırımcılar.",
    about: "Hakkında",
    skills: "Uzmanlık",
    noBio: "Bio henüz eklenmedi.",
    message: "Mesaj",
    connect: "Bağlan",
    publish: "Yayınla",
    published: "Yayınlandı",
    empty: "Üye bulunamadı.",
    searchPlaceholder: "İsim, şirket veya uzmanlık…",
    searchTalent: "Rol veya beceri ara…",
    loading: "Üyeler yükleniyor",
    loadError: "Üyeler alınamadı",
    tabMembers: "Üyeler",
    memberCount: "{n} üye",
    liveSoon: "canlı durum yakında",
    talentLoading: "Talent board yükleniyor",
    talentError: "Talent board alınamadı",
    postCount: "{n} ilan",
    postCta: "İlan Ver",
    talentEmpty: "Henüz ilan yok · ilk ilanı sen ver.",
    talentFooter: "Başarılı eşleşmelerde platform %10 komisyon alır · inner·hub Talent Board",
    connectViaPanel: "Panel üzerinden bağlan",
    profile: "Profil",
    deletePost: "İlanı sil",
    typeSeeking: "arıyor",
    typeOffering: "sunuyor",
    composeTitle: "İlan Ver",
    composeSub: "Arıyorsan veya sunuyorsan daireye duyur.",
    phRole: "Rol / başlık",
    phDesc: "Kısa açıklama",
    phTags: "Etiketler (virgülle)",
    createFailed: "İlan oluşturulamadı",
    statTotal: "Toplam Üye",
    statTotalSub: "dairenin içinde",
    statProfile: "Profil",
    statProfileSub: "bio dolu",
    statTalent: "Talent İlanı",
    statTalentSub: "canlı",
    statAdmin: "Admin",
    statAdminSub: "yönetim"
  },
  perks: {
    title: "Ayrıcalıklar",
    subtitle: "Üyelere özel fırsatlar.",
    heroHeadline: "Perks worth\nbeing inside for.",
    heroBody: "Program katılımcılarına özel yazılım, finans ve yaşam fırsatları. Kodu al, partnerde kullan.",
    featuredCta: "Öne Çıkanlar",
    allCta: "Tüm Fırsatlar",
    heroStat: "Aktif ayrıcalık",
    heroTagline: "Yazılım. Finans. Yaşam.",
    saved: "Kaydedilenler",
    howTo: "Nasıl kullanılır",
    empty: "Sonuç yok",
    emptyHint: "Filtreyi veya aramayı temizleyip tekrar deneyin.",
    showAll: "Tümünü göster",
    claim: "Talep et",
    loading: "Ayrıcalıklar yükleniyor",
    loadError: "Ayrıcalıklar alınamadı",
    review: "İncele",
    hasCode: "Kod var",
    perkLabel: "Ayrıcalık",
    expires: "Son: {date}",
    activationCode: "Aktivasyon kodu",
    goPartner: "Partner sitesine git",
    unsave: "Kaydedilenlerden çıkar",
    saveForLater: "Daha sonra için kaydet",
    featured: "Öne çıkan",
    openDetail: "Detayı aç",
    searchPlaceholder: "Marka, teklif veya kod ara…",
    count: "{n} ayrıcalık",
    footer: "Yeni ayrıcalıklar her ay ekleniyor · Öneri için Slack veya destek kanalını kullanın.",
    catSoftware: "Yazılım",
    catFinance: "Finans",
    catLife: "Yaşam",
    catEducation: "Eğitim",
    statTotal: "Toplam Fırsat",
    statTotalSub: "aktif ayrıcalık",
    statFeatured: "Öne Çıkan",
    statFeaturedSub: "bu dönem",
    statCategory: "Kategori",
    statCategorySub: "yazılım · finans · yaşam",
    statSaved: "Kaydettiğin",
    statSavedSub: "favorilerinde",
    step1Title: "Seç",
    step1Body: "Kategori veya aramayla fırsatı bulun.",
    step2Title: "Kod al",
    step2Body: "Detayda aktivasyon kodunu kopyalayın.",
    step3Title: "Kullan",
    step3Body: "Partner sitesinde kodu uygulayın.",
    partners: "Partnerler",
    ecosystem: "Ekosistem",
    campaignBadge: "inner·only"
  },
  pulse: {
    title: "Pulse",
    eyebrow: "Community pulse",
    subtitle: "Topluluğun anonim nabzı. Bu hafta ne konuşuluyor?",
    live: "Canlı",
    loading: "Pulse yükleniyor",
    loadError: "Pulse yüklenemedi",
    heroLabel: "Phosphor · canlı sinyal",
    heroQuote: "Daire her an nefes alıyor.",
    empty: "Henüz nabız verisi yok",
    emptyHint: "Bu hafta kanallarda henüz yeterli mesaj yok. Sohbet başladıkça trendler ve aktivite burada görünecek.",
    emptyActivity: "Henüz aktivite yok",
    statMessages: "Bu Hafta Mesaj",
    statMessagesSub: "{n} kanalda",
    statActive: "Aktif Üye",
    statActiveSub: "toplulukta",
    statTrends: "Trend Konu",
    statTrendsSub: "takip ediliyor",
    statScore: "Aktivite Skoru",
    statScoreSub: "bu hafta",
    trending: "Trending Konular",
    noTrends: "Bu kategoride trend yok",
    weeklyActivity: "Haftalık Aktivite",
    topChannels: "En Aktif Kanallar",
    noChannels: "Kanal verisi yok",
    topContributors: "Bu Hafta Öne Çıkanlar",
    noContributors: "Henüz katkı yok",
    streakDays: "{n}g",
    firstActivity: "Bu hafta ilk aktivite",
    sameLevel: "Geçen haftayla aynı seviye",
    weekUp: "Bu hafta %{n} artış",
    weekDown: "Bu hafta %{n} azalış",
    catTech: "teknoloji",
    catBiz: "iş",
    catInvest: "yatırım",
    catCulture: "kültür",
    footer: "veriler anonimleştirilmiş · gerçek zamanlı · yalnızca üyeler görür"
  },
  api: {
    title: "inner·api",
    eyebrow: "Platform API",
    subtitle: "Topluluk altyapısına programatik erişim. Kendi ürününe entegre et.",
    docs: "Dokümantasyon",
    keys: "API Anahtarların",
    keysHint: "Anahtarları güvende tut · kimseyle paylaşma",
    loading: "Anahtarlar yükleniyor",
    loadError: "Anahtarlar yüklenemedi",
    empty: "Henüz bir API anahtarın yok.",
    createKey: "Yeni Anahtar",
    creating: "Oluşturuluyor…",
    revokeKey: "İptal et",
    copyKey: "Kopyala",
    keyCreated: "Yeni anahtar oluşturuldu",
    keyCreatedHint: "Bu anahtar bir daha gösterilmeyecek. Şimdi kopyala ve güvenli bir yere kaydet.",
    deleteKey: "Anahtarı sil",
    confirmDelete: "Emin misin?",
    deleting: "Siliniyor…",
    abort: "Vazgeç",
    createdAt: "oluşturuldu {date}",
    lastUsed: "son kullanım {date}",
    deleteFailed: "Silinemedi",
    createFailed: "Anahtar oluşturulamadı",
    phKeyName: "Anahtar adı (ör. prod-server)",
    endpoints: "Endpoint'ler",
    plans: "API Planları",
    recommended: "Önerilen",
    requests: "{n} istek",
    contactSupport: "Destekle İletişime Geç",
    free: "Ücretsiz",
    unlimited: "Sınırsız",
    perMonth: "/ ay",
    warning: "inner·api beta aşamasındadır. Anahtar oluşturma ve silme canlı çalışır; kullanım/rate-limit takibi ve faturalandırma henüz bağlanmadı. Plan yükseltmesi için destek ekibiyle iletişime geç.",
    footer: "v1 · REST · JSON · Bearer Auth · inner·hub ekosistemi",
    epMembers: "Topluluk üyelerini listele (anonim)",
    epMember: "Üye profilini getir ve kimliği doğrula",
    epMatch: "AI eşleştirme algoritmasını çağır",
    epPulse: "Topluluk sinyal verilerini getir",
    epVerify: "inner·id kimlik doğrulama",
    epWebhook: "Topluluk event'lerine webhook al",
    planStarterF1: "Temel üye sorgusu",
    planStarterF2: "Kimlik doğrulama",
    planStarterF3: "E-posta desteği",
    planBuilderF1: "Tüm endpoint'ler",
    planBuilderF2: "inner·match API",
    planBuilderF3: "Webhook desteği",
    planBuilderF4: "Öncelikli destek",
    planScaleF1: "White-label",
    planScaleF2: "Özel SLA",
    planScaleF3: "Dedicated destek",
    planScaleF4: "inner·pulse ham veri",
    reqStarter: "1.000 / ay",
    reqBuilder: "50.000 / ay"
  },
  applications: {
    title: "başvurular",
    subtitle: "Davet taleplerini incele; onay / red kalıcı kaydedilir.",
    admin: "Admin",
    pending: "Beklemede",
    approve: "Onayla",
    reject: "Reddet",
    empty: "Henüz başvuru yok",
    noResults: "Sonuç bulunamadı",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    loading: "Başvurular yükleniyor",
    loadError: "Başvurular alınamadı",
    detail: "Başvuru Detayı",
    why: "Neden inner·hub?",
    appliedAt: "Başvuru Tarihi",
    referrer: "Referans",
    none: "Yok",
    searchPlaceholder: "Ad, e-posta, etiket…",
    updateFailed: "Durum güncellenemedi",
    footer: "başvurular · yalnızca admin"
  },
  analytics: {
    title: "analitik",
    subtitle: "Site trafiği (Google ile senkron) ve çember katılımı · Framer tarzı paneli.",
    admin: "Admin",
    tabSite: "Site",
    tabCircle: "Çember",
    visitors: "Ziyaretçi",
    pageViews: "Sayfa görüntüleme",
    uniqueSessions: "benzersiz oturum",
    inRange: "seçili aralık",
    source: "Kaynak",
    sourceGoogleSub: "GA4 Data API",
    sourceSiteSub: "first-party + gtag",
    visitorsOverTime: "Ziyaretçiler",
    visitorsOverTimeSub: "Günlük benzersiz oturumlar",
    topPages: "Popüler sayfalar",
    topPagesSub: "En çok görüntülenen path’ler",
    topReferrers: "Referrer’lar",
    topReferrersSub: "Trafik kaynakları",
    devices: "Cihazlar",
    devicesSub: "Oturumlara göre",
    webEmpty: "Henüz site trafiği yok - ziyaretler burada birikecek.",
    syncedGoogle: "Google Analytics ile senkron",
    sendingGoogle: "gtag ile Google’a gönderiliyor",
    gaApiHint: "Canlı Google raporları için Hostinger env: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY",
    openGoogle: "Google Analytics",
    range7: "7 gün",
    range28: "28 gün",
    range90: "90 gün",
    totalMembers: "Toplam Üye",
    activeMembers: "Aktif Üye",
    newThisWeek: "Bu hafta yeni",
    empty: "Henüz yeterli veri yok",
    emptyHint: "Topluluk hareketlendikçe büyüme, katılım ve aktif üye grafikleri burada dolacak.",
    loading: "Analitik yükleniyor",
    loadError: "Analitik yüklenemedi",
    membersInCircle: "dairenin içinde",
    newThisMonth: "+{n} bu ay",
    noNewThisMonth: "bu ay yeni yok",
    messagesThisWeek: "Bu Hafta Mesaj",
    vsLastWeek: "geçen haftaya göre",
    eventRegs: "Etkinlik Kaydı",
    total: "toplam",
    thisWeekDelta: "+{n} bu hafta",
    aiMatch: "AI Eşleşme",
    thisMonthDelta: "+{n} bu ay",
    memberGrowth: "Üye Büyümesi",
    memberGrowthSub: "Kümülatif üye sayısı · aylık, gerçek kayıt tarihlerinden",
    revenue: "Gelir",
    revenueSub: "MRR takibi",
    revenueSoon: "Gelir takibi yakında",
    revenueHint: "Üyelik ödemeleri Stripe üzerinden işleniyor; panel içi gelir raporu henüz bağlanmadı.",
    weeklyEngagement: "Haftalık Katılım",
    weeklyEngagementSub: "Aktif üye · mesaj · etkinlik kaydı · son 4 hafta",
    messages: "Mesaj",
    registrations: "Kayıt",
    topMembers: "En Aktif Üyeler",
    topMembersSub: "Son 30 günde mesaj katkısına göre",
    colMember: "Üye",
    colContribution: "Katkı",
    colEvent: "Etkinlik",
    colJoined: "Katıldı",
    channelActivity: "Kanal Aktivitesi",
    channelActivitySub: "En aktif kanallar · toplam mesaj",
    pendingApps: "Bekleyen Başvurular",
    pendingAppsSub: "Admin görünümü",
    awaitingReview: "değerlendirme bekliyor",
    footer: "analitik · yalnızca admin"
  },
  publicProfile: {
    title: "Profil",
    enterPanel: "Panele gir",
    loading: "Profil yükleniyor…",
    notFound: "Profil bulunamadı",
    membersOnly: "Üyelere özel",
    membersOnlyBody: "@{handle} profili yalnızca inner·hub üyelerine açık. Görüntülemek için giriş yap.",
    login: "Giriş yap",
    loadError: "Yüklenemedi",
    networkError: "Ağ hatası",
    skills: "Uzmanlıklar",
    links: "Bağlantılar",
    memberSince: "Üye · {date}",
    verifiedNote: "Bu kimlik inner·hub davetli üyeliğine bağlıdır. Rozet:"
  },
  notFound: {
    title: "404 Sayfa bulunamadı",
    body: "Aradığın sayfa taşınmış veya hiç var olmamış olabilir.",
    backHome: "Ana sayfaya dön"
  }
};
const en = {
  common: {
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    copy: "Copy",
    copied: "Copied",
    loading: "Loading…",
    retry: "Retry",
    back: "Back",
    next: "Next",
    close: "Close",
    view: "View",
    open: "Open",
    search: "Search",
    all: "All",
    soon: "Soon",
    member: "Member",
    admin: "Admin",
    logout: "Log out",
    logoutLong: "Sign out",
    online: "online",
    errorGeneric: "Something went wrong",
    comingSoon: "This page will be ready soon.",
    home: "Home",
    skipToContent: "Skip to content",
    sectionIndex: "Section index",
    privateCircle: "inner.hub private circle",
    yes: "Yes",
    no: "No",
    searchPlaceholder: "Search…"
  },
  nav: {
    sectionMain: "Main",
    sectionPlatform: "Platform",
    sectionAccount: "Account",
    sectionAdmin: "Admin",
    dashboard: "Dashboard",
    community: "Community",
    courses: "Courses",
    events: "Events",
    members: "Members",
    org: "Organization",
    perks: "Perks",
    profile: "Profile",
    membership: "Membership",
    faq: "FAQ",
    applications: "Applications",
    coursesAdmin: "Course Management",
    eventsAdmin: "Event Management",
    haberlerAdmin: "News",
    analytics: "Analytics",
    settings: "Settings"
  },
  shell: {
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications",
    profileCompletion: "Profile completion",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    justNow: "just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    unreadCount: "{n} unread",
    openNotif: "Open",
    notifLoading: "Loading notifications…",
    notifError: "Could not load · try again"
  },
  search: {
    title: "Search",
    open: "Search",
    close: "Close",
    placeholder: "Member, course, event, perk, page…",
    placeholderShort: "Search everything…",
    hint: "Start typing a page, member, or content. Fastest path on mobile.",
    empty: "No results. Try AI or another keyword.",
    ai: "AI",
    aiFailed: "AI unavailable; structured results are below.",
    footerNav: "↑↓ navigate · Enter open",
    footerAi: "AI · Enter or AI button",
    kind: {
      page: "Page",
      member: "Member",
      course: "Course",
      event: "Event",
      perk: "Perk",
      stage: "Stage",
      org: "Org",
      faq: "FAQ",
      ai: "AI"
    }
  },
  settings: {
    title: "settings",
    subtitle: "Manage account and platform preferences.",
    loading: "Loading settings",
    loadError: "Could not load settings",
    saveError: "Could not save",
    prefsUpdated: "Preferences updated",
    sectionNotif: "Notifications",
    sectionNotifSub: "Choose which events you want alerts for",
    notifMatch: "inner·match suggestions",
    notifMatchSub: "When a new match arrives",
    notifEvents: "Event reminders",
    notifEventsSub: "One day before events you joined",
    notifMessages: "Chat messages",
    notifMessagesSub: "@mentions and DMs",
    notifCapital: "inner·capital updates",
    notifCapitalSub: "SPV and deal-flow activity",
    notifDigest: "Weekly digest",
    notifDigestSub: "Week summary every Monday",
    notifEmail: "Email notifications",
    notifEmailSub: "Receive platform alerts by email",
    sectionPrivacy: "Privacy",
    sectionPrivacySub: "Control how you appear inside the platform",
    showOnline: "Show online status",
    showOnlineSub: "Other members see you as ONLINE",
    allowMatch: "Include me in inner·match",
    allowMatchSub: "Appear in the AI matching engine",
    analyticsConsent: "Anonymous analytics",
    analyticsConsentSub: "Anonymous usage data to improve the platform",
    sectionAppearance: "Appearance",
    sectionAppearanceSub: "Interface preferences",
    theme: "Theme",
    themeSub: "Light, dark, or system preference",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    compactMode: "Compact mode",
    compactModeSub: "Denser content layout",
    sectionLang: "Language",
    sectionLangSub: "Platform interface language",
    uiLang: "Interface language",
    langTr: "Türkçe",
    langEn: "English",
    danger: "Danger zone",
    suspend: "Suspend account",
    suspendSub: "Temporarily pause your membership",
    logoutSub: "Sign out on this device",
    footer: "settings",
    whatsapp: "WhatsApp",
    whatsappSub: "Campaign and announcement alerts",
    whatsappOptIn: "WhatsApp notifications",
    whatsappOptInSub: "Get important updates on WhatsApp",
    whatsappPhone: "Phone",
    whatsappPhoneHint: "A valid number is required for opt-in (also editable in profile)",
    whatsappError: "Could not save WhatsApp preference",
    deleteAccount: "Delete account",
    deleteAccountSub: "Your profile and data will be permanently removed",
    deleteAccountConfirmHint: "Type DELETE to confirm",
    deleteAccountAction: "Delete account permanently",
    deleteAccountError: "Could not delete account"
  },
  legal: {
    eyebrow: "Legal",
    title: "Before you continue",
    subtitle: "Please read and accept our latest documents.",
    acceptAll: "Accept all",
    accepting: "Saving…",
    acceptError: "Could not save acceptance",
    required: "Acceptance is required to continue in the panel"
  },
  org: {
    title: "organization",
    subtitle: "Your company and team members.",
    loading: "Loading organization",
    loadError: "Could not load organization",
    empty: "No organization yet",
    emptyHint: "Create or join one from your profile.",
    goProfile: "Go to profile",
    mine: "My organizations",
    primary: "primary",
    members: "Members",
    loadingMembers: "Loading members",
    membersError: "Could not load members",
    noMembers: "No members yet",
    footer: "organization"
  },
  campaigns: {
    create: "Publish campaign",
    costHint: "1 Circle Pass",
    titlePlaceholder: "Campaign title",
    pitchPlaceholder: "Short pitch",
    ctaPlaceholder: "https://…",
    codePlaceholder: "Code (optional)",
    publish: "Publish",
    created: "Campaign published",
    createError: "Could not create campaign"
  },
  publicNav: {
    idea: "Idea",
    circle: "Circle",
    platform: "Platform",
    gathering: "Gathering",
    next: "Next",
    artifacts: "News",
    invitation: "Invitation",
    requestInvitation: "Request an invitation",
    primaryNav: "Primary",
    openMenu: "Open menu",
    closeMenu: "Close menu"
  },
  artifacts: {
    nav: "News",
    eyebrow: "08 · News",
    title: "Signal, notes, video.",
    subtitle: "Blog, posts, and captions - early signal from the circle. Produced via Flexlore; published with clear answers for search and AEO.",
    metaTitle: "News · inner.hub",
    metaDescription: "inner.hub news: writing and video briefs on invitations, gatherings, and the circle.",
    article: "Article",
    video: "Video",
    back: "All news",
    ctaHint: "Access is by invitation. Always.",
    empty: "Coming soon - posts will flow here via Flexlore Content Creator Flow.",
    faqTitle: "FAQ"
  },
  haberlerAdmin: {
    title: "News",
    subtitle: "Blog / article / video structure. Until Flexlore connects: save drafts or export JSON into the content file.",
    viewPublic: "Public page",
    published: "Published",
    open: "Open",
    create: "New post",
    createHint: "For AEO: clear answer first, then long body. Export JSON → src/content/artifacts.",
    fieldTitleTr: "Title (TR)",
    fieldTitleEn: "Title (EN)",
    fieldAnswer: "AEO answer",
    fieldDescription: "Meta description",
    fieldBody: "Body (line = paragraph)",
    saveDraft: "Save draft",
    exportJson: "Copy JSON",
    copied: "Copied",
    drafts: "Drafts",
    delete: "Delete"
  },
  home: {
    heroTag: "Istanbul → Global · Est. 2026",
    heroBody: "A private circle of founders, builders, and investors. Bound not by place or status, but by hunger to meet early and build what comes next.",
    requestInvitation: "Request an invitation",
    ideaEyebrow: "01 · The idea",
    ideaTitle: "A private circle.",
    ideaBody: "inner·hub is an invite-only network. Founders, builders, and investors come here for early signal, deep connection, and building together.",
    ideaLine1: "AI is the center.",
    ideaLine2: "Around it: founders, builders, investors.",
    ideaLine3: "inner.hub brings them together early.",
    ideaReveal: "It starts in İstanbul. Thirty-four people, chosen one by one, form the founding circle: not members of a platform, but the people who make what comes next possible.",
    seatsEyebrow: "02 · The first thirty-four",
    seatsTitle: "Who it's for.",
    seatsLine1: "Founding seats for people who meet early.",
    seatsLine2: "Not tickets. Not tiers. The circle.",
    seatFounders: "Founders.",
    seatFounders1: "Building startups in AI and beyond",
    seatFounders2: "Shipping before the noise arrives",
    seatFounders3: "Looking for co-builders, not crowds",
    seatFounders4: "Chosen one by one. Never open apply",
    seatBuilders: "Builders.",
    seatBuilders1: "Engineers and researchers in serious AI",
    seatBuilders2: "Depth over demos. Craft that compounds",
    seatBuilders3: "Signal shared inside the circle first",
    seatInvestors: "Investors.",
    seatInvestors1: "Angels and venture operators",
    seatInvestors2: "Early conviction, patient capital",
    seatInvestors3: "Access shaped by trust, not tickets",
    circleStartsHere: "Your circle starts here.",
    learnMore: "Learn more",
    seatsFooter: "These thirty-four are not just members. They are the founding members of inner.hub.",
    platformEyebrow: "03 · The platform",
    platformTitle: "Built for the pace of a closed circle.",
    platformAccess: "Access is by invitation. Always.",
    moreTools: "+{n} more tools",
    modSignalTag: "AI Layer",
    modSignalDesc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    modMatchTag: "Matching",
    modMatchDesc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    modCapitalTag: "Investments",
    modCapitalDesc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    modVaultTag: "Knowledge",
    modVaultDesc: "Shared knowledge base. Pitch decks, market research, and documents. Permissioned and searchable.",
    modPulseTag: "Intelligence",
    modPulseDesc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters. Inside only.",
    modIdTag: "Identity",
    modIdDesc: "Portable verified membership identity. Your inner.hub membership carries weight beyond the platform.",
    modApiTag: "Platform",
    modApiDesc: "Platform API for integrations and partners. Build on top of the inner.hub infrastructure.",
    modBountyTag: "Marketplace",
    modBountyDesc: "Community task system. Companies post challenges, members solve them, platform facilitates.",
    whatThisIs: "What this is",
    whatThisIsEyebrow: "04 · What this is",
    thePoint: "The point",
    bigThings: "Big things start here.",
    whatThisIsBody: "New ideas are discussed here, tested here, and supported here by people who can actually build them and fund them.",
    byInvitation: "By invitation",
    entryEyebrow: "05 · Entry",
    entryTitle: "Entry is by invitation. Always.",
    entryBody: "There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally.",
    entryStepName: "Your name",
    entryStepNameLine: "Someone inside the circle puts your name forward.",
    entryStepConsider: "Consideration",
    entryStepConsiderLine: "We take our time. Fit beats fame.",
    entryStepInvite: "Invitation",
    entryStepInviteLine: "If it is right, you hear from us directly.",
    theGathering: "The gathering",
    gatheringEyebrow: "06 · The gathering",
    gatheringDate: "Sep 2026 · İstanbul",
    gatheringTitle: "The first inner.hub gathering. İstanbul, September 2026.",
    gatheringLine: "Thirty-four people. Two days. One circle. The first of many.",
    oneCircle: "34 · One circle",
    oneCircleSr: "Thirty-four squares forming one circle.",
    whatsNext: "What's next",
    people: "People",
    days: "Days",
    modules: "Modules",
    footerTagline: "Invite-only. Early signal. Build together.",
    footerNavigate: "Navigate",
    footerConnect: "Connect",
    footerRights: "© 2026 inner hub · All rights reserved",
    langSwitch: "Language",
    panel: "Panel"
  },
  invite: {
    preparing: "Preparing invitation",
    access: "inner · access",
    homeLink: "Home",
    memberLogin: "Member login",
    requestTitle: "Request an invitation",
    received: "Received",
    successTitle: "If it fits, we will be in touch",
    successBody: "We review every request carefully. If approved, your invite code arrives by email; register on the panel with that code.",
    successPanelHint: "Already have a code? Enter the panel via member login.",
    backHome: "Back to home",
    howEnter: "How do you enter?",
    roleFounder: "Founder",
    roleFounderEn: "Founder",
    roleFounderHint: "Building something. Early or scaling.",
    roleInvestor: "Investor",
    roleInvestorEn: "Investor",
    roleInvestorHint: "Angel, fund, or operator allocating capital.",
    roleBuilder: "Builder",
    roleBuilderEn: "Builder",
    roleBuilderHint: "Engineer, researcher, or operator. Building inside the stack.",
    roleCompany: "Company",
    roleCompanyEn: "Company",
    roleCompanyHint: "Team looking to enter the circle together.",
    fullName: "Full name",
    email: "Email",
    org: "Organization",
    linkedin: "LinkedIn",
    city: "City",
    story: "Your story",
    intro: "Short intro",
    submit: "Submit",
    submitting: "Submitting…",
    continue: "Continue",
    stepRole: "How do you enter?",
    stepIdentity: "Who should we reach?",
    stepOrg: "Which organization?",
    stepStory: "What are you building?",
    stepIntro: "How did you find us?",
    copyRole: "Investor, founder, builder, or company. Each entry is a different door.",
    copyIdentity: "Details so we can reach you directly. No spam - only a real reply.",
    copyOrgInvestor: "Your fund or firm + domain. We'll fetch the logo automatically.",
    copyOrgCompany: "Your company name and domain. The logo is saved to the system.",
    copyOrgDefault: "Add your org if you have one. Domain pulls the logo automatically.",
    copyStory: "Keep it short. Keep it clear. The circle will read this.",
    copyIntro: "Most people arrive by invite. If you found us yourself, that's fine - just say so.",
    phName: "Your full name",
    phEmail: "you@company.com",
    orgLabel: "Org / Fund / Company",
    orgDomain: "Organization domain",
    forLogo: "For logo",
    required: "Required",
    optional: "Optional",
    logoFound: "Logo found",
    logoAuto: "Logo fetched automatically",
    logoHint: "When you enter a domain, we fetch and store the organization logo.",
    storyLabel: "Your story",
    introLabel: "Short intro",
    phStory: "What are you building, and why now?",
    phIntro: "A name, a link… or I found you myself",
    phOrg: "Sequoia, a16z, Acme AI…",
    phDomain: "sequoiacap.com"
  },
  homeWhatsNext: {
    eyebrow: "07 · What's next · In time",
    titleBefore: "What's next is already",
    titleEm: "forming.",
    body: "We announce things when they are real.\nThe circle expands: gatherings, capital, and tools. One deliberate step at a time.",
    access: "Access is by invitation. Always.",
    accessShort: "By invitation only.",
    cta: "Request an invitation"
  },
  onboarding: {
    welcomeEyebrow: "01 · Welcome",
    welcomeTitle: "You're in the circle.",
    welcomeBody: "The inner·hub panel: signal, match, capital, and community · all in one place. A short tour gets you moving.",
    dashEyebrow: "02 · Dashboard",
    dashTitle: "This is your base.",
    dashBody: "Summary cards, upcoming events, and quick jumps. Keep the pulse from here.",
    signalEyebrow: "03 · Signal & Match",
    signalTitle: "Right people, right opportunities.",
    signalBody: "inner·signal surfaces opportunities; inner·match helps you build trust-based connections.",
    communityEyebrow: "04 · Community",
    communityTitle: "Chat, members, events.",
    communityBody: "From the left menu open Community Chat, Members, and Events. The circle stays alive here.",
    profileEyebrow: "05 · Profile",
    profileTitle: "Make yourself visible.",
    profileBody: "As you complete your profile, matching and trust improve. The completion bar bottom-left reminds you.",
    coachNavTitle: "Main menu",
    coachNavBody: "All modules live here. On small screens, open via the hamburger.",
    coachNotifTitle: "Notifications",
    coachNotifBody: "Match, event, and capital signals land here.",
    coachMainTitle: "Content area",
    coachMainBody: "Your selected page opens here. Start with Dashboard · the rest is in the menu.",
    skip: "Skip",
    next: "Continue",
    done: "Finish",
    start: "Start tour",
    persona: {
      eyebrow: "06 · Persona",
      founder: {
        title: "Founder track.",
        body: "Signal, Match, and Capital come first. Keep your profile sharp so the right investors and partners find you.",
        coachTitle: "Founder menu",
        coachBody: "Scan opportunities with Signal and Match; stay ready for Capital deal flow."
      },
      investor: {
        title: "Investor lens.",
        body: "Deal flow, founder signals, and trust score gather here. Reach the right founders through Match.",
        coachTitle: "Investor menu",
        coachBody: "Follow deal flow via Capital and Signal; Match builds trust-based ties."
      },
      builder: {
        title: "Builder mode.",
        body: "Courses, craft, and product content speed you up. Find teammates via Talent and Members.",
        coachTitle: "Builder menu",
        coachBody: "Learn and connect via Courses and Members; Signal surfaces opportunities."
      },
      company: {
        title: "Company account.",
        body: "Manage your org page, campaigns, and team here. Show up in the Perks ecosystem.",
        coachTitle: "Company menu",
        coachBody: "Contribute via Org and Perks; publishing a campaign costs 1 Pass."
      }
    }
  },
  login: {
    continueInside: "Continue inside the circle.",
    accessByInvite: "Access is by invitation. Always.",
    membersOnly: "Panel · Members only",
    googleContinue: "Continue with Google",
    googleRegister: "Sign up with Google",
    or: "or",
    inviteCode: "Invite code",
    invitePlaceholder: "Your invite code",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    signIn: "Enter",
    createAccount: "Create account",
    register: "Register",
    haveAccount: "Already a member?",
    noAccount: "Don't have an account?",
    support: "Contact us",
    typewriter: "A closed circle for founders, investors, and builders. So - what's next?",
    ambientWelcome: "A personal invitation,\nwelcome to the inner·hub circle.",
    mouseHint: "Move your mouse · the gaze follows you",
    googleFailed: "Google sign-in failed."
  },
  id: {
    eyebrow: "Portable identity",
    subtitle: "Your verified identity. Share your profile and manage platform links here.",
    editProfile: "Edit profile",
    publicProfile: "Public profile",
    completion: "Completion",
    connections: "Links",
    skills: "Expertise",
    platformLinks: "Platform connections",
    platformLinksHint: "Connect LinkedIn, GitHub, and your site to inner·id",
    badgeEmbed: "Badge & embed",
    badgeEmbedHint: "Pick a snippet for your platform and copy it",
    verified: "Identity verified",
    verifiedBody: "inner·id is tied to your invite-based session. Platform links are stored on your profile; badge snippets are generated from your handle.",
    footer: "portable identity · invite-based · inner·hub ecosystem",
    profileCompletion: "Profile completion",
    memberSince: "Member · {date}",
    scanVerify: "Scan · verify",
    connected: "Connected",
    empty: "Empty",
    connect: "Connect",
    unlink: "Remove link",
    noSkills: "No expertise yet.",
    addInProfile: "Add in profile",
    setHandle: "Set a username on Profile for a permanent handle.",
    loading: "Loading inner·id",
    loadError: "Could not load identity",
    tierMember: "Member",
    tierFounder: "Founding member",
    badgeMember: "Member",
    badgeFounder: "Founder",
    personalSite: "Personal site",
    linkedinDesc: "Verify your inner·hub membership on your profile",
    githubDesc: "Add the badge to your README and verify the profile",
    websiteDesc: "Integrate with the HTML embed snippet",
    none: "None",
    removeFailed: "Could not remove",
    saveFailed: "Could not save"
  },
  dashboard: {
    title: "Dashboard",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingFallback: "Hello",
    greetingLine: "Hey, {name}. The circle is moving. What are we building today?",
    ambientLine: "The well-chosen gather here,\n{name}, you're among them today.",
    subtitle: "Your day inside the circle.",
    quickActions: "Quick actions",
    openMatch: "inner·match",
    goToSignal: " - view",
    goToMatch: " - go",
    goToCapital: " - explore",
    openEvents: "See events",
    openChat: "Chat",
    openSignal: "inner·signal",
    emptyFeed: "No activity yet.",
    emptyFeedHint: "Join events or complete your profile.",
    completeProfile: "Complete your profile",
    viewAll: "All",
    featured: "Featured",
    signalEyebrow: "This week",
    signalDesc: "Signals and connection suggestions from community memory.",
    vaultEyebrow: "Knowledge base",
    vaultDesc: "Pitch decks, research, and notes · inside the circle only.",
    newTerm: "New term",
    enrollCourse2: "Enroll in Course 2",
    termApplicationsOpen: "Term 2 applications are open",
    apply: "Apply",
    myCourses: "My courses",
    enrolled: "enrolled",
    upcoming: "upcoming",
    activePerks: "active offers",
    noCoursesYet: "No courses yet",
    noUpcomingEvents: "No upcoming events",
    programProgress: "Program progress",
    continueFrom: "Pick up where you left off",
    notStarted: "Not started yet",
    inProgress: "In progress",
    completed: "Completed",
    continue: "Continue",
    details: "Details",
    perksSubtitle: "Offers exclusive to program members",
    gatheringEyebrow: "Sep 2026 · Istanbul",
    gatheringDesc: "Thirty-four people. Two days. One circle. First gathering."
  },
  events: {
    title: "Events",
    subtitle: "Community gatherings, workshops, and networking events.",
    heroTitle: "Where the circle\ngathers in person.",
    heroBody: "Community gatherings, workshops, and networking. Bonds built with trust, inside the circle.",
    seeUpcoming: "See upcoming",
    openCalendar: "Open calendar",
    upcomingStat: "Upcoming events",
    heroTagline: "Gatherings. Workshops. Networking.",
    rsvp: "RSVP",
    rsvpCancel: "Cancel registration",
    full: "Sold out",
    join: "Register",
    joined: "Registered",
    empty: "No upcoming events.",
    emptyPublished: "No published events yet.",
    emptyHint: "New gatherings will show up here.",
    filterAll: "All",
    filterUpcoming: "Upcoming",
    filterPast: "Past",
    filterJoined: "Joined",
    seatsLeft: "{n} seats left",
    list: "List",
    calendar: "Calendar",
    loading: "Loading events",
    loadError: "Could not load events",
    upcomingSection: "Upcoming events",
    pastSection: "Past events",
    typeGathering: "Gathering",
    typeWorkshop: "Workshop",
    typeOnline: "Online",
    typeHybrid: "Hybrid",
    typeInPerson: "In person",
    locationSoon: "Location soon",
    peopleCount: "{registered}/{capacity} people",
    thisMonth: "This month",
    onCalendar: "on the calendar",
    youreRegistered: "You're in",
    atEvent: "at events",
    past: "Past",
    completed: "completed",
    planned: "planned events",
    registerFailed: "Registration failed",
    cancelFailed: "Cancellation failed",
    roomMine: "My room",
    roomAll: "All",
    joinMeet: "Join Meet",
    passRequired: "Not enough Circle Pass balance. Get a pass on the membership page.",
    getPass: "Get Circle Pass →",
    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
    daySun: "Sun"
  },
  match: {
    title: "inner·match",
    subtitle: "Members matched to your preferences.",
    prefsTitle: "Preferences",
    prefsLookingFor: "Looking for",
    prefsIndustry: "Industry",
    prefsStage: "Stage",
    prefsLocation: "Location",
    prefsSave: "Save preferences",
    compatibility: "Compatibility",
    compatibilityScore: "{n}% match",
    introduce: "Introduce",
    introduceSent: "Introduction request sent",
    empty: "No matches yet.",
    emptyHint: "Update your preferences for new suggestions.",
    refresh: "Refresh",
    heroTitle: "Where trust\nfinds its people.",
    heroBody: "Co-founder, mentor, and investor matching · curated inside the circle, guided by trust.",
    viewMatches: "View Matches",
    setPreferences: "Set Preferences",
    foundStat: "Matches found",
    heroTagline: "Co-founders. Mentors. Investors.",
    pageSubtitle: "AI-curated list of the best-fit connections in the community.",
    lookingFor: "Looking for",
    filter: "Filter →",
    loading: "Computing AI matches",
    loadError: "Could not load matches",
    countLabel: "{n} matches",
    sortedBy: "Ranked by AI confidence",
    howItWorks: "How it works?",
    step1Title: "01 · Profile analysis",
    step1Body: "Member sector, experience, and community interactions are analyzed.",
    step2Title: "02 · Vector matching",
    step2Body: "Claude Haiku scores similarity and finds common ground.",
    step3Title: "03 · Human approval",
    step3Body: "When you tap “Introduce”, the inner team steps in.",
    whyCompatible: "Why compatible?",
    commonGround: "Common ground",
    introducing: "Sending…",
    introduceFailed: "Could not send request",
    typeCofounder: "Co-founder",
    typeMentor: "Mentor",
    typeInvestor: "Investor",
    typeCollab: "Collaboration",
    footer: "claude-haiku-4-5-20251001 · updated weekly"
  },
  capital: {
    title: "inner·capital",
    subtitle: "Deal flow and founder introductions.",
    heroHeadline: "Where conviction\nmeets capital.",
    heroBody: "Private deal flow, SPVs, and co-investment. Curated inside the circle, invited by trust.",
    viewPipeline: "View Pipeline",
    viewSpvs: "View SPVs",
    activeDeals: "Active deals",
    heroTagline: "Deal Flow. SPVs. Co-Investment.",
    loading: "Loading deal flow",
    loadError: "Could not load capital",
    addDeal: "Add deal",
    membersOnly: "Private deal flow · circle members only",
    viewPipelineTab: "Pipeline",
    viewListTab: "List",
    statActive: "Active deals",
    statActiveSub: "in pipeline",
    statRaise: "Total raise",
    statRaiseSub: "active rounds",
    statClosed: "Closed",
    statClosedSub: "inner portfolio",
    statSpv: "SPV",
    statSpvSub: "open vehicles",
    stageClosed: "Closed",
    today: "today",
    daysAgoShort: "{n}d",
    target: "Target",
    valuation: "Valuation",
    score: "Score",
    detail: "Details",
    close: "← Close",
    round: "Round",
    internalScore: "Internal score",
    founders: "Founders",
    leadInvestor: "Lead investor",
    sector: "Sector",
    tags: "Tags",
    spvOpen: "SPV open",
    interested: "Interested",
    introduceFounder: "Introduce founder",
    admin: "Admin",
    investorBanner: "Investor room highlight",
    deleteDeal: "Delete deal",
    confirmDelete: "Delete the {company} deal?",
    updateFailed: "Could not update",
    deleteFailed: "Could not delete",
    participants: "{n} participants",
    closing: "Closes {date}",
    joinSpv: "Join SPV",
    emptyColumn: "Empty",
    colCompany: "Company",
    colSector: "Sector",
    colTarget: "Target",
    colValuation: "Valuation",
    colStage: "Stage",
    openSpvs: "Open SPVs",
    openSpvsSub: "Pooled investment via special-purpose vehicles",
    disclaimer: "for inner·hub members only · informational, not investment advice",
    empty: "No open opportunities.",
    viewDeal: "View details",
    composeTitle: "Add deal",
    composeSub: "Add a deal to the pipeline (admin only).",
    phCompany: "Company",
    phTagline: "Short tagline",
    phRaise: "Target ($500K)",
    phValuation: "Valuation",
    phRound: "Round (Pre-seed / Seed)",
    phFounders: "Founders (comma-separated)",
    phScore: "Score 0-100",
    saveFailed: "Could not save deal"
  },
  vault: {
    title: "inner·vault",
    eyebrow: "Knowledge base",
    subtitle: "The circle's private knowledge base. Share, learn, reference.",
    share: "Share",
    loading: "Loading vault",
    loadError: "Could not load vault",
    heroLabel: "D60 · archive map",
    heroQuote: "Every document is a layer of the circle.",
    statTotal: "Total docs",
    statMine: "My shares",
    statViews: "Views",
    featured: "Featured",
    searchPlaceholder: "Search docs, tags, or authors…",
    empty: "No documents found.",
    emptyHint: "Uploaded resources will appear here.",
    private: "Private",
    community: "Community",
    inviteOnly: "Invite only",
    mine: "mine",
    file: "file",
    pages: "{n} pages",
    views: "{n} views",
    today: "today",
    daysAgo: "{n}d ago",
    download: "Download",
    downloadFailed: "Download failed",
    uploadTitle: "Share document",
    uploadSub: "Metadata + optional file (PDF, Office, image · max 12 MB)",
    phTitle: "Title",
    phExcerpt: "Short summary",
    fileOptional: "File (optional)",
    filePick: "Choose PDF, DOCX, PPTX, PNG…",
    accessLevel: "Access level",
    fileTooLarge: "File must be 12 MB or smaller",
    saveFailed: "Could not save",
    uploadFailed: "Could not upload file",
    save: "Save",
    saved: "Saved",
    footer: "members only",
    typePitch: "Pitch Deck",
    typeResearch: "Research",
    typeNote: "Note",
    typeTemplate: "Template",
    typeCode: "Code",
    typeReport: "Report"
  },
  signal: {
    title: "inner·signal",
    eyebrow: "AI layer",
    subtitle: "Signals drawn from community memory for you. Read, save, act.",
    insight: "Insight",
    themes: "Themes",
    people: "Connections",
    activity: "Activity",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    loading: "Analyzing signals",
    lastUpdated: "Last updated · {date}",
    empty: "No signals yet.",
    emptyHint: "New insights will appear here as they form.",
    emptyConnections: "No connection suggestions this week.",
    activeSignal: "Active signal",
    weeklyTheme: "weekly themes",
    rising: "Rising",
    momentumHigh: "high momentum",
    connection: "Connection",
    suggestedThisWeek: "suggested this week",
    avgMatch: "Avg. match",
    matchScoreLabel: "match score",
    weekInsight: "This week's insight",
    copyInsight: "Copy insight",
    openInChat: "Open in Chat",
    followInChat: "Follow in Chat",
    generateVisual: "Generate visual · 720p",
    generating: "Generating · {status}",
    queued: "queued",
    regenerate: "Regenerate",
    fromCache: "Visual from cache · no extra credit",
    visualReady: "Visual ready. Regenerating uses credits.",
    confirmGenerate: "One visual will be generated (720p, credit-efficient). Continue?",
    confirmRegenerate: "Regeneration uses ~0.25-1 credits. Continue?",
    expandEditorial: "Expand · editorial",
    visualAlt: "Weekly signal visual",
    weeklyThemes: "Weekly themes",
    weeklyThemesSub: "This week's signals from the community",
    meetThisWeek: "Meet this week",
    meetThisWeekSub: "Connections suggested by match score",
    compatibilityPct: "Match {n}%",
    requestIntro: "Request intro",
    momentumRising: "Rising",
    momentumStable: "Stable",
    momentumFalling: "Falling",
    activityMap: "Activity map",
    activityMapSub: "Community density over the last 5 weeks · indicative",
    low: "Low",
    high: "High",
    interactions: "{n} interactions",
    week4: "4w",
    week3: "3w",
    week2: "2w",
    week1: "1w",
    weekThis: "Now",
    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
    daySun: "Sun",
    fetchError: "Could not fetch signal",
    footer: "Claude + Higgsfield · updated weekly · visuals use credits"
  },
  profile: {
    title: "profile",
    subtitle: "Manage your identity inside inner·hub.",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    visibility: "Profile visibility",
    visibilityPublic: "Public",
    visibilityMembers: "Members only",
    visibilityPrivate: "Private",
    visibilityHint: "Choose who can see your profile.",
    visibilityPublicDesc: "Anyone can see your profile",
    visibilityMembersDesc: "inner·hub members can see it",
    visibilityPrivateDesc: "Only you can see it",
    loading: "Loading profile",
    loadError: "Could not load profile",
    completionPct: "{n}% complete",
    photo: "Profile photo",
    photoSoon: "Soon · via avatar URL",
    avatar: "Avatar",
    uploadAvatar: "Upload photo",
    useGenerated: "Use generated",
    avatarHint: "JPEG is compressed · style applies on save",
    avatarError: "Could not update avatar",
    avatarTooLarge: "Image too large (max 160KB)",
    university: "University",
    behance: "Behance",
    instagram: "Instagram",
    phone: "Phone",
    phoneHint: "Used for WhatsApp opt-in",
    placeholderUniversity: "University name",
    placeholderBehance: "username",
    placeholderInstagram: "username",
    placeholderPhone: "+90…",
    org: "Organization",
    orgSub: "Create a company or join an existing one",
    orgEmpty: "You are not linked to an organization yet.",
    createOrg: "Create organization",
    orgName: "Name",
    orgNamePlaceholder: "Company / studio name",
    orgLogo: "Logo URL",
    orgType: "Type",
    orgType_startup: "Startup",
    orgType_company: "Company",
    orgType_fund: "Fund",
    orgType_studio: "Studio",
    orgCreateError: "Could not create organization",
    orgCreated: "Organization created",
    joinOrg: "Join organization",
    joinOrgPlaceholder: "Search by name…",
    join: "Join",
    orgJoinError: "Could not join",
    orgJoined: "Joined",
    sectionBasics: "Basic info",
    sectionSkills: "Expertise",
    sectionSkillsSub: "Shown on your inner·id card and in matches",
    sectionSocial: "Social links",
    sectionSocialSub: "Connected to your inner·id badge",
    firstName: "First name",
    lastName: "Last name",
    handle: "Username",
    role: "Role / title",
    company: "Company",
    bio: "Bio",
    placeholderFirstName: "Your first name",
    placeholderLastName: "Your last name",
    placeholderHandle: "handle",
    placeholderRole: "Founder, CPO…",
    placeholderCompany: "Company name",
    placeholderBio: "Write a short intro…",
    placeholderLinkedin: "your-profile",
    placeholderGithub: "username",
    placeholderWebsite: "yoursite.com",
    placeholderTwitter: "username",
    personalSite: "Personal site",
    twitter: "X / Twitter",
    skills: "Expertise",
    skillAdd: "Add…",
    skillsHint: "Max. 10 tags · press Enter to add",
    handleError: "Lowercase letters, numbers, and underscore only",
    changesSaved: "Changes saved",
    saveError: "Could not save",
    footer: "profile · invite-based"
  },
  faq: {
    title: "faq",
    subtitle: "Frequently asked questions.",
    loading: "Loading FAQ",
    loadError: "Could not load FAQ",
    empty: "No FAQ yet.",
    noAnswer: "Didn't find an answer?",
    contactHint: "Reach us via community Chat or email.",
    footer: "frequently asked questions"
  },
  membership: {
    title: "Membership",
    subtitle: "Join inner·hub. Pick a yearly plan and grow with the circle.",
    popular: "Most popular",
    buy: "Buy",
    redirecting: "Redirecting…",
    current: "Current plan",
    perMonth: "/ month",
    perYear: "/ year",
    checkoutFailed: "Could not start checkout",
    trust: "Payments processed securely by Stripe · SSL encrypted · Cancel anytime",
    planAnnual: "Annual membership",
    planAnnualDesc: "Full access to inner·hub. Events, courses, perks, and community.",
    planFounder: "Founder membership",
    planFounderDesc: "The first layer of inner·hub. Extra benefits for founding members.",
    feat1: "Priority registration for all events",
    feat2: "Access to all course content",
    feat3: "Perks catalog",
    feat4: "Community chat channels",
    feat5: "Member directory",
    feat6: "Talent Board posts",
    feat7: "Monthly networking breakfast",
    featPasses: "3 Circle Passes each month",
    featF1: "Everything in annual membership",
    featF2: "Founder badge and profile tag",
    featF3: "inner·capital deal flow access",
    featF4: "Private founder dinner invites",
    featF5: "Priority inner·studio advising",
    featF6: "Demo Day presentation rights",
    featF7: "Co-founder matching priority",
    circlePass: "Circle Pass",
    passBalance: "Balance · {n} passes",
    passMonthly: "This month {balance}/{grant}",
    passHint: "For live course and event registration",
    buyPass: "+1 Pass · {price} TL",
    paymentSuccessTitle: "Payment received",
    paymentSuccessEvent: "Your event registration is confirmed.",
    paymentSuccessMembership: "{plan} is active.",
    paymentSuccessEmail: " Confirmation sent to {email}.",
    paymentVerifyFailed: "Could not verify payment",
    backToMembership: "← Back to membership",
    backToPanel: "Back to panel",
    planFallback: "Membership"
  },
  chat: {
    title: "Chat",
    subtitle: "Channels and direct messages.",
    channels: "Channels",
    empty: "No messages yet.",
    emptyHint: "Send the first message.",
    emptyChannels: "No channels yet.",
    emptyChannel: "#{name} is empty",
    placeholder: "Message #{name}…",
    send: "Send",
    sendHint: "Enter to send · Shift+Enter for a new line",
    loadingChannels: "Loading channels",
    loadChannelsError: "Could not load channels",
    loadingMessages: "Loading messages",
    loadMessagesError: "Could not load messages",
    sendError: "Could not send message",
    aiDigest: "AI digest · #{name}",
    aiDigestHint: "Channel summary will appear here once enough messages accumulate."
  },
  courses: {
    title: "Courses",
    subtitle: "Learning paths and sessions.",
    heroEyebrow: "My courses",
    heroHeadline: "Where knowledge\nmeets momentum.",
    heroBody: "inner·hub learning · at your pace, on your time, with the circle's knowledge.",
    heroStat: "Enrolled courses",
    heroTagline: "At your pace, on your time.",
    continueCta: "Continue",
    exploreCta: "Explore courses",
    enroll: "Enroll",
    continue: "Continue",
    start: "Start",
    completed: "completed",
    inProgress: "In progress",
    empty: "No published courses yet.",
    loading: "Loading courses",
    loadError: "Could not load courses",
    enrollFailed: "Enrollment failed",
    enrollRequired: "Enrollment required",
    hide: "Hide",
    viewCurriculum: "View curriculum",
    curriculumSoon: "Curriculum coming soon.",
    lessons: "{done}/{total} lessons",
    tag: "Course",
    education: "Education",
    term: "Term {n}",
    myEnrolled: "My enrolled courses",
    otherCourses: "Other courses",
    statEnrolled: "Enrolled",
    statEnrolledSub: "in progress",
    statProgress: "Avg. progress",
    statProgressSub: "across enrolled",
    statOther: "Other courses",
    statOtherSub: "waiting to explore",
    statTotal: "Total",
    statTotalSub: "inner·hub catalog",
    loadFailed: "Could not load courses",
    saveFailed: "Could not save",
    noVideo: "No video for this lesson",
    markComplete: "Mark as complete",
    markCompleteFailed: "Could not mark complete",
    completedLabel: "Completed",
    adminEyebrow: "Admin",
    adminTitle: "Course Management",
    adminSubtitle: "Add courses, modules, and lessons · upload video to Mux.",
    addCourse: "Add Course",
    courseTitlePlaceholder: "Course title",
    courseDescriptionPlaceholder: "Course description",
    addModule: "Add Module",
    moduleTitlePlaceholder: "Module title",
    addLesson: "Add Lesson",
    lessonTitlePlaceholder: "Lesson title",
    lessonContentPlaceholder: "Short note (optional)",
    lessonsCount: "lessons",
    chooseVideo: "Choose video",
    uploading: "Uploading…",
    processingVideo: "Processing…",
    uploadFailed: "Video upload failed",
    published: "Published",
    draft: "Draft",
    format: "Format",
    audience: "Room",
    startsAt: "Starts at",
    meetUrl: "Meet URL",
    passCost: "Pass",
    notify: "Notify",
    saveLive: "Save",
    roomMine: "My room",
    roomAll: "All",
    joinMeet: "Join Meet",
    passCostHint: "{n} pass",
    passRequired: "Not enough Circle Pass balance. Get a pass on the membership page.",
    getPass: "Get Circle Pass →",
    categoryLabel: "Category",
    category: {
      business: "Business",
      product: "Product",
      art: "Art",
      craft: "Craft",
      capital: "Capital",
      ops: "Ops"
    }
  },
  eventsAdmin: {
    eyebrow: "Admin",
    title: "Event Management",
    subtitle: "Add events · publish · notify registrants.",
    loading: "Loading events",
    loadFailed: "Could not load events",
    saveFailed: "Could not save",
    addEvent: "Add Event",
    titlePlaceholder: "Event title",
    descriptionPlaceholder: "Description",
    locationPlaceholder: "Location",
    startAt: "Starts",
    endAt: "Ends",
    format: "Format",
    audience: "Room",
    meetUrl: "Meet URL",
    passCost: "Pass",
    publishNow: "Publish now",
    notify: "Notify",
    published: "Published",
    draft: "Draft"
  },
  stage: {
    title: "Stage",
    subtitle: "Put your product in front of the circle · collect votes · hit the showcase.",
    loading: "Loading stage",
    loadFailed: "Could not load stage",
    showcase: "Showcase",
    showcaseHint: "Top voted in the last 7 days",
    allProducts: "All products",
    empty: "No products yet · be the first.",
    submit: "Submit product",
    titlePlaceholder: "Product name",
    urlPlaceholder: "https://…",
    pitchPlaceholder: "Short pitch",
    submitFailed: "Could not submit",
    openLink: "Open link"
  },
  members: {
    title: "Members",
    subtitle: "Community members and collaboration opportunities.",
    heroBody: "Founders, engineers, investors · find each other and grow inside the circle.",
    heroHeadline: "Where builders\nfind each other.",
    viewMembers: "View members",
    talentBoard: "Talent Board",
    heroStat: "Inside the circle",
    heroTagline: "Founders. Engineers. Investors.",
    about: "About",
    skills: "Skills",
    noBio: "No bio yet.",
    message: "Message",
    connect: "Connect",
    publish: "Publish",
    published: "Published",
    empty: "No members found.",
    searchPlaceholder: "Name, company, or skill…",
    searchTalent: "Search role or skill…",
    loading: "Loading members",
    loadError: "Could not load members",
    tabMembers: "Members",
    memberCount: "{n} members",
    liveSoon: "live status soon",
    talentLoading: "Loading talent board",
    talentError: "Could not load talent board",
    postCount: "{n} posts",
    postCta: "Post",
    talentEmpty: "No posts yet · be the first.",
    talentFooter: "Successful matches take a 10% platform fee · inner·hub Talent Board",
    connectViaPanel: "Connect via panel",
    profile: "Profile",
    deletePost: "Delete post",
    typeSeeking: "seeking",
    typeOffering: "offering",
    composeTitle: "Post",
    composeSub: "Announce what you're seeking or offering to the circle.",
    phRole: "Role / title",
    phDesc: "Short description",
    phTags: "Tags (comma-separated)",
    createFailed: "Could not create post",
    statTotal: "Total members",
    statTotalSub: "inside the circle",
    statProfile: "Profiles",
    statProfileSub: "with bio",
    statTalent: "Talent posts",
    statTalentSub: "live",
    statAdmin: "Admin",
    statAdminSub: "ops"
  },
  perks: {
    title: "Perks",
    subtitle: "Member-only opportunities.",
    heroHeadline: "Perks worth\nbeing inside for.",
    heroBody: "Software, finance, and lifestyle deals for program members. Grab the code, use it with the partner.",
    featuredCta: "Featured",
    allCta: "All deals",
    heroStat: "Active perks",
    heroTagline: "Software. Finance. Lifestyle.",
    saved: "Saved",
    howTo: "How to use",
    empty: "No results",
    emptyHint: "Clear filters or search and try again.",
    showAll: "Show all",
    claim: "Claim",
    loading: "Loading perks",
    loadError: "Could not load perks",
    review: "Review",
    hasCode: "Has code",
    perkLabel: "Perk",
    expires: "Ends: {date}",
    activationCode: "Activation code",
    goPartner: "Go to partner site",
    unsave: "Remove from saved",
    saveForLater: "Save for later",
    featured: "Featured",
    openDetail: "Open details",
    searchPlaceholder: "Search brand, offer, or code…",
    count: "{n} perks",
    footer: "New perks added monthly · Suggest via Slack or support.",
    catSoftware: "Software",
    catFinance: "Finance",
    catLife: "Lifestyle",
    catEducation: "Education",
    statTotal: "Total deals",
    statTotalSub: "active perks",
    statFeatured: "Featured",
    statFeaturedSub: "this period",
    statCategory: "Categories",
    statCategorySub: "software · finance · life",
    statSaved: "Saved",
    statSavedSub: "in favorites",
    step1Title: "Pick",
    step1Body: "Find a deal by category or search.",
    step2Title: "Get code",
    step2Body: "Copy the activation code in details.",
    step3Title: "Use",
    step3Body: "Apply the code on the partner site.",
    partners: "Partners",
    ecosystem: "Ecosystem",
    campaignBadge: "inner·only"
  },
  pulse: {
    title: "Pulse",
    eyebrow: "Community pulse",
    subtitle: "The circle's anonymous pulse. What's being talked about this week?",
    live: "Live",
    loading: "Loading pulse",
    loadError: "Could not load pulse",
    heroLabel: "Phosphor · live signal",
    heroQuote: "The circle is breathing.",
    empty: "No pulse data yet",
    emptyHint: "Not enough channel messages this week. Trends and activity will appear as chat picks up.",
    emptyActivity: "No activity yet",
    statMessages: "Messages this week",
    statMessagesSub: "across {n} channels",
    statActive: "Active members",
    statActiveSub: "in community",
    statTrends: "Trending topics",
    statTrendsSub: "tracked",
    statScore: "Activity score",
    statScoreSub: "this week",
    trending: "Trending topics",
    noTrends: "No trends in this category",
    weeklyActivity: "Weekly activity",
    topChannels: "Top channels",
    noChannels: "No channel data",
    topContributors: "Highlights this week",
    noContributors: "No contributions yet",
    streakDays: "{n}d",
    firstActivity: "First activity this week",
    sameLevel: "Same level as last week",
    weekUp: "Up {n}% this week",
    weekDown: "Down {n}% this week",
    catTech: "tech",
    catBiz: "biz",
    catInvest: "invest",
    catCulture: "culture",
    footer: "anonymized · real-time · members only"
  },
  api: {
    title: "inner·api",
    eyebrow: "Platform API",
    subtitle: "Programmatic access to the community stack. Integrate into your product.",
    docs: "Documentation",
    keys: "Your API keys",
    keysHint: "Keep keys safe · never share them",
    loading: "Loading keys",
    loadError: "Could not load keys",
    empty: "You don't have an API key yet.",
    createKey: "New key",
    creating: "Creating…",
    revokeKey: "Revoke",
    copyKey: "Copy",
    keyCreated: "New key created",
    keyCreatedHint: "This key won't be shown again. Copy it now and store it safely.",
    deleteKey: "Delete key",
    confirmDelete: "Are you sure?",
    deleting: "Deleting…",
    abort: "Cancel",
    createdAt: "created {date}",
    lastUsed: "last used {date}",
    deleteFailed: "Could not delete",
    createFailed: "Could not create key",
    phKeyName: "Key name (e.g. prod-server)",
    endpoints: "Endpoints",
    plans: "API plans",
    recommended: "Recommended",
    requests: "{n} requests",
    contactSupport: "Contact support",
    free: "Free",
    unlimited: "Unlimited",
    perMonth: "/ month",
    warning: "inner·api is in beta. Key create/delete works live; usage/rate-limit tracking and billing are not wired yet. Contact support to upgrade a plan.",
    footer: "v1 · REST · JSON · Bearer Auth · inner·hub ecosystem",
    epMembers: "List community members (anonymous)",
    epMember: "Fetch and verify a member profile",
    epMatch: "Call the AI matching algorithm",
    epPulse: "Fetch community signal data",
    epVerify: "inner·id identity verification",
    epWebhook: "Receive webhooks for community events",
    planStarterF1: "Basic member query",
    planStarterF2: "Identity verification",
    planStarterF3: "Email support",
    planBuilderF1: "All endpoints",
    planBuilderF2: "inner·match API",
    planBuilderF3: "Webhook support",
    planBuilderF4: "Priority support",
    planScaleF1: "White-label",
    planScaleF2: "Özel SLA",
    planScaleF3: "Dedicated support",
    planScaleF4: "inner·pulse raw data",
    reqStarter: "1,000 / month",
    reqBuilder: "50,000 / month"
  },
  applications: {
    title: "applications",
    subtitle: "Review invitation requests; approve / reject is persisted.",
    admin: "Admin",
    pending: "Pending",
    approve: "Approve",
    reject: "Reject",
    empty: "No applications yet",
    noResults: "No results found",
    approved: "Approved",
    rejected: "Rejected",
    loading: "Loading applications",
    loadError: "Could not load applications",
    detail: "Application detail",
    why: "Why inner·hub?",
    appliedAt: "Applied",
    referrer: "Referrer",
    none: "None",
    searchPlaceholder: "Name, email, tag…",
    updateFailed: "Could not update status",
    footer: "applications · admin only"
  },
  analytics: {
    title: "analytics",
    subtitle: "Site traffic (synced with Google) and circle engagement · Framer-style panel.",
    admin: "Admin",
    tabSite: "Site",
    tabCircle: "Circle",
    visitors: "Visitors",
    pageViews: "Page views",
    uniqueSessions: "unique sessions",
    inRange: "selected range",
    source: "Source",
    sourceGoogleSub: "GA4 Data API",
    sourceSiteSub: "first-party + gtag",
    visitorsOverTime: "Visitors",
    visitorsOverTimeSub: "Daily unique sessions",
    topPages: "Top pages",
    topPagesSub: "Most viewed paths",
    topReferrers: "Referrers",
    topReferrersSub: "Traffic sources",
    devices: "Devices",
    devicesSub: "By session",
    webEmpty: "No site traffic yet - visits will appear here.",
    syncedGoogle: "Synced with Google Analytics",
    sendingGoogle: "Sending to Google via gtag",
    gaApiHint: "For live Google reports set env: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY",
    openGoogle: "Google Analytics",
    range7: "7 days",
    range28: "28 days",
    range90: "90 days",
    totalMembers: "Total members",
    activeMembers: "Active members",
    newThisWeek: "New this week",
    empty: "Not enough data yet",
    emptyHint: "As the community moves, growth, engagement, and active-member charts will fill in.",
    loading: "Loading analytics",
    loadError: "Could not load analytics",
    membersInCircle: "inside the circle",
    newThisMonth: "+{n} this month",
    noNewThisMonth: "none new this month",
    messagesThisWeek: "Messages this week",
    vsLastWeek: "vs last week",
    eventRegs: "Event registrations",
    total: "total",
    thisWeekDelta: "+{n} this week",
    aiMatch: "AI matches",
    thisMonthDelta: "+{n} this month",
    memberGrowth: "Member growth",
    memberGrowthSub: "Cumulative members · monthly from real join dates",
    revenue: "Revenue",
    revenueSub: "MRR tracking",
    revenueSoon: "Revenue tracking soon",
    revenueHint: "Membership payments run through Stripe; in-panel revenue reporting is not wired yet.",
    weeklyEngagement: "Weekly engagement",
    weeklyEngagementSub: "Active members · messages · event regs · last 4 weeks",
    messages: "Messages",
    registrations: "Registrations",
    topMembers: "Most active members",
    topMembersSub: "By message contribution in the last 30 days",
    colMember: "Member",
    colContribution: "Contribution",
    colEvent: "Events",
    colJoined: "Joined",
    channelActivity: "Channel activity",
    channelActivitySub: "Top channels · total messages",
    pendingApps: "Pending applications",
    pendingAppsSub: "Admin view",
    awaitingReview: "awaiting review",
    footer: "analytics · admin only"
  },
  publicProfile: {
    title: "Profile",
    enterPanel: "Enter panel",
    loading: "Loading profile…",
    notFound: "Profile not found",
    membersOnly: "Members only",
    membersOnlyBody: "@{handle}'s profile is only visible to inner·hub members. Sign in to view.",
    login: "Sign in",
    loadError: "Could not load",
    networkError: "Network error",
    skills: "Skills",
    links: "Links",
    memberSince: "Member · {date}",
    verifiedNote: "This identity is tied to inner·hub invite-only membership. Badge:"
  },
  notFound: {
    title: "404 Page not found",
    body: "The page you’re looking for may have moved or never existed.",
    backHome: "Back to home"
  }
};
const dictionaries = { tr, en };
const I18nContext = createContext(null);
function resolveInitialLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return readStoredLocale() ?? DEFAULT_LOCALE;
}
function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(resolveInitialLocale);
  const setLocale = useCallback((next) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const messages = dictionaries[locale];
  const t = useCallback(
    (key, values) => {
      const raw = getByPath(messages, key) ?? getByPath(dictionaries.en, key) ?? getByPath(dictionaries.tr, key) ?? key;
      return interpolate$1(raw, values);
    },
    [messages]
  );
  const value = useMemo(
    () => ({ locale, setLocale, t, messages }),
    [locale, setLocale, t, messages]
  );
  return /* @__PURE__ */ jsx(I18nContext.Provider, { value, children });
}
function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
function useT() {
  return useI18n().t;
}
function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}
function LocaleToggle({
  className = "",
  tone = "dark"
}) {
  const { locale, setLocale } = useLocale();
  const btn = (code, label) => {
    const active = locale === code;
    const base = tone === "dark" ? active ? "bg-[var(--bone)] text-black" : "text-[var(--bone)]/55 hover:text-[var(--bone)]" : active ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]";
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        lang: code,
        onClick: () => setLocale(code),
        "aria-pressed": active,
        className: `px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${base}`,
        children: label
      },
      code
    );
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "group",
      "aria-label": "Language",
      className: `inline-flex items-center border ${tone === "dark" ? "border-white/15" : "border-[var(--ink)]/15"} ${className}`,
      children: [
        btn("tr", "TR"),
        btn("en", "EN")
      ]
    }
  );
}
const ease = [0.16, 1, 0.3, 1];
function FadeIn({
  children,
  className,
  delay = 0
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return /* @__PURE__ */ jsx("div", { className, children });
  }
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-40px" },
      transition: { duration: 0.55, ease, delay: Math.min(delay, 0.3) },
      className,
      children
    }
  );
}
const EASE$3 = [0.16, 1, 0.3, 1];
function WordsPullUp({
  text,
  className,
  delay = 0,
  showAsterisk = false,
  as: Tag = "h2"
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Comp = Tag;
  if (reduce) {
    return /* @__PURE__ */ jsxs(Comp, { className, children: [
      text,
      showAsterisk ? /* @__PURE__ */ jsx(Asterisk, {}) : null
    ] });
  }
  return /* @__PURE__ */ jsx(Comp, { ref, className, children: words.map((word, i) => {
    const isLast = i === words.length - 1;
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: "relative mr-[0.2em] inline-block overflow-hidden pb-1 pr-1 align-top last:mr-0",
        children: /* @__PURE__ */ jsxs(
          motion.span,
          {
            className: "inline-block",
            initial: { y: 20, opacity: 0 },
            animate: inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 },
            transition: { duration: 0.6, ease: EASE$3, delay: delay + i * 0.08 },
            children: [
              word,
              showAsterisk && isLast ? /* @__PURE__ */ jsx(Asterisk, {}) : null
            ]
          }
        )
      },
      `${word}-${i}`
    );
  }) });
}
function Asterisk() {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "ml-[0.08em] inline-block size-[0.32em] shrink-0 translate-y-[0.05em] bg-[var(--inner-green)] animate-beacon align-baseline shadow-[0_0_12px_rgba(24,255,133,0.45)]",
      "aria-hidden": true
    }
  );
}
function WordsPullUpMultiStyle({
  segments,
  className,
  delay = 0
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = segments.flatMap(
    (seg, si) => seg.text.split(" ").map((word, wi) => ({
      word,
      className: seg.className,
      key: `${si}-${wi}-${word}`
    }))
  );
  if (reduce) {
    return /* @__PURE__ */ jsx("h2", { className, children: segments.map((seg, i) => /* @__PURE__ */ jsxs("span", { className: seg.className, children: [
      seg.text,
      i < segments.length - 1 ? " " : ""
    ] }, i)) });
  }
  return /* @__PURE__ */ jsx("h2", { ref, className: `inline-flex flex-wrap gap-x-[0.28em] ${className ?? ""}`, children: words.map((item, i) => /* @__PURE__ */ jsx("span", { className: "inline-block overflow-hidden pb-1 align-top", children: /* @__PURE__ */ jsx(
    motion.span,
    {
      className: `inline-block ${item.className ?? ""}`,
      initial: { y: 20, opacity: 0 },
      animate: inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 },
      transition: { duration: 0.55, ease: EASE$3, delay: delay + i * 0.08 },
      children: item.word
    }
  ) }, item.key)) });
}
function RevealChar({
  char,
  progress,
  range
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return /* @__PURE__ */ jsx(motion.span, { style: { opacity }, children: char });
}
function ScrollTextReveal({
  text,
  className,
  style
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
  if (reduce) {
    return /* @__PURE__ */ jsx("p", { className, style, children: text });
  }
  const words = text.split(" ");
  const total = text.length;
  let charIndex = 0;
  return /* @__PURE__ */ jsx("p", { ref, className, style, children: words.map((word, wi) => {
    const wordEl = /* @__PURE__ */ jsx("span", { className: "inline-block", children: word.split("").map((char) => {
      const i = charIndex;
      charIndex += 1;
      return /* @__PURE__ */ jsx(
        RevealChar,
        {
          char,
          progress: scrollYProgress,
          range: [i / total - 0.08, i / total + 0.04]
        },
        i
      );
    }) });
    const isLast = wi === words.length - 1;
    if (!isLast) charIndex += 1;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      wordEl,
      !isLast ? " " : null
    ] }, wi);
  }) });
}
function BeaconSquare({
  className = "",
  size = "0.42em",
  pulse = false
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block shrink-0 self-end bg-[#18FF85] animate-beacon ${pulse ? "beacon-pulse-glow" : ""} ${className}`,
      style: { width: size, height: size, marginBottom: "0.05em" },
      "aria-hidden": true
    }
  );
}
function Lockup({
  suffix = "hub",
  className = "",
  fontSize,
  /** Dar chrome: `i` ■ */
  compact = false,
  /** @deprecated `compact` kullan */
  showHub = true,
  /** Birincil logo yerleşimlerinde yeşil kareye yumuşak glow ekler. */
  pulse = false
}) {
  const isCompact = compact || !showHub;
  const label = isCompact ? "innerhub" : `inner ${suffix}`;
  const textStyle = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 300,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.015em",
    ...fontSize ? { fontSize } : {}
  };
  if (isCompact) {
    return /* @__PURE__ */ jsxs("span", { lang: "en", className: `inline-flex items-baseline leading-none ${className}`, "aria-label": label, children: [
      /* @__PURE__ */ jsx("span", { style: textStyle, children: "i" }),
      /* @__PURE__ */ jsx(BeaconSquare, { className: "ml-[0.06em]", size: "0.42em", pulse })
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { lang: "en", className: `inline-flex items-baseline leading-none ${className}`, "aria-label": label, children: [
    /* @__PURE__ */ jsx("span", { style: textStyle, children: "inner" }),
    /* @__PURE__ */ jsx(BeaconSquare, { className: "mx-[0.12em]", size: "0.42em", pulse }),
    /* @__PURE__ */ jsx("span", { style: textStyle, children: suffix })
  ] });
}
function SiteFooter() {
  const t = useT();
  return /* @__PURE__ */ jsxs(
    "footer",
    {
      id: "site-footer",
      className: "relative overflow-hidden border-t border-white/10 bg-[var(--ink-fixed)] px-4 pb-8 pt-12 text-[var(--bone-fixed)] sm:px-6 sm:pt-16 md:px-12 md:pt-20 lg:px-[10%]",
      children: [
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -left-20 top-10 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--bone-fixed)]", fontSize: "clamp(28px, 4vw, 36px)" }),
            /* @__PURE__ */ jsx("p", { className: "max-w-[36ch] text-sm font-light leading-relaxed text-[var(--bone-fixed)]/70", children: t("home.footerTagline") }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "mailto:support@inner.digital",
                className: "inline-flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/55 transition-colors hover:text-[var(--bone-fixed)]",
                children: [
                  /* @__PURE__ */ jsx(Mail, { className: "size-3.5" }),
                  "support@inner.digital"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40", children: t("home.footerNavigate") }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: [
              { label: t("publicNav.platform"), href: "/#section-03" },
              { label: t("publicNav.gathering"), href: "/#section-06" },
              { label: t("publicNav.artifacts"), href: "/haberler" },
              { label: t("publicNav.invitation"), href: "/invitation" }
            ].map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              "a",
              {
                href: l.href,
                className: "font-mono text-caption uppercase tracking-widest text-[var(--bone-fixed)]/65 transition-colors hover:text-[var(--bone-fixed)]",
                children: l.label
              }
            ) }, l.href)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40", children: t("home.footerConnect") }),
            /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.linkedin.com",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  "aria-label": "inner on LinkedIn",
                  className: "border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]",
                  children: /* @__PURE__ */ jsx(Linkedin, { size: 18, strokeWidth: 1.5 })
                }
              ),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.instagram.com",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  "aria-label": "inner on Instagram",
                  className: "border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]",
                  children: /* @__PURE__ */ jsx(Instagram, { size: 18, strokeWidth: 1.5 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35", children: "İstanbul → Global" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35", children: t("home.footerRights") }),
          /* @__PURE__ */ jsx("div", { className: "leading-none text-[var(--bone-fixed)]", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Lockup, { fontSize: "clamp(2.75rem, 10vw, 7.5rem)" }) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "inner hub" })
      ]
    }
  );
}
function Grain() {
  return /* @__PURE__ */ jsx("div", { className: "grain-overlay", "aria-hidden": "true" });
}
const SECTIONS = [
  { id: "section-01", label: "01" },
  { id: "section-02", label: "02" },
  { id: "section-03", label: "03" },
  { id: "section-04", label: "04" },
  { id: "section-05", label: "05" },
  { id: "section-06", label: "06" },
  { id: "section-07", label: "07" }
];
function IndexRail() {
  const t = useT();
  const [active, setActive] = useState("section-01");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": t("common.sectionIndex"),
      className: "hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4",
      children: SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: `#${id}`,
            className: "flex items-center gap-2 font-mono text-caption tabular-nums tracking-widest transition-opacity duration-500",
            style: { opacity: isActive ? 1 : 0.35 },
            children: [
              isActive && /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-[5px] h-[5px] bg-[var(--inner-green)] flex-shrink-0",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: isActive ? "text-[var(--bone-fixed)]" : "text-[var(--bone-fixed)]/45", children: label })
            ]
          },
          id
        );
      })
    }
  );
}
const TOTAL = 34;
const RADIUS = 130;
const SIZE = 7;
const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;
function DiagramCircle() {
  const t = useT();
  const squares = Array.from({ length: TOTAL }, (_, i) => {
    const angle = i / TOTAL * Math.PI * 2 - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);
    return { x, y, isGreen: i === 0 };
  });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
        className: "w-full max-w-[320px] h-auto animate-diagram-spin",
        role: "presentation",
        focusable: "false",
        children: squares.map((s, i) => /* @__PURE__ */ jsx(
          "rect",
          {
            x: s.x - SIZE / 2,
            y: s.y - SIZE / 2,
            width: SIZE,
            height: SIZE,
            fill: s.isGreen ? "var(--inner-green)" : "var(--bone)",
            opacity: s.isGreen ? 1 : 0.85
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-label uppercase tracking-widest opacity-50", children: t("home.oneCircle") }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: t("home.oneCircleSr") })
  ] });
}
function Preloader() {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("inner_preloader_seen");
    if (reduced || seen) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("inner_preloader_seen", "1");
    setPhase("in");
    const t1 = setTimeout(() => setPhase("out"), 500);
    const t2 = setTimeout(() => setPhase("done"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "done") return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": "true",
      className: "fixed inset-0 z-[9998] bg-[var(--ink)] flex items-center justify-center",
      style: {
        transition: "transform 400ms var(--ease-expo), visibility 0ms 400ms",
        transform: phase === "out" ? "translateY(-110%)" : "translateY(0)",
        visibility: phase === "out" ? "hidden" : "visible"
      },
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: "w-[14px] h-[14px] bg-[var(--inner-green)]",
          style: {
            animation: phase === "in" ? "preloader-pulse 500ms ease-in-out" : void 0
          }
        }
      )
    }
  );
}
const BY_FRAGMENT = {
  "hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994": "/posters/courses-hero.jpg",
  "hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959": "/posters/capital-events.jpg",
  "hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4": "/posters/gathering.jpg",
  "hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711": "/posters/match-hero.jpg",
  "hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08": "/posters/perks-ambient.jpg"
};
function posterForVideo(src, fallback = "/posters/courses-hero.jpg") {
  for (const [fragment, poster] of Object.entries(BY_FRAGMENT)) {
    if (src.includes(fragment)) return poster;
  }
  return fallback;
}
function HeroVideo({ src, poster, className, style }) {
  const resolvedPoster = poster ?? posterForVideo(src);
  const ref = useRef(null);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  if (reduce) {
    return /* @__PURE__ */ jsx("img", { src: resolvedPoster, alt: "", "aria-hidden": "true", className, style });
  }
  return /* @__PURE__ */ jsx(
    "video",
    {
      ref,
      muted: true,
      loop: true,
      playsInline: true,
      poster: resolvedPoster,
      preload: "none",
      className,
      style,
      src
    }
  );
}
const CARD_BG = "#212121";
function FeatureCard$1({
  feature,
  index,
  setRef
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: (el) => {
        ref.current = el;
        setRef(el);
      },
      "data-feature-index": index,
      className: `border border-white/10 p-6 transition-all duration-700 ease-out md:p-8 ${inView ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`,
      style: { backgroundColor: CARD_BG },
      children: [
        /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-white/45", children: feature.tag }),
        /* @__PURE__ */ jsx("h3", { className: "mb-6 font-serif text-xl italic text-[var(--bone-fixed)] md:text-2xl", children: feature.name }),
        /* @__PURE__ */ jsx("div", { className: "mb-6 aspect-video overflow-hidden bg-black/40", children: feature.media.type === "video" ? /* @__PURE__ */ jsx(
          HeroVideo,
          {
            src: feature.media.src,
            poster: posterForVideo(feature.media.src),
            className: "size-full object-cover"
          }
        ) : /* @__PURE__ */ jsx(
          "img",
          {
            src: feature.media.src,
            alt: feature.name,
            className: "size-full object-cover",
            loading: "lazy"
          }
        ) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-white/55 md:text-base", children: feature.desc })
      ]
    }
  );
}
function PlatformFeatures({
  features,
  restModules
}) {
  const t = useT();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef(/* @__PURE__ */ new Map());
  const ratiosRef = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    const ratios = ratiosRef.current;
    ratios.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.featureIndex);
          if (Number.isNaN(idx)) return;
          ratios.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let bestIdx = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        });
        if (bestRatio > 0) setActiveIndex(bestIdx);
      },
      {
        // Mid-viewport band so the left nav tracks the card you're actually reading
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-28% 0px -42% 0px"
      }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);
  const scrollToCard = (index) => {
    setActiveIndex(index);
    cardRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative px-4 py-20 text-[var(--bone-fixed)] sm:px-6 md:px-12 md:py-40 lg:px-[10%] lg:py-48",
      style: { backgroundColor: "var(--ink-fixed)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -left-20 top-24 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-16 bottom-20 size-80 bg-[var(--inner-green)]/[0.035] blur-3xl" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-[400px_1fr] lg:items-start lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-between lg:self-start lg:py-28", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-xs uppercase tracking-widest text-white/45", children: t("home.platformEyebrow") }),
              /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-2xl leading-[1.2] text-[var(--bone-fixed)] sm:text-3xl lg:text-[46px]", children: t("home.platformTitle") })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-12 hidden flex-col gap-2 lg:flex", children: features.map((f, i) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => scrollToCard(i),
                className: `border px-4 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors ${activeIndex === i ? "border-white/15 bg-white/[0.08] text-[var(--bone-fixed)]" : "border-transparent text-white/45 hover:text-white/70"}`,
                children: f.name
              },
              f.id
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-12 hidden lg:block", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-white/55", children: t("home.platformAccess") }),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/invitation",
                  className: "inline-flex items-center gap-2 border border-white/25 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:border-white/50 hover:bg-[var(--bone-fixed)] hover:text-[var(--ink-fixed)]",
                  children: [
                    t("home.requestInvitation"),
                    " ",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:gap-2", children: [
            features.map((f, i) => /* @__PURE__ */ jsx(
              FeatureCard$1,
              {
                feature: f,
                index: i,
                setRef: (el) => {
                  if (el) cardRefs.current.set(i, el);
                  else cardRefs.current.delete(i);
                }
              },
              f.id
            )),
            restModules.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-white/10 pt-10", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-6 font-mono text-label uppercase tracking-widest text-white/45", children: t("home.moreTools", { n: restModules.length }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-1", children: restModules.map((mod) => {
                const Icon = mod.icon;
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex flex-col gap-3 border border-white/10 p-5 sm:p-6",
                    style: { backgroundColor: CARD_BG },
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsx(Icon, { className: "size-4 text-white/45", strokeWidth: 1.5 }),
                        /* @__PURE__ */ jsx("span", { className: "font-mono text-label uppercase tracking-widest text-white/40", children: mod.tag })
                      ] }),
                      /* @__PURE__ */ jsx("h4", { className: "font-serif italic text-lg text-[var(--bone-fixed)]", children: mod.name }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-white/50", children: mod.desc })
                    ]
                  },
                  mod.id
                );
              }) })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, _defaults = {
  duration: 0.5,
  overwrite: false,
  delay: 0
}, _suppressOverwrites, _reverting$1, _context, _bigNum$1 = 1e8, _tinyNum = 1 / _bigNum$1, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString = function _isString2(value) {
  return typeof value === "string";
}, _isFunction = function _isFunction2(value) {
  return typeof value === "function";
}, _isNumber = function _isNumber2(value) {
  return typeof value === "number";
}, _isUndefined = function _isUndefined2(value) {
  return typeof value === "undefined";
}, _isObject = function _isObject2(value) {
  return typeof value === "object";
}, _isNotFalse = function _isNotFalse2(value) {
  return value !== false;
}, _windowExists$1 = function _windowExists() {
  return typeof window !== "undefined";
}, _isFuncOrString = function _isFuncOrString2(value) {
  return _isFunction(value) || _isString(value);
}, _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
}, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globalTimeline, _win$1, _coreInitted, _doc$1, _globals = {}, _installScope = {}, _coreReady, _install = function _install2(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
}, _missingPlugin = function _missingPlugin2(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
}, _warn = function _warn2(message, suppress) {
  return !suppress && console.warn(message);
}, _addGlobal = function _addGlobal2(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
}, _emptyFunc = function _emptyFunc2() {
  return 0;
}, _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
}, _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
}, _revertConfig = {
  suppressEvents: true
}, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness2(targets) {
  var target = targets[0], harnessPlugin, i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);
  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    i = _harnessPlugins.length;
    while (i-- && !_harnessPlugins[i].targetTest(target)) {
    }
    harnessPlugin = _harnessPlugins[i];
  }
  i = targets.length;
  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }
  return targets;
}, _getCache = function _getCache2(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
}, _getProperty = function _getProperty2(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
}, _forEachName = function _forEachName2(names, func) {
  return (names = names.split(",")).forEach(func) || names;
}, _round = function _round2(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
}, _roundPrecise = function _roundPrecise2(value) {
  return Math.round(value * 1e7) / 1e7 || 0;
}, _parseRelative = function _parseRelative2(start, value) {
  var operator = value.charAt(0), end = parseFloat(value.substr(2));
  start = parseFloat(start);
  return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
}, _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
  var l = toFind.length, i = 0;
  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
  }
  return i < l;
}, _lazyRender = function _lazyRender2() {
  var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
  _lazyLookup = {};
  _lazyTweens.length = 0;
  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
}, _isRevertWorthy = function _isRevertWorthy2(animation) {
  return !!(animation._initted || animation._startAt || animation.add);
}, _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting$1 && _lazyRender();
  animation.render(time, suppressEvents, !!(_reverting$1 && time < 0 && _isRevertWorthy(animation)));
  _lazyTweens.length && !_reverting$1 && _lazyRender();
}, _numericIfPossible = function _numericIfPossible2(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
}, _passThrough = function _passThrough2(p) {
  return p;
}, _setDefaults = function _setDefaults2(obj, defaults2) {
  for (var p in defaults2) {
    p in obj || (obj[p] = defaults2[p]);
  }
  return obj;
}, _setKeyframeDefaults = function _setKeyframeDefaults2(excludeDuration) {
  return function(obj, defaults2) {
    for (var p in defaults2) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults2[p]);
    }
  };
}, _merge = function _merge2(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }
  return base;
}, _mergeDeep = function _mergeDeep2(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }
  return base;
}, _copyExcluding = function _copyExcluding2(obj, excluding) {
  var copy = {}, p;
  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }
  return copy;
}, _inheritDefaults = function _inheritDefaults2(vars) {
  var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }
  return vars;
}, _arraysMatch = function _arraysMatch2(a1, a2) {
  var i = a1.length, match = i === a2.length;
  while (match && i-- && a1[i] === a2[i]) {
  }
  return i < 0;
}, _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
  var prev = parent[lastProp], t;
  if (sortBy) {
    t = child[sortBy];
    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }
  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }
  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }
  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
}, _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }
  if (lastProp === void 0) {
    lastProp = "_last";
  }
  var prev = child._prev, next = child._next;
  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }
  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }
  child._next = child._prev = child.parent = null;
}, _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
}, _uncache = function _uncache2(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    var a = animation;
    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }
  return animation;
}, _recacheAncestors = function _recacheAncestors2(animation) {
  var parent = animation.parent;
  while (parent && parent.parent) {
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }
  return animation;
}, _rewindStartAt = function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
}, _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
}, _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
}, _animationCycle = function _animationCycle2(tTime, cycleDuration) {
  var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
  return tTime && whole === tTime ? whole - 1 : whole;
}, _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
}, _setEnd = function _setEnd2(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
}, _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
  var parent = animation._dp;
  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
    _setEnd(animation);
    parent._dirty || _uncache(parent, animation);
  }
  return animation;
}, _postAddChecks = function _postAddChecks2(timeline2, child) {
  var t;
  if (child._time || !child._dur && child._initted || child._start < timeline2._time && (child._dur || !child.add)) {
    t = _parentToChildTotalTime(timeline2.rawTime(), child);
    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  }
  if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
    if (timeline2._dur < timeline2.duration()) {
      t = timeline2;
      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime);
        t = t._dp;
      }
    }
    timeline2._zTime = -_tinyNum;
  }
}, _addToTimeline = function _addToTimeline2(timeline2, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition(timeline2, position, child) : timeline2._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
  _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
  _isFromOrFromStart(child) || (timeline2._recent = child);
  skipChecks || _postAddChecks(timeline2, child);
  timeline2._ts < 0 && _alignPlayhead(timeline2, timeline2._tTime);
  return timeline2;
}, _scrollTrigger = function _scrollTrigger2(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
}, _attemptInitTween = function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);
  if (!tween._initted) {
    return 1;
  }
  if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);
    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
}, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
}, _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
}, _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
  if (repeatDelay && tween._repeat) {
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }
  if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      return;
    }
    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
    suppressEvents || (suppressEvents = totalTime && !prevIteration);
    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);
      if (!suppressEvents && !_reverting$1) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
}, _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
  var child;
  if (time > prevTime) {
    child = animation._first;
    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }
      child = child._next;
    }
  } else {
    child = animation._last;
    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }
      child = child._prev;
    }
  }
}, _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
}, _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
}, _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
}, _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
  var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur, i, offset, isPercent;
  if (_isString(position) && (isNaN(position) || position in labels)) {
    offset = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");
    if (offset === "<" || offset === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }
    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }
    offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
    if (isPercent && percentAnimation) {
      offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }
    return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
  }
  return position == null ? clippedDuration : +position;
}, _createTweenType = function _createTweenType2(type, params, timeline2) {
  var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline2;
  if (type) {
    irVars = vars;
    parent = timeline2;
    while (parent && !("immediateRender" in irVars)) {
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }
    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
  }
  return new Tween(params[0], vars, params[varsIndex + 1]);
}, _conditionalReturn = function _conditionalReturn2(value, func) {
  return value || value === 0 ? func(value) : func;
}, _clamp = function _clamp2(min, max, value) {
  return value < min ? min : value > max ? max : value;
}, getUnit = function getUnit2(value, v) {
  return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
}, clamp = function clamp2(min, max, value) {
  return _conditionalReturn(value, function(v) {
    return _clamp(min, max, v);
  });
}, _slice = [].slice, _isArrayLike = function _isArrayLike2(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
}, _flatten = function _flatten2(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }
  return ar.forEach(function(value) {
    var _accumulator;
    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
}, toArray = function toArray2(value, scope, leaveStrings) {
  return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
}, selector = function selector2(value) {
  value = toArray(value)[0] || _warn("Invalid scope") || {};
  return function(v) {
    var el = value.current || value.nativeElement || value;
    return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
  };
}, shuffle = function shuffle2(a) {
  return a.sort(function() {
    return 0.5 - Math.random();
  });
}, distribute = function distribute2(v) {
  if (_isFunction(v)) {
    return v;
  }
  var vars = _isObject(v) ? v : {
    each: v
  }, ease2 = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
  if (_isString(from)) {
    ratioX = ratioY = {
      center: 0.5,
      edges: 0.5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }
  return function(i, target, a) {
    var l = (a || vars).length, distances = cache[l], originX, originY, x, y, d, j, max, min, wrapAt;
    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
      if (!wrapAt) {
        max = -_bigNum$1;
        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
        }
        wrapAt < l && wrapAt--;
      }
      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
      originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum$1;
      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }
      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0;
      ease2 = ease2 && l < 0 ? _invertEase(ease2) : ease2;
    }
    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease2 ? ease2(l) : l) * distances.v) + distances.u;
  };
}, _roundModifier = function _roundModifier2(v) {
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
  return function(raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
  };
}, snap = function snap2(snapTo, value) {
  var isArray = _isArray(snapTo), radius, is2D;
  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum$1;
    if (snapTo.values) {
      snapTo = toArray(snapTo.values);
      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius;
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }
  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function(raw) {
    var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum$1, closest = 0, i = snapTo.length, dx, dy;
    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }
      if (dx < min) {
        min = dx;
        closest = i;
      }
    }
    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
}, random = function random2(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
}, pipe = function pipe2() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }
  return function(value) {
    return functions.reduce(function(v, f) {
      return f(v);
    }, value);
  };
}, unitize = function unitize2(func, unit) {
  return function(value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
}, normalize = function normalize2(min, max, value) {
  return mapRange(min, max, 0, 1, value);
}, _wrapArray = function _wrapArray2(a, wrapper, value) {
  return _conditionalReturn(value, function(index) {
    return a[~~wrapper(index)];
  });
}, wrap = function wrap2(min, max, value) {
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max) : _conditionalReturn(value, function(value2) {
    return (range + (value2 - min) % range) % range + min;
  });
}, wrapYoyo = function wrapYoyo2(min, max, value) {
  var range = max - min, total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max) : _conditionalReturn(value, function(value2) {
    value2 = (total + (value2 - min) % total) % total || 0;
    return min + (value2 > range ? total - value2 : value2);
  });
}, _replaceRandom = function _replaceRandom2(value) {
  var prev = 0, s = "", i, nums, end, isArray;
  while (~(i = value.indexOf("random(", prev))) {
    end = value.indexOf(")", i);
    isArray = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end + 1;
  }
  return s + value.substr(prev, value.length - prev);
}, mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin, outRange = outMax - outMin;
  return _conditionalReturn(value, function(value2) {
    return outMin + ((value2 - inMin) / inRange * outRange || 0);
  });
}, interpolate = function interpolate2(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function(p2) {
    return (1 - p2) * start + p2 * end;
  };
  if (!func) {
    var isString = _isString(start), master = {}, p, i, interpolators, l, il;
    progress === true && (mutate = 1) && (progress = null);
    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;
      for (i = 1; i < l; i++) {
        interpolators.push(interpolate2(start[i - 1], start[i]));
      }
      l--;
      func = function func2(p2) {
        p2 *= l;
        var i2 = Math.min(il, ~~p2);
        return interpolators[i2](p2 - i2);
      };
      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }
    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }
      func = function func2(p2) {
        return _renderPropTweens(p2, master) || (isString ? start.p : start);
      };
    }
  }
  return _conditionalReturn(progress, func);
}, _getLabelInDirection = function _getLabelInDirection2(timeline2, fromTime, backward) {
  var labels = timeline2.labels, min = _bigNum$1, p, distance, label;
  for (p in labels) {
    distance = labels[p] - fromTime;
    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }
  return label;
}, _callback = function _callback2(animation, type, executeLazyFirst) {
  var v = animation.vars, callback = v[type], prevContext = _context, context3 = animation._ctx, params, scope, result;
  if (!callback) {
    return;
  }
  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender();
  context3 && (_context = context3);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context = prevContext;
  return result;
}, _interrupt = function _interrupt2(animation) {
  _removeFromParent(animation);
  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
}, _quickTween, _registerPluginQueue = [], _createPlugin = function _createPlugin2(config3) {
  if (!config3) return;
  config3 = !config3.name && config3["default"] || config3;
  if (_windowExists$1() || config3.headless) {
    var name = config3.name, isFunc = _isFunction(config3), Plugin = name && !isFunc && config3.init ? function() {
      this._props = [];
    } : config3, instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    }, statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults(Plugin, _setDefaults(_copyExcluding(config3, instanceDefaults), statics));
      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
      _plugins[Plugin.prop = name] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config3);
  }
}, _255 = 255, _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
}, _hue = function _hue2(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
}, splitColor = function splitColor2(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max, min, d, wasHSL;
  if (!a) {
    if (v.substr(-1) === ",") {
      v = v.substr(0, v.length - 1);
    }
    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }
      if (v.length === 9) {
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }
      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);
      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1);
        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }
    a = a.map(Number);
  }
  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    a[0] = ~~(h + 0.5);
    a[1] = ~~(s * 100 + 0.5);
    a[2] = ~~(l * 100 + 0.5);
  }
  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
}, _colorOrderData = function _colorOrderData2(v) {
  var values = [], c = [], i = -1;
  v.split(_colorExp).forEach(function(v2) {
    var a = v2.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
}, _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
  var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
  if (!colors) {
    return s;
  }
  colors = colors.map(function(color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });
  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;
    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }
  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;
    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }
  return result + shell[l];
}, _colorExp = (function() {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }
  return new RegExp(s + ")", "gi");
})(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter2(a) {
  var combined = a.join(" "), toHSL;
  _colorExp.lastIndex = 0;
  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
    return true;
  }
}, _tickerActive, _ticker = (function() {
  var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v) {
    var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame;
    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;
    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1e3;
      _self.time = time = time / 1e3;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }
    manual || (_id = _req(_tick2));
    if (dispatch) {
      for (_i = 0; _i < _listeners2.length; _i++) {
        _listeners2[_i](time, _delta, frame, v);
      }
    }
  };
  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1e3 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists$1()) {
          _win$1 = _coreInitted = window;
          _doc$1 = _win$1.document || {};
          _globals.gsap = gsap;
          (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap.version);
          _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});
          _registerPluginQueue.forEach(_createPlugin);
        }
        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();
        _req = _raf || function(f) {
          return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
        };
        _tickerActive = 1;
        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity;
      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    },
    fps: function fps(_fps) {
      _gap = 1e3 / (_fps || 240);
      _nextTime = _self.time * 1e3 + _gap;
    },
    add: function add(callback, once, prioritize) {
      var func = once ? function(t, d, f, v) {
        callback(t, d, f, v);
        _self.remove(func);
      } : callback;
      _self.remove(callback);
      _listeners2[prioritize ? "unshift" : "push"](func);
      _wake();
      return func;
    },
    remove: function remove(callback, i) {
      ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners2
  };
  return _self;
})(), _wake = function _wake2() {
  return !_tickerActive && _ticker.wake();
}, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString2(value) {
  var obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i = 1, l = split.length, index, val, parsedVal;
  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }
  return obj;
}, _valueInParentheses = function _valueInParentheses2(value) {
  var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
}, _configEaseFromString = function _configEaseFromString2(name) {
  var split = (name + "").split("("), ease2 = _easeMap[split[0]];
  return ease2 && split.length > 1 && ease2.config ? ease2.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease2;
}, _invertEase = function _invertEase2(ease2) {
  return function(p) {
    return 1 - ease2(1 - p);
  };
}, _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
  var child = timeline2._first, ease2;
  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase2(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase2(child.timeline, isYoyo);
      } else {
        ease2 = child._ease;
        child._ease = child._yEase;
        child._yEase = ease2;
        child._yoyo = isYoyo;
      }
    }
    child = child._next;
  }
}, _parseEase = function _parseEase2(ease2, defaultEase) {
  return !ease2 ? defaultEase : (_isFunction(ease2) ? ease2 : _easeMap[ease2] || _configEaseFromString(ease2)) || defaultEase;
}, _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut2(p) {
      return 1 - easeIn(1 - p);
    };
  }
  if (easeInOut === void 0) {
    easeInOut = function easeInOut2(p) {
      return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }
  var ease2 = {
    easeIn,
    easeOut,
    easeInOut
  }, lowercaseName;
  _forEachName(names, function(name) {
    _easeMap[name] = _globals[name] = ease2;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
    for (var p in ease2) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease2[p];
    }
  });
  return ease2;
}, _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
  return function(p) {
    return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
  };
}, _configElastic = function _configElastic2(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  }, ease2 = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  p2 = _2PI / p2;
  ease2.config = function(amplitude2, period2) {
    return _configElastic2(type, amplitude2, period2);
  };
  return ease2;
}, _configBack = function _configBack2(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }
  var easeOut = function easeOut2(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  }, ease2 = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  ease2.config = function(overshoot2) {
    return _configBack2(type, overshoot2);
  };
  return ease2;
};
_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
  var power = i < 5 ? i + 1 : i;
  _insertEase(name + ",Power" + (power - 1), i ? function(p) {
    return Math.pow(p, power);
  } : function(p) {
    return p;
  }, function(p) {
    return 1 - Math.pow(1 - p, power);
  }, function(p) {
    return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});
_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
(function(n, c) {
  var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
  };
  _insertEase("Bounce", function(p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);
_insertEase("Expo", function(p) {
  return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
});
_insertEase("Circ", function(p) {
  return -(_sqrt(1 - p * p) - 1);
});
_insertEase("Sine", function(p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});
_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }
    var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
    return function(p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults.ease = _easeMap["quad.out"];
_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
  return _callbackNames += name + "," + name + "Params,";
});
var GSCache = function GSCache2(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
var Animation = /* @__PURE__ */ (function() {
  function Animation2(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;
    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }
    this._ts = 1;
    _setDuration(this, +vars.duration, 1, 1);
    this.data = vars.data;
    if (_context) {
      this._ctx = _context;
      _context.data.push(this);
    }
    _tickerActive || _ticker.wake();
  }
  var _proto = Animation2.prototype;
  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }
    return this._delay;
  };
  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };
  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }
    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };
  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();
    if (!arguments.length) {
      return this._tTime;
    }
    var parent = this._dp;
    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);
      !parent._dp || parent.parent || _postAddChecks(parent, this);
      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }
        parent = parent.parent;
      }
      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }
    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      this._ts || (this._pTime = _totalTime);
      _lazySafeRender(this, _totalTime, suppressEvents);
    }
    return this;
  };
  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
  };
  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  };
  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  };
  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  };
  _proto.timeScale = function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts;
    }
    if (this._rts === value) {
      return this;
    }
    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
    this.totalTime(_clamp(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);
    _setEnd(this);
    return _recacheAncestors(this);
  };
  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }
    if (this._ps !== value) {
      this._ps = value;
      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
        this._ts = this._act = 0;
      } else {
        _wake();
        this._ts = this._rts;
        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
      }
    }
    return this;
  };
  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }
    return this._start;
  };
  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  };
  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp;
    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };
  _proto.revert = function revert(config3) {
    if (config3 === void 0) {
      config3 = _revertConfig;
    }
    var prevIsReverting = _reverting$1;
    _reverting$1 = config3;
    if (_isRevertWorthy(this)) {
      this.timeline && this.timeline.revert(config3);
      this.totalTime(-0.01, config3.suppressEvents);
    }
    this.data !== "nested" && config3.kill !== false && this.kill();
    _reverting$1 = prevIsReverting;
    return this;
  };
  _proto.globalTime = function globalTime(rawTime) {
    var animation = this, time = arguments.length ? rawTime : animation.rawTime();
    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }
    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
  };
  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }
    return this._repeat === -2 ? Infinity : this._repeat;
  };
  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;
      _onUpdateTotalDuration(this);
      return time ? this.time(time) : this;
    }
    return this._rDelay;
  };
  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }
    return this._yoyo;
  };
  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };
  _proto.restart = function restart(includeDelay, suppressEvents) {
    this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    this._dur || (this._zTime = -_tinyNum);
    return this;
  };
  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };
  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };
  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };
  _proto.resume = function resume() {
    return this.paused(false);
  };
  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
      return this;
    }
    return this._rts < 0;
  };
  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };
  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp, start = this._start, rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };
  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;
    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }
      return this;
    }
    return vars[type];
  };
  _proto.then = function then(onFulfilled) {
    var self = this;
    return new Promise(function(resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
        var _then = self.then;
        self.then = null;
        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };
      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };
  _proto.kill = function kill() {
    _interrupt(this);
  };
  return Animation2;
})();
_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
var Timeline = /* @__PURE__ */ (function(_Animation) {
  _inheritsLoose(Timeline2, _Animation);
  function Timeline2(vars, position) {
    var _this;
    if (vars === void 0) {
      vars = {};
    }
    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }
  var _proto2 = Timeline2.prototype;
  _proto2.to = function to(targets, vars, position) {
    _createTweenType(0, arguments, this);
    return this;
  };
  _proto2.from = function from(targets, vars, position) {
    _createTweenType(1, arguments, this);
    return this;
  };
  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);
    return this;
  };
  _proto2.set = function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };
  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  };
  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };
  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.render = function render4(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }
      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;
      if (crossingStart) {
        dur || (prevTime = this._zTime);
        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }
      if (this._repeat) {
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          }
          time > dur && (time = dur);
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime;
          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            return this;
          }
          dur = this._dur;
          tDur = this._tDur;
          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -1e-4;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }
          this._lock = 0;
          if (!this._ts && !prevPaused) {
            return this;
          }
          _propagateYoyoEase(this, isYoyo);
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }
      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale;
      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      if (time >= prevTime && totalTime >= 0) {
        child = this._first;
        while (child) {
          next = child._next;
          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum);
              break;
            }
          }
          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time;
        while (child) {
          next = child._prev;
          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && _isRevertWorthy(child));
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
              break;
            }
          }
          child = next;
        }
      }
      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
        if (this._ts) {
          this._start = prevStart;
          _setEnd(this);
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
        if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
          if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
              _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }
      }
    }
    return this;
  };
  _proto2.add = function add(child, position) {
    var _this2 = this;
    _isNumber(position) || (position = _parsePosition(this, position, child));
    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function(obj) {
          return _this2.add(obj, position);
        });
        return this;
      }
      if (_isString(child)) {
        return this.addLabel(child, position);
      }
      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }
    return this !== child ? _addToTimeline(this, child, position) : this;
  };
  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }
    if (tweens === void 0) {
      tweens = true;
    }
    if (timelines === void 0) {
      timelines = true;
    }
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum$1;
    }
    var a = [], child = this._first;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }
      child = child._next;
    }
    return a;
  };
  _proto2.getById = function getById2(id) {
    var animations = this.getChildren(1, 1, 1), i = animations.length;
    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };
  _proto2.remove = function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }
    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }
    child.parent === this && _removeLinkedListItem(this, child);
    if (child === this._recent) {
      this._recent = this._last;
    }
    return _uncache(this);
  };
  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }
    this._forcing = 1;
    if (!this._dp && this._ts) {
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }
    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
    this._forcing = 0;
    return this;
  };
  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };
  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };
  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };
  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);
    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }
      child = child._next;
    }
  };
  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }
    return this;
  };
  _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
    var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children;
    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }
      child = child._next;
    }
    return a;
  };
  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};
    var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();
        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }
        _onStart && _onStart.apply(tween, onStartParams || []);
      }
    }, vars));
    return immediateRender ? tween.render(0) : tween;
  };
  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };
  _proto2.recent = function recent() {
    return this._recent;
  };
  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };
  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };
  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };
  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }
    var child = this._first, labels = this.labels, p;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }
      child = child._next;
    }
    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }
    return _uncache(this);
  };
  _proto2.invalidate = function invalidate(soft) {
    var child = this._first;
    this._lock = 0;
    while (child) {
      child.invalidate(soft);
      child = child._next;
    }
    return _Animation.prototype.invalidate.call(this, soft);
  };
  _proto2.clear = function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }
    var child = this._first, next;
    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }
    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };
  _proto2.totalDuration = function totalDuration(value) {
    var max = 0, self = this, child = self._last, prevStart = _bigNum$1, prev, start, parent;
    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }
    if (self._dirty) {
      parent = self.parent;
      while (child) {
        prev = child._prev;
        child._dirty && child.totalDuration();
        start = child._start;
        if (start > prevStart && self._sort && child._ts && !self._lock) {
          self._lock = 1;
          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }
        if (start < 0 && child._ts) {
          max -= start;
          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start / self._ts;
            self._time -= start;
            self._tTime -= start;
          }
          self.shiftChildren(-start, false, -Infinity);
          prevStart = 0;
        }
        child._end > max && child._ts && (max = child._end);
        child = prev;
      }
      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);
      self._dirty = 0;
    }
    return self._tDur;
  };
  Timeline2.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
      _lastRenderedFrame = _ticker.frame;
    }
    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) {
        if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }
          child || _ticker.sleep();
        }
      }
    }
  };
  return Timeline2;
})(Animation);
_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }
  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop);
    start = a[0];
    end = a[1];
  }
  startNums = start.match(_complexStringNumExp) || [];
  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);
    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }
    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0;
      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }
  pt.c = index < end.length ? end.substring(index, end.length) : "";
  pt.fp = funcParam;
  if (_relExp.test(end) || hasRandom) {
    pt.e = 0;
  }
  this._pt = pt;
  return pt;
}, _addPropTween = function _addPropTween2(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }
    if (end.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
      if (pt || pt === 0) {
        end = pt;
      }
    }
  }
  if (!optional || parsedStart !== end || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end) && end !== "") {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }
    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
}, _processVars = function _processVars2(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }
  var copy = {}, p;
  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }
  return copy;
}, _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;
  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
      i = plugin._props.length;
      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }
  return plugin;
}, _overwritingTween, _forceAllPropTweens, _initTween = function _initTween2(tween, time, tTime) {
  var vars = tween.vars, ease2 = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
  tl && (!keyframes || !ease2) && (ease2 = "none");
  tween._ease = _parseEase(ease2, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease2 : yoyoEase, _defaults.ease)) : 0;
  if (yoyoEase && tween._yoyo && !tween._repeat) {
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }
  tween._from = !tl && !!vars.runBackwards;
  if (!tl || keyframes && !vars.stagger) {
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop];
    cleanVars = _copyExcluding(vars, _reservedProps);
    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1);
      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
      prevStartAt._lazy = 0;
    }
    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function() {
          return _callback(tween, "onUpdate");
        },
        stagger: 0
      }, startAt)));
      tween._startAt._dp = 0;
      tween._startAt._sat = tween;
      time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          time && (tween._zTime = time);
          return;
        }
      }
    } else if (runBackwards && dur) {
      if (!prevStartAt) {
        time && (immediateRender = false);
        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent
          //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars);
        _removeFromParent(tween._startAt = Tween.set(targets, p));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;
        if (!immediateRender) {
          _initTween2(tween._startAt, _tinyNum, _tinyNum);
        } else if (!time) {
          return;
        }
      }
    }
    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;
    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
      index = fullTargets === targets ? i : fullTargets.indexOf(target);
      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
        plugin._props.forEach(function(name) {
          ptLookup[name] = pt;
        });
        plugin.priority && (hasPriority = 1);
      }
      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }
      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;
        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
        overwritten = !tween.parent;
        _overwritingTween = 0;
      }
      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }
    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween);
  }
  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten;
  keyframes && time <= 0 && tl.render(_bigNum$1, true, true);
}, _updatePropTweens = function _updatePropTweens2(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;
    while (i--) {
      pt = lookup[i][property];
      if (pt && pt.d && pt.d._pt) {
        pt = pt.d._pt;
        while (pt && pt.p !== property && pt.fp !== property) {
          pt = pt._next;
        }
      }
      if (!pt) {
        _forceAllPropTweens = 1;
        tween.vars[property] = "+=0";
        _initTween(tween, time);
        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1;
      }
      ptCache.push(pt);
    }
  }
  i = ptCache.length;
  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT;
    pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e));
    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
  }
}, _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
  if (!propertyAliases) {
    return vars;
  }
  copy = _merge({}, vars);
  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;
      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }
  return copy;
}, _parseKeyframe = function _parseKeyframe2(prop, obj, allProps, easeEach) {
  var ease2 = obj.ease || easeEach || "power1.inOut", p, a;
  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []);
    obj.forEach(function(value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease2
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease2
      });
    }
  }
}, _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
}, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
  return _staggerPropsToSkip[name] = 1;
});
var Tween = /* @__PURE__ */ (function(_Animation2) {
  _inheritsLoose(Tween2, _Animation2);
  function Tween2(targets, vars, position, skipInherit) {
    var _this3;
    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }
    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults2 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = [];
    _this3._overwrite = overwrite;
    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults2 || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      });
      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;
      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);
        if (_isObject(stagger)) {
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }
        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i];
          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
          if (!stagger && l === 1 && copy.delay) {
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }
          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }
        tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
      } else if (keyframes) {
        _inheritDefaults(_setDefaults(tl.vars.defaults, {
          ease: "none"
        }));
        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0, a, kf, v;
        if (_isArray(keyframes)) {
          keyframes.forEach(function(frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration();
        } else {
          copy = {};
          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }
          for (p in copy) {
            a = copy[p].sort(function(a2, b) {
              return a2.t - b.t;
            });
            time = 0;
            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }
          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          });
        }
      }
      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0;
    }
    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);
      _globalTimeline.killTweensOf(parsedTargets);
      _overwritingTween = 0;
    }
    _addToTimeline(parent, _assertThisInitialized(_this3), position);
    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);
    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum;
      _this3.render(Math.max(0, -delay) || 0);
    }
    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }
  var _proto3 = Tween2.prototype;
  _proto3.render = function render4(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
      time = tTime;
      timeline2 = this.timeline;
      if (this._repeat) {
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          } else if (time > dur) {
            time = dur;
          }
        }
        isYoyo = this._yoyo && iteration & 1;
        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          this._tTime = tTime;
          return this;
        }
        if (iteration !== prevIteration) {
          timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
          if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
            this._lock = force = 1;
            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }
      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0;
          return this;
        }
        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          return this;
        }
        if (dur !== this._dur) {
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._tTime = tTime;
      this._time = time;
      if (!this._act && this._ts) {
        this._act = 1;
        this._lazy = 0;
      }
      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      pt = this._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      timeline2 && timeline2.render(totalTime < 0 ? totalTime : timeline2._dur * timeline2._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
        _callback(this, "onUpdate");
      }
      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }
    return this;
  };
  _proto3.targets = function targets() {
    return this._targets;
  };
  _proto3.invalidate = function invalidate(soft) {
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  };
  _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur);
    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start, startIsRelative, 1);
    }
    _alignPlayhead(this, 0);
    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };
  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }
    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
      return this;
    }
    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
      return this;
    }
    var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }
    overwrittenProps = this._op = this._op || [];
    if (vars !== "all") {
      if (_isString(vars)) {
        p = {};
        _forEachName(vars, function(name) {
          return p[name] = 1;
        });
        vars = p;
      }
      vars = _addAliasesToVars(parsedTargets, vars);
    }
    i = parsedTargets.length;
    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];
        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }
        for (p in props) {
          pt = curLookup && curLookup[p];
          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }
            delete curLookup[p];
          }
          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }
    this._initted && !this._pt && firstPT && _interrupt(this);
    return this;
  };
  Tween2.to = function to(targets, vars) {
    return new Tween2(targets, vars, arguments[2]);
  };
  Tween2.from = function from(targets, vars) {
    return _createTweenType(1, arguments);
  };
  Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween2(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  };
  Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  };
  Tween2.set = function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween2(targets, vars);
  };
  Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };
  return Tween2;
})(Animation);
_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
_forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
  Tween[name] = function() {
    var tl = new Timeline(), params = _slice.call(arguments, 0);
    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
var _setterPlain = function _setterPlain2(target, property, value) {
  return target[property] = value;
}, _setterFunc = function _setterFunc2(target, property, value) {
  return target[property](value);
}, _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
  return target[property](data.fp, value);
}, _setterAttribute = function _setterAttribute2(target, property, value) {
  return target.setAttribute(property, value);
}, _getSetter = function _getSetter2(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
}, _renderPlain = function _renderPlain2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
}, _renderBoolean = function _renderBoolean2(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
}, _renderComplexString = function _renderComplexString2(ratio, data) {
  var pt = data._pt, s = "";
  if (!ratio && data.b) {
    s = data.b;
  } else if (ratio === 1 && data.e) {
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
      pt = pt._next;
    }
    s += data.c;
  }
  data.set(data.t, data.p, s, data);
}, _renderPropTweens = function _renderPropTweens2(ratio, data) {
  var pt = data._pt;
  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
}, _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
  var pt = this._pt, next;
  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
}, _killPropTweensOf = function _killPropTweensOf2(property) {
  var pt = this._pt, hasNonDependentRemaining, next;
  while (pt) {
    next = pt._next;
    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }
    pt = next;
  }
  return !hasNonDependentRemaining;
}, _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
}, _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
  var pt = parent._pt, next, pt2, first, last;
  while (pt) {
    next = pt._next;
    pt2 = first;
    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }
    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }
    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }
    pt = next;
  }
  parent._pt = first;
};
var PropTween = /* @__PURE__ */ (function() {
  function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;
    if (next) {
      next._prev = this;
    }
  }
  var _proto4 = PropTween2.prototype;
  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set;
    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target;
    this.tween = tween;
  };
  return PropTween2;
})();
_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
  return _reservedProps[name] = 1;
});
_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
var _media = [], _listeners = {}, _emptyArray = [], _lastMediaTime = 0, _contextID = 0, _dispatch = function _dispatch2(type) {
  return (_listeners[type] || _emptyArray).map(function(f) {
    return f();
  });
}, _onMediaChange = function _onMediaChange2() {
  var time = Date.now(), matches = [];
  if (time - _lastMediaTime > 2) {
    _dispatch("matchMediaInit");
    _media.forEach(function(c) {
      var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
      for (p in queries) {
        match = _win$1.matchMedia(queries[p]).matches;
        match && (anyMatch = 1);
        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }
      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });
    _dispatch("matchMediaRevert");
    matches.forEach(function(c) {
      return c.onMatch(c, function(func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;
    _dispatch("matchMedia");
  }
};
var Context = /* @__PURE__ */ (function() {
  function Context2(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = [];
    this.isReverted = false;
    this.id = _contextID++;
    func && this.add(func);
  }
  var _proto5 = Context2.prototype;
  _proto5.add = function add(name, func, scope) {
    if (_isFunction(name)) {
      scope = func;
      func = name;
      name = _isFunction;
    }
    var self = this, f = function f2() {
      var prev = _context, prevSelector = self.selector, result;
      prev && prev !== self && prev.data.push(self);
      scope && (self.selector = selector(scope));
      _context = self;
      result = func.apply(self, arguments);
      _isFunction(result) && self._r.push(result);
      _context = prev;
      self.selector = prevSelector;
      self.isReverted = false;
      return result;
    };
    self.last = f;
    return name === _isFunction ? f(self, function(func2) {
      return self.add(null, func2);
    }) : name ? self[name] = f : f;
  };
  _proto5.ignore = function ignore(func) {
    var prev = _context;
    _context = null;
    func(this);
    _context = prev;
  };
  _proto5.getTweens = function getTweens() {
    var a = [];
    this.data.forEach(function(e) {
      return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  };
  _proto5.clear = function clear() {
    this._r.length = this.data.length = 0;
  };
  _proto5.kill = function kill(revert, matchMedia2) {
    var _this4 = this;
    if (revert) {
      (function() {
        var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
        while (i2--) {
          t = _this4.data[i2];
          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function(tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        }
        tweens.map(function(t2) {
          return {
            g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
            t: t2
          };
        }).sort(function(a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function(o) {
          return o.t.revert(revert);
        });
        i2 = _this4.data.length;
        while (i2--) {
          t = _this4.data[i2];
          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill();
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }
        _this4._r.forEach(function(f) {
          return f(revert, _this4);
        });
        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function(e) {
        return e.kill && e.kill();
      });
    }
    this.clear();
    if (matchMedia2) {
      var i = _media.length;
      while (i--) {
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  };
  _proto5.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  return Context2;
})();
var MatchMedia = /* @__PURE__ */ (function() {
  function MatchMedia2(scope) {
    this.contexts = [];
    this.scope = scope;
    _context && _context.data.push(this);
  }
  var _proto6 = MatchMedia2.prototype;
  _proto6.add = function add(conditions, func, scope) {
    _isObject(conditions) || (conditions = {
      matches: conditions
    });
    var context3 = new Context(0, scope || this.scope), cond = context3.conditions = {}, mq, p, active;
    _context && !context3.selector && (context3.selector = _context.selector);
    this.contexts.push(context3);
    func = context3.add("onMatch", func);
    context3.queries = conditions;
    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win$1.matchMedia(conditions[p]);
        if (mq) {
          _media.indexOf(context3) < 0 && _media.push(context3);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }
    active && func(context3, function(f) {
      return context3.add(null, f);
    });
    return this;
  };
  _proto6.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  _proto6.kill = function kill(revert) {
    this.contexts.forEach(function(c) {
      return c.kill(revert, true);
    });
  };
  return MatchMedia2;
})();
var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    args.forEach(function(config3) {
      return _createPlugin(config3);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]);
    var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
    unit === "native" && (unit = "");
    return !target ? target : !property ? function(property2, unit2, uncache2) {
      return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);
    if (target.length > 1) {
      var setters = target.map(function(t) {
        return gsap.quickSetter(t, property, unit);
      }), l = setters.length;
      return function(value) {
        var i = l;
        while (i--) {
          setters[i](value);
        }
      };
    }
    target = target[0] || {};
    var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
      var p2 = new Plugin();
      _quickTween._pt = 0;
      p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p2.render(1, p2);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);
    return Plugin ? setter : function(value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  },
  quickTo: function quickTo(target, property, vars) {
    var _setDefaults22;
    var tween = gsap.to(target, _setDefaults((_setDefaults22 = {}, _setDefaults22[property] = "+=0.1", _setDefaults22.paused = true, _setDefaults22.stagger = 0, _setDefaults22), vars || {})), func = function func2(value, start, startIsRelative) {
      return tween.resetTo(property, value, start, startIsRelative);
    };
    func.tween = tween;
    return func;
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  },
  config: function config2(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref3) {
    var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults2 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function(pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });
    _effects[name] = function(targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults2), tl);
    };
    if (extendTimeline) {
      Timeline.prototype[name] = function(targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease2) {
    _easeMap[name] = _parseEase(ease2);
  },
  parseEase: function parseEase(ease2, defaultEase) {
    return arguments.length ? _parseEase(ease2, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }
    var tl = new Timeline(vars), child, next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
    _globalTimeline.remove(tl);
    tl._dp = 0;
    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;
    while (child) {
      next = child._next;
      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }
      child = next;
    }
    _addToTimeline(_globalTimeline, tl, 0);
    return tl;
  },
  context: function context(func, scope) {
    return func ? new Context(func, scope) : _context;
  },
  matchMedia: function matchMedia(scope) {
    return new MatchMedia(scope);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return _media.forEach(function(c) {
      var cond = c.conditions, found, p;
      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }
      found && c.revert();
    }) || _onMediaChange();
  },
  addEventListener: function addEventListener(type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    var a = _listeners[type], i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  },
  utils: {
    wrap,
    wrapYoyo,
    distribute,
    random,
    snap,
    normalize,
    getUnit,
    clamp,
    splitColor,
    toArray,
    selector,
    mapRange,
    pipe,
    unitize,
    interpolate,
    shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween,
    globals: _addGlobal,
    Tween,
    Timeline,
    Animation,
    getCache: _getCache,
    _removeLinkedListItem,
    reverting: function reverting() {
      return _reverting$1;
    },
    context: function context2(toAdd) {
      if (toAdd && _context) {
        _context.data.push(toAdd);
        toAdd._ctx = _context;
      }
      return _context;
    },
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }
  }
};
_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
  return _gsap[name] = Tween[name];
});
_ticker.add(Timeline.updateRoot);
_quickTween = _gsap.to({}, {
  duration: 0
});
var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
  var pt = plugin._pt;
  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }
  return pt;
}, _addModifiers = function _addModifiers2(tween, modifiers) {
  var targets = tween._targets, p, i, pt;
  for (p in modifiers) {
    i = targets.length;
    while (i--) {
      pt = tween._ptLookup[i][p];
      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          pt = _getPluginPropTween(pt, p);
        }
        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
}, _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
  return {
    name,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init4(target, vars, tween) {
      tween._onInit = function(tween2) {
        var temp, p;
        if (_isString(vars)) {
          temp = {};
          _forEachName(vars, function(name2) {
            return temp[name2] = 1;
          });
          vars = temp;
        }
        if (modifier) {
          temp = {};
          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }
          vars = temp;
        }
        _addModifiers(tween2, vars);
      };
    }
  };
};
var gsap = _gsap.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;
    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v;
      this._props.push(p);
    }
  },
  render: function render(ratio, data) {
    var pt = data._pt;
    while (pt) {
      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
      pt = pt._next;
    }
  }
}, {
  name: "endArray",
  headless: 1,
  init: function init2(target, value) {
    var i = value.length;
    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
Tween.version = Timeline.version = gsap.version = "3.13.0";
_coreReady = 1;
_windowExists$1() && _wake();
_easeMap.Power0;
_easeMap.Power1;
_easeMap.Power2;
_easeMap.Power3;
_easeMap.Power4;
_easeMap.Linear;
_easeMap.Quad;
_easeMap.Cubic;
_easeMap.Quart;
_easeMap.Quint;
_easeMap.Strong;
_easeMap.Elastic;
_easeMap.Back;
_easeMap.SteppedEase;
_easeMap.Bounce;
_easeMap.Sine;
_easeMap.Expo;
_easeMap.Circ;
var _win, _doc, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, _reverting, _windowExists2 = function _windowExists3() {
  return typeof window !== "undefined";
}, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, _bigNum = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, _renderCSSProp = function _renderCSSProp2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
}, _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
}, _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
}, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
}, _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
  return target.style[property] = value;
}, _setterCSSProp = function _setterCSSProp2(target, property, value) {
  return target.style.setProperty(property, value);
}, _setterTransform = function _setterTransform2(target, property, value) {
  return target._gsap[property] = value;
}, _setterScale = function _setterScale2(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
}, _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache.scaleX = cache.scaleY = value;
  cache.renderTransform(ratio, cache);
}, _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache[property] = value;
  cache.renderTransform(ratio, cache);
}, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _saveStyle = function _saveStyle2(property, isNotCSS) {
  var _this = this;
  var target = this.target, style = target.style, cache = target._gsap;
  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};
    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function(a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property);
      property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function(p) {
        return _saveStyle2.call(_this, p, isNotCSS);
      });
    }
    if (this.props.indexOf(_transformProp) >= 0) {
      return;
    }
    if (cache.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }
    property = _transformProp;
  }
  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
}, _removeIndependentTransforms = function _removeIndependentTransforms2(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
}, _revertStyle = function _revertStyle2() {
  var props = this.props, target = this.target, style = target.style, cache = target._gsap, i, p;
  for (i = 0; i < props.length; i += 3) {
    if (!props[i + 1]) {
      props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
    } else if (props[i + 1] === 2) {
      target[props[i]](props[i + 2]);
    } else {
      target[props[i]] = props[i + 2];
    }
  }
  if (this.tfm) {
    for (p in this.tfm) {
      cache[p] = this.tfm[p];
    }
    if (cache.svg) {
      cache.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }
    i = _reverting();
    if ((!i || !i.isStart) && !style[_transformProp]) {
      _removeIndependentTransforms(style);
      if (cache.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache.zOrigin + "px";
        cache.zOrigin = 0;
        cache.renderTransform();
      }
      cache.uncache = 1;
    }
  }
}, _getStyleSaver = function _getStyleSaver2(target, properties) {
  var saver = {
    target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap.core.getCache(target);
  properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
    return saver.save(p);
  });
  return saver;
}, _supports3D, _createElement = function _createElement2(type, ns) {
  var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type);
  return e && e.style ? e : _doc.createElement(type);
}, _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
}, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
  var e = element || _tempDiv, s = e.style, i = 5;
  if (property in s && !preferPrefix) {
    return property;
  }
  property = property.charAt(0).toUpperCase() + property.substr(1);
  while (i-- && !(_prefixes[i] + property in s)) {
  }
  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
}, _initCore = function _initCore2() {
  if (_windowExists2() && window.document) {
    _win = window;
    _doc = _win.document;
    _docElement = _doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
    _supports3D = !!_checkPropPrefix("perspective");
    _reverting = gsap.core.reverting;
    _pluginInitted = 1;
  }
}, _getReparentedCloneBBox = function _getReparentedCloneBBox2(target) {
  var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone = target.cloneNode(true), bbox;
  clone.style.display = "block";
  svg.appendChild(clone);
  _docElement.appendChild(svg);
  try {
    bbox = clone.getBBox();
  } catch (e) {
  }
  svg.removeChild(clone);
  _docElement.removeChild(svg);
  return bbox;
}, _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
  var i = attributesArray.length;
  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
}, _getBBox = function _getBBox2(target) {
  var bounds, cloned;
  try {
    bounds = target.getBBox();
  } catch (error) {
    bounds = _getReparentedCloneBBox(target);
    cloned = 1;
  }
  bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
}, _isSVG = function _isSVG2(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
}, _removeProperty = function _removeProperty2(target, property) {
  if (property) {
    var style = target.style, first2Chars;
    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }
    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);
      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        property = "-" + property;
      }
      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      style.removeAttribute(property);
    }
  }
}, _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;
  plugin._props.push(property);
  return pt;
}, _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
}, _nonStandardLayouts = {
  grid: 1,
  flex: 1
}, _convertToUnit = function _convertToUnit2(target, property, value, unit) {
  var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }
  curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);
  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
  }
  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }
  if (!parent || parent === _doc || !parent.appendChild) {
    parent = _doc.body;
  }
  cache = parent._gsap;
  if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
    return _round(curValue / cache.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }
    if (horizontal && toPercent) {
      cache = _getCache(parent);
      cache.time = _ticker.time;
      cache.width = parent[measureProperty];
    }
  }
  return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
}, _get = function _get2(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();
  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];
    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }
  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];
    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
    }
  }
  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
}, _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start, end) {
  if (!start || start === "none") {
    var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor");
    }
  }
  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (end.substring(0, 6) === "var(--") {
    end = _getComputedProperty(target, end.substring(4, end.indexOf(")")));
  }
  if (end === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }
  a = [start, end];
  _colorStringFilter(a);
  start = a[0];
  end = a[1];
  startValues = start.match(_numWithUnitExp) || [];
  endValues = end.match(_numWithUnitExp) || [];
  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }
      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;
        if (!endUnit) {
          endUnit = endUnit || _config.units[prop] || startUnit;
          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }
        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        }
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : "";
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }
  _relExp.test(end) && (pt.e = 0);
  this._pt = pt;
  return pt;
}, _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
  var split = value.split(" "), x = split[0], y = split[1] || "50%";
  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    value = x;
    x = y;
    y = value;
  }
  split[0] = _keywordToPercent[x] || x;
  split[1] = _keywordToPercent[y] || y;
  return split.join(" ");
}, _renderClearProps = function _renderClearProps2(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i;
    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;
      while (--i > -1) {
        prop = props[i];
        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }
        _removeProperty(target, prop);
      }
    }
    if (clearTransforms) {
      _removeProperty(target, _transformProp);
      if (cache) {
        cache.svg && target.removeAttribute("transform");
        style.scale = style.rotate = style.translate = "none";
        _parseTransform(target, 1);
        cache.uncache = 1;
        _removeIndependentTransforms(style);
      }
    }
  }
}, _specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;
      plugin._props.push(property);
      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = function _isNullTransform2(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
}, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
  var matrixString = _getComputedProperty(target, _transformProp);
  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
}, _getMatrix = function _getMatrix2(target, force2D) {
  var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
  if (cache.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix;
    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;
    if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
      addedToDOM = 1;
      nextSibling = target.nextElementSibling;
      _docElement.appendChild(target);
    }
    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");
    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }
  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
}, _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y;
  }
  if (smooth || smooth !== false && cache.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache.xOffset = cache.yOffset = 0;
  }
  cache.xOrigin = xOrigin;
  cache.yOrigin = yOrigin;
  cache.smooth = !!smooth;
  cache.origin = origin;
  cache.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px";
  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
  }
  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
}, _parseTransform = function _parseTransform2(target, uncache) {
  var cache = target._gsap || new GSCache(target);
  if ("x" in cache && !uncache && !cache.uncache) {
    return cache;
  }
  var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache.svg = !!(target.getCTM && _isSVG(target));
  if (cs.translate) {
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
    }
    style.scale = style.rotate = style.translate = "none";
  }
  matrix = _getMatrix(target, cache.svg);
  if (cache.svg) {
    if (cache.uncache) {
      t2 = target.getBBox();
      origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin");
    }
    _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
  }
  xOrigin = cache.xOrigin || 0;
  yOrigin = cache.yOrigin || 0;
  if (matrix !== _identity2DMatrix) {
    a = matrix[0];
    b = matrix[1];
    c = matrix[2];
    d = matrix[3];
    x = a12 = matrix[4];
    y = a22 = matrix[5];
    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
      if (cache.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      }
    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      }
      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      }
      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }
      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }
      scaleX = _round(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }
    if (cache.svg) {
      t1 = target.getAttribute("transform");
      cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }
  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }
  uncache = uncache || cache.uncache;
  cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
  cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
  cache.z = z + px;
  cache.scaleX = _round(scaleX);
  cache.scaleY = _round(scaleY);
  cache.rotation = _round(rotation) + deg;
  cache.rotationX = _round(rotationX) + deg;
  cache.rotationY = _round(rotationY) + deg;
  cache.skewX = skewX + deg;
  cache.skewY = skewY + deg;
  cache.transformPerspective = perspective + px;
  if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }
  cache.xOffset = cache.yOffset = 0;
  cache.force3D = _config.force3D;
  cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache.uncache = 0;
  return cache;
}, _firstTwoOnly = function _firstTwoOnly2(value) {
  return (value = value.split(" "))[0] + " " + value[1];
}, _addPxTranslate = function _addPxTranslate2(target, start, value) {
  var unit = getUnit(start);
  return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
}, _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
  cache.z = "0px";
  cache.rotationY = cache.rotationX = "0deg";
  cache.force3D = 0;
  _renderCSSTransforms(ratio, cache);
}, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
  var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }
  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }
  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }
  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }
  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }
  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }
  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }
  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }
  target.style[_transformProp] = transforms || "translate(0, 0)";
}, _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
  var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);
  if (skewY) {
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }
  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;
    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;
      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }
    a11 = _round(a11);
    a21 = _round(a21);
    a12 = _round(a12);
    a22 = _round(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }
  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }
  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }
  if (xPercent || yPercent) {
    temp = target.getBBox();
    tx = _round(tx + xPercent / 100 * temp.width);
    ty = _round(ty + yPercent / 100 * temp.height);
  }
  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp] = temp);
}, _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
  var cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
  if (isString) {
    direction = endValue.split("_")[1];
    if (direction === "short") {
      change %= cap;
      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }
    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }
  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";
  plugin._props.push(property);
  return pt;
}, _assign = function _assign2(target, source) {
  for (var p in source) {
    target[p] = source[p];
  }
  return target;
}, _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
  var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    _removeProperty(target, _transformProp);
    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp];
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp] = startValue;
  }
  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];
    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;
      plugin._props.push(p);
    }
  }
  _assign(endCache, startCache);
};
_forEachName("padding,margin,Width,Radius", function(name, index) {
  var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
    return index < 2 ? name + side : "border" + side + name;
  });
  _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
    var a, vars;
    if (arguments.length < 4) {
      a = props.map(function(prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }
    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function(prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});
var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init3(target, vars, tween, index, targets) {
    var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority, inlineProps;
    _pluginInitted || _initCore();
    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;
    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }
      endValue = vars[p];
      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        continue;
      }
      type = typeof endValue;
      specialProp = _specialProps[p];
      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }
      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }
      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;
        if (!_colorExp.test(startValue)) {
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
        }
        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
        } else {
          startValue = _get(target, p);
        }
        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);
        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              startNum = 0;
            }
            inlineProps.push("visibility", 0, style.visibility);
            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }
          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }
        isTransformRelated = p in _transformProps;
        if (isTransformRelated) {
          this.styles.save(p);
          if (type === "string" && endValue.substring(0, 6) === "var(--") {
            endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));
            endNum = parseFloat(endValue);
          }
          if (!transformPropTween) {
            cache = target._gsap;
            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
            smooth = vars.smoothOrigin !== false && cache.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
            transformPropTween.dep = 1;
          }
          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue);
            if (cache.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0;
              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }
            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
            continue;
          } else if (p === "force3D") {
            cache[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);
            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }
        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0);
          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;
          if (startUnit !== endUnit && endUnit !== "%") {
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);
            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }
        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }
    hasPriority && _sortPropTweensByPriority(this);
  },
  render: function render2(ratio, data) {
    if (data.tween._time || !_reverting()) {
      var pt = data._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  },
  core: {
    _removeProperty,
    _getMatrix
  }
};
gsap.utils.checkPrefix = _checkPropPrefix;
gsap.core.getStyleSaver = _getStyleSaver;
(function(positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
    _transformProps[name] = 1;
  });
  _forEachName(rotation, function(name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });
  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
  _forEachName(aliases, function(name) {
    var split = name.split(":");
    _propertyAliases[split[1]] = all[split[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
  _config.units[name] = "px";
});
gsap.registerPlugin(CSSPlugin);
var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
gsapWithCSS.core.Tween;
const NEXT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";
function WhatsNextCinematic() {
  const t = useT();
  const videoWrapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useRef(false);
  const bodyLines = t("homeWhatsNext.body").split("\n");
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const wrap3 = videoWrapRef.current;
    if (!wrap3 || reduceMotion.current) return;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    const tick = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      gsapWithCSS.set(wrap3, { x: currentX, y: currentY });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx * 18;
      targetY = (e.clientY - cy) / cy * 18;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      gsapWithCSS.set(wrap3, { clearProps: "x,y" });
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "section-07",
      className: "relative flex min-h-svh flex-col justify-end overflow-hidden bg-black px-4 pb-12 text-white sm:px-6 sm:pb-16 md:px-12 md:pb-24 lg:px-[10%]",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 z-0 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { ref: videoWrapRef, className: "absolute inset-0 origin-center scale-[1.08] will-change-transform", children: /* @__PURE__ */ jsx(
            "video",
            {
              className: "h-full w-full object-cover",
              src: NEXT_VIDEO,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              preload: "metadata",
              onLoadedMetadata: (e) => {
                e.currentTarget.playbackRate = 1.25;
              }
            }
          ) }),
          /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute inset-0 bg-black/25" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              className: "absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: [
              "relative z-10 transition-all duration-1000",
              ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            ].join(" "),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60 sm:mb-8 sm:text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" }),
                t("homeWhatsNext.eyebrow")
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "max-w-[14ch] text-balance font-display font-serif italic text-4xl leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl", children: [
                t("homeWhatsNext.titleBefore"),
                " ",
                /* @__PURE__ */ jsx("span", { className: "italic", children: t("homeWhatsNext.titleEm") })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-8 max-w-[48ch] text-base leading-[1.6] text-white/70 sm:mt-10 sm:text-lg md:mt-12 md:text-xl", children: [
                bodyLines[0],
                bodyLines[1] ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
                  /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
                  bodyLines[1]
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: [
                    "liquid-glass mt-8 flex max-w-3xl flex-col gap-3 py-1 pl-4 pr-1 transition-all duration-1000 delay-300 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 sm:pl-6 md:mt-12",
                    ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  ].join(" "),
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "hidden flex-1 text-sm font-medium text-white sm:block", children: t("homeWhatsNext.access") }),
                    /* @__PURE__ */ jsx("p", { className: "flex-1 px-1 pt-2 text-sm font-medium text-white sm:hidden sm:px-0 sm:pt-0", children: t("homeWhatsNext.accessShort") }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "/invitation",
                        className: "shrink-0 whitespace-nowrap bg-white px-5 py-3 text-center font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:py-2.5",
                        children: t("homeWhatsNext.cta")
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const LINK_KEYS = [
  { key: "idea", href: "/#section-01" },
  { key: "circle", href: "/#section-02" },
  { key: "platform", href: "/#section-03" },
  { key: "gathering", href: "/#section-06" },
  { key: "artifacts", href: "/haberler" }
  // eski "Sıradaki" → Haberler
];
const EASE$2 = [0.16, 1, 0.3, 1];
const HERO_CHROME = "#0A0A0A";
function FloatingNavbar({ placement = "overlay" }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const links = LINK_KEYS.map((link) => ({
    href: link.href,
    label: t(`publicNav.${link.key}`)
  }));
  return /* @__PURE__ */ jsxs(
    motion.header,
    {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: EASE$2, delay: 0.15 },
      className: placement === "static" ? "sticky top-0 z-50 border-b border-white/10" : "absolute inset-x-0 top-0 z-50",
      style: { backgroundColor: HERO_CHROME },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-[56px] items-center justify-between gap-3 px-3 py-2.5 sm:h-auto sm:gap-4 sm:px-5 sm:py-3.5 md:px-6", children: [
          /* @__PURE__ */ jsx("a", { href: "/", "aria-label": "inner hub home", className: "inline-flex shrink-0", children: /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--bone-fixed)]", fontSize: "clamp(22px, 5.2vw, 32px)", pulse: true }) }),
          /* @__PURE__ */ jsx(
            "nav",
            {
              "aria-label": t("publicNav.primaryNav"),
              className: "absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex lg:gap-1",
              children: links.map((link) => /* @__PURE__ */ jsxs(
                "a",
                {
                  href: link.href,
                  className: "group relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--bone-fixed)]/70 transition-colors duration-300 hover:text-[var(--bone-fixed)] lg:px-4 lg:text-[11px]",
                  children: [
                    link.label,
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        "aria-hidden": true,
                        className: "absolute bottom-0.5 left-3 right-3 h-px origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-300 ease-out group-hover:scale-x-100 lg:left-4 lg:right-4"
                      }
                    )
                  ]
                },
                link.href
              ))
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(LocaleToggle, { tone: "dark", className: "hidden sm:inline-flex" }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/invitation",
                className: "hidden items-center gap-2.5 bg-[var(--bone-fixed)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-fixed)] transition-colors hover:bg-white sm:inline-flex lg:px-5 lg:text-[11px]",
                children: [
                  t("publicNav.invitation"),
                  /* @__PURE__ */ jsx("span", { className: "size-1.5 bg-[var(--inner-green)]", "aria-hidden": true })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-label": open ? t("publicNav.closeMenu") : t("publicNav.openMenu"),
                "aria-expanded": open,
                onClick: () => setOpen((v) => !v),
                className: "flex items-center justify-center p-1.5 md:hidden",
                children: /* @__PURE__ */ jsxs("span", { className: "relative flex h-3.5 w-4 flex-col justify-between", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "block h-[1.5px] w-full origin-center bg-[var(--bone-fixed)] transition-transform duration-300",
                      style: {
                        transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                        transform: open ? "translateY(6px) rotate(45deg)" : "none"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "block h-[1.5px] w-full origin-center bg-[var(--bone-fixed)] transition-transform duration-300",
                      style: {
                        transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                        transform: open ? "translateY(-6px) rotate(-45deg)" : "none"
                      }
                    }
                  )
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: open ? /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -6 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -6 },
            transition: { duration: 0.25, ease: EASE$2 },
            className: "border-t border-white/10 md:hidden",
            style: { backgroundColor: HERO_CHROME },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-white/10 px-4 py-3", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/50", children: t("home.langSwitch") }),
                /* @__PURE__ */ jsx(LocaleToggle, { tone: "dark" })
              ] }),
              links.map((link, i) => /* @__PURE__ */ jsxs(
                "a",
                {
                  href: link.href,
                  onClick: () => setOpen(false),
                  className: "flex items-center justify-between border-b border-white/10 px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)]/80 transition-colors last:border-b-0 hover:text-[var(--bone-fixed)]",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: link.label }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[var(--bone-fixed)]/30", children: String(i + 1).padStart(2, "0") })
                  ]
                },
                link.href
              )),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/invitation",
                  onClick: () => setOpen(false),
                  className: "flex items-center justify-between bg-[var(--bone-fixed)] px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--ink-fixed)]",
                  children: [
                    t("publicNav.requestInvitation"),
                    /* @__PURE__ */ jsx("span", { className: "size-1.5 bg-[var(--inner-green)]", "aria-hidden": true })
                  ]
                }
              )
            ]
          }
        ) : null })
      ]
    }
  );
}
const EASE$1 = [0.16, 1, 0.3, 1];
const CARD_EASE = [0.22, 1, 0.36, 1];
const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const FEATURE_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";
const IDEA_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
function HomeOpening() {
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx(HeroInset, {}),
    /* @__PURE__ */ jsx(AboutIdea, {}),
    /* @__PURE__ */ jsx(FoundingSeats, {})
  ] });
}
function HeroInset() {
  const t = useT();
  return /* @__PURE__ */ jsx(
    "section",
    {
      className: "relative h-[100svh] p-2 sm:p-3 md:p-5 lg:p-6",
      style: { backgroundColor: "var(--ink-fixed)" },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative h-full w-full overflow-hidden border border-white/[0.08]",
          style: { backgroundColor: "var(--ink-fixed)" },
          children: [
            /* @__PURE__ */ jsx(
              HeroVideo,
              {
                src: HERO_VIDEO,
                className: "absolute inset-0 z-0 h-full w-full scale-[1.02] object-cover"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "noise-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.55] mix-blend-overlay"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-transparent to-black/70"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              }
            ),
            /* @__PURE__ */ jsx(FloatingNavbar, {}),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:px-5 sm:pb-6 md:px-8 md:pb-9 lg:px-10", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.8, delay: 0.35, ease: EASE$1 },
                  className: "mb-3 flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--bone-fixed)]/55 sm:mb-6 sm:gap-3 sm:text-[11px]",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" }),
                    t("home.heroTag")
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-12 md:gap-10", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 md:col-span-8", children: [
                  /* @__PURE__ */ jsx("h1", { className: "text-[var(--bone-fixed)]", children: /* @__PURE__ */ jsx(
                    Lockup,
                    {
                      suffix: "hub",
                      className: "text-[var(--bone-fixed)]",
                      fontSize: "clamp(2.75rem, 14vw, 9.5rem)",
                      pulse: true
                    }
                  ) }),
                  /* @__PURE__ */ jsx("p", { className: "sr-only", children: t("common.privateCircle") })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3.5 sm:gap-5 md:col-span-4 md:pb-3", children: [
                  /* @__PURE__ */ jsx(
                    motion.p,
                    {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.8, delay: 0.5, ease: EASE$1 },
                      className: "max-w-[36ch] text-[13px] leading-[1.45] text-[var(--bone-fixed)]/70 sm:text-sm md:text-[15px] md:leading-[1.35]",
                      children: t("home.heroBody")
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    motion.a,
                    {
                      href: "/invitation",
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.8, delay: 0.7, ease: EASE$1 },
                      className: "group inline-flex w-full min-h-11 items-center justify-between gap-2.5 bg-[var(--bone-fixed)] py-1.5 pl-4 pr-1.5 text-sm font-medium text-[var(--ink-fixed)] transition-[gap] duration-300 hover:gap-3.5 sm:w-fit sm:min-h-0 sm:pl-5 sm:text-base",
                      children: [
                        t("home.requestInvitation"),
                        /* @__PURE__ */ jsx("span", { className: "flex size-9 shrink-0 items-center justify-center bg-[var(--ink-fixed)] transition-transform duration-300 group-hover:scale-110 sm:size-10", children: /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-4 text-[var(--bone-fixed)]", strokeWidth: 1.75 }) })
                      ]
                    }
                  )
                ] })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function AboutIdea() {
  const t = useT();
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "section-01",
      className: "bg-[var(--ink-fixed)] px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-28",
      children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl overflow-hidden border border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 z-0", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx(
            HeroVideo,
            {
              src: IDEA_VIDEO,
              className: "h-full w-full scale-[1.04] object-cover"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[var(--ink-fixed)]/55" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" }),
          /* @__PURE__ */ jsx("div", { className: "noise-overlay absolute inset-0 opacity-[0.3] mix-blend-overlay" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 px-5 py-14 text-center sm:px-8 sm:py-16 md:px-12 md:py-20", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/60 sm:mb-8 sm:text-xs", children: t("home.ideaEyebrow") }),
          /* @__PURE__ */ jsx(
            WordsPullUpMultiStyle,
            {
              className: "mx-auto max-w-3xl justify-center text-3xl leading-[0.95] text-[var(--bone-fixed)] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl",
              segments: [
                { text: t("home.ideaLine1"), className: "font-normal" },
                {
                  text: t("home.ideaLine2"),
                  className: "font-display font-serif italic"
                },
                {
                  text: t("home.ideaLine3"),
                  className: "font-normal"
                }
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            ScrollTextReveal,
            {
              text: t("home.ideaReveal"),
              className: "mx-auto mt-10 max-w-2xl text-xs leading-relaxed text-[var(--bone-fixed)]/70 sm:mt-12 sm:text-sm md:text-base"
            }
          )
        ] })
      ] })
    }
  );
}
function FoundingSeats() {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const seatCards = useMemo(
    () => [
      {
        id: "01",
        title: t("home.seatFounders"),
        items: [
          t("home.seatFounders1"),
          t("home.seatFounders2"),
          t("home.seatFounders3"),
          t("home.seatFounders4")
        ]
      },
      {
        id: "02",
        title: t("home.seatBuilders"),
        items: [t("home.seatBuilders1"), t("home.seatBuilders2"), t("home.seatBuilders3")]
      },
      {
        id: "03",
        title: t("home.seatInvestors"),
        items: [t("home.seatInvestors1"), t("home.seatInvestors2"), t("home.seatInvestors3")]
      }
    ],
    [t]
  );
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "section-02",
      ref,
      className: "relative min-h-0 overflow-hidden bg-[var(--ink-fixed)] px-3 py-12 sm:px-4 sm:py-16 md:min-h-svh md:px-6 md:py-24",
      children: [
        /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto max-w-7xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-10 max-w-3xl sm:mb-12 md:mb-14", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/50 sm:text-xs", children: t("home.seatsEyebrow") }),
            /* @__PURE__ */ jsx(
              WordsPullUpMultiStyle,
              {
                className: "justify-start text-left text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl",
                segments: [
                  {
                    text: t("home.seatsLine1"),
                    className: "font-normal text-[var(--bone-fixed)]"
                  },
                  {
                    text: t("home.seatsLine2"),
                    className: "font-normal text-white/40"
                  }
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4 lg:h-[min(480px,70vh)]", children: [
            /* @__PURE__ */ jsxs(FeatureCard, { index: 0, inView, className: "relative min-h-[240px] overflow-hidden lg:min-h-0", children: [
              /* @__PURE__ */ jsx(HeroVideo, { src: FEATURE_VIDEO, className: "absolute inset-0 h-full w-full object-cover" }),
              /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: "absolute bottom-4 left-4 right-4 font-medium sm:bottom-5 sm:left-5",
                  style: { color: "#F4F1EC" },
                  children: t("home.circleStartsHere")
                }
              )
            ] }),
            seatCards.map((card, i) => /* @__PURE__ */ jsxs(
              FeatureCard,
              {
                index: i + 1,
                inView,
                className: "flex min-h-[240px] flex-col bg-[#212121] p-4 sm:p-5 lg:min-h-0",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: card.id }),
                    /* @__PURE__ */ jsx("span", { className: "size-2.5 bg-[var(--inner-green)] animate-beacon", "aria-hidden": true })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "mb-4 text-lg font-medium text-[var(--bone-fixed)] sm:text-xl", children: card.title }),
                  /* @__PURE__ */ jsx("ul", { className: "flex flex-1 flex-col gap-2.5", children: card.items.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2.5 text-sm text-white/55", children: [
                    /* @__PURE__ */ jsx(
                      Check,
                      {
                        className: "mt-0.5 size-3.5 shrink-0 text-[var(--inner-green)]",
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: item })
                  ] }, item)) }),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: "/invitation",
                      className: "mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/70 transition-colors hover:text-[var(--bone-fixed)]",
                      children: [
                        t("home.learnMore"),
                        /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5 -rotate-0", strokeWidth: 1.75 })
                      ]
                    }
                  )
                ]
              },
              card.id
            ))
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-8 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-10 sm:text-base", children: t("home.seatsFooter") })
        ] })
      ]
    }
  );
}
function FeatureCard({
  children,
  index,
  inView,
  className
}) {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className,
      initial: { opacity: 0, scale: 0.95 },
      animate: inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 },
      transition: { duration: 0.65, delay: index * 0.15, ease: CARD_EASE },
      children
    }
  );
}
function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.4
    });
    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return /* @__PURE__ */ jsxs("span", { ref, children: [
    val,
    suffix
  ] });
}
const FEATURE_MEDIA = {
  signal: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  match: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4",
  capital: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
};
function buildHomeModules(t) {
  return [
    {
      id: "signal",
      name: "inner·signal",
      desc: t("home.modSignalDesc"),
      icon: Zap,
      tag: t("home.modSignalTag")
    },
    {
      id: "match",
      name: "inner·match",
      desc: t("home.modMatchDesc"),
      icon: Users,
      tag: t("home.modMatchTag")
    },
    {
      id: "capital",
      name: "inner·capital",
      desc: t("home.modCapitalDesc"),
      icon: TrendingUp,
      tag: t("home.modCapitalTag")
    },
    {
      id: "vault",
      name: "inner·vault",
      desc: t("home.modVaultDesc"),
      icon: BookOpen,
      tag: t("home.modVaultTag")
    },
    {
      id: "pulse",
      name: "inner·pulse",
      desc: t("home.modPulseDesc"),
      icon: Radio,
      tag: t("home.modPulseTag")
    },
    {
      id: "id",
      name: "inner·id",
      desc: t("home.modIdDesc"),
      icon: Fingerprint,
      tag: t("home.modIdTag")
    },
    {
      id: "api",
      name: "inner·api",
      desc: t("home.modApiDesc"),
      icon: Code2,
      tag: t("home.modApiTag")
    },
    {
      id: "bounty",
      name: "inner·bounty",
      desc: t("home.modBountyDesc"),
      icon: Target,
      tag: t("home.modBountyTag")
    }
  ];
}
function buildPlatformFeatures(modules) {
  return modules.slice(0, 3).map((m) => ({
    id: m.id,
    name: m.name,
    tag: m.tag,
    desc: m.desc,
    media: {
      type: "video",
      src: FEATURE_MEDIA[m.id]
    }
  }));
}
function MarqueeStrip({ modules }) {
  const loop = [...modules, ...modules, ...modules];
  return /* @__PURE__ */ jsxs("div", { className: "relative z-10 overflow-hidden bg-[var(--ink-fixed)] py-3 sm:py-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--ink-fixed)] to-transparent sm:w-20"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--ink-fixed)] to-transparent sm:w-20"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-[100vw] overflow-hidden border-y border-white/10 bg-[var(--ink-fixed)] py-3.5 sm:py-4", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "flex w-max items-center gap-0",
        animate: { x: ["0%", "-33.333%"] },
        transition: { duration: 36, ease: "linear", repeat: Infinity },
        children: loop.map((item, i) => {
          const Icon = item.icon;
          return /* @__PURE__ */ jsxs(
            "a",
            {
              href: "#section-03",
              className: "group flex shrink-0 items-center gap-3 px-5 sm:gap-3.5 sm:px-7",
              children: [
                /* @__PURE__ */ jsx("span", { className: "flex size-7 items-center justify-center bg-white/10 transition-colors group-hover:bg-[var(--inner-green)] sm:size-8", children: /* @__PURE__ */ jsx(
                  Icon,
                  {
                    className: "size-3.5 text-[var(--bone-fixed)] transition-colors group-hover:text-[var(--ink-fixed)] sm:size-4",
                    strokeWidth: 1.6
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "flex flex-col gap-0.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bone-fixed)] sm:text-[11px]", children: item.name }),
                  /* @__PURE__ */ jsx("span", { className: "hidden font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--bone-fixed)]/40 sm:block", children: item.tag })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": true,
                    className: "ml-5 size-1 shrink-0 bg-[var(--inner-green)] sm:ml-7"
                  }
                )
              ]
            },
            `${item.id}-${i}`
          );
        })
      }
    ) })
  ] });
}
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]",
      style: { scaleX: scrollYProgress }
    }
  );
}
function StatItem({ n, label, suffix = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start", children: [
    /* @__PURE__ */ jsx("span", { className: "font-display font-serif italic text-4xl leading-none mb-2 text-[var(--bone-fixed)] sm:mb-3 sm:text-5xl md:text-7xl", children: /* @__PURE__ */ jsx(Counter, { to: n, suffix }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest opacity-40 text-[var(--bone-fixed)] sm:text-label", children: label })
  ] });
}
function Home() {
  useLenis(true);
  const t = useT();
  const { locale } = useLocale();
  const modules = buildHomeModules(t);
  const platformFeatures = buildPlatformFeatures(modules);
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", { lang: locale, className: "site-atmosphere flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsx("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest", children: t("common.skipToContent") }),
    /* @__PURE__ */ jsx(ScrollProgress, {}),
    /* @__PURE__ */ jsx(Preloader, {}),
    /* @__PURE__ */ jsx(Grain, {}),
    /* @__PURE__ */ jsx(IndexRail, {}),
    /* @__PURE__ */ jsxs("main", { id: "main-content", className: "flex-grow", children: [
      /* @__PURE__ */ jsx(HomeOpening, {}),
      /* @__PURE__ */ jsx(MarqueeStrip, { modules }),
      /* @__PURE__ */ jsx("section", { id: "section-03", children: /* @__PURE__ */ jsx(PlatformFeatures, { features: platformFeatures, restModules: modules.slice(3) }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-[var(--ink-fixed)] border-t border-border/15", children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 h-[85vh] md:h-[95vh] z-0", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx(
            HeroVideo,
            {
              src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
              className: "h-full w-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-[var(--ink-fixed)]" })
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "section-04", className: "relative z-10 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 md:px-12 md:pt-36 lg:px-[10%]", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs", children: [
            /* @__PURE__ */ jsx("span", { children: t("home.whatThisIsEyebrow") }),
            /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: t("home.thePoint") })
          ] }),
          /* @__PURE__ */ jsx(
            WordsPullUp,
            {
              text: t("home.bigThings"),
              className: "font-display font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--bone-fixed)] max-w-3xl mb-8 sm:mb-10 text-balance"
            }
          ),
          /* @__PURE__ */ jsx(
            ScrollTextReveal,
            {
              text: t("home.whatThisIsBody"),
              className: "max-w-[46ch] text-[var(--bone-fixed)]",
              style: { fontSize: "clamp(17px, 2.4vw, 26px)", lineHeight: 1.55, opacity: 0.85 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "section-05", className: "relative z-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-32 md:px-12 md:pb-48 lg:px-[10%]", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs", children: [
            /* @__PURE__ */ jsx("span", { children: t("home.entryEyebrow") }),
            /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: t("home.byInvitation") })
          ] }),
          /* @__PURE__ */ jsx(
            WordsPullUp,
            {
              text: t("home.entryTitle"),
              className: "font-display font-serif italic text-3xl sm:text-4xl md:text-5xl max-w-2xl mb-6 sm:mb-8 text-balance text-[var(--bone-fixed)]"
            }
          ),
          /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsx("p", { className: "mb-12 max-w-[65ch] text-base leading-[1.7] text-[var(--bone-fixed)]/80 sm:mb-20 sm:text-lg", children: t("home.entryBody") }) }),
          /* @__PURE__ */ jsx("div", { className: "max-w-3xl", children: [
            { label: t("home.entryStepName"), line: t("home.entryStepNameLine") },
            { label: t("home.entryStepConsider"), line: t("home.entryStepConsiderLine") },
            { label: t("home.entryStepInvite"), line: t("home.entryStepInviteLine") }
          ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-white/15 py-5 last:border-b md:flex-row md:items-baseline md:gap-12 md:py-6", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-xs md:w-48", children: item.label }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-[var(--bone-fixed)]/90 sm:text-lg", children: item.line })
          ] }) }, item.label)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "section",
        {
          id: "section-06",
          className: "relative overflow-hidden border-t border-border/15 bg-[var(--ink-fixed)] px-4 py-20 text-[var(--bone-fixed)] transition-colors duration-700 sm:px-6 sm:py-32 md:px-12 md:py-48 lg:px-[10%]",
          children: [
            /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-24 top-0 size-[520px] bg-[var(--inner-green)]/[0.04] blur-3xl" }),
            /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--ink-fixed)]/40 to-transparent" }),
            /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsxs("div", { className: "mb-12 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest opacity-60 sm:mb-20 sm:gap-6 sm:pb-6 sm:text-xs", children: [
              /* @__PURE__ */ jsx("span", { children: t("home.gatheringEyebrow") }),
              /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: t("home.gatheringDate") })
            ] }) }),
            /* @__PURE__ */ jsx(
              WordsPullUp,
              {
                text: t("home.gatheringTitle"),
                className: "mb-12 max-w-3xl text-balance font-display font-serif italic text-3xl sm:mb-20 sm:text-4xl md:mb-24 md:text-5xl lg:text-6xl"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mb-12 flex flex-col gap-12 sm:mb-20 sm:gap-16 lg:mb-24 lg:flex-row lg:items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid min-w-0 grid-cols-3 gap-3 sm:gap-6 md:gap-10 lg:flex-1", children: [
                /* @__PURE__ */ jsx(StatItem, { n: 34, label: t("home.people") }),
                /* @__PURE__ */ jsx(StatItem, { n: 2, label: t("home.days") }),
                /* @__PURE__ */ jsx(StatItem, { n: 8, label: t("home.modules") })
              ] }),
              /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, className: "flex-shrink-0", children: /* @__PURE__ */ jsx(DiagramCircle, {}) })
            ] }),
            /* @__PURE__ */ jsx(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-balance font-serif text-xl opacity-80 sm:text-2xl md:text-3xl", children: t("home.gatheringLine") }),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "#section-07",
                  className: "group inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:border-white/60 hover:bg-white hover:text-black sm:min-h-0 sm:justify-start",
                  children: [
                    t("home.whatsNext"),
                    /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
                  ]
                }
              )
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(WhatsNextCinematic, {})
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
const NO_BODY_STATUS = /* @__PURE__ */ new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";
function isRequest(input) {
  return typeof Request !== "undefined" && input instanceof Request;
}
function resolveMethod(input, explicitMethod) {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}
function isUrl(input) {
  return typeof URL !== "undefined" && input instanceof URL;
}
function applyBaseUrl(input) {
  return input;
}
function resolveUrl(input) {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}
function mergeHeaders(...sources) {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}
function getMediaType(headers) {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}
function isJsonMediaType(mediaType) {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}
function isTextMediaType(mediaType) {
  return Boolean(
    mediaType && (mediaType.startsWith("text/") || mediaType === "application/xml" || mediaType === "text/xml" || mediaType.endsWith("+xml") || mediaType === "application/x-www-form-urlencoded")
  );
}
function hasNoBody(response, method) {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}
function stripBom(text) {
  return text.charCodeAt(0) === 65279 ? text.slice(1) : text;
}
function looksLikeJson(text) {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}
function getStringField(value, key) {
  if (!value || typeof value !== "object") return void 0;
  const candidate = value[key];
  if (typeof candidate !== "string") return void 0;
  const trimmed = candidate.trim();
  return trimmed === "" ? void 0 : trimmed;
}
function truncate(text, maxLength = 300) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
function buildErrorMessage(response, data) {
  const prefix = `HTTP ${response.status} ${response.statusText}`;
  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }
  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message = getStringField(data, "message") ?? getStringField(data, "error_description") ?? getStringField(data, "error");
  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;
  return prefix;
}
class ApiError extends Error {
  name = "ApiError";
  status;
  statusText;
  data;
  headers;
  response;
  method;
  url;
  constructor(response, data, requestInfo) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}
class ResponseParseError extends Error {
  name = "ResponseParseError";
  status;
  statusText;
  headers;
  response;
  method;
  url;
  rawBody;
  cause;
  constructor(response, rawBody, cause, requestInfo) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} (${response.status} ${response.statusText}) as JSON`
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}
async function parseJsonBody(response, requestInfo) {
  const raw = await response.text();
  const normalized = stripBom(raw);
  if (normalized.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}
async function parseErrorBody(response, method) {
  if (hasNoBody(response, method)) {
    return null;
  }
  const mediaType = getMediaType(response.headers);
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }
  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();
  if (trimmed === "") {
    return null;
  }
  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }
  return raw;
}
function inferResponseType(response) {
  const mediaType = getMediaType(response.headers);
  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}
async function parseSuccessBody(response, responseType, requestInfo) {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }
  const effectiveType = responseType === "auto" ? inferResponseType(response) : responseType;
  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);
    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }
    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          'Blob responses are not supported in this runtime. Use responseType "json" or "text" instead.'
        );
      }
      return response.blob();
  }
}
async function customFetch(input, options = {}) {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init4 } = options;
  const method = resolveMethod(input, init4.method);
  if (init4.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }
  const headers = mergeHeaders(isRequest(input) ? input.headers : void 0, headersInit);
  if (typeof init4.body === "string" && !headers.has("content-type") && looksLikeJson(init4.body)) {
    headers.set("content-type", "application/json");
  }
  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }
  const requestInfo = { method, url: resolveUrl(input) };
  const response = await fetch(input, { ...init4, method, headers });
  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }
  return await parseSuccessBody(response, responseType, requestInfo);
}
const getSubmitRequestUrl = () => {
  return `/api/request`;
};
const submitRequest = async (invitationInput, options) => {
  return customFetch(
    getSubmitRequestUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(invitationInput)
    }
  );
};
const getSubmitRequestMutationOptions = (options) => {
  const mutationKey = ["submitRequest"];
  const { mutation: mutationOptions, request: requestOptions } = { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return submitRequest(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useSubmitRequest = (options) => {
  return useMutation(getSubmitRequestMutationOptions());
};
const GA_ID = "G-FGLJ0ECVDD";
function isGaEnabled() {
  return Boolean(GA_ID) && typeof window !== "undefined";
}
function trackEvent(name, params) {
  if (!isGaEnabled() || !window.gtag) return;
  window.gtag("event", name, params);
}
const INVITE_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";
const EASE = [0.16, 1, 0.3, 1];
const ROLE_DEFS = [
  { value: "founder", icon: Rocket },
  { value: "investor", icon: TrendingUp },
  { value: "builder", icon: Wrench },
  { value: "company", icon: Building2 }
];
const STEP_IDS = ["role", "identity", "org", "story", "intro"];
const fieldClass = "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3.5 text-[15px] text-[var(--bone-fixed)] shadow-none placeholder:text-white/35 focus-visible:border-[var(--inner-green)] focus-visible:outline-none focus-visible:ring-0 transition-colors";
function Invitation() {
  const t = useT();
  const { locale } = useLocale();
  const { mutate: submitRequest2, isSuccess, isError, isPending } = useSubmitRequest();
  const roles = useMemo(
    () => ROLE_DEFS.map((r) => ({
      ...r,
      label: r.value === "founder" ? t("invite.roleFounder") : r.value === "investor" ? t("invite.roleInvestor") : r.value === "builder" ? t("invite.roleBuilder") : t("invite.roleCompany"),
      hint: r.value === "founder" ? t("invite.roleFounderHint") : r.value === "investor" ? t("invite.roleInvestorHint") : r.value === "builder" ? t("invite.roleBuilderHint") : t("invite.roleCompanyHint")
    })),
    [t]
  );
  const steps = useMemo(
    () => [
      { id: STEP_IDS[0], title: t("invite.stepRole") },
      { id: STEP_IDS[1], title: t("invite.stepIdentity") },
      { id: STEP_IDS[2], title: t("invite.stepOrg") },
      { id: STEP_IDS[3], title: t("invite.stepStory") },
      { id: STEP_IDS[4], title: t("invite.stepIntro") }
    ],
    [t]
  );
  const stepCopy = (s, r) => {
    if (s === 0) return t("invite.copyRole");
    if (s === 1) return t("invite.copyIdentity");
    if (s === 2) {
      if (r === "investor") return t("invite.copyOrgInvestor");
      if (r === "company") return t("invite.copyOrgCompany");
      return t("invite.copyOrgDefault");
    }
    if (s === 3) return t("invite.copyStory");
    return t("invite.copyIntro");
  };
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(null);
  const [linkedin, setLinkedin] = useState("");
  const [link, setLink] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationDomain, setOrganizationDomain] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [whoYouAre, setWhoYouAre] = useState("");
  const [whoIntroduced, setWhoIntroduced] = useState("");
  const [fax, setFax] = useState("");
  useEffect(() => {
    if (!isSuccess) return;
    trackEvent("invite_request_submitted", { role: role ?? "unknown" });
  }, [isSuccess, role]);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const t2 = Math.min(1, (now - start) / duration);
      const p = 1 - Math.pow(1 - t2, 3);
      setBootProgress(Math.round(p * 100));
      if (t2 < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setBooting(false), 180);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    if (organizationDomain.trim()) return;
    const at = email.lastIndexOf("@");
    if (at < 0) return;
    const d = email.slice(at + 1).toLowerCase();
    const consumer = [
      "gmail.com",
      "googlemail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "proton.me",
      "protonmail.com"
    ];
    if (d && d.includes(".") && !consumer.includes(d)) {
      setOrganizationDomain(d);
    }
  }, [email, organizationDomain]);
  useEffect(() => {
    const domain = organizationDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!domain || !domain.includes(".")) {
      setOrganizationLogo(null);
      return;
    }
    let cancelled = false;
    const t2 = window.setTimeout(async () => {
      setLogoLoading(true);
      try {
        const res = await fetch(`/api/org-logo?domain=${encodeURIComponent(domain)}`);
        if (!res.ok) {
          if (!cancelled) setOrganizationLogo(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setOrganizationLogo(data.logoUrl ?? null);
      } catch {
        if (!cancelled) setOrganizationLogo(null);
      } finally {
        if (!cancelled) setLogoLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(t2);
    };
  }, [organizationDomain]);
  const progress = useMemo(() => (step + 1) / steps.length * 100, [step, steps.length]);
  const orgRequired = role === "investor" || role === "company";
  const canNext = (() => {
    if (step === 0) return role != null;
    if (step === 1) return name.trim().length > 1 && email.includes("@");
    if (step === 2) {
      if (orgRequired) return organization.trim().length > 1;
      return true;
    }
    if (step === 3) return whoYouAre.trim().length >= 12;
    if (step === 4) return true;
    return false;
  })();
  const goNext = () => {
    if (!canNext) return;
    if (step < steps.length - 1) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };
  const handleSubmit = () => {
    if (!role || !canNext) return;
    submitRequest2({
      data: {
        name: name.trim(),
        email: email.trim(),
        role,
        linkedin: linkedin || null,
        whoYouAre: whoYouAre.trim(),
        link: link || null,
        whoIntroduced: whoIntroduced || null,
        organization: organization.trim() || null,
        organizationDomain: organizationDomain.trim() || null,
        organizationLogo: organizationLogo || null,
        fax: fax || null,
        company: null
      }
    });
  };
  const onKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (e.target.tagName === "TEXTAREA") return;
    e.preventDefault();
    if (step < steps.length - 1) goNext();
    else handleSubmit();
  };
  return /* @__PURE__ */ jsxs("div", { lang: locale, className: "cinematic-surface relative flex min-h-svh flex-col overflow-hidden bg-[var(--ink-fixed)] text-[var(--bone-fixed)]", children: [
    /* @__PURE__ */ jsx(
      HeroVideo,
      {
        src: INVITE_VIDEO,
        className: "fixed inset-0 z-0 h-full w-full scale-[1.03] object-cover"
      }
    ),
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 z-[1] bg-black/55" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/45 to-black/75"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "noise-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.25] mix-blend-overlay"
      }
    ),
    /* @__PURE__ */ jsxs("header", { className: "relative z-20 flex h-[60px] shrink-0 items-center justify-between px-5 md:h-[72px] md:px-10 lg:px-[8%]", children: [
      /* @__PURE__ */ jsx("a", { href: "/", className: "inline-flex focus-visible:outline-none", children: /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--bone-fixed)]", fontSize: "clamp(22px, 2.4vw, 30px)", pulse: true }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 sm:gap-4", children: [
        /* @__PURE__ */ jsx(LocaleToggle, { tone: "dark" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/panel",
            className: "font-mono text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white/80 sm:text-xs",
            children: t("invite.memberLogin")
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/",
            className: "font-mono text-[10px] uppercase tracking-widest text-white/55 transition-colors hover:text-white sm:text-xs",
            children: t("invite.homeLink")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 md:px-10 md:py-14", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: booting ? /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.35 },
        className: "w-full max-w-md",
        children: [
          /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50", children: t("invite.preparing") }),
          /* @__PURE__ */ jsx("div", { className: "mb-3 h-[2px] w-full overflow-hidden bg-white/15", children: /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "h-full bg-[var(--inner-green)]",
              style: { width: `${bootProgress}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest text-white/45", children: [
            /* @__PURE__ */ jsx("span", { children: t("invite.access") }),
            /* @__PURE__ */ jsxs("span", { children: [
              bootProgress,
              "%"
            ] })
          ] })
        ]
      },
      "boot"
    ) : isSuccess ? /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE },
        className: "w-full max-w-lg panel-glass-ink px-6 py-10 sm:px-8 sm:py-12",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex size-7 items-center justify-center bg-[var(--inner-green)]", children: /* @__PURE__ */ jsx(Check, { className: "size-3.5 text-black", strokeWidth: 2.5 }) }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs uppercase tracking-widest text-white/60", children: t("invite.received") })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "mb-4 font-display font-serif italic text-4xl leading-[1.1] text-balance text-[var(--bone-fixed)] md:text-5xl", children: t("invite.successTitle") }),
          /* @__PURE__ */ jsx("p", { className: "max-w-[42ch] text-sm leading-relaxed text-white/60 md:text-base", children: t("invite.successBody") }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/",
                className: "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--bone-fixed)]/70 transition-colors hover:text-[var(--bone-fixed)]",
                children: [
                  t("invite.backHome"),
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/panel",
                className: "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40 transition-colors hover:text-white/75",
                children: [
                  t("invite.successPanelHint"),
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })
                ]
              }
            )
          ] })
        ]
      },
      "success"
    ) : /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE },
        className: "w-full max-w-xl panel-glass-ink",
        onKeyDown,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-white/10 px-5 pt-5 sm:px-7", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.16em] text-white/50", children: t("invite.requestTitle") }),
              /* @__PURE__ */ jsxs("p", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
                String(step + 1).padStart(2, "0"),
                " / ",
                String(steps.length).padStart(2, "0")
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-[2px] w-full overflow-hidden bg-white/10", children: /* @__PURE__ */ jsx(
              motion.div,
              {
                className: "h-full bg-[var(--inner-green)]",
                animate: { width: `${progress}%` },
                transition: { duration: 0.45, ease: EASE }
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 flex gap-1.5 overflow-x-auto pb-4", children: steps.map((s, i) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (i < step) setStep(i);
                },
                className: `shrink-0 border-b px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors sm:text-[10px] ${i === step ? "border-[var(--inner-green)] text-[var(--bone-fixed)]" : i < step ? "border-transparent text-[var(--inner-green)]/80 hover:text-[var(--inner-green)]" : "border-transparent text-white/25"}`,
                children: s.id
              },
              s.id
            )) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-5 py-7 sm:px-7 sm:py-8", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: 18 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -14 },
              transition: { duration: 0.35, ease: EASE },
              children: [
                /* @__PURE__ */ jsx("h1", { className: "mb-2 font-display font-serif italic text-3xl leading-[1.1] text-balance text-[var(--bone-fixed)] sm:text-4xl", children: steps[step].title }),
                /* @__PURE__ */ jsx("p", { className: "mb-8 max-w-[46ch] text-sm leading-relaxed text-white/55", children: stepCopy(step, role) }),
                step === 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: roles.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.value;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setRole(r.value),
                      className: `group flex flex-col items-start gap-3 border px-4 py-4 text-left transition-all duration-300 ${active ? "border-[var(--inner-green)]/70 bg-[var(--inner-green)]/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "border-white/12 bg-white/[0.03] backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.06]"}`,
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between", children: [
                          /* @__PURE__ */ jsx(
                            Icon,
                            {
                              className: `size-4 ${active ? "text-[var(--inner-green)]" : "text-white/50"}`,
                              strokeWidth: 1.6
                            }
                          ),
                          active ? /* @__PURE__ */ jsx(Check, { className: "size-3.5 text-[var(--inner-green)]", strokeWidth: 2.5 }) : null
                        ] }),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-widest text-[var(--bone-fixed)]", children: r.label }),
                          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-snug text-white/45", children: r.hint })
                        ] })
                      ]
                    },
                    r.value
                  );
                }) }),
                step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                  /* @__PURE__ */ jsx(Field, { label: t("invite.fullName"), required: true, children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      placeholder: t("invite.phName"),
                      className: fieldClass,
                      autoComplete: "name",
                      autoFocus: true
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field, { label: t("invite.email"), required: true, children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      placeholder: t("invite.phEmail"),
                      className: fieldClass,
                      autoComplete: "email"
                    }
                  ) })
                ] }),
                step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 border border-white/10 bg-white/[0.03] p-4", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex size-14 shrink-0 items-center justify-center border border-white/15 bg-black/40", children: logoLoading ? /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-white/40", children: "…" }) : organizationLogo ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: organizationLogo,
                        alt: "",
                        className: "size-10 object-contain"
                      }
                    ) : /* @__PURE__ */ jsx(Building2, { className: "size-5 text-white/35", strokeWidth: 1.5 }) }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-white/45", children: organizationLogo ? t("invite.logoFound") : t("invite.logoAuto") }),
                      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-snug text-white/50", children: t("invite.logoHint") })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Field,
                    {
                      label: t("invite.orgLabel"),
                      hint: orgRequired ? t("invite.required") : t("invite.optional"),
                      required: orgRequired,
                      children: /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          value: organization,
                          onChange: (e) => setOrganization(e.target.value),
                          placeholder: t("invite.phOrg"),
                          className: fieldClass,
                          autoComplete: "organization",
                          autoFocus: true
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(Field, { label: t("invite.orgDomain"), hint: t("invite.forLogo"), children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: organizationDomain,
                      onChange: (e) => setOrganizationDomain(e.target.value),
                      placeholder: t("invite.phDomain"),
                      className: fieldClass,
                      autoComplete: "off"
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field, { label: t("invite.linkedin"), hint: t("invite.optional"), children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "url",
                      value: linkedin,
                      onChange: (e) => setLinkedin(e.target.value),
                      placeholder: "https://linkedin.com/in/...",
                      className: fieldClass,
                      autoComplete: "off"
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field, { label: t("invite.org"), hint: t("invite.optional"), children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "url",
                      value: link,
                      onChange: (e) => setLink(e.target.value),
                      placeholder: "https://",
                      className: fieldClass,
                      autoComplete: "off"
                    }
                  ) })
                ] }),
                step === 3 && /* @__PURE__ */ jsx(Field, { label: t("invite.storyLabel"), required: true, children: /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: whoYouAre,
                    onChange: (e) => setWhoYouAre(e.target.value),
                    placeholder: t("invite.phStory"),
                    className: `${fieldClass} min-h-[140px] resize-none py-3 leading-relaxed`,
                    autoFocus: true
                  }
                ) }),
                step === 4 && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                  /* @__PURE__ */ jsx(Field, { label: t("invite.introLabel"), hint: t("invite.optional"), children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: whoIntroduced,
                      onChange: (e) => setWhoIntroduced(e.target.value),
                      placeholder: t("invite.phIntro"),
                      className: fieldClass,
                      autoComplete: "off",
                      autoFocus: true
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { className: "border border-white/12 bg-white/[0.04] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md", children: [
                    /* @__PURE__ */ jsx("p", { className: "mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40", children: t("invite.intro") }),
                    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
                      organizationLogo ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: organizationLogo,
                          alt: "",
                          className: "size-9 border border-white/10 bg-white object-contain p-1"
                        }
                      ) : null,
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-[var(--bone-fixed)]", children: organization || "Kurum belirtilmedi" }),
                        organizationDomain ? /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] text-white/40", children: organizationDomain }) : null
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
                      /* @__PURE__ */ jsx(SummaryRow, { label: t("invite.howEnter"), value: roles.find((r) => r.value === role)?.label ?? "·" }),
                      /* @__PURE__ */ jsx(SummaryRow, { label: "İsim", value: name || "·" }),
                      /* @__PURE__ */ jsx(SummaryRow, { label: "Email", value: email || "·" }),
                      linkedin ? /* @__PURE__ */ jsx(SummaryRow, { label: "LinkedIn", value: linkedin }) : null
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "sr-only", "aria-hidden": true, children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      tabIndex: -1,
                      autoComplete: "off",
                      value: fax,
                      onChange: (e) => setFax(e.target.value)
                    }
                  ) }),
                  isError ? /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-widest text-[var(--error)]", children: "Bir şeyler ters gitti. Tekrar dene." }) : null
                ] })
              ]
            },
            step
          ) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: goBack,
                disabled: step === 0,
                className: "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:text-white disabled:invisible",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "size-3.5" }),
                  t("common.back")
                ]
              }
            ),
            step < steps.length - 1 ? /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: goNext,
                disabled: !canNext,
                className: "inline-flex items-center gap-2 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 disabled:opacity-35",
                children: [
                  t("invite.continue"),
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" })
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: handleSubmit,
                disabled: isPending || !role,
                className: "inline-flex items-center gap-2 bg-[var(--bone-fixed)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 disabled:opacity-35",
                children: [
                  isPending ? t("invite.submitting") : t("invite.submit"),
                  !isPending ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5" }) : null
                ]
              }
            )
          ] })
        ]
      },
      "wizard"
    ) }) })
  ] });
}
function Field({
  label,
  hint,
  required,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "font-mono text-[10px] uppercase tracking-widest text-white/65 sm:text-[11px]", children: [
        label,
        required ? /* @__PURE__ */ jsx("span", { className: "text-[var(--inner-green)]", children: " *" }) : null
      ] }),
      hint ? /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-white/30", children: hint }) : null
    ] }),
    children
  ] });
}
function SummaryRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsx("dt", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "truncate text-right text-[var(--bone-fixed)]/85", children: value })
  ] });
}
function SitePublicShell({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "site-atmosphere flex min-h-screen flex-col bg-[var(--ink-fixed)] text-[var(--bone-fixed)]", children: [
    /* @__PURE__ */ jsx(FloatingNavbar, { placement: "static" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1", children }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
const SITE = "https://inner.digital";
function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}
function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
function useSeo({
  title,
  description,
  canonicalPath,
  ogImage = "https://inner.digital/inner-og.png",
  type = "website",
  jsonLd,
  noIndex = false
}) {
  const json = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const fullTitle = title.includes("inner") ? title : `${title} · inner.hub`;
    const canonical = canonicalPath.startsWith("http") ? canonicalPath : `${SITE}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta(
      "property",
      "og:type",
      type === "article" ? "article" : type === "video.other" ? "video.other" : "website"
    );
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);
    if (json) upsertJsonLd("ih-jsonld", JSON.parse(json));
  }, [title, description, canonicalPath, ogImage, type, json, noIndex]);
}
function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE}${item.path}`
    }))
  };
}
const SEO_POSTS = [
  {
    slug: "kapali-cember-deal-flow",
    kind: "article",
    publishedAt: "2026-07-18",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/capital-events.jpg",
    coverAlt: "Deal flow and capital in a closed circle",
    tr: {
      title: "Kapalı çember deal flow’u nasıl hızlandırır?",
      description: "Davetiye ile girilen kurucu-yatırımcı ağlarında deal flow neden daha hızlı ve kaliteli ilerler? inner.hub modeli, güven, uyum ve erken sinyal üzerine.",
      answer: "Kapalı çemberde deal flow hızlanır çünkü her bağlantı önceden filtrelenmiş güvene dayanır. Açık ağlarda gürültü artar; davetiye ile kurulan çemberde sinyal, sermaye ve kurucu aynı standartta buluşur.",
      body: [
        "Deal flow, bir yatırımcı veya kurucu için yalnızca “kaç fırsat gördüm” meselesi değildir. Asıl soru şudur: görülen fırsatların kaçı güvenilir bağlamda geldi, kaçı zaman kaybı oldu?",
        "Açık platformlar ölçek için tasarlanır. Herkes bağlanabilir; herkes mesaj atabilir. Bu, hacmi artırır ama sinyal-gürültü oranını düşürür. Kapalı çember tersini seçer: üyelik kısıtlıdır, giriş davetiye iledir, her isim içeriden gelir.",
        "inner.hub’da bir kurucu ile yatırımcı aynı masaya oturduğunda, aralarındaki bağın arkasında bir üyenin itibarı vardır. Bu, soğuk outbound’dan farklı bir psikoloji üretir. İlk konuşma “kimsin?” değil, “ne inşa ediyorsun?” olur.",
        "Erken aşama AI girişimlerinde zaman en pahalı kaynaktır. Yanlış intro, yanlış pitch, yanlış term sheet - hepsi haftalar alır. Kapalı çember, bu maliyeti düşürmek için tasarlanır: uyum önce, hacim sonra.",
        "Pratikte deal flow üç katmanda hızlanır. Bir: kalite filtresi (davetiye). İki: bağlamsal intro (üye önerisi). Üç: ortak dil (çemberin standartları). inner.hub bu üç katmanı aynı ürün yüzünde tutar.",
        "Bu model “elitizm” değildir. Standarttır. Herkese açık olmayan bir oda, herkesin aynı kalitede konuşmasını mümkün kılar. Gathering’ler, signal board’lar ve eşleşme bu standardın üzerine kurulur.",
        "Özetle: kapalı çember deal flow’u hızlandırır çünkü güven önceden birikmiştir. inner.hub, bu birikimi İstanbul’dan global bir ağa taşımak için kurulmuştur."
      ],
      tags: ["deal flow", "davetiye", "yatırımcı", "kurucu", "SEO"],
      faq: [
        {
          q: "Kapalı çember açık ağdan daha mı iyidir?",
          a: "Amaç hacimse açık ağ; amaç uyum ve güvenli deal flow ise kapalı çember daha etkilidir. inner.hub ikincisini seçer."
        },
        {
          q: "Deal flow nasıl ölçülür?",
          a: "Ham lead sayısı değil; nitelikli intro, takip eden görüşme ve kapanan ilişki oranı daha doğru ölçüttür."
        }
      ]
    },
    en: {
      title: "How a closed circle accelerates deal flow",
      description: "Why invitation-only founder-investor networks move deal flow faster and with higher signal - the inner.hub model of trust, fit, and early access.",
      answer: "Deal flow accelerates in a closed circle because every connection sits on pre-filtered trust. Open networks add noise; invitation circles put founders, capital, and signal on the same standard.",
      body: [
        "Deal flow is not just volume. The real question is how many opportunities arrive with trusted context - and how many waste time.",
        "Open platforms optimize for scale. Anyone can connect; anyone can message. Volume rises; signal-to-noise falls. A closed circle chooses the opposite: limited membership, invitation entry, names from inside.",
        "When a founder and an investor meet inside inner.hub, someone’s reputation sits behind the intro. That changes the first conversation from “who are you?” to “what are you building?”",
        "In early AI, time is the scarcest resource. Bad intros and bad process cost weeks. The closed circle is designed to cut that cost: fit first, volume later.",
        "In practice, deal flow speeds up in three layers: quality filter (invitation), contextual intro (member referral), shared language (circle standards). inner.hub keeps all three in one product surface.",
        "This is not elitism. It is a standard. A room that is not open to everyone allows everyone inside to speak at the same bar. Gatherings, signal, and matching sit on that bar.",
        "Bottom line: closed circles accelerate deal flow because trust is prepaid. inner.hub exists to compound that trust from İstanbul outward."
      ],
      tags: ["deal flow", "invitation", "investor", "founder", "SEO"],
      faq: [
        {
          q: "Is a closed circle better than an open network?",
          a: "If the goal is volume, open wins. If the goal is trusted deal flow, closed circles win. inner.hub chooses the latter."
        },
        {
          q: "How should deal flow be measured?",
          a: "Not raw lead count - qualified intros, follow-on conversations, and closed relationships are better metrics."
        }
      ]
    }
  },
  {
    slug: "istanbul-ai-kurucu-agi",
    kind: "article",
    publishedAt: "2026-07-16",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/match-hero.jpg",
    coverAlt: "İstanbul AI founder network",
    tr: {
      title: "İstanbul’dan global AI kurucu ağı nasıl kurulur?",
      description: "İstanbul neden AI kurucuları için erken buluşma noktası olabilir? inner.hub’ın yerel derinlik + global erişim stratejisi ve davetiye ile büyüme modeli.",
      answer: "İstanbul’dan global bir AI kurucu ağı, yerel derinlik ve seçici davetiye ile kurulur. Önce otuz dört kişilik kurucu çember; sonra aynı standartla genişleyen global katman. inner.hub bu yolu seçer.",
      body: [
        "Birçok ağ ters sırayla büyür: önce global marka, sonra yerel içerik. Bu yaklaşım hızlı görünür ama kök tutmaz. inner.hub tersini yapar - İstanbul’da gerçek bir çember, ardından global yayılım.",
        "İstanbul’un avantajı coğrafya değil; yoğunluktur. Kurucular, yatırımcılar ve builder’lar aynı şehirde erken buluşabilir. Bu fiziksel yakınlık, dijital araçlarla birleşince sinyal hızlanır.",
        "Kurucu çember (ilk 34) bilinçli olarak küçüktür. Amaç, “herkes” olmak değil; standardı taşıyan bir çekirdek oluşturmaktır. Her yeni üye bu çekirdeğin itibarını miras alır.",
        "Global katman, yerel kaliteyi sulandırmadan eklenir. Aynı davetiye mantığı, aynı uyum kriteri, aynı gathering disiplini. Farklı şehirler, aynı bar.",
        "AI özelinde hız kritiktir. Model, ürün ve sermaye döngüleri kısadır. Erken doğru insanlarla aynı odada olmak, altı ay sonra “keşke” dememek demektir.",
        "inner.hub platform katmanları - signal, match, capital, vault - bu ağın üzerine oturur. Ağ sosyal bir sohbet değil; iş üreten bir altyapıdır.",
        "Sonuç: İstanbul başlangıçtır, sınır değildir. Global AI kurucu ağı, yerel güvenin üzerine inşa edildiğinde dayanıklı olur."
      ],
      tags: ["İstanbul", "AI", "kurucu ağı", "global", "davetiye"],
      faq: [
        {
          q: "Neden İstanbul?",
          a: "Yoğun kurucu-yatırımcı kesişimi ve erken fiziksel buluşma imkanı; global genişleme için sağlam bir çekirdek sağlar."
        },
        {
          q: "Global üyelik ne zaman açılır?",
          a: "Kurucu çember standardı oturdukça, aynı davetiye modeli ile şehir şehir genişler - açık başvuru ile değil."
        }
      ]
    },
    en: {
      title: "How to build a global AI founder network from İstanbul",
      description: "Why İstanbul can be an early meeting point for AI founders - inner.hub’s local depth + global reach strategy and invitation-led growth.",
      answer: "A global AI founder network from İstanbul is built with local depth and selective invitations. First a founding circle of thirty-four; then a global layer on the same standard. That is the inner.hub path.",
      body: [
        "Many networks grow backwards: global brand first, local substance later. It looks fast and rarely roots. inner.hub does the opposite - a real circle in İstanbul, then global expansion.",
        "İstanbul’s edge is density, not geography. Founders, investors, and builders can meet early in one city. Physical proximity plus digital tools speeds signal.",
        "The founding circle (first 34) is intentionally small. The goal is not “everyone” - it is a core that carries the standard. Every new member inherits that reputation.",
        "The global layer is added without diluting local quality. Same invitation logic, same fit bar, same gathering discipline. Different cities, same standard.",
        "In AI, speed matters. Model, product, and capital cycles are short. Being in the right room early beats saying “if only” six months later.",
        "inner.hub’s platform layers - signal, match, capital, vault - sit on top of this network. It is infrastructure for work, not a chat club.",
        "Bottom line: İstanbul is the start, not the limit. A global AI founder network holds when it is built on local trust."
      ],
      tags: ["Istanbul", "AI", "founder network", "global", "invitation"],
      faq: [
        {
          q: "Why İstanbul?",
          a: "Dense founder-investor intersection and early in-person meetings create a durable core for global expansion."
        },
        {
          q: "When does global membership open?",
          a: "As the founding standard settles, the same invitation model expands city by city - not via open apply."
        }
      ]
    }
  },
  {
    slug: "gathering-vs-konferans",
    kind: "article",
    publishedAt: "2026-07-14",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/gathering.jpg",
    coverAlt: "Private gathering room",
    tr: {
      title: "Gathering ile konferans arasındaki fark nedir?",
      description: "inner.hub gathering’i bir konferans değildir. Kapalı oda, seçili katılımcı, iş üreten format - konferans ekonomisinden neden farklılaşır?",
      answer: "Gathering, konferans değildir: biletli sahne yerine davetiye ile girilen kapalı bir çalışma odasıdır. Amaç içerik tüketmek değil; sinyal, sermaye ve kurucuları aynı standartta buluşturmaktır.",
      body: [
        "Konferanslar ölçek için tasarlanır: sahne, sponsor, bilet, networking cocktail. Bu formatın değeri vardır - ama erken aşama güven ve deal flow için çoğu zaman fazla gürültülüdür.",
        "Gathering tersine çevrilmiş bir odadır. Katılımcı sayısı düşüktür. Herkes davetiye ile gelir. Program, “konuşmacı dinle” değil “birlikte çalış” mantığındadır.",
        "inner.hub gathering’inde otuz dört kişi bir araya gelir. Bu sayı tesadüf değildir: yeterince çeşitli, yeterince yoğun, yeterince yönetilebilir. Kalabalık değil; çember.",
        "Gündem, ürün demoları, sermaye konuşmaları ve eşleşme üzerine kurulur. Sahne show’u değil, iş masası. Kayıtlar ve erişim davetiye sürecinin içinde kalır.",
        "Konferansta kartvizit değişir. Gathering’de itibar değişir. Bir üyenin önerdiği isim, çemberin ortak belleğine girer.",
        "Bu yüzden gathering SEO ve AEO açısından da net bir cevap üretir: “inner.hub gathering nedir?” sorusunun yanıtı “özel bir çalışma buluşması”dır - genel etkinlik değil.",
        "İstanbul Eylül 2026 gathering’i bu modelin ilk kamusal ifadesidir. Sonraki buluşmalar aynı disiplini taşır: kapalı, seçili, iş odaklı."
      ],
      tags: ["gathering", "konferans", "etkinlik", "İstanbul", "çember"],
      faq: [
        {
          q: "Gathering’e nasıl katılınır?",
          a: "Genel bilet satışı yoktur. Erişim davetiye ve üyelik süreci üzerinden ilerler."
        },
        {
          q: "Konferansa benzer mi?",
          a: "Hayır. Sahne ve sponsor odaklı değil; kapalı oda ve iş üretme odaklıdır."
        }
      ]
    },
    en: {
      title: "Gathering vs conference: what’s the difference?",
      description: "An inner.hub gathering is not a conference. Closed room, invited guests, work-first format - why it diverges from conference economics.",
      answer: "A gathering is not a conference: it is an invitation-only working room, not a ticketed stage. The goal is not content consumption - it is putting signal, capital, and founders on one standard.",
      body: [
        "Conferences are built for scale: stage, sponsors, tickets, networking cocktails. Valuable - and often too noisy for early trust and deal flow.",
        "A gathering inverts the room. Attendance is small. Everyone is invited. The program is “work together,” not “watch speakers.”",
        "At an inner.hub gathering, thirty-four people meet. That number is intentional: diverse enough, dense enough, manageable enough. Not a crowd - a circle.",
        "The agenda centers product, capital conversations, and matching. Work table, not stage show. Access stays inside the invitation flow.",
        "At conferences, business cards move. At gatherings, reputation moves. A name referred by a member enters the circle’s shared memory.",
        "That is why gathering also answers SEO/AEO cleanly: “What is an inner.hub gathering?” - a private working meetup, not a generic event.",
        "The İstanbul September 2026 gathering is the first public expression of this model. Later gatherings carry the same discipline: closed, selective, work-first."
      ],
      tags: ["gathering", "conference", "event", "Istanbul", "circle"],
      faq: [
        {
          q: "How do I attend a gathering?",
          a: "There is no public ticket sale. Access moves through invitation and membership."
        },
        {
          q: "Is it like a conference?",
          a: "No. It is not stage-and-sponsor led - it is a closed room built to produce work."
        }
      ]
    }
  },
  {
    slug: "aeo-icin-net-cevaplar",
    kind: "article",
    publishedAt: "2026-07-12",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/perks-ambient.jpg",
    coverAlt: "Clear answers for search and answer engines",
    tr: {
      title: "AEO nedir? Cevap motorları için nasıl yazılır?",
      description: "AEO (Answer Engine Optimization) nedir, SEO’dan farkı nedir? inner.hub haberlerinde net cevap, FAQ şeması ve uzun form içerikle nasıl uygulanır?",
      answer: "AEO, içeriği arama motorlarından ziyade cevap motorları (ChatGPT, Perplexity, Google AI Overviews) için optimize etmektir. Net bir ilk cevap, yapılandırılmış FAQ ve kanıtlayan uzun gövde ile yapılır.",
      body: [
        "Klasik SEO anahtar kelime ve backlink odaklıydı. AEO ise “bu sorunun en temiz cevabı nedir?” sorusuna odaklanır. Modeller, sayfanın ilk net paragrafını ve FAQ bloklarını sıkça öne çıkarır.",
        "inner.hub Haberler’de her yazı bir answer (doğrudan cevap) ile açılır. Bu paragraf 40-60 kelime civarındadır; soruyu yineler ve tek cümlede çözüm verir.",
        "Ardından uzun gövde gelir: bağlam, mekanizma, örnek, sınır. Cevap motorları kısa özeti sever; insanlar ve klasik SEO derinliği ister. İkisini birlikte tutmak gerekir.",
        "FAQ şeması (FAQPage JSON-LD) AEO için güçlendiricidir. “Gathering nedir?”, “Davetiye nasıl alınır?” gibi sorular ayrı soru-cevap çiftleri olarak işaretlenir.",
        "Video haberlerde VideoObject şeması + kısa yazılı özet birlikte çalışır. Motor hem medyayı hem metni okur.",
        "Marka tutarlılığı AEO’da kritiktir. “inner.hub”, “davetiye”, “çember”, “gathering” aynı anlamda tekrar ederse modeller markayı doğru bağlar.",
        "Pratik checklist: (1) H1 soruya yakın olsun. (2) İlk blokta net cevap. (3) 4+ paragraf kanıt. (4) FAQ. (5) Canonical + sitemap. (6) İç link (davetiye, gathering).",
        "Flexlore Content Creator Flow bağlandığında blog, post ve caption aynı AEO şablonundan üretilecek: answer → body → faq → tags. Bu sayfa yapısı o akışa hazırdır."
      ],
      tags: ["AEO", "SEO", "cevap motoru", "FAQ", "içerik"],
      faq: [
        {
          q: "AEO ile SEO aynı şey mi?",
          a: "Hayır. SEO sıralama ve tıklama; AEO ise modellerin doğrudan alıntılayacağı net cevaplar üretmektir. Birbirini tamamlar."
        },
        {
          q: "İyi bir AEO cevabı ne kadar olmalı?",
          a: "Genelde 40-60 kelimelik tek paragraf yeterlidir; ardından uzun gövde ve FAQ ile desteklenir."
        }
      ]
    },
    en: {
      title: "What is AEO? How to write for answer engines",
      description: "What Answer Engine Optimization is, how it differs from SEO, and how inner.hub news uses clear answers, FAQ schema, and long-form proof.",
      answer: "AEO optimizes content for answer engines (ChatGPT, Perplexity, Google AI Overviews), not only classic search rankings. It starts with a clear first answer, structured FAQ, and a long body that proves the claim.",
      body: [
        "Classic SEO centered keywords and backlinks. AEO asks: what is the cleanest answer to this question? Models often surface the first clear paragraph and FAQ blocks.",
        "In inner.hub Haberler, every piece opens with an answer block - roughly 40-60 words that restate the question and resolve it in one breath.",
        "Then comes the long body: context, mechanism, examples, limits. Answer engines like brevity; humans and classic SEO want depth. You need both.",
        "FAQ schema (FAQPage JSON-LD) strengthens AEO. Questions like “What is a gathering?” become explicit Q&A pairs.",
        "For video news, VideoObject schema plus a short written summary work together. Engines read both media and text.",
        "Brand consistency matters. Repeating “inner.hub”, “invitation”, “circle”, and “gathering” with stable meaning helps models bind the brand correctly.",
        "Practical checklist: (1) H1 near the query. (2) Clear answer first. (3) 4+ proof paragraphs. (4) FAQ. (5) Canonical + sitemap. (6) Internal links (invitation, gathering).",
        "When Flexlore Content Creator Flow connects, blog, posts, and captions will ship from the same AEO template: answer → body → faq → tags. This page structure is ready for that flow."
      ],
      tags: ["AEO", "SEO", "answer engine", "FAQ", "content"],
      faq: [
        {
          q: "Are AEO and SEO the same?",
          a: "No. SEO is rankings and clicks; AEO is producing clear answers models can quote. They complement each other."
        },
        {
          q: "How long should an AEO answer be?",
          a: "Usually a 40-60 word paragraph is enough, then support it with a long body and FAQ."
        }
      ]
    }
  }
];
const ARTIFACTS = [
  {
    slug: "inner-hub-neden-davetiye",
    kind: "article",
    publishedAt: "2026-07-20",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/gathering.jpg",
    coverAlt: "inner hub gathering atmosphere",
    tr: {
      title: "Neden davetiye ile giriş?",
      description: "inner.hub neden açık başvuru değil de davetiye kullanır? Kapalı çember, erken sinyal ve güven temelli üyelik.",
      answer: "inner.hub davetiye ile girilir çünkü çember kalabalık değil uyum ister. Üyeler içeriden önerilir, özenle değerlendirilir ve kişisel olarak davet edilir.",
      body: [
        "Açık platformlar ölçeklenir; kapalı çemberler güven biriktirir. inner.hub ikincisini seçer.",
        "Bir isim içeriden gelir. Uyum, şöhretten önce gelir. Uygunsa davetiye kişisel olarak ulaşır.",
        "Bu model deal flow, eşleşme ve bilgi paylaşımını mümkün kılar: herkes aynı masada değil, aynı standartta."
      ],
      tags: ["davetiye", "üyelik", "çember"],
      faq: [
        {
          q: "Davetiye olmadan üye olunur mu?",
          a: "Hayır. Erişim davetiye ile başlar; açık başvuru formu üyelik garantisi vermez."
        }
      ]
    },
    en: {
      title: "Why invitation-only entry?",
      description: "Why inner.hub uses invitations instead of open apply - closed circle, early signal, trust-based membership.",
      answer: "inner.hub is invitation-only because the circle optimizes for fit, not crowd. Members are put forward from inside, considered carefully, and invited personally.",
      body: [
        "Open platforms scale. Closed circles compound trust. inner.hub chooses the latter.",
        "A name comes from inside. Fit beats fame. If it is right, the invitation arrives personally.",
        "That standard makes deal flow, matching, and knowledge sharing possible - same bar, not same crowd."
      ],
      tags: ["invitation", "membership", "circle"],
      faq: [
        {
          q: "Can I join without an invitation?",
          a: "No. Access starts with an invitation; an open form does not guarantee membership."
        }
      ]
    }
  },
  {
    slug: "istanbul-gathering-2026",
    kind: "video",
    publishedAt: "2026-07-22",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/courses-hero.jpg",
    coverAlt: "İstanbul gathering visual",
    video: {
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
      durationSeconds: 18,
      thumbnail: "/posters/gathering.jpg"
    },
    tr: {
      title: "İstanbul gathering · Eylül 2026",
      description: "İlk inner.hub buluşması: otuz dört kişi, iki gün, bir çember. İstanbul, Eylül 2026 kısa video özeti.",
      answer: "İlk inner.hub gathering İstanbul’da, Eylül 2026’da. Otuz dört kişi, iki gün, bir çember - birçoklarının ilki.",
      body: [
        "Buluşma bir konferans değil; kapalı bir çalışma alanı. Sinyal, sermaye ve inşa aynı masada.",
        "Kayıt ve detaylar davetiye sürecinin içinde ilerler. Genel bilet satışı yok."
      ],
      tags: ["gathering", "İstanbul", "video"]
    },
    en: {
      title: "İstanbul gathering · September 2026",
      description: "The first inner.hub gathering: thirty-four people, two days, one circle. Short video brief for September 2026 in İstanbul.",
      answer: "The first inner.hub gathering is in İstanbul, September 2026. Thirty-four people, two days, one circle - the first of many.",
      body: [
        "It is not a conference. It is a closed working room where signal, capital, and builders meet.",
        "Access stays inside the invitation flow. There is no public ticket sale."
      ],
      tags: ["gathering", "Istanbul", "video"]
    }
  },
  ...SEO_POSTS
];
function getArtifact(slug) {
  return ARTIFACTS.find((a) => a.slug === slug);
}
function listArtifacts() {
  return [...ARTIFACTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
function artifactPath(slug) {
  return `/haberler/${slug}`;
}
function artifactsIndexPath() {
  return "/haberler";
}
function artifactAbsoluteUrl(slug) {
  return `https://inner.digital${artifactPath(slug)}`;
}
function copyFor(a, locale) {
  return locale === "en" ? a.en : a.tr;
}
function ArtifactsPage() {
  const t = useT();
  const { locale } = useLocale();
  const items = listArtifacts();
  const indexPath = artifactsIndexPath();
  const jsonLd = useMemo(
    () => [
      breadcrumbJsonLd([
        { name: "inner.hub", path: "/" },
        { name: t("artifacts.nav"), path: indexPath }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("artifacts.metaTitle"),
        description: t("artifacts.metaDescription"),
        url: `https://inner.digital${indexPath}`,
        isPartOf: { "@type": "WebSite", name: "inner.hub", url: "https://inner.digital" }
      }
    ],
    [t, indexPath]
  );
  useSeo({
    title: t("artifacts.metaTitle"),
    description: t("artifacts.metaDescription"),
    canonicalPath: indexPath,
    jsonLd
  });
  return /* @__PURE__ */ jsx(SitePublicShell, { children: /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-5xl px-4 py-14 sm:px-6 md:px-10 md:py-20 lg:px-[8%]", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-[10px] uppercase tracking-widest text-white/45", children: t("artifacts.eyebrow") }),
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: "max-w-2xl font-display font-serif italic text-4xl leading-[1.1] sm:text-5xl md:text-6xl",
        style: { fontVariationSettings: "'opsz' 144, 'WONK' 1" },
        children: t("artifacts.title")
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base", children: t("artifacts.subtitle") }),
    /* @__PURE__ */ jsx("ul", { className: "mt-14 space-y-0 border-t border-white/10", children: items.length === 0 ? /* @__PURE__ */ jsx("li", { className: "py-16 text-sm text-white/45", children: t("artifacts.empty") }) : items.map((item) => {
      const copy = copyFor(item, locale);
      return /* @__PURE__ */ jsx("li", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs(
        Link,
        {
          href: artifactPath(item.slug),
          className: "group grid grid-cols-1 gap-5 py-8 transition-colors md:grid-cols-[180px_1fr_auto] md:items-center md:gap-8",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-[16/10] overflow-hidden bg-white/5 md:aspect-[4/3]", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.coverImage,
                  alt: item.coverAlt,
                  className: "size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]",
                  loading: "lazy"
                }
              ),
              item.kind === "video" && /* @__PURE__ */ jsxs("span", { className: "absolute bottom-2 left-2 inline-flex items-center gap-1.5 bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--bone-fixed)]", children: [
                /* @__PURE__ */ jsx(Play, { className: "size-2.5 fill-current" }),
                t("artifacts.video")
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("p", { className: "mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
                item.kind === "video" ? t("artifacts.video") : t("artifacts.article"),
                /* @__PURE__ */ jsx("span", { className: "mx-2 text-white/20", children: "·" }),
                /* @__PURE__ */ jsx("time", { dateTime: item.publishedAt, children: new Date(item.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }) })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl text-[var(--bone-fixed)] transition-colors group-hover:text-white sm:text-2xl", children: copy.title }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 text-sm leading-relaxed text-white/50", children: copy.answer })
            ] }),
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "hidden size-5 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--inner-green)] md:block" })
          ]
        }
      ) }, item.slug);
    }) })
  ] }) });
}
function AutoplayVideo({ src, poster, label, className }) {
  const videoRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => {
      void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    tryPlay();
    const onVis = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [src]);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const seek = (ratio) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
    setProgress(ratio);
  };
  const fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative aspect-video overflow-hidden bg-black ${className ?? ""}`,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onFocusCapture: () => setHover(true),
      onBlurCapture: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
      },
      children: [
        /* @__PURE__ */ jsx(
          "video",
          {
            ref: videoRef,
            className: "absolute inset-0 size-full object-cover",
            playsInline: true,
            muted,
            loop: true,
            autoPlay: true,
            poster,
            preload: "auto",
            onClick: togglePlay,
            onTimeUpdate: () => {
              const v = videoRef.current;
              if (!v || !v.duration) return;
              setProgress(v.currentTime / v.duration);
            },
            onLoadedMetadata: () => {
              const v = videoRef.current;
              if (v) setDuration(v.duration);
            },
            onPlay: () => setPlaying(true),
            onPause: () => setPlaying(false),
            children: /* @__PURE__ */ jsx("source", { src, type: "video/mp4" })
          }
        ),
        label ? /* @__PURE__ */ jsxs("span", { className: "pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 bg-black/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--bone-fixed)]", children: [
          /* @__PURE__ */ jsx(Play, { className: "size-2.5 fill-current" }),
          label
        ] }) : null,
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-white/10 bg-gradient-to-t from-black/90 via-black/70 to-black/40 px-3 py-2.5 backdrop-blur-sm transition-opacity duration-200 ${hover ? "opacity-100" : "pointer-events-none opacity-0"}`,
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: togglePlay,
                  className: "flex size-8 shrink-0 items-center justify-center text-[var(--bone-fixed)]",
                  "aria-label": playing ? "Pause" : "Play",
                  children: playing ? /* @__PURE__ */ jsx(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "size-4 fill-current" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "relative h-1 flex-1 overflow-hidden bg-white/20",
                  "aria-label": "Seek",
                  onClick: (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - rect.left) / Math.max(rect.width, 1));
                  },
                  children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "absolute inset-y-0 left-0 bg-[var(--inner-green)]",
                      style: { width: `${progress * 100}%` }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 font-mono text-[10px] tabular-nums text-white/55", children: [
                fmt(progress * duration),
                " / ",
                fmt(duration)
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: toggleMute,
                  className: "flex size-8 shrink-0 items-center justify-center text-[var(--bone-fixed)]",
                  "aria-label": muted ? "Unmute" : "Mute",
                  children: muted ? /* @__PURE__ */ jsx(VolumeX, { className: "size-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "size-4" })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
function NotFound() {
  const t = useT();
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsx(Card, { className: "w-full max-w-md mx-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex mb-4 gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-red-500" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: t("notFound.title") })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-gray-600", children: t("notFound.body") }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/",
        className: "mt-6 inline-block text-sm font-medium text-gray-900 underline underline-offset-2 hover:opacity-70",
        children: t("notFound.backHome")
      }
    )
  ] }) }) });
}
function ArtifactDetailPage() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams();
  const artifact = params.slug ? getArtifact(params.slug) : void 0;
  const copy = artifact ? locale === "en" ? artifact.en : artifact.tr : null;
  const isVideo = Boolean(artifact?.kind === "video" && artifact.video);
  const indexPath = artifactsIndexPath();
  const jsonLd = useMemo(() => {
    if (!artifact || !copy) return void 0;
    const url = artifactAbsoluteUrl(artifact.slug);
    const articleLd = {
      "@context": "https://schema.org",
      "@type": isVideo ? "VideoObject" : "Article",
      headline: copy.title,
      name: copy.title,
      description: copy.description,
      datePublished: artifact.publishedAt,
      dateModified: artifact.updatedAt ?? artifact.publishedAt,
      author: {
        "@type": "Organization",
        name: artifact.author.name,
        url: artifact.author.url ?? "https://inner.digital"
      },
      publisher: {
        "@type": "Organization",
        name: "inner.hub",
        url: "https://inner.digital",
        logo: {
          "@type": "ImageObject",
          url: "https://inner.digital/inner-logo.png"
        }
      },
      mainEntityOfPage: url,
      image: [`https://inner.digital${artifact.coverImage}`],
      ...isVideo && artifact.video ? {
        contentUrl: artifact.video.src,
        embedUrl: url,
        thumbnailUrl: `https://inner.digital${artifact.video.thumbnail}`,
        uploadDate: artifact.publishedAt,
        duration: `PT${artifact.video.durationSeconds}S`
      } : {
        articleBody: [copy.answer, ...copy.body].join("\n\n"),
        wordCount: [copy.answer, ...copy.body].join(" ").split(/\s+/).length
      }
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: copy.title,
          acceptedAnswer: { "@type": "Answer", text: copy.answer }
        },
        ...(copy.faq ?? []).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      ]
    };
    return [
      breadcrumbJsonLd([
        { name: "inner.hub", path: "/" },
        { name: t("artifacts.nav"), path: indexPath },
        { name: copy.title, path: artifactPath(artifact.slug) }
      ]),
      articleLd,
      faqLd
    ];
  }, [artifact, copy, isVideo, t, indexPath]);
  useSeo({
    title: copy?.title ?? t("artifacts.metaTitle"),
    description: copy?.description ?? t("artifacts.metaDescription"),
    canonicalPath: artifact ? artifactPath(artifact.slug) : indexPath,
    ogImage: artifact ? `https://inner.digital${artifact.coverImage}` : void 0,
    type: isVideo ? "video.other" : "article",
    jsonLd,
    noIndex: !artifact
  });
  if (!artifact || !copy) return /* @__PURE__ */ jsx(NotFound, {});
  return /* @__PURE__ */ jsx(SitePublicShell, { children: /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-0", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: indexPath,
        className: "mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45 transition-colors hover:text-[var(--bone-fixed)]",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-3" }),
          t("artifacts.back")
        ]
      }
    ),
    /* @__PURE__ */ jsxs("p", { className: "mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
      isVideo ? t("artifacts.video") : t("artifacts.article"),
      /* @__PURE__ */ jsx("span", { className: "mx-2 text-white/20", children: "·" }),
      /* @__PURE__ */ jsx("time", { dateTime: artifact.publishedAt, children: new Date(artifact.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }) })
    ] }),
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: "font-display font-serif italic text-3xl leading-[1.15] sm:text-4xl md:text-5xl",
        style: { fontVariationSettings: "'opsz' 144, 'WONK' 1" },
        children: copy.title
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-6 border-l-2 border-[var(--inner-green)] pl-4 text-base leading-relaxed text-white/75 sm:text-lg", children: copy.answer }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 overflow-hidden border border-white/10 bg-black/40", children: isVideo && artifact.video ? /* @__PURE__ */ jsx(
      AutoplayVideo,
      {
        src: artifact.video.src,
        poster: artifact.video.thumbnail,
        label: t("artifacts.video")
      }
    ) : /* @__PURE__ */ jsx(
      "img",
      {
        src: artifact.coverImage,
        alt: artifact.coverAlt,
        className: "aspect-[16/9] w-full object-cover"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 space-y-5 text-[15px] leading-[1.7] text-white/65 sm:text-base", children: copy.body.map((para, i) => /* @__PURE__ */ jsx("p", { children: para }, `${artifact.slug}-p-${i}`)) }),
    copy.faq && copy.faq.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-12 border-t border-white/10 pt-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-6 font-display font-serif italic text-2xl", children: t("artifacts.faqTitle") }),
      /* @__PURE__ */ jsx("dl", { className: "space-y-6", children: copy.faq.map((f) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "font-mono text-[11px] uppercase tracking-widest text-white/50", children: f.q }),
        /* @__PURE__ */ jsx("dd", { className: "mt-2 text-[15px] leading-relaxed text-white/65", children: f.a })
      ] }, f.q)) })
    ] }),
    copy.tags.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8", children: copy.tags.map((tag) => /* @__PURE__ */ jsx(
      "li",
      {
        className: "border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45",
        children: tag
      },
      tag
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-14 flex flex-col gap-3 border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/55", children: t("artifacts.ctaHint") }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/invitation",
          className: "inline-flex items-center justify-center gap-2 bg-[var(--bone-fixed)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-fixed)]",
          children: [
            t("publicNav.requestInvitation"),
            /* @__PURE__ */ jsx("span", { className: "size-1.5 bg-[var(--inner-green)]", "aria-hidden": true })
          ]
        }
      )
    ] })
  ] }) });
}
function PublicRoutes() {
  return /* @__PURE__ */ jsxs(Switch, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", component: Home }),
    /* @__PURE__ */ jsx(Route, { path: "/invitation", component: Invitation }),
    /* @__PURE__ */ jsx(Route, { path: "/haberler", component: ArtifactsPage }),
    /* @__PURE__ */ jsx(Route, { path: "/haberler/:slug", component: ArtifactDetailPage }),
    /* @__PURE__ */ jsx(Route, { component: NotFound })
  ] });
}
function render3(url = "/") {
  const queryClient = new QueryClient();
  return renderToString(
    /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(I18nProvider, { children: /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(Router, { ssrPath: url, children: /* @__PURE__ */ jsx(PublicRoutes, {}) }) }) }) })
  );
}
export {
  render3 as render
};
