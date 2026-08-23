#!/usr/bin/env node
/**
 * Visual regression placeholder — dark-only panel routes checklist.
 * Full Playwright snapshots can plug into this list later.
 */
const ROUTES = [
  "/panel",
  "/panel/members",
  "/panel/courses",
  "/panel/events",
  "/panel/chat",
  "/panel/org",
  "/panel/perks",
  "/panel/stage",
  "/panel/signal",
  "/panel/match",
  "/panel/capital",
  "/panel/vault",
  "/panel/pulse",
  "/panel/membership",
  "/panel/profile",
  "/panel/settings",
  "/panel/applications",
  "/panel/analytics",
  "/panel/haberler",
  "/panel/faq",
  "/panel/inner-id",
  "/panel/inner-api",
];

console.log(`Panel visual checklist (${ROUTES.length} routes, dark-only):`);
for (const r of ROUTES) console.log(`  - ${r}`);
console.log("OK — list ready for Playwright capture.");
