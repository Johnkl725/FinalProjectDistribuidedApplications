// ===============================================
// VEHICLE INSURANCE ROUTES
// ===============================================

import { Router } from "express";
import { VehicleInsuranceController } from "../controllers/vehicle-insurance.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();
const controller = new VehicleInsuranceController();

// Public routes
router.get("/health", controller.healthCheck);

// Protected routes (require authentication)
router.post("/quote", authMiddleware, controller.getQuote);
router.post("/policies", authMiddleware, controller.createPolicy);
router.get("/policies/my", authMiddleware, controller.getUserPolicies);
router.get("/policies/id/:id", authMiddleware, controller.getPolicyById);
// Generate PDF before generic policyNumber route to avoid conflicts
router.get("/policies/:id/pdf", authMiddleware, controller.generatePolicyPDF);
router.get(
  "/policies/:policyNumber",
  authMiddleware,
  controller.getPolicyByNumber
);
router.put("/policies/:id/cancel", authMiddleware, controller.cancelPolicy);

// Admin routes
router.get(
  "/policies",
  authMiddleware,
  adminMiddleware,
  controller.getAllPolicies
);
router.put(
  "/policies/:id/activate",
  authMiddleware,
  adminMiddleware,
  controller.activatePolicy
);

export default router;
