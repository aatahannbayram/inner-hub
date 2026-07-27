import { Router } from "express";
import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  createSession,
  destroySession,
  publicUser,
  requireAuth,
} from "../lib/auth";
import {
  ensureUserProfileColumns,
  ensureUserMembershipColumns,
} from "../lib/ensureSchema";
import {
  consumeInviteCode,
  normalizeEmail,
  personaFromInviteRequest,
  validateInviteCodeForEmail,
} from "../lib/inviteCodes";
import { getPrimaryOrgForUser, isAvatarStyle, resolveAvatarUrl } from "../lib/identity";

const router = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

function calcCompletion(input: {
  name: string;
  handle: string;
  title: string;
  company: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  website: string;
  university: string;
  behance: string;
  hasAvatar: boolean;
}): number {
  const parts = input.name.trim().split(/\s+/).filter(Boolean);
  const checks = [
    (parts[0] ?? "").length > 0,
    (parts[1] ?? "").length > 0,
    input.handle.trim().length > 0,
    input.title.trim().length > 0,
    input.company.trim().length > 0,
    input.bio.trim().length > 20,
    input.skills.length >= 2,
    input.linkedin.trim().length > 0,
    input.github.trim().length > 0 || input.website.trim().length > 0 || input.behance.trim().length > 0,
    input.university.trim().length > 0,
    input.hasAvatar,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((s) => typeof s === "string").slice(0, 10);
    }
  } catch {
    /* fallthrough */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
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

    if (!email || !password || !name) {
      res.status(400).json({ error: "Ad, e-posta ve şifre zorunlu" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Şifre en az 8 karakter olmalı" });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const invite = await validateInviteCodeForEmail(inviteCode, normalizedEmail);
    if (!invite.ok) {
      res.status(403).json({ error: invite.error });
      return;
    }

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "Bu e-posta ile zaten bir hesap var" });
      return;
    }

    await ensureUserMembershipColumns();
    const persona = await personaFromInviteRequest(invite.invitationRequestId);

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        persona: persona ?? undefined,
      })
      .returning();

    await consumeInviteCode(invite.id, user.id);

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
      const invite = await validateInviteCodeForEmail(inviteCode, normalizedEmail);
      if (!invite.ok) {
        res.status(403).json({ error: invite.error });
        return;
      }
      await ensureUserMembershipColumns();
      const persona = await personaFromInviteRequest(invite.invitationRequestId);
      [user] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          name: payload.name ?? normalizedEmail,
          avatarUrl: payload.picture,
          googleId: payload.sub,
          persona: persona ?? undefined,
        })
        .returning();
      await consumeInviteCode(invite.id, user.id);
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
  try {
    await ensureUserProfileColumns();
    await ensureUserMembershipColumns();
    const [fresh] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    const user = fresh ?? req.user;
    const org = await getPrimaryOrgForUser(user.id);
    res.json({
      user: {
        ...publicUser(user),
        skills: parseSkills(user.skills),
        resolvedAvatarUrl: resolveAvatarUrl(user),
        org: org
          ? {
              id: org.id,
              name: org.name,
              slug: org.slug,
              logoUrl: org.logoUrl,
              type: org.type,
            }
          : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Profil yüklenemedi" });
  }
});

// ─── PATCH /api/auth/me ─────────────────────────────────────────────────────────
router.patch("/me", requireAuth, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const body = req.body ?? {};

    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const name = `${firstName} ${lastName}`.trim() || req.user!.name;
    const handleRaw = typeof body.handle === "string" ? body.handle.trim().toLowerCase() : "";
    const handle = handleRaw.replace(/[^a-z0-9_]/g, "").slice(0, 20);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 50) : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 50) : "";
    const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 160) : "";
    const linkedin = typeof body.linkedin === "string" ? body.linkedin.trim().slice(0, 120) : "";
    const github = typeof body.github === "string" ? body.github.trim().slice(0, 120) : "";
    const website = typeof body.website === "string" ? body.website.trim().slice(0, 120) : "";
    const twitter = typeof body.twitter === "string" ? body.twitter.trim().slice(0, 120) : "";
    const university = typeof body.university === "string" ? body.university.trim().slice(0, 120) : "";
    const behance = typeof body.behance === "string" ? body.behance.trim().slice(0, 120) : "";
    const instagram = typeof body.instagram === "string" ? body.instagram.trim().slice(0, 120) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    const whatsappOptIn =
      body.whatsappOptIn === true || body.whatsappOptIn === "true"
        ? "true"
        : body.whatsappOptIn === false || body.whatsappOptIn === "false"
          ? "false"
          : undefined;
    const avatarStyle = isAvatarStyle(body.avatarStyle) ? body.avatarStyle : undefined;
    const visibility =
      body.visibility === "public" || body.visibility === "private" || body.visibility === "members"
        ? body.visibility
        : "members";
    const skills = Array.isArray(body.skills)
      ? body.skills.filter((s: unknown) => typeof s === "string").map((s: string) => s.trim()).filter(Boolean).slice(0, 10)
      : [];

    if (handle) {
      const [taken] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(and(eq(usersTable.handle, handle), ne(usersTable.id, userId)))
        .limit(1);
      if (taken) {
        res.status(409).json({ error: "Bu kullanıcı adı alınmış" });
        return;
      }
    }

    const current = req.user!;
    const nextAvatarStyle = avatarStyle ?? current.avatarStyle ?? "lorelei";
    const profileCompletionPct = calcCompletion({
      name,
      handle,
      title,
      company,
      bio,
      skills,
      linkedin,
      github,
      website,
      university,
      behance,
      hasAvatar: Boolean(current.avatarUrl) || Boolean(handle || current.email),
    });

    const [updated] = await db
      .update(usersTable)
      .set({
        name,
        handle: handle || null,
        title: title || null,
        company: company || null,
        bio: bio || null,
        linkedin: linkedin || null,
        github: github || null,
        website: website || null,
        twitter: twitter || null,
        university: university || null,
        behance: behance || null,
        instagram: instagram || null,
        phone: phone || null,
        ...(whatsappOptIn !== undefined ? { whatsappOptIn } : {}),
        ...(avatarStyle ? { avatarStyle: nextAvatarStyle } : {}),
        skills: JSON.stringify(skills),
        visibility,
        profileCompletionPct,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    const org = await getPrimaryOrgForUser(userId);
    res.json({
      user: {
        ...publicUser(updated),
        skills: parseSkills(updated.skills),
        resolvedAvatarUrl: resolveAvatarUrl(updated),
        org: org
          ? { id: org.id, name: org.name, slug: org.slug, logoUrl: org.logoUrl, type: org.type }
          : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Profil kaydedilemedi" });
  }
});

/** POST /api/auth/me/avatar — { dataUrl } veya { clear: true } veya { useGenerated: true } */
router.post("/me/avatar", requireAuth, async (req, res) => {
  try {
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const { dataUrl, clear, useGenerated, avatarStyle } = req.body ?? {};

    if (clear === true || useGenerated === true) {
      const style = isAvatarStyle(avatarStyle) ? avatarStyle : req.user!.avatarStyle ?? "lorelei";
      const [updated] = await db
        .update(usersTable)
        .set({ avatarUrl: null, avatarStyle: style })
        .where(eq(usersTable.id, userId))
        .returning();
      res.json({
        user: {
          ...publicUser(updated!),
          skills: parseSkills(updated!.skills),
          resolvedAvatarUrl: resolveAvatarUrl(updated!),
        },
      });
      return;
    }

    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "Geçerli bir görsel dataUrl gerekli" });
      return;
    }
    if (dataUrl.length > 220_000) {
      res.status(400).json({ error: "Görsel çok büyük (max ~160KB)" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ avatarUrl: dataUrl })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({
      user: {
        ...publicUser(updated!),
        skills: parseSkills(updated!.skills),
        resolvedAvatarUrl: resolveAvatarUrl(updated!),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Avatar güncellenemedi" });
  }
});

export default router;
