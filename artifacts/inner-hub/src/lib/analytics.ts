import { apiUrl } from "@/lib/api";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Build env veya index.html’deki sabit ID - G-FGLJ0ECVDD */
const GA_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
  "G-FGLJ0ECVDD";

const SESSION_KEY = "ih_analytics_sid";

/** Panel / admin yüzeylerini GA + first-party’ye gönderme */
function shouldTrackPath(path: string): boolean {
  if (path.startsWith("/panel")) return false;
  if (path.startsWith("/requests")) return false;
  return true;
}

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s_${Date.now().toString(36)}`;
  }
}

let ready = false;
let lastTrackedPath: string | null = null;

export function isGaEnabled(): boolean {
  return Boolean(GA_ID) && typeof window !== "undefined";
}

/**
 * index.html gtag’i zaten yüklediyse dokunma.
 * Yoksa (eski deploy) dinamik yükle.
 */
export function initGoogleAnalytics(): void {
  if (!isGaEnabled() || ready) return;
  ready = true;

  if (typeof window.gtag === "function") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

/** First-party beacon → admin Framer paneli (Google’a paralel). */
function sendFirstPartyBeacon(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      event: "page_view",
      path,
      title: title ?? document.title,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
      locale: document.documentElement.lang || null,
    });
    const url = apiUrl("/api/analytics/collect");
    // text/plain → CORS preflight yok (cross-origin Hostinger → API)
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "text/plain" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload,
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

/** SPA route değişiminde page_view → Google + first-party */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  if (!shouldTrackPath(path)) return;
  if (path === lastTrackedPath) return;

  const isFirst = lastTrackedPath === null;
  lastTrackedPath = path;

  // Google: ilk public yüklemede index.html config zaten page_view gönderdi
  if (!isFirst && isGaEnabled() && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  }

  // First-party: her public page_view (ilk dahil) - admin paneli için
  sendFirstPartyBeacon(path, title);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!isGaEnabled() || !window.gtag) return;
  window.gtag("event", name, params);
}

export function getGaMeasurementId(): string {
  return GA_ID;
}
