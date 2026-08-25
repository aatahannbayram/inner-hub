import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLocale } from "./I18nProvider";
import { isLocaleAgnosticPath, swapLocalePath } from "./localePath";
import type { Locale } from "./types";

export function LocaleToggle({
  className = "",
  tone = "dark",
}: {
  className?: string;
  /** dark = bone on ink (hero); light = ink on bone (panel) */
  tone?: "dark" | "light";
}) {
  const { locale, setLocale } = useLocale();
  const [loc, setLocation] = useLocation();

  const switchTo = (code: Locale) => {
    setLocale(code);
    if (isLocaleAgnosticPath(loc)) return;
    const next = swapLocalePath(loc, code);
    if (next !== loc) setLocation(next);
  };

  const btn = (code: Locale, label: string) => {
    const active = locale === code;
    const base =
      tone === "dark"
        ? active
          ? "bg-[var(--bone)] text-black"
          : "text-[var(--bone)]/55 hover:text-[var(--bone)]"
        : active
          ? "bg-[var(--ink)] text-[var(--bone)]"
          : "text-[var(--ink-muted)] hover:text-[var(--ink)]";
    return (
      <button
        key={code}
        type="button"
        lang={code}
        onClick={() => switchTo(code)}
        aria-pressed={active}
        className={`px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${base}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "items-center border",
        tone === "dark" ? "border-white/15" : "border-[var(--ink)]/15",
        className || "inline-flex",
      )}
    >
      {btn("tr", "TR")}
      {btn("en", "EN")}
    </div>
  );
}
