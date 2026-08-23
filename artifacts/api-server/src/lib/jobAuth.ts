import type { Request } from "express";

/** Cron secret (X-Job-Secret: CRON_SECRET) veya admin oturumu. */
export function jobAuthorized(req: {
  headers: Request["headers"];
  user?: { role?: string };
}): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers["x-job-secret"];
  if (secret && typeof header === "string" && header === secret) return true;
  if (req.user?.role === "admin") return true;
  return false;
}
