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
}): boolean {
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

/** Dizinde yalnızca kimlik sinyali olan gerçek üyeler. */
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
}): boolean {
  if (isTestOrSystemAccount(input)) return false;

  const bio = (input.bio ?? "").trim();
  const company = (input.company ?? "").trim();
  const title = (input.title ?? "").trim();
  const linkedin = (input.linkedin ?? "").trim();
  const persona = (input.persona ?? "").trim();

  if (bio.length >= 20) return true;
  if (company.length > 1) return true;
  if (title.length > 1) return true;
  if (linkedin.length > 0 || Boolean(input.linkedinId)) return true;
  if (Boolean(input.avatarUrl)) return true;
  if (persona.length > 0) return true;

  return false;
}
