import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "inner-hub-theme";

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return mode === "dark";
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", resolveIsDark(mode));
}

/** Panel'in light/dark tercihini localStorage'da tutar, <html> üzerinde
 *  .dark class'ını uygular. main.tsx'teki senkron script ilk paint'te
 *  aynı localStorage anahtarını okuyup FOUC'u önler — burası sadece
 *  reaktif değişiklikleri (toggle, sistem teması) yönetir. */
export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
  });

  useEffect(() => {
    applyTheme(mode);
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { mode, setMode };
}
