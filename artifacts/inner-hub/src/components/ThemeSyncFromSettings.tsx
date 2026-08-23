import { useEffect } from "react";
import { useTheme, PANEL_FORCED_MODE } from "@/hooks/useTheme";

/**
 * Panel light tema kapalı (P0-8): sunucu prefs.theme ne olursa olsun dark zorlanır.
 */
export function ThemeSyncFromSettings() {
  const { setMode } = useTheme();

  useEffect(() => {
    setMode(PANEL_FORCED_MODE);
  }, [setMode]);

  return null;
}
