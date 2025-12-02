// ===============================================
// AUTH ROUTES
// ===============================================

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const authController = new AuthController();

// Logging middleware
router.use((req, res, next) => {
  console.log(`📥 Auth Route: ${req.method} ${req.path}`);
  console.log(`📦 Body:`, req.body);
  next();
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/health', authController.healthCheck);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

// Admin routes (require authentication + admin role)
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.get('/stats', authMiddleware, adminMiddleware, authController.getUserStats);
router.put('/users/:id/role', authMiddleware, adminMiddleware, authController.updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

// Employee management routes (admin only)
router.get('/employees', authMiddleware, adminMiddleware, authController.getEmployees);
router.post('/employees', authMiddleware, adminMiddleware, authController.createEmployee);
router.put('/employees/:id', authMiddleware, adminMiddleware, authController.updateEmployee);
router.put('/employees/:id/department', authMiddleware, adminMiddleware, authController.assignEmployeeToDepartment);

// Department routes (admin/employee access)
router.get('/departments', authMiddleware, authController.getDepartments);
router.get('/departments/stats', authMiddleware, adminMiddleware, authController.getDepartmentStats);

export default router;


