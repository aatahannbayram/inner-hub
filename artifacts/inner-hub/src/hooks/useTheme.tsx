import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "inner-hub-theme";

/** Panel her zaman dark; light/system geçici olarak kapatıldı (P0-8). */
const PANEL_FORCED_MODE: ThemeMode = "dark";

function resolveIsDark(_mode: ThemeMode): boolean {
  return true;
}

/** Dark tema yalnızca panelde - ana site / invitation marka light+cinematic kalır */
export function isPanelPath(pathname?: string): boolean {
  if (typeof window === "undefined" && !pathname) return false;
  const path = pathname ?? window.location.pathname;
  return /(?:^|\/)panel(?:\/|$)/.test(path);
}

export function applyTheme(_mode: ThemeMode, pathname?: string) {
  if (typeof document === "undefined") return;
  const dark = isPanelPath(pathname);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  return PANEL_FORCED_MODE;
}

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  /** Panel light tema kapalı; UI toggle gösterme. */
  themeToggleEnabled: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Panel her zaman dark. Light/system seçenekleri P0-8 kapsamında kapatıldı.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(PANEL_FORCED_MODE);
  const [isDark, setIsDark] = useState(() => isPanelPath());

  const sync = useCallback((_next: ThemeMode, pathname?: string) => {
    applyTheme(PANEL_FORCED_MODE, pathname);
    setIsDark(isPanelPath(pathname));
  }, []);

  useEffect(() => {
    sync(PANEL_FORCED_MODE);
    try {
      window.localStorage.setItem(STORAGE_KEY, PANEL_FORCED_MODE);
    } catch {
      /* ignore */
    }
  }, [sync]);

  const setMode = useCallback(
    (_next: ThemeMode) => {
      setModeState(PANEL_FORCED_MODE);
      try {
        window.localStorage.setItem(STORAGE_KEY, PANEL_FORCED_MODE);
      } catch {
        /* ignore */
      }
      sync(PANEL_FORCED_MODE);
    },
    [sync],
  );

  const value = useMemo(
    () => ({ mode, setMode, isDark, themeToggleEnabled: false }),
    [mode, setMode, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Wouter Router içinde mount edilmeli - panel ↔ public geçişinde `.dark` kapsamı.
 */
export function ThemeRouteSync() {
  return null;
}

export function useThemeRouteSync(locationPath: string) {
  const ctx = useContext(ThemeContext);
  useEffect(() => {
    if (!ctx) return;
    applyTheme(PANEL_FORCED_MODE, locationPath);
  }, [locationPath, ctx]);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export { STORAGE_KEY as THEME_STORAGE_KEY, PANEL_FORCED_MODE };
