import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { parseProfileLinks, publicProfileLinks } from "../lib/profileLinks";
import { parseCardTheme } from "../lib/cardTheme";
import { ensureUserProfileColumns } from "../lib/ensureSchema";
import { resolveAvatarUrl } from "../lib/identity";
import { renderProfileQrSvg } from "../lib/qrSvg";
import { buildVCard } from "../lib/vcard";
import {
  renderCardBackSvg,
  renderCardFrontSvg,
  renderMiniCardSvg,
} from "../lib/cardPrint";
import {
  getCardStatsForHandle,
  recordCardEvent,
  type CardEventType,
} from "../lib/profileCardEvents";

const router = Router();

function appBaseUrl(): string {
  return (process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "");
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

function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function findByHandle(handle: string) {
  await ensureUserProfileColumns();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.handle, handle))
    .limit(1);
  return user ?? null;
}

function publicPayload(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    title: user.title,
    company: user.company,
    bio: user.bio,
    skills: parseSkills(user.skills),
    avatarUrl: resolveAvatarUrl(user),
    linkedin: user.linkedin,
    linkedinLogoUrl: user.linkedinLogoUrl ?? null,
    github: user.github,
    githubLogoUrl: user.githubLogoUrl ?? null,
    website: user.website,
    websiteLogoUrl: user.websiteLogoUrl ?? null,
    twitter: user.twitter,
    instagram: user.instagram ?? null,
    behance: user.behance ?? null,
    profileLinks: publicProfileLinks(parseProfileLinks(user.profileLinks)),
    cardTheme: parseCardTheme(user.cardTheme),
    showPhoneOnCard: Boolean(user.showPhoneOnCard),
    phone: user.showPhoneOnCard && user.phone ? user.phone : null,
    visibility: user.visibility ?? "members",
    role: user.role,
    profileCompletionPct: user.profileCompletionPct,
    createdAt: user.createdAt.toISOString(),
    verified: Boolean(user.linkedinId),
    tier: user.role === "admin" ? "Kurucu Üye" : "Üye",
  };
}

function profilePublicUrl(handle: string): string {
  return `${appBaseUrl()}/u/${handle}`;
}

