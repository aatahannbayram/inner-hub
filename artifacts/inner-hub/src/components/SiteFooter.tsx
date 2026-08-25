import { Mail } from "lucide-react";
import { Lockup } from "@/components/Lockup";
import { useLocalizedHref, useT } from "@/i18n";

/** Public site footer - Home + Haberler paylaşır */
export function SiteFooter() {
  const t = useT();
  const privacyHref = useLocalizedHref("/privacy");
  const haberlerHref = useLocalizedHref("/haberler");
  const inviteHref = useLocalizedHref("/invitation");
  const faqHref = useLocalizedHref("/sss");
  const gatheringHref = useLocalizedHref("/haberler/istanbul-gathering-2026");
  const whyInviteHref = useLocalizedHref("/haberler/inner-hub-neden-davetiye");

  const navLinks = [
    { label: t("publicNav.invitation"), href: inviteHref },
    { label: t("publicNav.artifacts"), href: haberlerHref },
    { label: t("sss.nav"), href: faqHref },
    { label: t("publicNav.gathering"), href: gatheringHref },
    { label: t("publicNav.whyInvite"), href: whyInviteHref },
  ];

  return (
    <footer
      id="site-footer"
      className="relative overflow-x-clip border-t border-white/10 bg-[var(--ink-fixed)] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-12 text-[var(--bone-fixed)] sm:px-6 sm:pt-16 md:px-12 md:pt-20 lg:px-[10%]"
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
            {navLinks.map((l) => (
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
          {/* No public social profiles yet — bare linkedin.com / instagram.com removed. */}
          <p className="mb-6 font-mono text-sm text-[var(--bone-fixed)]/55">
            <a
              href="mailto:support@inner.digital"
              className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-[var(--bone-fixed)]"
            >
              support@inner.digital
            </a>
          </p>
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
            İstanbul → Global
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35">
            {t("home.footerRights")}
          </p>
          <a
            href={privacyHref}
            className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/35 underline decoration-white/20 underline-offset-2 transition-colors hover:text-[var(--bone-fixed)]/70"
          >
            {t("home.footerPrivacy")}
          </a>
        </div>
        <div className="max-w-full overflow-hidden leading-none text-[var(--bone-fixed)]" aria-hidden="true">
          <Lockup fontSize="clamp(2.25rem, 18vw, 7.5rem)" />
        </div>
      </div>
      <span className="sr-only">inner hub</span>
    </footer>
  );
}
