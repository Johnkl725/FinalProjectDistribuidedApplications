// ===============================================
// API GATEWAY - RATE LIMITING MIDDLEWARE
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from 'shared';

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 */
export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create rate limit data for this IP
    let limitData = rateLimitStore.get(ip);

    if (!limitData || now > limitData.resetTime) {
      // Create new window
      limitData = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(ip, limitData);
      next();
      return;
    }

    // Increment request count
    limitData.count++;

    if (limitData.count > maxRequests) {
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
        errorResponse('Too many requests. Please try again later.')
      );
      return;
    }

    next();
  };
};

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Clean up every minute


