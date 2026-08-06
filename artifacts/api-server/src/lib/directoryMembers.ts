/** Üye dizininde gösterilmemesi gereken test / seed / sistem hesapları. */

const TEST_NAME_EXACT = new Set([
  "admin",
  "member",
  "member test",
  "invitee",
  "onboarding test",
  "kod testi",
  "test user",
  "test",
  "smoke test",
]);

export function isTestOrSystemAccount(input: {
  email?: string | null;
  name?: string | null;
  isSystem?: boolean | null;
}): boolean {
  if (input.isSystem) return true;

  const email = (input.email ?? "").trim().toLowerCase();
  const name = (input.name ?? "").trim().toLowerCase();

  if (!email && !name) return true;

  if (
    email.endsWith("@test.com") ||
    email.endsWith("@example.com") ||
    email.endsWith("@example.org")
  ) {
    return true;
  }

  // Local / seed hesapları
  if (
    email === "admin@inner.digital" ||
    email === "member@inner.digital" ||
    email === "admin@inner.co" ||
    email.startsWith("invitee-") ||
    email.startsWith("onboarding-test-") ||
    email.startsWith("test-smoke") ||
    email.startsWith("nox")
  ) {
    return true;
  }

  if (TEST_NAME_EXACT.has(name)) return true;
  if (/\b(test|smoke|invitee|onboarding)\b/i.test(name) && name.length < 40) return true;

  return false;
}

/**
 * Dizinde sistem/test hesapları hariç tüm üyeler.
 * Eksik profiller istemcide katlanmış bölümde gösterilir (D-14).
 */
export function isDirectoryMember(input: {
  email?: string | null;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  title?: string | null;
  linkedin?: string | null;
  linkedinId?: string | null;
  avatarUrl?: string | null;
  persona?: string | null;
  isSystem?: boolean | null;
}): boolean {
  if (isTestOrSystemAccount(input)) return false;
  const name = (input.name ?? "").trim();
  return name.length > 0;
}
