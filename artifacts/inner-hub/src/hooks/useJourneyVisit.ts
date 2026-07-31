import { useEffect } from "react";
import { apiUrl } from "@/lib/api";

const SESSION_KEY = "inner_journey_visit_v1";

function readSession(): Record<string, boolean> {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSession(map: Record<string, boolean>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Sayfa ziyaretini bir kez journey’e yaz (oturum başına). */
export function useJourneyVisit(place: "members" | "signal" | "stage" | "profile") {
  useEffect(() => {
    const seen = readSession();
    if (seen[place]) return;
    seen[place] = true;
    writeSession(seen);
    void fetch(apiUrl("/api/journey/visit"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place }),
    }).catch(() => {
      /* ignore */
    });
  }, [place]);
}
