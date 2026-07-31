import { fetchLinkPreview } from "./linkPreview";

export type SocialPreview = {
  title: string | null;
  description: string | null;
  image: string | null;
  company: string | null;
  website: string | null;
};

function cleanHandle(raw: string, network: "linkedin" | "github"): string {
  let h = raw.trim().replace(/^\/+|\/+$/g, "");
  h = h.replace(/^https?:\/\//i, "");
  h = h.replace(/^(www\.)?/i, "");
  if (network === "linkedin") {
    h = h.replace(/^linkedin\.com\/in\//i, "").replace(/^in\//i, "");
  } else {
    h = h.replace(/^github\.com\//i, "");
  }
  h = h.split(/[/?#]/)[0] ?? "";
  return h.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
}

/** "Name - Title at Company | LinkedIn" → parçala */
export function parseLinkedinOgTitle(title: string): {
  name: string | null;
  headline: string | null;
  company: string | null;
} {
  const cleaned = title.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
  if (!cleaned) return { name: null, headline: null, company: null };
  const parts = cleaned.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
  const name = parts[0] ?? null;
  const rest = parts.slice(1).join(" - ");
  let company: string | null = null;
  let headline: string | null = rest || null;
  const at = rest.match(/\bat\s+(.+)$/i);
  if (at?.[1]) {
    company = at[1].trim().slice(0, 50);
    headline = rest.replace(/\s+at\s+.+$/i, "").trim() || null;
  }
  return { name, headline: headline?.slice(0, 50) ?? null, company };
}

export async function fetchGithubSocialPreview(rawHandle: string): Promise<SocialPreview | null> {
  const handle = cleanHandle(rawHandle, "github");
  if (!handle) return null;

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "inner-hub-social-preview/1.0 (+https://inner.digital)",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub yanıt vermedi (${res.status})`);

  const json = (await res.json()) as {
    name?: string | null;
    login?: string;
    bio?: string | null;
    avatar_url?: string | null;
    company?: string | null;
    blog?: string | null;
  };

  return {
    title: (json.name || json.login || handle).slice(0, 200),
    description: json.bio?.slice(0, 500) ?? null,
    image: json.avatar_url ?? `https://github.com/${handle}.png`,
    company: json.company?.replace(/^@/, "").trim().slice(0, 50) || null,
    website: json.blog?.trim().slice(0, 120) || null,
  };
}

export async function fetchLinkedinSocialPreview(rawHandle: string): Promise<SocialPreview | null> {
  const handle = cleanHandle(rawHandle, "linkedin");
  if (!handle) return null;

  const url = `https://www.linkedin.com/in/${handle}`;
  try {
    const preview = await fetchLinkPreview(url);
    const parsed = preview.title ? parseLinkedinOgTitle(preview.title) : null;
    return {
      title: parsed?.name ?? preview.title,
      description: preview.description ?? parsed?.headline ?? null,
      image: preview.image,
      company: parsed?.company ?? null,
      website: null,
    };
  } catch {
    // LinkedIn scraper'sız da en azından handle ile önizleme göster
    return {
      title: handle,
      description: null,
      image: null,
      company: null,
      website: null,
    };
  }
}
