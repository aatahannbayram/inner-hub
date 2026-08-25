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
  ...SEO_POSTS,
];

export function getArtifact(slug: string): Artifact | undefined {
  return ARTIFACTS.find((a) => a.slug === slug);
}

export function listArtifacts(): Artifact[] {
  return [...ARTIFACTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
