import { useLocale } from "./I18nProvider";
import { localizedPath } from "./localePath";

/** Resolve a public path for the active locale (`/invitation` → `/en/invitation`). */
export function useLocalizedHref(path: string): string {
  const { locale } = useLocale();
  return localizedPath(path, locale);
}
