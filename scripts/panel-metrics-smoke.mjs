#!/usr/bin/env node
/** Smoke: pulse threshold defaults match plan (no DB). */
const minMsg = Number(process.env.PULSE_MIN_MESSAGES_7D ?? 20);
const minActive = Number(process.env.PULSE_MIN_ACTIVE_MEMBERS_7D ?? 5);
const minProfiles = Number(process.env.MATCH_MIN_COMPLETE_PROFILES ?? 3);

function sufficient(messages7d, activeMembers7d) {
  return messages7d >= minMsg && activeMembers7d >= minActive;
}

const cases = [
  { m: 0, a: 0, expect: false },
  { m: 19, a: 5, expect: false },
  { m: 20, a: 4, expect: false },
  { m: 20, a: 5, expect: true },
  { m: 100, a: 12, expect: true },
];

let failed = 0;
for (const c of cases) {
  const got = sufficient(c.m, c.a);
  if (got !== c.expect) {
    console.error(`FAIL messages=${c.m} active=${c.a}: got ${got}, want ${c.expect}`);
    failed += 1;
  }
}

if (minProfiles < 2) {
  console.error("MATCH_MIN_COMPLETE_PROFILES too low");
  failed += 1;
}

if (failed) process.exit(1);
console.log(`OK thresholds messages>=${minMsg} active>=${minActive} profiles>=${minProfiles}`);
