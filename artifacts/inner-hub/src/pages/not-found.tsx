import { AlertCircle, LayoutDashboard, Users, CalendarDays, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useLocalizedHref, useT } from "@/i18n";

const POPULAR = [
  { href: "/panel", icon: LayoutDashboard, key: "nav.dashboard" as const },
  { href: "/panel/members", icon: Users, key: "nav.members" as const },
  { href: "/panel/events", icon: CalendarDays, key: "nav.events" as const },
  { href: "/panel/courses", icon: BookOpen, key: "nav.courses" as const },
];

export default function NotFound() {
  const t = useT();
  const homeHref = useLocalizedHref("/");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bone)] px-4 text-[var(--ink)]">
      <div className="panel-glass w-full max-w-lg p-6 sm:p-8">
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-8 shrink-0 text-[var(--error-ink)]" />
          <div>
            <h1 className="font-sans text-2xl font-medium tracking-[-0.02em] text-[var(--ink)]">
              {t("notFound.title")}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-body)]">{t("notFound.body")}</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
            {t("search.open")}
          </span>
          <input
            type="search"
            placeholder={t("search.placeholder")}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline focus:outline-2 focus:outline-[var(--inner-green)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                window.location.href = q ? `/panel?q=${encodeURIComponent(q)}` : "/panel";
              }
            }}
          />
        </label>

        <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
          {t("notFound.popular")}
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {POPULAR.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center gap-2 border border-[var(--ink)]/10 px-3 py-2 text-sm text-[var(--ink)] hover:border-[var(--ink)]/25"
                >
                  <Icon className="size-3.5 text-[var(--ink-body)]" />
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href={homeHref}
          className="mt-6 inline-block font-mono text-[11px] uppercase tracking-widest text-[var(--ink)] underline underline-offset-4 hover:text-[var(--inner-green)]"
        >
          {t("notFound.backHome")}
        </Link>
      </div>
    </div>
  );
}
