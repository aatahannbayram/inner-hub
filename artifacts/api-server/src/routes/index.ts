import { Router, type IRouter } from "express";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import paymentsRouter from "./payments";
import aiRouter from "./ai";
import authRouter from "./auth";
import catalogRouter from "./catalog";
import applicationsRouter from "./applications";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(invitationsRouter);
router.use("/payments", paymentsRouter);
router.use("/ai", aiRouter);
router.use("/auth", authRouter);
router.use(catalogRouter);
router.use(applicationsRouter);
router.use(communityRouter);

export default router;
