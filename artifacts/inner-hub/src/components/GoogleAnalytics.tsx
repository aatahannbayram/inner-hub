import { useEffect } from "react";
import { useLocation } from "wouter";
import { initGoogleAnalytics, trackPageView } from "@/lib/analytics";

/**
 * GA4 (G-FGLJ0ECVDD): mount’ta gtag yükle, route değişince
 * Google page_view + first-party beacon (admin Framer paneli) gönder.
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
