import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lockup } from "@/components/Lockup";
import { LocaleToggle, useLocalizedHref, useT } from "@/i18n";
import { cn } from "@/lib/utils";

const LINK_KEYS = [
  { key: "idea", href: "/#section-01" },
  { key: "circle", href: "/#section-02" },
  { key: "platform", href: "/#section-03" },
  { key: "artifacts", href: "/haberler" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared chrome - footer ink (hafif yeşil atmospheric), pure #000 değil */
export const HERO_CHROME = "#0A0A0A";

/**
 * Hero nav - full-width black bar matching the outer frame for visual unity.
 * placement: overlay = hero üzerinde absolute; static = sayfa üstünde sticky.
 */
export function FloatingNavbar({ placement = "overlay" }: { placement?: "overlay" | "static" }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  const homeHref = useLocalizedHref("/");
  const inviteHref = useLocalizedHref("/invitation");
  const ideaHref = useLocalizedHref("/#section-01");
  const circleHref = useLocalizedHref("/#section-02");
  const platformHref = useLocalizedHref("/#section-03");
  const artifactsHref = useLocalizedHref("/haberler");
  const localizedByKey = {
    idea: ideaHref,
    circle: circleHref,
    platform: platformHref,
    artifacts: artifactsHref,
  } as const;
  const links = LINK_KEYS.map((link) => ({
    href: localizedByKey[link.key],
    label: t(`publicNav.${link.key}`),
  }));

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className={cn(
        placement === "static"
          ? "sticky top-0 border-b border-white/10 pt-[env(safe-area-inset-top)]"
          : "absolute inset-x-0 top-0 pt-[env(safe-area-inset-top)]",
        open ? "z-[80]" : "z-50",
      )}
      style={{ backgroundColor: HERO_CHROME }}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-auto sm:gap-4 sm:px-5 sm:py-3.5 md:px-6">
        <a href={homeHref} aria-label="inner hub home" className="inline-flex min-w-0 shrink-0">
          <Lockup className="text-[var(--bone-fixed)]" fontSize="clamp(20px, 5.2vw, 32px)" pulse />
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

        <div className="flex shrink-0 items-center gap-2">
          <LocaleToggle tone="dark" className="hidden md:inline-flex" />
          <a
            href={inviteHref}
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
            className="relative z-[70] flex size-11 items-center justify-center md:hidden"
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

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="fixed inset-0 z-[60] flex flex-col md:hidden"
                  style={{
                    backgroundColor: HERO_CHROME,
                    paddingTop: "calc(3.5rem + env(safe-area-inset-top))",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)]/50">
                      {t("home.langSwitch")}
                    </span>
                    <LocaleToggle tone="dark" />
                  </div>
                  <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {links.map((link, i) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-12 items-center justify-between border-b border-white/10 px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--bone-fixed)]/80 transition-colors hover:text-[var(--bone-fixed)]"
                      >
                        <span>{link.label}</span>
                        <span className="font-mono text-[10px] text-[var(--bone-fixed)]/30">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </a>
                    ))}
                  </nav>
                  <a
                    href={inviteHref}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between bg-[var(--bone-fixed)] px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--ink-fixed)] pb-[max(0.875rem,env(safe-area-inset-bottom))]"
                  >
                    {t("publicNav.requestInvitation")}
                    <span className="size-1.5 bg-[var(--inner-green)]" aria-hidden />
                  </a>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </motion.header>
  );
}
