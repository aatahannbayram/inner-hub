#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const key = (await readFile(path.join(root, "public", "indexnow-key.txt"), "utf-8")).trim();
const host = "inner.digital";
const urls = [
  "https://inner.digital/",
  "https://inner.digital/invitation",
  "https://inner.digital/haberler",
  "https://inner.digital/haberler/gathering-vs-konferans",
  "https://inner.digital/haberler/istanbul-ai-kurucu-agi",
  "https://inner.digital/haberler/istanbul-gathering-2026",
  "https://inner.digital/haberler/kapali-cember-deal-flow",
  "https://inner.digital/haberler/inner-hub-neden-davetiye",
  "https://inner.digital/haberler/aeo-icin-net-cevaplar",
  "https://inner.digital/sss",
];

const body = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: urls,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log("IndexNow", res.status, await res.text());
// Soft ping (legacy; harmless)
const ping = await fetch(
  `https://www.google.com/ping?sitemap=${encodeURIComponent("https://inner.digital/sitemap.xml")}`,
);
console.log("Google sitemap ping", ping.status);
