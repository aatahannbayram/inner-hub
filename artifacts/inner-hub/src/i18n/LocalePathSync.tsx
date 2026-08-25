import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLocale } from "./I18nProvider";
import { isLocaleAgnosticPath, localeFromPath } from "./localePath";

/** Keep i18n locale in sync with `/en` URL prefix on public routes. */
export function LocalePathSync() {
  const [loc] = useLocation();
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    if (isLocaleAgnosticPath(loc)) return;
    const fromPath = localeFromPath(loc);
    if (fromPath !== locale) setLocale(fromPath);
  }, [loc, locale, setLocale]);

  return null;
}
