import { Router, type IRouter } from "express";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import paymentsRouter from "./payments";
import aiRouter from "./ai";
import authRouter from "./auth";
import catalogRouter from "./catalog";
import applicationsRouter from "./applications";
import communityRouter from "./community";
import chatRouter from "./chat";
import notificationsRouter from "./notifications";
import matchRouter from "./match";

const router: IRouter = Router();

router.use(healthRouter);
router.use(invitationsRouter);
router.use("/payments", paymentsRouter);
router.use("/ai", aiRouter);
router.use("/auth", authRouter);
router.use(catalogRouter);
router.use(applicationsRouter);
router.use(communityRouter);
router.use(chatRouter);
router.use(notificationsRouter);
router.use(matchRouter);

export default router;
