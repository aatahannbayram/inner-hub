import { Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useT } from "@/i18n";

/**
 * Panel header / ayarlar için kompakt tema döngüsü: light → dark → system → light
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode, isDark } = useTheme();
  const t = useT();

  const cycle = () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const i = order.indexOf(mode);
    setMode(order[(i + 1) % order.length]!);
  };

  const label =
    mode === "light"
      ? t("settings.themeLight")
      : mode === "dark"
        ? t("settings.themeDark")
        : t("settings.themeSystem");

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${t("settings.theme")}: ${label}`}
      aria-label={`${t("settings.theme")}: ${label}`}
      className={`hit-40 relative inline-flex items-center justify-center text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] ${className}`}
    >
      {isDark ? <Moon className="size-4" strokeWidth={1.6} /> : <Sun className="size-4" strokeWidth={1.6} />}
    </button>
  );
}
