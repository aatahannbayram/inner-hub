export type { Locale, InterpValues } from "./types";
export { DEFAULT_LOCALE, LOCALES, isLocale } from "./types";
export { dictionaries, type Messages } from "./messages";
export { I18nProvider, useI18n, useT, useLocale } from "./I18nProvider";

/** Compact EN/TR toggle for public chrome */
export { LocaleToggle } from "./LocaleToggle";
export { LocaleSyncFromSettings } from "./LocaleSyncFromSettings";
