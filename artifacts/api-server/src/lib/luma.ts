/**
 * Luma Public API client (calendar-scoped).
 * Docs: https://docs.luma.com/reference/getting-started-with-your-api
 * Requires Luma Plus + LUMA_API_KEY (x-luma-api-key).
 */

const LUMA_BASE = "https://public-api.luma.com";

export type LumaLocationType =
  | "discord"
  | "meet"
  | "twitch"
  | "twitter"
  | "youtube"
  | "zoom"
  | "offline"
  | "missing"
  | "unknown";

export type LumaEventEntry = {
  platform?: string;
  id: string;
  name: string;
  start_at: string;
  end_at?: string | null;
  cover_url?: string | null;
  url?: string | null;
  meeting_url?: string | null;
  timezone?: string | null;
  location_type?: LumaLocationType | null;
  geo_address_json?: {
    address?: string;
    city_state?: string;
    full_address?: string;
    city?: string;
  } | null;
  hosts?: Array<{
    name?: string;
    avatar_url?: string | null;
  }> | null;
  guest_count?: number | null;
};

type ListResponse = {
  entries?: LumaEventEntry[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export function isLumaConfigured(): boolean {
  return Boolean(process.env.LUMA_API_KEY?.trim());
}

async function lumaFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const key = process.env.LUMA_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch(`${LUMA_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "x-luma-api-key": key,
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`[luma] ${path} → ${res.status}`, body.slice(0, 200));
    return null;
  }

  return (await res.json()) as T;
}

/** Calendar events (manage + listed/view). Soft-fails to [] if key missing or API errors. */
export async function listLumaCalendarEvents(opts?: {
  period?: "upcoming" | "past" | "all";
  limit?: number;
}): Promise<LumaEventEntry[]> {
  if (!isLumaConfigured()) return [];

  const limit = Math.min(opts?.limit ?? 50, 100);
  const params = new URLSearchParams();
  params.set("pagination_limit", String(limit));
  params.set("sort_column", "start_at");
  params.set("sort_direction", opts?.period === "past" ? "desc" : "asc");
  params.append("access", "manage");
  params.append("access", "view");

  const data = await lumaFetch<ListResponse>(`/v1/calendars/events/list?${params}`);
  const entries = data?.entries ?? [];

  const now = Date.now();
  if (opts?.period === "upcoming") {
    return entries.filter((e) => new Date(e.end_at || e.start_at).getTime() >= now);
  }
  if (opts?.period === "past") {
    return entries.filter((e) => new Date(e.end_at || e.start_at).getTime() < now);
  }
  return entries;
}

export function lumaLocationLabel(entry: LumaEventEntry): string {
  const geo =
    entry.geo_address_json?.full_address ||
    entry.geo_address_json?.address ||
    entry.geo_address_json?.city_state ||
    entry.geo_address_json?.city;
  if (geo) return geo;

  switch (entry.location_type) {
    case "zoom":
      return "Zoom";
    case "meet":
      return "Google Meet";
    case "discord":
      return "Discord";
    case "youtube":
      return "YouTube";
    case "twitch":
      return "Twitch";
    case "twitter":
      return "X / Twitter";
    case "offline":
      return "Yüz yüze";
    default:
      return entry.location_type && entry.location_type !== "missing" && entry.location_type !== "unknown"
        ? entry.location_type
        : "Konum yakında";
  }
}

export function mapLumaToHubEvent(entry: LumaEventEntry) {
  const end = entry.end_at || entry.start_at;
  const now = Date.now();
  const isPast = new Date(end).getTime() < now;
  const isOnline =
    entry.location_type != null &&
    entry.location_type !== "offline" &&
    entry.location_type !== "missing" &&
    entry.location_type !== "unknown";

  return {
    id: `luma:${entry.id}`,
    source: "luma" as const,
    title: entry.name,
    description: "",
    location: lumaLocationLabel(entry),
    startAt: entry.start_at,
    endAt: end,
    isPast,
    isPublished: true,
    format: (isOnline ? "online" : "in_person") as "online" | "in_person" | "hybrid",
    audience: "all",
    meetUrl: entry.meeting_url ?? null,
    passCost: 0,
    capacity: 0,
    registered: entry.guest_count ?? 0,
    isRegistered: false,
    lumaUrl: entry.url ?? null,
    coverUrl: entry.cover_url ?? null,
    hosts: (entry.hosts ?? [])
      .filter((h) => h?.name)
      .map((h) => ({ name: h.name!, avatarUrl: h.avatar_url ?? null })),
  };
}
