import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React mount'tan önce senkron uygulanır — panel tema tercihini
// localStorage'dan okuyup ilk paint'te FOUC (yanlış temayla flash)
// olmadan .dark class'ını basar. useTheme() hook'u aynı anahtarı
// okuyup reaktif değişiklikleri (toggle, sistem teması) yönetir.
try {
  const stored = window.localStorage.getItem("inner-hub-theme");
  const isDark =
    stored === "dark" ||
    (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
} catch {
  // localStorage erişilemezse (gizli sekme vb.) light kalır.
}

createRoot(document.getElementById("root")!).render(<App />);
