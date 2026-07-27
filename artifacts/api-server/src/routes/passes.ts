import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { getPassBalance } from "../lib/passes";

const router = Router();

const MONTHLY_GRANT = 3;
const PASS_PRICE_TRY = 299;

/** GET /api/passes/me */
router.get("/passes/me", requireAuth, async (req, res) => {
  try {
    const balance = await getPassBalance(req.user!.id);
    res.json({
      balance,
      monthlyGrant: MONTHLY_GRANT,
      passPriceTry: PASS_PRICE_TRY,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Pass bakiyesi alınamadı" });
  }
});

export default router;
