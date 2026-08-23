import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  getPassBalance,
  monthlyPassGrantAll,
  MONTHLY_PASS_GRANT,
} from "../lib/passes";
import { ensureUserMembershipColumns } from "../lib/ensureSchema";

const router = Router();

const PASS_PRICE_TRY = 149;

/** GET /api/passes/me */
router.get("/passes/me", requireAuth, async (req, res) => {
  try {
    await ensureUserMembershipColumns();
    const balance = await getPassBalance(req.user!.id);
    const [user] = await db
      .select({
        membershipPlan: usersTable.membershipPlan,
        membershipStatus: usersTable.membershipStatus,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id))
      .limit(1);

    res.json({
      balance,
      monthlyGrant: MONTHLY_PASS_GRANT,
      passPriceTry: PASS_PRICE_TRY,
      membershipPlan: user?.membershipPlan ?? null,
      membershipStatus: user?.membershipStatus ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Pass bakiyesi alınamadı" });
  }
});

/** POST /api/admin/passes/monthly-grant — aktif üyelere aylık pass (idempotent). */
router.post("/admin/passes/monthly-grant", requireAuth, requireAdmin, async (_req, res) => {
  try {
    await ensureUserMembershipColumns();
    const result = await monthlyPassGrantAll();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Aylık pass grant başarısız" });
  }
});

export default router;
