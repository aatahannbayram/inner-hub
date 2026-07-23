"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Landing için yumuşak scroll — panelde kullanılmaz */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}
