// ===============================================
// VEHICLE INSURANCE ROUTES
// ===============================================

import { Router } from 'express';
import { VehicleInsuranceController } from '../controllers/vehicle-insurance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { employeeMiddleware } from '../middleware/employee.middleware';

const router = Router();
const controller = new VehicleInsuranceController();

// Public routes
router.get('/health', controller.healthCheck);

// Protected routes (require authentication)
router.post('/quote', authMiddleware, controller.getQuote);
router.post('/policies', authMiddleware, controller.createPolicy);

// ========================================
// NEW ENDPOINTS - DATABASE VIEWS (must be before dynamic routes)
// ========================================

// Get current policies with expiration indicators (authenticated users)
router.get('/policies/current', authMiddleware, controller.getCurrentPolicies);

// Get user policy statistics (authenticated users)
router.get('/users/stats', authMiddleware, controller.getUserStats);

// Get active policies summary (employees and admins only)
router.get('/admin/policies/summary', authMiddleware, employeeMiddleware, controller.getActivePoliciesSummary);

// Other policy routes
router.get('/policies/my', authMiddleware, controller.getUserPolicies);
router.get('/policies/id/:id', authMiddleware, controller.getPolicyById);
router.get('/policies/:policyNumber', authMiddleware, controller.getPolicyByNumber);
router.put('/policies/:id/cancel', authMiddleware, controller.cancelPolicy);

// Admin routes
router.get('/policies', authMiddleware, adminMiddleware, controller.getAllPolicies);
router.put('/policies/:id/activate', authMiddleware, adminMiddleware, controller.activatePolicy);

export default router;


