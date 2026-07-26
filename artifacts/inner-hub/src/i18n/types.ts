export type Locale = "tr" | "en";

export const LOCALES: Locale[] = ["tr", "en"];
export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_STORAGE_KEY = "inner.locale";

export function isLocale(v: unknown): v is Locale {
  return v === "tr" || v === "en";
}

export function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function detectBrowserLocale(): Locale {
  try {
    const lang = navigator.language?.toLowerCase() ?? "";
    if (lang.startsWith("tr")) return "tr";
    if (lang.startsWith("en")) return "en";
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

/** Dot-path lookup: "nav.main" → nested object */
export function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export type InterpValues = Record<string, string | number>;

/** Simple `{name}` interpolation */
export function interpolate(template: string, values?: InterpValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}
