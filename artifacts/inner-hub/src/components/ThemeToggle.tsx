import { Moon, Sun } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";

/**
 * /api/settings PUT tam prefs objesi bekliyor (partial gönderilirse diğer
 * alanlar sunucu tarafında default'a döner) — bu yüzden cache'teki mevcut
 * prefs'i temel alıp yalnızca theme'i güncelliyoruz.
 */
async function persistThemeToServer(theme: ThemeMode, queryClient: ReturnType<typeof useQueryClient>) {
  try {
    const cached = queryClient.getQueryData<{ prefs: Record<string, unknown> }>(["settings"]);
    const prefs = { ...(cached?.prefs ?? {}), theme };
    const res = await fetch(apiUrl("/api/settings"), {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefs }),
    });
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.prefs) queryClient.setQueryData(["settings"], { prefs: json.prefs });
  } catch {
    /* best-effort — tema yine de localStorage üzerinden bu sekmede uygulanmış olur */
  }
}

/**
 * Panel header / ayarlar için kompakt tema döngüsü: light → dark → system → light
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode, isDark } = useTheme();
  const t = useT();
  const queryClient = useQueryClient();

  const cycle = () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const i = order.indexOf(mode);
    const next = order[(i + 1) % order.length]!;
    setMode(next);
    void persistThemeToServer(next, queryClient);
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
