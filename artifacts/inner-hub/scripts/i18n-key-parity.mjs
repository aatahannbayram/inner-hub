#!/usr/bin/env node
/**
 * TR/EN message key parity guard.
 * Messages type already requires EN ⊆ TR keys at compile time;
 * this script fails CI if typecheck cannot run or keys diverge at runtime shape.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("pnpm", ["exec", "tsc", "-p", "tsconfig.json", "--noEmit"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error("i18n key parity failed: TypeScript reported errors (EN must match TR Messages).");
  process.exit(result.status ?? 1);
}

console.log("i18n key parity OK (Messages type + tsc --noEmit)");
