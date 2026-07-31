import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureUserProfileColumns } from "../lib/ensureSchema";
import { hydrateUserProfileFromInvite } from "../lib/inviteCodes";
import {
  buildJourneySnapshot,
  mergeJourneyIntoSettingsPrefs,
  parseJourneyPrefs,
  type JourneyVisitKey,
} from "../lib/journey";

const router = Router();

const VISITS = new Set<JourneyVisitKey>(["members", "signal", "stage", "profile"]);

router.get("/journey", requireAuth, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    let user = req.user!;
    const hydrated = await hydrateUserProfileFromInvite(user);
    if (hydrated) {
      // req.user snapshot stale olabilir; güncel satırı kullan
      const [fresh] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
      if (fresh) user = fresh;
    }
    const prefs = parseJourneyPrefs(user.settingsPrefs);
    res.json({ journey: buildJourneySnapshot(user, prefs) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Yolculuk yüklenemedi" });
  }
});

/** POST { place } — members | signal | stage | profile ziyaretini işaretle */
router.post("/journey/visit", requireAuth, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    const place = typeof req.body?.place === "string" ? req.body.place.trim() : "";
    if (!VISITS.has(place as JourneyVisitKey)) {
      res.status(400).json({ error: "Geçersiz place" });
      return;
    }
    const userId = req.user!.id;
    const [row] = await db
      .select({ settingsPrefs: usersTable.settingsPrefs })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const nextPrefsJson = mergeJourneyIntoSettingsPrefs(row?.settingsPrefs, {
      visited: { [place]: true },
    });

    const [updated] = await db
      .update(usersTable)
      .set({ settingsPrefs: nextPrefsJson })
      .where(eq(usersTable.id, userId))
      .returning();

    const journey = buildJourneySnapshot(updated!, parseJourneyPrefs(nextPrefsJson));
    res.json({ journey });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ziyaret kaydedilemedi" });
  }
});

/** POST { dismiss: true } — dashboard kartını gizle (görevler bitene kadar tekrar açılabilir) */
router.post("/journey/dismiss", requireAuth, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    const userId = req.user!.id;
    const [row] = await db
      .select({ settingsPrefs: usersTable.settingsPrefs })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const nextPrefsJson = mergeJourneyIntoSettingsPrefs(row?.settingsPrefs, {
      dismissedCard: true,
    });

    const [updated] = await db
      .update(usersTable)
      .set({ settingsPrefs: nextPrefsJson })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({ journey: buildJourneySnapshot(updated!, parseJourneyPrefs(nextPrefsJson)) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kaydedilemedi" });
  }
});

export default router;
