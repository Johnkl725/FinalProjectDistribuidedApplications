import { Router } from "express";
import { RenewalController } from "../controllers/renewal.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { staffMiddleware } from "../middleware/staff.middleware";

const router = Router();
const controller = new RenewalController();

router.get("/health", controller.health);

router.get("/expiring", authMiddleware, staffMiddleware, controller.expiring);
router.post("/run", authMiddleware, staffMiddleware, controller.run);
router.post("/policies/:id/notify", authMiddleware, staffMiddleware, controller.notify);

export default router;

