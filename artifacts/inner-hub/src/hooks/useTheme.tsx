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

function resolveIsDark(mode: ThemeMode): boolean {
  if (typeof window === "undefined") return false;
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return mode === "dark";
}

/** Dark tema yalnızca panelde — ana site / invitation marka light+cinematic kalır */
export function isPanelPath(pathname?: string): boolean {
  if (typeof window === "undefined" && !pathname) return false;
  const path = pathname ?? window.location.pathname;
  return /(?:^|\/)panel(?:\/|$)/.test(path);
}

export function applyTheme(mode: ThemeMode, pathname?: string) {
  if (typeof document === "undefined") return;
  const dark = isPanelPath(pathname) && resolveIsDark(mode);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
  } catch {
    return "light";
  }
}

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Panel light/dark/system. Ana siteye `.dark` basılmaz —
 * public sayfalar ink/bone marka dilinde kalır.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [isDark, setIsDark] = useState(() => {
    const m = readStoredMode();
    return isPanelPath() && resolveIsDark(m);
  });

  const sync = useCallback((next: ThemeMode, pathname?: string) => {
    applyTheme(next, pathname);
    setIsDark(isPanelPath(pathname) && resolveIsDark(next));
  }, []);

  useEffect(() => {
    sync(mode);
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => sync("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, sync]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      sync(next);
    },
    [sync],
  );

  const value = useMemo(() => ({ mode, setMode, isDark }), [mode, setMode, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Wouter Router içinde mount edilmeli — panel ↔ public geçişinde `.dark` kapsamı.
 */
export function ThemeRouteSync() {
  // lazy import pattern avoided — caller passes location via hook in App
  return null;
}

export function useThemeRouteSync(locationPath: string) {
  const ctx = useContext(ThemeContext);
  useEffect(() => {
    if (!ctx) return;
    applyTheme(ctx.mode, locationPath);
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

export { STORAGE_KEY as THEME_STORAGE_KEY };
