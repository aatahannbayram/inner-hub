import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Messages } from "./messages";
import {
  DEFAULT_LOCALE,
  getByPath,
  interpolate,
  isLocale,
  readStoredLocale,
  writeStoredLocale,
  type InterpValues,
  type Locale,
} from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: InterpValues) => string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveInitialLocale(): Locale {
  // SSR + ilk ziyaret: her zaman TR. Kullanıcı dil seçince localStorage yazar.
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return readStoredLocale() ?? DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const messages = dictionaries[locale];

  const t = useCallback(
    (key: string, values?: InterpValues) => {
      const raw =
        getByPath(messages, key) ??
        getByPath(dictionaries.en, key) ??
        getByPath(dictionaries.tr, key) ??
        key;
      return interpolate(raw, values);
    },
    [messages],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, messages }),
    [locale, setLocale, t, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}
