#!/usr/bin/env node
/**
 * WCAG contrast check for Inner Hub semantic token pairs (dark + light).
 * Exit 1 if any text pair falls below 4.5:1 (or 3:1 for UI/non-text).
 */
const PAIRS = {
  light: {
    bone: "#F4F1EC",
    ink: "#0A0A0A",
    inkBody: "#3A3937",
    inkMuted: "#575654",
    successInk: "#0B6B3A",
    errorInk: "#9C3F26",
    surfaceInverted: "#0A0A0A",
    onInverted: "#F4F1EC",
    onInvertedMuted: "#B8B5AF",
    onInvertedSuccess: "#18FF85",
  },
  dark: {
    bone: "#0A0A0A",
    ink: "#F4F1EC",
    inkBody: "#B8B5AF",
    inkMuted: "#8C8A85",
    successInk: "#18FF85",
    errorInk: "#E2795A",
    surfaceInverted: "#F4F1EC",
    onInverted: "#0A0A0A",
    onInvertedMuted: "#575654",
    onInvertedSuccess: "#0B6B3A",
  },
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function channel(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const CHECKS = [
  { fg: "ink", bg: "bone", min: 4.5, label: "ink on bone" },
  { fg: "inkBody", bg: "bone", min: 4.5, label: "ink-body on bone" },
  { fg: "inkMuted", bg: "bone", min: 4.5, label: "ink-muted on bone" },
  { fg: "successInk", bg: "bone", min: 3, label: "success-ink on bone (UI)" },
  { fg: "errorInk", bg: "bone", min: 3, label: "error-ink on bone (UI)" },
  { fg: "onInverted", bg: "surfaceInverted", min: 4.5, label: "on-inverted on surface-inverted" },
  { fg: "onInvertedMuted", bg: "surfaceInverted", min: 4.5, label: "on-inverted-muted on surface-inverted" },
  { fg: "onInvertedSuccess", bg: "surfaceInverted", min: 3, label: "on-inverted-success on surface-inverted (UI)" },
];

let failed = 0;
for (const [mode, tokens] of Object.entries(PAIRS)) {
  console.log(`\n[${mode}]`);
  for (const check of CHECKS) {
    const ratio = contrast(tokens[check.fg], tokens[check.bg]);
    const ok = ratio >= check.min;
    const mark = ok ? "OK" : "FAIL";
    console.log(`  ${mark} ${check.label}: ${ratio.toFixed(2)}:1 (min ${check.min})`);
    if (!ok) failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}
console.log("\nAll contrast checks passed.");
