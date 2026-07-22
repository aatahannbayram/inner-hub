import { Router, type IRouter } from "express";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import paymentsRouter from "./payments";
import aiRouter from "./ai";
import authRouter from "./auth";
import catalogRouter from "./catalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(invitationsRouter);
router.use("/payments", paymentsRouter);
router.use("/ai", aiRouter);
router.use("/auth", authRouter);
router.use(catalogRouter);

export default router;
