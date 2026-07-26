import { useEffect } from "react";
import { useLocation } from "wouter";
import { initGoogleAnalytics, trackPageView } from "@/lib/analytics";

/**
 * GA4: mount’ta gtag yükle, wouter location değişince page_view gönder.
 * VITE_GA_MEASUREMENT_ID yoksa hiçbir şey yapmaz.
 */
export function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return null;
}
