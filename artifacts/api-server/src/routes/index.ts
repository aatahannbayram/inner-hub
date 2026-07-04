import { Router, type IRouter } from "express";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import paymentsRouter from "./payments";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(invitationsRouter);
router.use("/payments", paymentsRouter);
router.use("/ai", aiRouter);

export default router;
