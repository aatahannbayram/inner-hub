import { Mail, Linkedin, Instagram } from "lucide-react";
import { Lockup } from "@/components/Lockup";
import { useT } from "@/i18n";

/** Public site footer - Home + Haberler paylaşır */
export function SiteFooter() {
  const t = useT();

  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden border-t border-white/10 bg-[var(--ink-fixed)] px-4 pb-8 pt-12 text-[var(--bone-fixed)] sm:px-6 sm:pt-16 md:px-12 md:pt-20 lg:px-[10%]"
    >
      <div className="pointer-events-none absolute -left-20 top-10 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" />

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-5">
          <Lockup className="text-[var(--bone-fixed)]" fontSize="clamp(28px, 4vw, 36px)" />
          <p className="max-w-[36ch] text-sm font-light leading-relaxed text-[var(--bone-fixed)]/70">
            {t("home.footerTagline")}
          </p>
          <a
            href="mailto:support@inner.digital"
            className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/55 transition-colors hover:text-[var(--bone-fixed)]"
          >
            <Mail className="size-3.5" />
            support@inner.digital
          </a>
        </div>

        <div>
          <p className="mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40">
            {t("home.footerNavigate")}
          </p>
          <ul className="space-y-2.5">
            {[
              { label: t("publicNav.platform"), href: "/#section-03" },
              { label: t("publicNav.gathering"), href: "/#section-06" },
              { label: t("publicNav.artifacts"), href: "/haberler" },
              { label: t("home.panel"), href: "/panel" },
              { label: t("publicNav.invitation"), href: "/invitation" },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-mono text-caption uppercase tracking-widest text-[var(--bone-fixed)]/65 transition-colors hover:text-[var(--bone-fixed)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/40">
            {t("home.footerConnect")}
          </p>
          <div className="mb-6 flex items-center gap-4">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="inner on LinkedIn"
              className="border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]"
            >
              <Linkedin size={18} strokeWidth={1.5} />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="inner on Instagram"
              className="border border-white/15 p-2.5 text-[var(--bone-fixed)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone-fixed)]"
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>
          </div>
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
            İstanbul → Global
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
          {t("home.footerRights")}
        </p>
        <div className="leading-none text-[var(--bone-fixed)]" aria-hidden="true">
          <Lockup fontSize="clamp(2.75rem, 10vw, 7.5rem)" />
        </div>
      </div>
      <span className="sr-only">inner hub</span>
    </footer>
  );
}
