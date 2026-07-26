import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lockup } from "@/components/Lockup";
import { LocaleToggle, useT } from "@/i18n";

const LINK_KEYS = [
  { key: "idea", href: "#section-01" },
  { key: "circle", href: "#section-02" },
  { key: "platform", href: "#section-03" },
  { key: "gathering", href: "#section-06" },
  { key: "next", href: "#section-07" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared chrome — footer ink (hafif yeşil atmospheric), pure #000 değil */
export const HERO_CHROME = "#0A0A0A";

/**
 * Hero nav — full-width black bar matching the outer frame for visual unity.
 */
export function FloatingNavbar() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const links = LINK_KEYS.map((link) => ({
    href: link.href,
    label: t(`publicNav.${link.key}`),
  }));

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
          <Lockup className="text-[var(--bone-fixed)]" fontSize="clamp(22px, 5.2vw, 32px)" pulse />
        </a>

        <nav
          aria-label={t("publicNav.primaryNav")}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex lg:gap-1"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--bone-fixed)]/70 transition-colors duration-300 hover:text-[var(--bone-fixed)] lg:px-4 lg:text-[11px]"
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
          <LocaleToggle tone="dark" className="hidden sm:inline-flex" />
          <a
            href="/invitation"
            className="hidden items-center gap-2.5 bg-[var(--bone-fixed)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-fixed)] transition-colors hover:bg-white sm:inline-flex lg:px-5 lg:text-[11px]"
          >
            {t("publicNav.invitation")}
            <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
          </a>

          <button
            type="button"
            aria-label={open ? t("publicNav.closeMenu") : t("publicNav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center p-1.5 md:hidden"
          >
            <span className="relative flex h-3.5 w-4 flex-col justify-between">
              <span
                className="block h-[1.5px] w-full origin-center bg-[var(--bone-fixed)] transition-transform duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-[1.5px] w-full origin-center bg-[var(--bone-fixed)] transition-transform duration-300"
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
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/50">
                {t("home.langSwitch")}
              </span>
              <LocaleToggle tone="dark" />
            </div>
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)]/80 transition-colors last:border-b-0 hover:text-[var(--bone-fixed)]"
              >
                <span>{link.label}</span>
                <span className="font-mono text-[10px] text-[var(--bone-fixed)]/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </a>
            ))}
            <a
              href="/invitation"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between bg-[var(--bone-fixed)] px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--ink-fixed)]"
            >
              {t("publicNav.requestInvitation")}
              <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
