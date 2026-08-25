import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { and, eq, isNull, ne } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "@workspace/db";
import { passwordResetTokensTable, usersTable } from "@workspace/db/schema";
import { parseProfileLinks, sanitizeProfileLinks } from "../lib/profileLinks";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  createSession,
  destroySession,
  destroySessionsForUser,
  publicUser,
  requireAuth,
} from "../lib/auth";
import {
  ensureUserProfileColumns,
  ensureUserMembershipColumns,
  ensurePasswordResetSchema,
} from "../lib/ensureSchema";
import {
  consumeInviteCode,
  normalizeEmail,
  personaFromInviteRequest,
  profileSeedFromInviteRequest,
  hydrateUserProfileFromInvite,
  validateInviteCodeForEmail,
} from "../lib/inviteCodes";
import { getPrimaryOrgForUser, isAvatarStyle, resolveAvatarUrl } from "../lib/identity";
import { notifyPasswordReset } from "../lib/mail";
import { appBaseUrl, mailProviderStatus, sendTransactionalMail } from "../lib/mail/transport";
import { logger } from "../lib/logger";

const router = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const forgotHits = new Map<string, { n: number; reset: number }>();

function allowForgotAttempt(key: string, limit = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const row = forgotHits.get(key);
  if (!row || now > row.reset) {
    forgotHits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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
  res.json({
    googleClientId: googleClientId ?? null,
    linkedinEnabled,
    mail: mailProviderStatus(),
  });
});

/** POST /api/auth/mail-test — { passcode, to? } ADMIN_PASSCODE ile Resend/SMTP smoke. */
router.post("/mail-test", async (req, res) => {
  const expected = process.env.ADMIN_PASSCODE?.trim();
  const got =
    (typeof req.headers["x-admin-passcode"] === "string"
      ? req.headers["x-admin-passcode"]
      : "") ||
    (typeof req.body?.passcode === "string" ? req.body.passcode : "");
  if (!expected || got !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const to =
    (typeof req.body?.to === "string" && req.body.to.includes("@")
      ? normalizeEmail(req.body.to)
      : null) ||
    process.env.NOTIFY_EMAIL ||
    process.env.MAIL_REPLY_TO;
  if (!to) {
    res.status(400).json({ error: "to veya NOTIFY_EMAIL gerekli" });
    return;
  }

  const status = mailProviderStatus();
  const result = await sendTransactionalMail({
    to,
    subject: "inner hub · mail test",
    text: `Bu bir test iletidir.\nFrom: ${status.from}\nResend: ${status.resendConfigured}\nSMTP: ${status.smtpConfigured}\n`,
    html: `<p>Bu bir test iletidir.</p><p>From: <code>${status.from}</code></p>`,
    kind: "auth.mail_test",
  });

  res.status(result.ok ? 200 : 502).json({ ok: result.ok, to, status, result });
});

/** POST /api/auth/admin/user-lookup — { passcode, email } ADMIN_PASSCODE ile destek teşhisi.
 *  "Şifre sıfırlama maili gelmedi" şikayetlerinde bu email gerçekten kayıtlı mı, silinmiş mi,
 *  şifresi var mı diye görmeye yarar - forgot-password'daki enumeration-önleyici genel mesajın
 *  arkasında ne olduğunu admin'e gösterir. Genel kullanıcıya asla açık değil. */
router.post("/admin/user-lookup", async (req, res) => {
  const expected = process.env.ADMIN_PASSCODE?.trim();
  const got =
    (typeof req.headers["x-admin-passcode"] === "string" ? req.headers["x-admin-passcode"] : "") ||
    (typeof req.body?.passcode === "string" ? req.body.passcode : "");
  if (!expected || got !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Geçerli bir e-posta gerekli" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.json({ found: false, email });
    return;
  }

  res.json({
    found: true,
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    deletedAt: user.deletedAt,
    hasPassword: Boolean(user.passwordHash),
    handle: user.handle,
  });
});

// ─── LinkedIn: mevcut hesaba bağlama (login değil, connect) ────────────────────
const LINKEDIN_STATE_COOKIE = "li_oauth_state";

router.get("/linkedin/start", requireAuth, (req, res) => {
  if (!linkedinEnabled) {
    res.status(503).json({ error: "LinkedIn henüz yapılandırılmadı" });
    return;
  }
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(LINKEDIN_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });
  res.redirect(linkedinAuthorizeUrl(state));
});

