import { Router, type IRouter, type Request } from "express";
import { db, invitationRequestsTable } from "@workspace/db";
import {
  SubmitRequestBody,
  ListRequestsQueryParams,
} from "@workspace/api-zod";
import { desc, sql } from "drizzle-orm";
import {
  notifyNewInvitationRequest,
  notifyApplicantInvitationReceived,
  roleLabelOf,
} from "../lib/mail";
import {
  domainFromEmail,
  normalizeDomain,
  orgLogoDir,
  resolveAndCacheOrgLogo,
} from "../lib/orgLogo";
import path from "node:path";
import fs from "node:fs";
import { once } from "../lib/ensureSchema";

const router: IRouter = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

const ensureOrgColumns = once(async () => {
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization_domain text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization_logo text`);
});

/** Live logo preview for the invitation form. */
router.get("/org-logo", async (req, res) => {
  const domain = normalizeDomain(String(req.query.domain ?? ""));
  if (!domain) {
    res.status(400).json({ error: "domain required" });
    return;
  }
  try {
    const resolved = await resolveAndCacheOrgLogo(domain);
    if (!resolved) {
      res.status(404).json({ error: "Logo not found", domain });
      return;
    }
    res.json({ domain: resolved.domain, logoUrl: resolved.logoPath });
  } catch {
    res.status(500).json({ error: "Logo resolve failed" });
  }
});

/** Serve cached org logos. */
router.get("/org-logos/:file", (req, res) => {
  const file = path.basename(String(req.params.file ?? ""));
  if (!file || file.includes("..")) {
    res.status(400).end();
    return;
  }
  const full = path.join(orgLogoDir(), file);
  if (!fs.existsSync(full)) {
    res.status(404).end();
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.sendFile(full);
});

router.post("/request", async (req, res) => {
  const parsed = SubmitRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request data." });
    return;
  }

  const {
    name,
    email,
    role,
    linkedin,
    whoYouAre,
    link,
    whoIntroduced,
    organization,
    organizationDomain,
    organizationLogo,
    company,
    fax,
  } = parsed.data as typeof parsed.data & {
    organization?: string | null;
    organizationDomain?: string | null;
    organizationLogo?: string | null;
    fax?: string | null;
  };

  // Honeypot (legacy `company` + new `fax`)
  if ((company && company.trim().length > 0) || (fax && fax.trim().length > 0)) {
    res.status(201).json({ message: "Received." });
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedRole = role === "operator" ? "builder" : (role ?? null);
  const trimmedLinkedin = linkedin?.trim() || null;
  const trimmedWhoYouAre = whoYouAre.trim();
  const trimmedLink = link?.trim() || null;
  const trimmedWhoIntroduced = whoIntroduced?.trim() || null;
  const trimmedOrg = organization?.trim() || null;

  let domain =
    normalizeDomain(organizationDomain) ||
    normalizeDomain(trimmedLink) ||
    domainFromEmail(trimmedEmail);

  let logoUrl: string | null = organizationLogo?.trim() || null;
  if (domain) {
    try {
      const resolved = await resolveAndCacheOrgLogo(domain);
      if (resolved) {
        domain = resolved.domain;
        logoUrl = resolved.logoPath;
      }
    } catch {
      // keep client-provided logo if any
    }
  }

  await ensureOrgColumns();

  await db.insert(invitationRequestsTable).values({
    name: trimmedName,
    email: trimmedEmail,
    role: trimmedRole,
    linkedin: trimmedLinkedin,
    whoYouAre: trimmedWhoYouAre,
    link: trimmedLink,
    whoIntroduced: trimmedWhoIntroduced,
    organization: trimmedOrg,
    organizationDomain: domain,
    organizationLogo: logoUrl,
    ipAddress: ip,
  });

  void notifyNewInvitationRequest({
    name: trimmedName,
    email: trimmedEmail,
    role: trimmedRole,
    linkedin: trimmedLinkedin,
    whoYouAre: trimmedWhoYouAre,
    link: trimmedLink,
    whoIntroduced: trimmedWhoIntroduced,
    organization: trimmedOrg,
    organizationDomain: domain,
    organizationLogo: logoUrl,
  });

  void notifyApplicantInvitationReceived({
    name: trimmedName,
    email: trimmedEmail,
    roleLabel: roleLabelOf(trimmedRole),
  });

  res.status(201).json({ message: "Received." });
});

router.get("/requests", async (req, res) => {
  const parsed = ListRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const adminPasscode = process.env["ADMIN_PASSCODE"];
  if (!adminPasscode || parsed.data.passcode !== adminPasscode) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  await ensureOrgColumns();

  const requests = await db
    .select()
    .from(invitationRequestsTable)
    .orderBy(desc(invitationRequestsTable.createdAt));

  res.json(requests);
});

export default router;
