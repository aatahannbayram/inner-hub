"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

const ease = [0.16, 1, 0.3, 1] as const;

/** Opacity-only — y offset kaldırıldı (layout jump / kayma önlemi) */
export function PanelPageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const reduce = useReducedMotion();

  if (reduce) {
    return <div key={location}>{children}</div>;
  }

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
