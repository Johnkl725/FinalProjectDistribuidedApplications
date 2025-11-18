// ===============================================
// LIFE INSURANCE ROUTES
// ===============================================

import { Router } from 'express';
import { LifeInsuranceController } from '../controllers/life-insurance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const controller = new LifeInsuranceController();

// Public routes
router.get('/health', controller.healthCheck);

// Protected routes (require authentication)
router.post('/quote', authMiddleware, controller.getQuote);
router.post('/policies', authMiddleware, controller.createPolicy);
router.get('/policies/my', authMiddleware, controller.getUserPolicies);
router.get('/policies/id/:id', authMiddleware, controller.getPolicyById);
router.get('/policies/:policyNumber', authMiddleware, controller.getPolicyByNumber);
router.put('/policies/:id/cancel', authMiddleware, controller.cancelPolicy);

// Admin routes
router.get('/policies', authMiddleware, adminMiddleware, controller.getAllPolicies);
router.put('/policies/:id/activate', authMiddleware, adminMiddleware, controller.activatePolicy);

export default router;


