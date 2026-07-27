import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider, applyTheme, THEME_STORAGE_KEY, type ThemeMode } from "@/hooks/useTheme";

// FOUC: yalnızca /panel yollarında dark uygula - ana site her zaman marka light.
try {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  const mode: ThemeMode =
    stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
  applyTheme(mode);
} catch {
  /* localStorage yoksa light kalır */
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
