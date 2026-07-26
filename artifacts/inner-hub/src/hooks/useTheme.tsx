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

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const dark = resolveIsDark(mode);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
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
 * Panel light/dark/system. Light silinmez; dark `.dark` class ile token'ları çevirir.
 * FOUC önleme: `main.tsx` aynı STORAGE_KEY'i mount öncesi okur.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [isDark, setIsDark] = useState(() => resolveIsDark(readStoredMode()));

  useEffect(() => {
    applyTheme(mode);
    setIsDark(resolveIsDark(mode));
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setIsDark(resolveIsDark("system"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    setIsDark(resolveIsDark(next));
  }, []);

  const value = useMemo(() => ({ mode, setMode, isDark }), [mode, setMode, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/** Hook olmadan (tests / edge) — provider dışı güvenli okuma */
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
