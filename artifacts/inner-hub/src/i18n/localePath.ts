import type { Locale } from "./types";

/** Paths that never take a `/en` prefix (auth panel + public profile handles). */
export function isLocaleAgnosticPath(pathname: string): boolean {
  return (
    pathname === "/panel" ||
    pathname.startsWith("/panel/") ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/s/")
  );
}

/** Locale implied by URL (`/en` → en, otherwise tr for public paths). */
export function localeFromPath(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return "tr";
}

/** Strip `/en` prefix → TR path. `/en` → `/`. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) {
    const rest = pathname.slice(3);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}

/** Prefix path for a locale. Panel/profile paths unchanged. Preserves ?query and #hash. */
export function localizedPath(path: string, locale: Locale): string {
  if (!path || path.startsWith("http") || path.startsWith("#") || path.startsWith("mailto:")) {
    return path;
  }
  const u = new URL(path, "https://inner.digital");
  const pathname = u.pathname || "/";
  if (isLocaleAgnosticPath(pathname)) {
    return `${pathname}${u.search}${u.hash}`;
  }

  const bare = stripLocalePrefix(pathname);
  const next =
    locale === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
  return `${next}${u.search}${u.hash}`;
}

/** Swap locale on current path (for LocaleToggle). */
export function swapLocalePath(pathname: string, next: Locale): string {
  if (isLocaleAgnosticPath(pathname)) return pathname;
  return localizedPath(stripLocalePrefix(pathname), next);
}
