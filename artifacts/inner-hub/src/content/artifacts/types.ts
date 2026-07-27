export type ArtifactKind = "article" | "video";

export type ArtifactLocaleCopy = {
  title: string;
  description: string;
  /** AEO: ilk 40-60 kelimelik net cevap / özet */
  answer: string;
  body: string[];
  tags: string[];
  /** Ek FAQ - AEO / FAQPage şeması */
  faq?: { q: string; a: string }[];
};

export type Artifact = {
  slug: string;
  kind: ArtifactKind;
  publishedAt: string; // ISO date
  updatedAt?: string;
  author: { name: string; url?: string };
  coverImage: string;
  coverAlt: string;
  /** Video haberler için */
  video?: {
    src: string;
    durationSeconds: number;
    thumbnail: string;
  };
  tr: ArtifactLocaleCopy;
  en: ArtifactLocaleCopy;
};

export function artifactPath(slug: string): string {
  return `/haberler/${slug}`;
}

export function artifactsIndexPath(): string {
  return "/haberler";
}

export function artifactAbsoluteUrl(slug: string): string {
  return `https://inner.digital${artifactPath(slug)}`;
}
