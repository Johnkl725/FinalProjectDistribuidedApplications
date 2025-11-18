// ===============================================
// API GATEWAY - AUTH MIDDLEWARE
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from 'shared';
import { errorResponse, HTTP_STATUS } from 'shared';

/**
 * Global authentication middleware for API Gateway
 * Validates JWT tokens before routing to microservices
 */
export const gatewayAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip auth for public routes
  const publicRoutes = [
    '/auth/register',
    '/auth/login',
    '/auth/health',
    '/health',
    '/status',
    '/',
  ];

  // Check if the route is public
  if (publicRoutes.includes(req.path) || req.path.endsWith('/health')) {
    next();
    return;
  }

  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication required. Please provide a valid token.')
      );
      return;
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Attach user data to request for downstream services
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid or expired token. Please login again.')
    );
  }
};

/**
 * Admin-only middleware
 */
export const adminOnlyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Access denied. Administrator privileges required.')
    );
    return;
  }

  next();
};


