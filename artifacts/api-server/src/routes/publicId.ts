import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { ensureUserProfileColumns } from "../lib/ensureSchema";

const router = Router();

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
    linkedin: user.linkedin,
    github: user.github,
    website: user.website,
    twitter: user.twitter,
    visibility: user.visibility ?? "members",
    role: user.role,
    profileCompletionPct: user.profileCompletionPct,
    createdAt: user.createdAt.toISOString(),
    verified: true,
    tier: user.role === "admin" ? "Kurucu Üye" : "Üye",
  };
}

// ─── GET /api/public/profile/:handle ─────────────────────────────────────────
router.get("/public/profile/:handle", async (req, res) => {
  try {
    const handle = normalizeHandle(String(req.params.handle ?? ""));
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

    // Badge herkese açık görsel (LinkedIn/GitHub README); private değilse göster
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

export default router;
