import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lockup } from "@/components/Lockup";

const LINKS = [
  { label: "Idea", href: "#section-01" },
  { label: "Circle", href: "#section-02" },
  { label: "Platform", href: "#section-03" },
  { label: "Gathering", href: "#section-06" },
  { label: "Next", href: "#section-07" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared chrome — same black as the inset frame / letterbox. */
export const HERO_CHROME = "#000000";

/**
 * Hero nav — full-width black bar matching the outer frame for visual unity.
 */
export function FloatingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="absolute inset-x-0 top-0 z-50"
      style={{ backgroundColor: HERO_CHROME }}
    >
      <div className="flex h-[56px] items-center justify-between gap-3 px-3 py-2.5 sm:h-auto sm:gap-4 sm:px-5 sm:py-3.5 md:px-6">
        <a href="/" aria-label="inner hub home" className="inline-flex shrink-0">
          <Lockup className="text-[var(--bone)]" fontSize="clamp(22px, 5.2vw, 32px)" />
        </a>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex lg:gap-1"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--bone)]/70 transition-colors duration-300 hover:text-[var(--bone)] lg:px-4 lg:text-[11px]"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute bottom-0.5 left-3 right-3 h-px origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-300 ease-out group-hover:scale-x-100 lg:left-4 lg:right-4"
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/invitation"
            className="hidden items-center gap-2.5 bg-[var(--bone)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-white sm:inline-flex lg:px-5 lg:text-[11px]"
          >
            Invitation
            <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
          </a>

          <button
            type="button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center p-1.5 md:hidden"
          >
            <span className="relative flex h-3.5 w-4 flex-col justify-between">
              <span
                className="block h-[1.5px] w-full origin-center bg-[var(--bone)] transition-transform duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-[1.5px] w-full origin-center bg-[var(--bone)] transition-transform duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="border-t border-white/10 md:hidden"
            style={{ backgroundColor: HERO_CHROME }}
          >
            {LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/80 transition-colors last:border-b-0 hover:text-[var(--bone)]"
              >
                <span>{link.label}</span>
                <span className="font-mono text-[10px] text-[var(--bone)]/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </a>
            ))}
            <a
              href="/invitation"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between bg-[var(--bone)] px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-black"
            >
              Request an invitation
              <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
