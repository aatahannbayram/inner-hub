const PH_GRAPHQL = "https://api.producthunt.com/v2/api/graphql";
const STALE_MS = 60 * 60 * 1000; // 1 saat

export type ProductHuntPost = {
  id: string;
  slug: string;
  url: string;
  votesCount: number;
};

/** producthunt.com/posts/{slug} veya /products/... yollarından slug çıkar. */
export function parseProductHuntUrl(raw: string): { slug: string; url: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "producthunt.com") return null;

  const parts = parsed.pathname.split("/").filter(Boolean);
  // /posts/slug  |  /products/slug  |  /posts/slug/…
  if (parts.length >= 2 && (parts[0] === "posts" || parts[0] === "products")) {
    const slug = parts[1]!;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(slug)) return null;
    return {
      slug,
      url: `https://www.producthunt.com/posts/${slug}`,
    };
  }
  return null;
}

export function isPhSyncStale(syncedAt: Date | null | undefined): boolean {
  if (!syncedAt) return true;
  return Date.now() - syncedAt.getTime() > STALE_MS;
}

function getToken(): string | null {
  const t = process.env.PRODUCT_HUNT_TOKEN?.trim();
  return t || null;
}

export async function fetchProductHuntPost(slug: string): Promise<ProductHuntPost | null> {
  const token = getToken();
  if (!token) return null;

  const query = `
    query PostBySlug($slug: String!) {
      post(slug: $slug) {
        id
        slug
        url
        votesCount
      }
    }
  `;

  try {
    const res = await fetch(PH_GRAPHQL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { slug } }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { post?: { id: string; slug: string; url: string; votesCount: number } | null };
      errors?: unknown[];
    };
    const post = json.data?.post;
    if (!post?.id) return null;
    return {
      id: String(post.id),
      slug: post.slug || slug,
      url: post.url || `https://www.producthunt.com/posts/${slug}`,
      votesCount: Number(post.votesCount) || 0,
    };
  } catch {
    return null;
  }
}

/** URL verilince slug parse + (token varsa) PH post çek. Token yoksa sadece URL/slug döner. */
export async function resolveProductHuntLink(rawUrl: string): Promise<{
  productHuntUrl: string;
  productHuntId: string | null;
  phVotesCount: number | null;
  phSyncedAt: Date | null;
} | null> {
  const parsed = parseProductHuntUrl(rawUrl);
  if (!parsed) return null;

  const post = await fetchProductHuntPost(parsed.slug);
  if (post) {
    return {
      productHuntUrl: post.url,
      productHuntId: post.id,
      phVotesCount: post.votesCount,
      phSyncedAt: new Date(),
    };
  }
  return {
    productHuntUrl: parsed.url,
    productHuntId: null,
    phVotesCount: null,
    phSyncedAt: null,
  };
}
