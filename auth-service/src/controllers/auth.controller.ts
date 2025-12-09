// ===============================================
// AUTH CONTROLLER - REQUEST HANDLER LAYER
// ===============================================

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { DepartmentRepository } from '../repositories/department.repository';
import { UserRepository } from '../repositories/user.repository';
import { successResponse, errorResponse, HTTP_STATUS } from 'shared';

export class AuthController {
  private authService: AuthService;
  private departmentRepo: DepartmentRepository;
  private userRepo: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.departmentRepo = new DepartmentRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Register new user
   * POST /auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📝 Register request received:', req.body);
      
      // Accept both camelCase and snake_case
      const { 
        email, 
        password, 
        first_name, 
        last_name, 
        firstName, 
        lastName, 
        role 
      } = req.body;

      const finalFirstName = first_name || firstName;
      const finalLastName = last_name || lastName;

      // Validate required fields
      if (!email || !password || !finalFirstName || !finalLastName) {
        console.log('❌ Validation failed - missing fields');
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Missing required fields: email, password, firstName/first_name, lastName/last_name')
        );
        return;
      }

      const result = await this.authService.register({
        email,
        password,
        first_name: finalFirstName,
        last_name: finalLastName,
        role,
      });

      res.status(HTTP_STATUS.CREATED).json(
        successResponse(result, 'User registered successfully')
      );
    } catch (error: any) {
      // Security: Generic error message for public endpoint
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Unable to complete registration')
      );
    }
  };

  /**
   * Login user
   * POST /auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Missing required fields: email, password')
        );
        return;
      }

      const result = await this.authService.login({ email, password });

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Login successful')
      );
    } catch (error: any) {
      // Security: Always return generic message for login failures
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Invalid credentials')
      );
    }
  };

  /**
   * Get current user profile
   * GET /auth/me
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await this.authService.getUserById(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(user)
      );
    } catch (error: any) {
      // Authenticated endpoint: specific message is OK
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Unable to load profile')
      );
    }
  };

  /**
   * Get all users (admin only)
   * GET /auth/users
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.authService.getAllUsers();

      res.status(HTTP_STATUS.OK).json(
        successResponse(users)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Update user profile
   * PUT /auth/profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const updates = req.body;

      const user = await this.authService.updateProfile(userId, updates);

      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'Profile updated successfully')
      );
    } catch (error: any) {
      // Authenticated endpoint: can provide specific validation errors
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message || 'Unable to update profile')
      );
    }
  };

  /**
   * Change password
   * POST /auth/change-password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Missing required fields: current_password, new_password')
        );
        return;
      }

      await this.authService.changePassword(userId, current_password, new_password);

      res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Password changed successfully')
      );
    } catch (error: any) {
      // Authenticated endpoint: specific error helps user
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message || 'Unable to change password')
      );
    }
  };

  /**
   * Get user statistics (admin only)
   * GET /auth/stats
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.authService.getUserStats();

      res.status(HTTP_STATUS.OK).json(
        successResponse(stats)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Create employee (admin only)
   * POST /auth/employees
   */
  createEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, first_name, last_name, firstName, lastName, department_id, phone } = req.body;

      const finalFirstName = first_name || firstName;
      const finalLastName = last_name || lastName;

      if (!email || !password || !finalFirstName || !finalLastName) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Missing required fields: email, password, firstName, lastName')
        );
        return;
      }

      // Create employee with additional fields (phone, department_id)
      const result = await this.authService.createEmployee({
        email,
        password,
        first_name: finalFirstName,
        last_name: finalLastName,
        department_id: department_id || null,
        phone: phone || null,
      });

      res.status(HTTP_STATUS.CREATED).json(
        successResponse(result, 'Employee created successfully')
      );
    } catch (error: any) {
      // Security: Generic error message
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Unable to create employee')
      );
    }
  };

  /**
   * Update employee (admin only)
   * PUT /auth/employees/:id
   */
  updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { first_name, last_name, email, department_id, phone } = req.body;

      const updates: any = {};
      if (first_name) updates.first_name = first_name;
      if (last_name) updates.last_name = last_name;
      if (email) updates.email = email;
      if (department_id !== undefined) updates.department_id = department_id;
      if (phone !== undefined) updates.phone = phone;

      const user = await this.userRepo.updateUser(userId, updates);

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Employee not found')
        );
        return;
      }

      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'Employee updated successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get all employees with department info (admin only)
   * GET /auth/employees
   */
  getEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await this.userRepo.getEmployeesWithDepartment();

      res.status(HTTP_STATUS.OK).json(
        successResponse(employees)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get all departments (admin/employee)
   * GET /auth/departments
   */
  getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      const departments = await this.departmentRepo.getAllActiveDepartments();

      res.status(HTTP_STATUS.OK).json(
        successResponse(departments)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get department statistics (admin only)
   * GET /auth/departments/stats
   */
  getDepartmentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.departmentRepo.getEmployeeCountByDepartment();

      res.status(HTTP_STATUS.OK).json(
        successResponse(stats)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Assign employee to department (admin only)
   * PUT /auth/employees/:id/department
   */
  assignEmployeeToDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { department_id } = req.body;

      const user = await this.userRepo.updateUser(userId, { department_id });

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse('Employee not found')
        );
        return;
      }

      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'Employee assigned to department successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Update user role (admin only)
   * PUT /auth/users/:id/role
   */
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role || !['customer', 'employee', 'admin'].includes(role)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Invalid role. Must be customer, employee, or admin')
        );
        return;
      }

      const user = await this.authService.updateUserRole(userId, role);

      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'User role updated successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Delete user (admin only)
   * DELETE /auth/users/:id
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = (req as any).user.userId;

      if (userId === currentUserId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Cannot delete your own account')
        );
        return;
      }

      await this.authService.deleteUser(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'User deleted successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Health check
   * GET /auth/health
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(
      successResponse({ status: 'healthy', service: 'auth-service' })
    );
  };
}