router.get("/linkedin/callback", async (req, res) => {
  const profileUrl = `${(process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "")}/panel/profile`;
  const fail = (reason: string) => res.redirect(`${profileUrl}?linkedin=error&reason=${encodeURIComponent(reason)}`);

  try {
    if (!req.user) {
      fail("not_authenticated");
      return;
    }
    const { code, state, error: liError } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };
    if (liError) {
      fail(liError);
      return;
    }
    const expectedState = req.cookies?.[LINKEDIN_STATE_COOKIE];
    res.clearCookie(LINKEDIN_STATE_COOKIE, { path: "/" });
    if (!code || !state || !expectedState || state !== expectedState) {
      fail("invalid_state");
      return;
    }

    const profile = await fetchLinkedinProfile(code);

    const [clash] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.linkedinId, profile.sub))
      .limit(1);
    if (clash && clash.id !== req.user.id) {
      fail("already_linked");
      return;
    }

    await db
      .update(usersTable)
      .set({
        linkedinId: profile.sub,
        avatarUrl: req.user.avatarUrl ?? profile.picture ?? undefined,
        linkedinLogoUrl: profile.picture ?? req.user.linkedinLogoUrl ?? undefined,
      })
      .where(eq(usersTable.id, req.user.id));

    res.redirect(`${profileUrl}?linkedin=connected`);
  } catch (err: any) {
    fail(err.message ?? "unknown");
  }
});

