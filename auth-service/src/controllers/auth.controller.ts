// ===============================================
// AUTH CONTROLLER - REQUEST HANDLER LAYER
// ===============================================

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse, HTTP_STATUS } from 'shared';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
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

      console.log('✅ Validation passed, calling service...');
      const result = await this.authService.register({
        email,
        password,
        first_name: finalFirstName,
        last_name: finalLastName,
        role,
      });

      console.log('✅ User registered successfully');
      res.status(HTTP_STATUS.CREATED).json(
        successResponse(result, 'User registered successfully')
      );
    } catch (error: any) {
      console.log('❌ Registration error:', error.message);
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
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
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(error.message)
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
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(error.message)
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
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
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
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
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
   * Health check
   * GET /auth/health
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(
      successResponse({ status: 'healthy', service: 'auth-service' })
    );
  };
}


