import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  createSession,
  destroySession,
  publicUser,
} from "../lib/auth";

const router = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

function assertInviteCode(inviteCode: unknown): string | null {
  const expected = process.env.INVITE_PASSCODE?.trim();
  if (!expected) {
    return "Davet sistemi yapılandırılmamış (INVITE_PASSCODE)";
  }
  if (typeof inviteCode !== "string" || !inviteCode.trim()) {
    return "Davet kodu zorunlu";
  }
  if (inviteCode.trim() !== expected) {
    return "Geçersiz davet kodu";
  }
  return null;
}

// ─── GET /api/auth/config ─────────────────────────────────────────────────────
// Frontend'in Google Sign-In butonunu render edebilmesi için public client ID.
router.get("/config", (_req, res) => {
  res.json({ googleClientId: googleClientId ?? null });
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, inviteCode } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      inviteCode?: string;
    };

    const inviteError = assertInviteCode(inviteCode);
    if (inviteError) {
      res.status(403).json({ error: inviteError });
      return;
    }

    if (!email || !password || !name) {
      res.status(400).json({ error: "Ad, e-posta ve şifre zorunlu" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Şifre en az 8 karakter olmalı" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "Bu e-posta ile zaten bir hesap var" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ email: normalizedEmail, name: name.trim(), passwordHash })
      .returning();

    const sessionId = await createSession(user.id);
    res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
    res.status(201).json({ user: publicUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kayıt sırasında hata oluştu" });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "E-posta ve şifre zorunlu" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "E-posta veya şifre hatalı" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "E-posta veya şifre hatalı" });
      return;
    }

    const sessionId = await createSession(user.id);
    res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
    res.json({ user: publicUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Giriş sırasında hata oluştu" });
  }
});

// ─── POST /api/auth/google ─────────────────────────────────────────────────────
// Body: { credential } — Google Identity Services'ten dönen ID token (JWT).
router.post("/google", async (req, res) => {
  try {
    if (!googleClient || !googleClientId) {
      res.status(503).json({ error: "Google ile giriş henüz yapılandırılmadı" });
      return;
    }

    const { credential, inviteCode } = req.body as {
      credential?: string;
      inviteCode?: string;
    };
    if (!credential) {
      res.status(400).json({ error: "Google credential eksik" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(401).json({ error: "Google doğrulaması başarısız" });
      return;
    }

    const normalizedEmail = payload.email.toLowerCase();
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    let user = existing;
    if (!user) {
      const inviteError = assertInviteCode(inviteCode);
      if (inviteError) {
        res.status(403).json({ error: inviteError });
        return;
      }
      [user] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          name: payload.name ?? normalizedEmail,
          avatarUrl: payload.picture,
          googleId: payload.sub,
        })
        .returning();
    } else if (!user.googleId) {
      [user] = await db
        .update(usersTable)
        .set({ googleId: payload.sub, avatarUrl: user.avatarUrl ?? payload.picture })
        .where(eq(usersTable.id, user.id))
        .returning();
    }

    const sessionId = await createSession(user.id);
    res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
    res.json({ user: publicUser(user) });
  } catch (err: any) {
    res.status(401).json({ error: "Google ile giriş doğrulanamadı" });
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) await destroySession(sessionId);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: publicUser(req.user) });
});

export default router;