router.post("/linkedin/disconnect", requireAuth, async (req, res) => {
  await db
    .update(usersTable)
    .set({ linkedinId: null })
    .where(eq(usersTable.id, req.user!.id));
  res.json({ ok: true });
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
    const seed = await profileSeedFromInviteRequest(invite.invitationRequestId);

    const passwordHash = await bcrypt.hash(password, 12);
    const profileCompletionPct = calcCompletion({
      name: name.trim(),
      handle: "",
      title: seed.title ?? "",
      company: seed.company ?? "",
      bio: seed.bio ?? "",
      skills: [],
      linkedin: seed.linkedin ?? "",
      github: "",
      website: seed.website ?? "",
      university: "",
      behance: "",
      hasAvatar: false,
    });

    const [user] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        persona: persona ?? undefined,
        bio: seed.bio,
        company: seed.company,
        linkedin: seed.linkedin,
        website: seed.website,
        title: seed.title,
        profileCompletionPct,
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

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
// Body: { email }. Her zaman aynı başarı mesajı (enumeration yok).
router.post("/forgot-password", async (req, res) => {
  const genericOk = {
    ok: true,
    message:
      "E-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.",
  };

  try {
    const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Geçerli bir e-posta gerekli" });
      return;
    }

    const ip =
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0]?.trim()
        : null) ||
      req.ip ||
      "unknown";

    if (!allowForgotAttempt(`ip:${ip}`) || !allowForgotAttempt(`email:${email}`, 3)) {
      res.status(429).json({ error: "Çok fazla deneme. Biraz sonra tekrar dene." });
      return;
    }

    await ensurePasswordResetSchema();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user && !user.deletedAt) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      await db
        .update(passwordResetTokensTable)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokensTable.userId, user.id),
            isNull(passwordResetTokensTable.usedAt),
          ),
        );

      await db.insert(passwordResetTokensTable).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const resetUrl = `${appBaseUrl()}/panel?reset=${encodeURIComponent(rawToken)}`;
      const mailResult = await notifyPasswordReset({
        name: user.name,
        email: user.email,
        resetUrl,
      });
      if (!mailResult.ok) {
        logger.warn(
          { email: user.email, error: mailResult.error, provider: mailResult.provider },
          "Password reset mail failed",
        );
        res.status(502).json({
          error: "Sıfırlama maili gönderilemedi. Biraz sonra tekrar dene veya support@inner.digital yaz.",
        });
        return;
      }
      logger.info(
        { email: user.email, provider: mailResult.provider },
        "Password reset mail accepted",
      );
    } else {
      logger.info({ email }, "Password reset requested for unknown email");
    }

    res.json(genericOk);
  } catch (err: any) {
    logger.error({ err }, "forgot-password failed");
    res.status(500).json({ error: err.message ?? "Şifre sıfırlama isteği başarısız" });
  }
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
// Body: { token, password }
router.post("/reset-password", async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!token || token.length < 32) {
      res.status(400).json({ error: "Geçersiz veya eksik sıfırlama bağlantısı" });
      return;
    }
    if (!password || password.length < 8) {
      res.status(400).json({ error: "Şifre en az 8 karakter olmalı" });
      return;
    }

    await ensurePasswordResetSchema();
    const tokenHash = hashResetToken(token);

    const [row] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
      .limit(1);

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ error: "Bağlantı geçersiz veya süresi dolmuş. Yeni talep oluştur." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, row.userId))
      .returning();

    if (!user || user.deletedAt) {
      res.status(400).json({ error: "Hesap bulunamadı" });
      return;
    }

    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          isNull(passwordResetTokensTable.usedAt),
        ),
      );

    await destroySessionsForUser(user.id);
    const sessionId = await createSession(user.id);
    res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
    res.json({ user: publicUser(user), ok: true });
  } catch (err: any) {
    logger.error({ err }, "reset-password failed");
    res.status(500).json({ error: err.message ?? "Şifre sıfırlanamadı" });
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
      const seed = await profileSeedFromInviteRequest(invite.invitationRequestId);
      const displayName = payload.name ?? normalizedEmail;
      const profileCompletionPct = calcCompletion({
        name: displayName,
        handle: "",
        title: seed.title ?? "",
        company: seed.company ?? "",
        bio: seed.bio ?? "",
        skills: [],
        linkedin: seed.linkedin ?? "",
        github: "",
        website: seed.website ?? "",
        university: "",
        behance: "",
        hasAvatar: Boolean(payload.picture),
      });
      [user] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          name: displayName,
          avatarUrl: payload.picture,
          googleId: payload.sub,
          persona: persona ?? undefined,
          bio: seed.bio,
          company: seed.company,
          linkedin: seed.linkedin,
          website: seed.website,
          title: seed.title,
          profileCompletionPct,
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
    let user = fresh ?? req.user;
    const hydrated = await hydrateUserProfileFromInvite(user);
    if (hydrated) {
      const [again] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1);
      if (again) user = again;
    }
    const org = await getPrimaryOrgForUser(user.id);
    res.json({
      user: {
        ...publicUser(user),
        skills: parseSkills(user.skills),
        profileLinks: parseProfileLinks(user.profileLinks),
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
    const bioRaw = typeof body.bio === "string" ? body.bio.trim() : "";
    if (bioRaw.length > 0) {
      if (bioRaw.length < 20) {
        res.status(400).json({ error: "Bio en az 20 karakter olmalı" });
        return;
      }
      if (/^\.+$/.test(bioRaw) || /^\.\.$/.test(bioRaw)) {
        res.status(400).json({ error: "Geçersiz bio" });
        return;
      }
    }
    const bio = bioRaw.slice(0, 400);
    const linkedin = typeof body.linkedin === "string" ? body.linkedin.trim().slice(0, 120) : "";
    const linkedinLogoUrlRaw =
      typeof body.linkedinLogoUrl === "string" ? body.linkedinLogoUrl.trim().slice(0, 500) : undefined;
    const linkedinLogoUrl =
      linkedinLogoUrlRaw === undefined
        ? undefined
        : linkedinLogoUrlRaw.length > 0 &&
            (linkedinLogoUrlRaw.startsWith("http://") || linkedinLogoUrlRaw.startsWith("https://"))
          ? linkedinLogoUrlRaw
          : null;
    const github = typeof body.github === "string" ? body.github.trim().slice(0, 120) : "";
    const githubLogoUrlRaw =
      typeof body.githubLogoUrl === "string" ? body.githubLogoUrl.trim().slice(0, 500) : undefined;
    const githubLogoUrl =
      githubLogoUrlRaw === undefined
        ? undefined
        : githubLogoUrlRaw.length > 0 &&
            (githubLogoUrlRaw.startsWith("http://") || githubLogoUrlRaw.startsWith("https://"))
          ? githubLogoUrlRaw
          : null;
    const website = typeof body.website === "string" ? body.website.trim().slice(0, 120) : "";
    const websiteLogoUrlRaw =
      typeof body.websiteLogoUrl === "string" ? body.websiteLogoUrl.trim().slice(0, 500) : undefined;
    const websiteLogoUrl =
      websiteLogoUrlRaw === undefined
        ? undefined
        : websiteLogoUrlRaw.length > 0 &&
            (websiteLogoUrlRaw.startsWith("http://") ||
              websiteLogoUrlRaw.startsWith("https://") ||
              websiteLogoUrlRaw.startsWith("/api/"))
          ? websiteLogoUrlRaw
          : null;
    const twitter = typeof body.twitter === "string" ? body.twitter.trim().slice(0, 120) : "";
    const university = typeof body.university === "string" ? body.university.trim().slice(0, 120) : "";
    const behance = typeof body.behance === "string" ? body.behance.trim().slice(0, 120) : "";
    const instagram = typeof body.instagram === "string" ? body.instagram.trim().slice(0, 120) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    const showPhoneOnCard =
      body.showPhoneOnCard === true || body.showPhoneOnCard === "true"
        ? true
        : body.showPhoneOnCard === false || body.showPhoneOnCard === "false"
          ? false
          : undefined;
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
    const profileLinks =
      Array.isArray(body.profileLinks) ? sanitizeProfileLinks(body.profileLinks) : undefined;

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
        ...(linkedinLogoUrl !== undefined
          ? { linkedinLogoUrl: linkedin ? linkedinLogoUrl : null }
          : !linkedin
            ? { linkedinLogoUrl: null }
            : {}),
        github: github || null,
        ...(githubLogoUrl !== undefined
          ? { githubLogoUrl: github ? githubLogoUrl : null }
          : !github
            ? { githubLogoUrl: null }
            : {}),
        website: website || null,
        ...(websiteLogoUrl !== undefined
          ? { websiteLogoUrl: website ? websiteLogoUrl : null }
          : !website
            ? { websiteLogoUrl: null }
            : {}),
        twitter: twitter || null,
        university: university || null,
        behance: behance || null,
        instagram: instagram || null,
        phone: phone || null,
        ...(showPhoneOnCard !== undefined ? { showPhoneOnCard } : {}),
        ...(whatsappOptIn !== undefined ? { whatsappOptIn } : {}),
        ...(avatarStyle ? { avatarStyle: nextAvatarStyle } : {}),
        skills: JSON.stringify(skills),
        ...(profileLinks !== undefined ? { profileLinks: JSON.stringify(profileLinks) } : {}),
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
        profileLinks: parseProfileLinks(updated.profileLinks),
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
          profileLinks: parseProfileLinks(updated!.profileLinks),
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
        profileLinks: parseProfileLinks(updated!.profileLinks),
        resolvedAvatarUrl: resolveAvatarUrl(updated!),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Avatar güncellenemedi" });
  }
});

export default router;
