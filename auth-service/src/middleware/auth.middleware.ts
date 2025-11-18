// ===============================================
// AUTH MIDDLEWARE - JWT Validation
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from 'shared';
import { errorResponse, HTTP_STATUS } from 'shared';

/**
 * Middleware to validate JWT tokens
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('No token provided')
      );
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid or expired token')
    );
  }
};


