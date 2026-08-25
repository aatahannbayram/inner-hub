"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function isFillRoute(location: string) {
  return location === "/panel/chat" || location.startsWith("/panel/chat/");
}

/** Opacity-only - y offset kaldırıldı (layout jump / kayma önlemi) */
export function PanelPageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const reduce = useReducedMotion();
  const fill = isFillRoute(location);
  const frame = cn("min-w-0", fill && "flex h-full min-h-0 flex-1 flex-col");

  if (reduce) {
    return (
      <div key={location} className={frame}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16, ease }}
        className={frame}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
