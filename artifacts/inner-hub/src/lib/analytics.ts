declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Build env veya index.html’deki sabit ID */
const GA_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
  "G-FGLJ0ECVDD";

/** Panel / admin yüzeylerini GA’ya gönderme */
function shouldTrackPath(path: string): boolean {
  if (path.startsWith("/panel")) return false;
  if (path.startsWith("/requests")) return false;
  return true;
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

/** SPA route değişiminde page_view (ilk yükleme index.html config’ten gelir) */
export function trackPageView(path: string, title?: string): void {
  if (!isGaEnabled() || !window.gtag) return;
  if (!shouldTrackPath(path)) return;
  if (path === lastTrackedPath) return;

  // İlk public path: HTML zaten page_view gönderdi — tekrarlama
  if (lastTrackedPath === null) {
    lastTrackedPath = path;
    return;
  }

  lastTrackedPath = path;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
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
