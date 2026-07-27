import type { Artifact } from "./types";
import { SEO_POSTS } from "./posts";

/**
 * Statik artifacts - CMS / Flexlore Content Creator Flow gelene kadar
 * SEO/AEO kaynak gerçeklik (blog, post, caption buradan yayınlanacak).
 * Yeni içerik ekle → sitemap’e de ekle.
 */
export const ARTIFACTS: Artifact[] = [
  {
    slug: "inner-hub-neden-davetiye",
    kind: "article",
    publishedAt: "2026-07-20",
    author: { name: "inner hub", url: "https://inner.digital" },
    coverImage: "/posters/gathering.jpg",
    coverAlt: "inner hub gathering atmosphere",
    tr: {
      title: "Neden davetiye ile giriş?",
      description:
        "inner.hub neden açık başvuru değil de davetiye kullanır? Kapalı çember, erken sinyal ve güven temelli üyelik.",
      answer:
        "inner.hub davetiye ile girilir çünkü çember kalabalık değil uyum ister. Üyeler içeriden önerilir, özenle değerlendirilir ve kişisel olarak davet edilir.",
      body: [
        "Açık platformlar ölçeklenir; kapalı çemberler güven biriktirir. inner.hub ikincisini seçer.",
        "Bir isim içeriden gelir. Uyum, şöhretten önce gelir. Uygunsa davetiye kişisel olarak ulaşır.",
        "Bu model deal flow, eşleşme ve bilgi paylaşımını mümkün kılar: herkes aynı masada değil, aynı standartta.",
      ],
      tags: ["davetiye", "üyelik", "çember"],
      faq: [
        {
          q: "Davetiye olmadan üye olunur mu?",
          a: "Hayır. Erişim davetiye ile başlar; açık başvuru formu üyelik garantisi vermez.",
        },
      ],
    },
    en: {
      title: "Why invitation-only entry?",
      description:
        "Why inner.hub uses invitations instead of open apply - closed circle, early signal, trust-based membership.",
      answer:
        "inner.hub is invitation-only because the circle optimizes for fit, not crowd. Members are put forward from inside, considered carefully, and invited personally.",
      body: [
        "Open platforms scale. Closed circles compound trust. inner.hub chooses the latter.",
        "A name comes from inside. Fit beats fame. If it is right, the invitation arrives personally.",
        "That standard makes deal flow, matching, and knowledge sharing possible - same bar, not same crowd.",
      ],
      tags: ["invitation", "membership", "circle"],
      faq: [
        {
          q: "Can I join without an invitation?",
          a: "No. Access starts with an invitation; an open form does not guarantee membership.",
        },
      ],
    },
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
      thumbnail: "/posters/gathering.jpg",
    },
    tr: {
      title: "İstanbul gathering · Eylül 2026",
      description:
        "İlk inner.hub buluşması: otuz dört kişi, iki gün, bir çember. İstanbul, Eylül 2026 kısa video özeti.",
      answer:
        "İlk inner.hub gathering İstanbul’da, Eylül 2026’da. Otuz dört kişi, iki gün, bir çember - birçoklarının ilki.",
      body: [
        "Buluşma bir konferans değil; kapalı bir çalışma alanı. Sinyal, sermaye ve inşa aynı masada.",
        "Kayıt ve detaylar davetiye sürecinin içinde ilerler. Genel bilet satışı yok.",
      ],
      tags: ["gathering", "İstanbul", "video"],
    },
    en: {
      title: "İstanbul gathering · September 2026",
      description:
        "The first inner.hub gathering: thirty-four people, two days, one circle. Short video brief for September 2026 in İstanbul.",
      answer:
        "The first inner.hub gathering is in İstanbul, September 2026. Thirty-four people, two days, one circle - the first of many.",
      body: [
        "It is not a conference. It is a closed working room where signal, capital, and builders meet.",
        "Access stays inside the invitation flow. There is no public ticket sale.",
      ],
      tags: ["gathering", "Istanbul", "video"],
    },
  },
  ...SEO_POSTS,
];

export function getArtifact(slug: string): Artifact | undefined {
  return ARTIFACTS.find((a) => a.slug === slug);
}

export function listArtifacts(): Artifact[] {
  return [...ARTIFACTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
