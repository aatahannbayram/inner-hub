import { JWT } from "google-auth-library";

export type Ga4WebReport = {
  connected: boolean;
  source: "google" | "none";
  propertyId: string | null;
  measurementId: string | null;
  error?: string;
  visitors: number;
  views: number;
  daily: { date: string; visitors: number; views: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
};

function measurementId(): string | null {
  return (
    process.env.GA_MEASUREMENT_ID?.trim() ||
    process.env.VITE_GA_MEASUREMENT_ID?.trim() ||
    "G-FGLJ0ECVDD"
  );
}

function propertyId(): string | null {
  const id = process.env.GA4_PROPERTY_ID?.trim();
  return id || null;
}

function serviceAccountConfigured(): boolean {
  return Boolean(
    process.env.GA4_CLIENT_EMAIL?.trim() && process.env.GA4_PRIVATE_KEY?.trim() && propertyId(),
  );
}

function daysAgoLabel(days: number): string {
  return `${days}daysAgo`;
}

function parseGaDate(raw: string): string {
  // YYYYMMDD → YYYY-MM-DD
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GA4_CLIENT_EMAIL!.trim();
  const key = process.env.GA4_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const client = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("GA4 access token alınamadı");
  return token;
}

async function runReport(
  token: string,
  propId: string,
  body: Record<string, unknown>,
): Promise<any> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 API ${res.status}: ${text.slice(0, 280)}`);
  }
  return res.json();
}

/** GA4 Data API — service account + property id gerekir. */
export async function fetchGa4WebReport(rangeDays: number): Promise<Ga4WebReport> {
  const mid = measurementId();
  const prop = propertyId();
  const empty: Ga4WebReport = {
    connected: false,
    source: "none",
    propertyId: prop,
    measurementId: mid,
    visitors: 0,
    views: 0,
    daily: [],
    topPages: [],
    topReferrers: [],
    devices: [],
  };

  if (!serviceAccountConfigured()) {
    return {
      ...empty,
      error: "GA4_PROPERTY_ID + GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY gerekli",
    };
  }

  try {
    const token = await getAccessToken();
    const startDate = daysAgoLabel(Math.max(1, rangeDays - 1));
    const dateRange = { startDate, endDate: "today" };

    const [totals, daily, pages, refs, devices] = await Promise.all([
      runReport(token, prop!, {
        dateRanges: [dateRange],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      }),
      runReport(token, prop!, {
        dateRanges: [dateRange],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      runReport(token, prop!, {
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      }),
      runReport(token, prop!, {
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 8,
      }),
      runReport(token, prop!, {
        dateRanges: [dateRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    ]);

    const totRow = totals.rows?.[0]?.metricValues ?? [];
    return {
      connected: true,
      source: "google",
      propertyId: prop,
      measurementId: mid,
      visitors: Number(totRow[0]?.value ?? 0),
      views: Number(totRow[1]?.value ?? 0),
      daily: (daily.rows ?? []).map((r: any) => ({
        date: parseGaDate(r.dimensionValues?.[0]?.value ?? ""),
        visitors: Number(r.metricValues?.[0]?.value ?? 0),
        views: Number(r.metricValues?.[1]?.value ?? 0),
      })),
      topPages: (pages.rows ?? []).map((r: any) => ({
        path: r.dimensionValues?.[0]?.value ?? "/",
        views: Number(r.metricValues?.[0]?.value ?? 0),
      })),
      topReferrers: (refs.rows ?? []).map((r: any) => ({
        source: r.dimensionValues?.[0]?.value || "(direct)",
        visitors: Number(r.metricValues?.[0]?.value ?? 0),
      })),
      devices: (devices.rows ?? []).map((r: any) => ({
        device: r.dimensionValues?.[0]?.value ?? "unknown",
        visitors: Number(r.metricValues?.[0]?.value ?? 0),
      })),
    };
  } catch (err: any) {
    return {
      ...empty,
      connected: false,
      error: err?.message ?? "GA4 sync failed",
    };
  }
}

export function gaPublicMeta() {
  return {
    measurementId: measurementId(),
    propertyId: propertyId(),
    dataApiReady: serviceAccountConfigured(),
  };
}
