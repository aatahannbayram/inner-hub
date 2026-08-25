#!/usr/bin/env node
/**
 * TR/EN message key parity guard (plan P0-2).
 * Compares nested leaf keys in `tr` / `en` without a full project typecheck.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pkgRoot, "../..");
const messagesPath = path.join(pkgRoot, "src/i18n/messages.ts");

const requireFromRepo = createRequire(path.join(repoRoot, "artifacts/api-server/package.json"));
const { transformSync } = requireFromRepo("esbuild");

function flattenKeys(obj, prefix = "") {
  /** @type {string[]} */
  const keys = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return keys;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

async function loadMessages() {
  const source = readFileSync(messagesPath, "utf8");
  const { code } = transformSync(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
  });
  const dir = mkdtempSync(path.join(tmpdir(), "ih-i18n-"));
  const out = path.join(dir, "messages.mjs");
  try {
    writeFileSync(out, code, "utf8");
    return await import(pathToFileURL(out).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const mod = await loadMessages();
const tr = mod.tr;
const en = mod.en;

if (!tr || !en) {
  console.error("i18n key parity failed: could not load `tr` / `en` from messages.ts");
  process.exit(1);
}

const trKeys = new Set(flattenKeys(tr));
const enKeys = new Set(flattenKeys(en));

const missingInEn = [...trKeys].filter((k) => !enKeys.has(k)).sort();
const missingInTr = [...enKeys].filter((k) => !trKeys.has(k)).sort();

if (missingInEn.length || missingInTr.length) {
  if (missingInEn.length) {
    console.error("Keys in TR but missing in EN:");
    for (const k of missingInEn) console.error(`  - ${k}`);
  }
  if (missingInTr.length) {
    console.error("Keys in EN but missing in TR:");
    for (const k of missingInTr) console.error(`  - ${k}`);
  }
  console.error(
    `i18n key parity failed: ${missingInEn.length} missing in EN, ${missingInTr.length} missing in TR`,
  );
  process.exit(1);
}

console.log(`i18n key parity OK (${trKeys.size} leaf keys)`);