async function sendVCard(handle: string, res: import("express").Response) {
  const user = await findByHandle(handle);
  if (!user || (user.visibility ?? "members") !== "public") {
    res.status(404).type("text/plain").send("not found");
    return;
  }

  const vcf = buildVCard({
    name: user.name,
    handle,
    title: user.title,
    company: user.company,
    bio: user.bio,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    twitter: user.twitter,
    instagram: user.instagram,
    photoUrl: resolveAvatarUrl(user),
    profileUrl: profilePublicUrl(handle),
    phone: user.showPhoneOnCard ? user.phone : null,
  });

  res.setHeader("Content-Type", "text/vcard; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${handle}.vcf"`);
  res.setHeader("Cache-Control", "public, max-age=120");
  res.send(vcf);
  void recordCardEvent(handle, "vcard").catch(() => {});
}

async function sendPublicQr(handle: string, res: import("express").Response) {
  const user = await findByHandle(handle);
  if (!user || (user.visibility ?? "members") !== "public") {
    res.status(404).type("text/plain").send("not found");
    return;
  }
  const svg = renderProfileQrSvg(profilePublicUrl(handle));
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(svg);
  void recordCardEvent(handle, "qr").catch(() => {});
}

// Specific routes before :handle catch-all
router.get("/public/profile/:handle/qr.svg", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    if (!handle) {
      res.status(400).type("text/plain").send("invalid handle");
      return;
    }
    await sendPublicQr(handle, res);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

router.get("/public/profile/:handle.vcf", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    if (!handle) {
      res.status(400).type("text/plain").send("invalid handle");
      return;
    }
    await sendVCard(handle, res);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

router.get("/public/profile/:handle/vcard", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    if (!handle) {
      res.status(400).type("text/plain").send("invalid handle");
      return;
    }
    await sendVCard(handle, res);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

/** Authenticated owner preview QR — works even when not yet public. */
router.get("/me/id/qr.svg", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).type("text/plain").send("unauthorized");
      return;
    }
    await ensureUserProfileColumns();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    if (!user) {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    const handle = normalizeHandle(user.handle ?? "") || `u${user.id}`;
    const svg = renderProfileQrSvg(profilePublicUrl(handle));
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "private, no-store");
    res.send(svg);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

// ─── GET /api/public/profile/:handle ─────────────────────────────────────────
router.get("/public/profile/:handle", async (req, res) => {
  try {
    const raw = String(req.params.handle ?? "");
    if (/\.vcf$/i.test(raw)) {
      const handle = normalizeHandle(raw.replace(/\.vcf$/i, ""));
      if (!handle) {
        res.status(400).type("text/plain").send("invalid handle");
        return;
      }
      await sendVCard(handle, res);
      return;
    }

    const handle = normalizeHandle(raw);
    if (!handle) {
      res.status(400).json({ error: "Geçersiz handle" });
      return;
    }

    const user = await findByHandle(handle);
    if (!user) {
      res.status(404).json({ error: "Profil bulunamadı" });
      return;
    }

    const visibility = user.visibility ?? "members";
    if (visibility === "private") {
      res.status(404).json({ error: "Profil bulunamadı" });
      return;
    }
    if (visibility === "members" && !req.user) {
      res.status(401).json({
        error: "Bu profil yalnızca inner·hub üyelerine açık",
        code: "MEMBERS_ONLY",
        handle,
      });
      return;
    }

    res.json({ profile: publicPayload(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Profil yüklenemedi" });
  }
});

const CARD_EVENTS = new Set<CardEventType>(["view", "vcard", "link", "qr", "share"]);

// ─── POST /api/public/profile/:handle/event ──────────────────────────────────
router.post("/public/profile/:handle/event", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    const eventType = String(req.body?.type ?? "") as CardEventType;
    if (!handle || !CARD_EVENTS.has(eventType)) {
      res.status(400).json({ error: "Geçersiz olay" });
      return;
    }
    const user = await findByHandle(handle);
    if (!user || (user.visibility ?? "members") !== "public") {
      res.status(404).json({ error: "not found" });
      return;
    }
    const linkKey = typeof req.body?.linkKey === "string" ? req.body.linkKey : null;
    const referrer =
      typeof req.body?.referrer === "string"
        ? req.body.referrer
        : typeof req.get("referer") === "string"
          ? req.get("referer")
          : null;
    const userAgent = req.get("user-agent") ?? null;
    await recordCardEvent(handle, eventType, { linkKey, referrer, userAgent });
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "error" });
  }
});

// ─── GET /api/me/id/stats ────────────────────────────────────────────────────
router.get("/me/id/stats", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    await ensureUserProfileColumns();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    if (!user?.handle) {
      res.json({
        stats: {
          views7d: 0,
          views30d: 0,
          vcards7d: 0,
          links7d: 0,
          qr7d: 0,
          shares7d: 0,
          viewsTotal: 0,
          linkClicks: [],
          devices: [],
          topReferrers: [],
        },
      });
      return;
    }
    const stats = await getCardStatsForHandle(user.handle);
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "error" });
  }
});

function printCardInput(user: typeof usersTable.$inferSelect, handle: string) {
  return {
    name: user.name,
    handle,
    title: user.title,
    company: user.company,
    profileUrl: profilePublicUrl(handle),
  };
}

// ─── Printable card SVG (owner preview always; public when visibility=public) ─
router.get("/me/id/card-front.svg", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).type("text/plain").send("unauthorized");
      return;
    }
    await ensureUserProfileColumns();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    if (!user) {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    const handle = normalizeHandle(user.handle ?? "") || `u${user.id}`;
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "private, no-store");
    res.send(renderCardFrontSvg(printCardInput(user, handle)));
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

router.get("/me/id/card-back.svg", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).type("text/plain").send("unauthorized");
      return;
    }
    await ensureUserProfileColumns();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    if (!user) {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    const handle = normalizeHandle(user.handle ?? "") || `u${user.id}`;
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "private, no-store");
    res.send(renderCardBackSvg(printCardInput(user, handle)));
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

router.get("/public/profile/:handle/card-front.svg", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    const user = await findByHandle(handle);
    if (!user || (user.visibility ?? "members") !== "public") {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(renderCardFrontSvg(printCardInput(user, handle)));
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

router.get("/public/profile/:handle/card-back.svg", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    const user = await findByHandle(handle);
    if (!user || (user.visibility ?? "members") !== "public") {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(renderCardBackSvg(printCardInput(user, handle)));
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

// ─── GET /api/badge/:handle.svg ──────────────────────────────────────────────
router.get("/badge/:handle.svg", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    if (!handle) {
      res.status(400).type("text/plain").send("invalid handle");
      return;
    }

    const user = await findByHandle(handle);
    if (!user || (user.visibility ?? "members") === "private") {
      res.status(404).type("text/plain").send("not found");
      return;
    }

    const label = "inner·hub";
    const name = escapeXml(user.name.split(/\s+/)[0] || handle);
    const handleLabel = escapeXml(`@${handle}`);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="168" height="28" role="img" aria-label="${label} member">
  <title>${label} · ${handleLabel}</title>
  <rect width="168" height="28" fill="#0A0A0A"/>
  <rect x="0" y="0" width="3" height="28" fill="#18FF85"/>
  <text x="12" y="18" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" fill="#F4F1EC">${escapeXml(label)}</text>
  <text x="78" y="18" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" fill="#18FF85">${name}</text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(svg);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

// ─── GET /api/badge/:handle/card.svg — mini kart embed ───────────────────────
router.get("/badge/:handle/card.svg", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
    if (!handle) {
      res.status(400).type("text/plain").send("invalid handle");
      return;
    }
    const user = await findByHandle(handle);
    if (!user || (user.visibility ?? "members") === "private") {
      res.status(404).type("text/plain").send("not found");
      return;
    }
    const svg = renderMiniCardSvg({
      ...printCardInput(user, handle),
      avatarUrl: resolveAvatarUrl(user),
    });
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(svg);
  } catch (err: any) {
    res.status(500).type("text/plain").send(err.message ?? "error");
  }
});

export default router;
