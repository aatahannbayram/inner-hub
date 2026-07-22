import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { sessionsTable, usersTable, type User } from "@workspace/db/schema";

export const SESSION_COOKIE = "inner_sid";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Frontend (Hostinger) ve API (Railway) farklı origin'lerde çalışıyor,
// bu yüzden prod'da cookie'nin cross-site fetch ile gönderilebilmesi için
// SameSite=None + Secure gerekiyor. Yerel dev'de aynı origin (Vite proxy) olduğu için Lax yeterli.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: SESSION_TTL_MS,
  path: "/",
};

export async function createSession(userId: number): Promise<string> {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ id, userId, expiresAt });
  return id;
}

export async function destroySession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function getUserBySession(sessionId: string | undefined): Promise<User | null> {
  if (!sessionId) return null;

  const [row] = await db
    .select({ user: usersTable, expiresAt: sessionsTable.expiresAt })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await destroySession(sessionId);
    return null;
  }
  return row.user;
}

export function publicUser(user: User) {
  const { passwordHash: _passwordHash, googleId: _googleId, ...rest } = user;
  return rest;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  req.user = (await getUserBySession(sessionId)) ?? undefined;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
