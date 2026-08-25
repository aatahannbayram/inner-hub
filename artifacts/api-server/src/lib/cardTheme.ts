export type CardTheme = {
  accent: string;
  bg: string;
  layout: "stack" | "card";
};

export const CARD_THEME_PRESETS: { id: string; theme: CardTheme }[] = [
  { id: "ink", theme: { accent: "#0A0A0A", bg: "#F4F1EC", layout: "stack" } },
  { id: "green", theme: { accent: "#18FF85", bg: "#F4F1EC", layout: "stack" } },
  { id: "slate", theme: { accent: "#1F2937", bg: "#EEF1F4", layout: "card" } },
  { id: "olive", theme: { accent: "#3D4A2E", bg: "#F2EFE6", layout: "stack" } },
  { id: "navy", theme: { accent: "#0B1F33", bg: "#E8EEF2", layout: "card" } },
  { id: "sand", theme: { accent: "#5C4A32", bg: "#F6F0E6", layout: "stack" } },
];

const HEX = /^#([0-9a-fA-F]{6})$/;

export function defaultCardTheme(): CardTheme {
  return { ...CARD_THEME_PRESETS[0]!.theme };
}

export function parseCardTheme(raw: string | null | undefined): CardTheme {
  if (!raw) return defaultCardTheme();
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return sanitizeCardTheme(parsed);
  } catch {
    return defaultCardTheme();
  }
}

export function sanitizeCardTheme(input: unknown): CardTheme {
  const base = defaultCardTheme();
  if (!input || typeof input !== "object") return base;
  const rec = input as Record<string, unknown>;
  const accent =
    typeof rec.accent === "string" && HEX.test(rec.accent.trim())
      ? rec.accent.trim().toUpperCase()
      : base.accent;
  const bg =
    typeof rec.bg === "string" && HEX.test(rec.bg.trim())
      ? rec.bg.trim().toUpperCase()
      : base.bg;
  const layout = rec.layout === "card" ? "card" : "stack";
  return { accent, bg, layout };
}
