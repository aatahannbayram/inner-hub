import { useMemo } from "react";
import { Link } from "wouter";
import { SitePublicShell } from "@/components/SitePublicShell";
import { useLocale, useLocalizedHref, useT } from "@/i18n";
import { useSeo, breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd } from "@/lib/seo";
import { localizedPath } from "@/i18n/localePath";

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default function PublicFaqPage() {
  const t = useT();
  const { locale } = useLocale();
  const inviteHref = useLocalizedHref("/invitation");
  const path = localizedPath("/sss", locale);

  const items = useMemo(
    () => FAQ_KEYS.map((n) => ({ q: t(`sss.q${n}`), a: t(`sss.a${n}`) })),
    [t],
  );

  useSeo({
    title: t("sss.metaTitle"),
    description: t("sss.metaDescription"),
    canonicalPath: path,
    jsonLd: [
      organizationJsonLd(),
      breadcrumbJsonLd([
        { name: "inner.hub", path: localizedPath("/", locale) },
        { name: t("sss.nav"), path },
      ]),
      faqPageJsonLd(items),
    ],
  });

  return (
    <SitePublicShell>
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/45">
          {t("sss.nav")}
        </p>
        <h1 className="font-serif text-3xl text-[var(--bone-fixed)] sm:text-4xl" style={{ fontWeight: 600 }}>
          {t("sss.title")}
        </h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-white/60 sm:text-base">
          {t("sss.subtitle")}
        </p>

        <dl className="mt-12 space-y-8 border-t border-white/10 pt-10">
          {items.map((item) => (
            <div key={item.q}>
              <dt className="font-serif text-xl text-[var(--bone-fixed)]">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-white/70 sm:text-[15px]">{item.a}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={inviteHref}
          className="mt-12 inline-flex min-h-11 items-center bg-[var(--bone-fixed)] px-5 font-mono text-label uppercase tracking-widest text-[var(--ink-fixed)]"
        >
          {t("home.requestInvitation")}
        </Link>
      </main>
    </SitePublicShell>
  );
}
