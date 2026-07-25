import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureUserProfileColumns } from "../lib/ensureSchema";

const router = Router();

export type SettingsPrefs = {
  notifMatch: boolean;
  notifEvents: boolean;
  notifMessages: boolean;
  notifCapital: boolean;
  notifDigest: boolean;
  notifEmail: boolean;
  showOnline: boolean;
  allowMatch: boolean;
  analyticsConsent: boolean;
  theme: "light" | "dark" | "system";
  lang: "tr" | "en";
  compactMode: boolean;
};

export const DEFAULT_SETTINGS_PREFS: SettingsPrefs = {
  notifMatch: true,
  notifEvents: true,
  notifMessages: true,
  notifCapital: false,
  notifDigest: true,
  notifEmail: true,
  showOnline: true,
  allowMatch: true,
  analyticsConsent: true,
  theme: "light",
  lang: "tr",
  compactMode: false,
};

export function parseSettingsPrefs(raw: string | null | undefined): SettingsPrefs {
  if (!raw) return { ...DEFAULT_SETTINGS_PREFS };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_SETTINGS_PREFS };
    return {
      notifMatch: parsed.notifMatch !== false,
      notifEvents: parsed.notifEvents !== false,
      notifMessages: parsed.notifMessages !== false,
      notifCapital: parsed.notifCapital === true,
      notifDigest: parsed.notifDigest !== false,
      notifEmail: parsed.notifEmail !== false,
      showOnline: parsed.showOnline !== false,
      allowMatch: parsed.allowMatch !== false,
      analyticsConsent: parsed.analyticsConsent !== false,
      theme:
        parsed.theme === "dark" || parsed.theme === "system" || parsed.theme === "light"
          ? parsed.theme
          : "light",
      lang: parsed.lang === "en" ? "en" : "tr",
      compactMode: parsed.compactMode === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS_PREFS };
  }
}

export async function getUserSettingsPrefs(userId: number): Promise<SettingsPrefs> {
  await ensureUserProfileColumns();
  const [user] = await db
    .select({ settingsPrefs: usersTable.settingsPrefs })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return parseSettingsPrefs(user?.settingsPrefs);
}

function sanitizeBody(body: any): SettingsPrefs {
  const base = { ...DEFAULT_SETTINGS_PREFS };
  if (!body || typeof body !== "object") return base;
  return {
    notifMatch: body.notifMatch !== false,
    notifEvents: body.notifEvents !== false,
    notifMessages: body.notifMessages !== false,
    notifCapital: body.notifCapital === true,
    notifDigest: body.notifDigest !== false,
    notifEmail: body.notifEmail !== false,
    showOnline: body.showOnline !== false,
    allowMatch: body.allowMatch !== false,
    analyticsConsent: body.analyticsConsent !== false,
    theme:
      body.theme === "dark" || body.theme === "system" || body.theme === "light"
        ? body.theme
        : "light",
    lang: body.lang === "en" ? "en" : "tr",
    compactMode: body.compactMode === true,
  };
}

// ─── GET /api/settings ───────────────────────────────────────────────────────
router.get("/settings", requireAuth, async (req, res) => {
  try {
    const prefs = await getUserSettingsPrefs(req.user!.id);
    res.json({ prefs });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ayarlar yüklenemedi" });
  }
});

// ─── PUT /api/settings ───────────────────────────────────────────────────────
router.put("/settings", requireAuth, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    const prefs = sanitizeBody(req.body?.prefs ?? req.body);
    const userId = req.user!.id;

    await db
      .update(usersTable)
      .set({ settingsPrefs: JSON.stringify(prefs) })
      .where(eq(usersTable.id, userId));

    res.json({ prefs });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ayarlar kaydedilemedi" });
  }
});

export default router;
