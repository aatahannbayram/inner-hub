import { Router, type IRouter, type Request } from "express";
import { db, invitationRequestsTable } from "@workspace/db";
import {
  SubmitRequestBody,
  ListRequestsQueryParams,
} from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

// Simple in-memory rate limiter: max 5 submissions per IP per hour
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

router.post("/request", async (req, res) => {
  const parsed = SubmitRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request data." });
    return;
  }

  const { name, email, whoYouAre, link, whoIntroduced, company } = parsed.data;

  // Honeypot check
  if (company && company.trim().length > 0) {
    // Silently accept but do not store
    res.status(201).json({ message: "Received." });
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  await db.insert(invitationRequestsTable).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    whoYouAre: whoYouAre.trim(),
    link: link?.trim() || null,
    whoIntroduced: whoIntroduced?.trim() || null,
    ipAddress: ip,
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

  const requests = await db
    .select()
    .from(invitationRequestsTable)
    .orderBy(desc(invitationRequestsTable.createdAt));

  res.json(requests);
});

export default router;
