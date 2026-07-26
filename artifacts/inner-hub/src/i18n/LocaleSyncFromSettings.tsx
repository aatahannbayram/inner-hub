import { useEffect } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useLocale, isLocale } from "@/i18n";

/** Panel oturumunda sunucudaki prefs.lang → arayüz dili */
export function LocaleSyncFromSettings() {
  const { setLocale } = useLocale();
  const { data } = useApiQuery<{ prefs: { lang?: string } }>(["settings"], "/api/settings");

  useEffect(() => {
    const lang = data?.prefs?.lang;
    if (isLocale(lang)) setLocale(lang);
  }, [data?.prefs?.lang, setLocale]);

  return null;
}
