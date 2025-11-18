// ===============================================
// ADMIN MIDDLEWARE - Role Validation
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from 'shared';

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
      res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Access denied. Admin privileges required.')
      );
      return;
    }

    next();
  } catch (error: any) {
    res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Access denied')
    );
  }
};


