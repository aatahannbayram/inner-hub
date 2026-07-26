import { useEffect } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";

function isThemeMode(v: unknown): v is ThemeMode {
  return v === "light" || v === "dark" || v === "system";
}

/** Sunucudaki prefs.theme → panel teması (localStorage ile uyumlu) */
export function ThemeSyncFromSettings() {
  const { setMode } = useTheme();
  const { data } = useApiQuery<{ prefs: { theme?: string } }>(["settings"], "/api/settings");

  useEffect(() => {
    const theme = data?.prefs?.theme;
    if (isThemeMode(theme)) setMode(theme);
  }, [data?.prefs?.theme, setMode]);

  return null;
}
