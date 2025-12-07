// ===============================================
// CLAIM ROUTES
// ===============================================

import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const controller = new ClaimController();

// Public routes
router.get('/health', controller.healthCheck);

// Protected routes (require authentication)
// IMPORTANT: More specific routes must come before parameterized routes
router.post('/', authMiddleware, controller.createClaim);
router.get('/my', authMiddleware, controller.getUserClaims);
router.get('/policy/:policyId', authMiddleware, controller.getPolicyClaims);
router.get('/id/:id', authMiddleware, controller.getClaimById);
router.put('/:id/status', authMiddleware, adminMiddleware, controller.updateClaimStatus);
router.get('/:claimNumber', authMiddleware, controller.getClaimByNumber);

// Admin/Employee routes (must be after all specific routes)
router.get('/', authMiddleware, adminMiddleware, controller.getAllClaims);

export default router;

