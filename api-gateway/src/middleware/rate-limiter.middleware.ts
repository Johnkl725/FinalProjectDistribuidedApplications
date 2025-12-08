// ===============================================
// API GATEWAY - RATE LIMITING MIDDLEWARE
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from 'shared';

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Read environment config (treat any non-'true' string as disabled)
const ENV_RATE_LIMIT_ENABLED = String(process.env.RATE_LIMIT_ENABLED ?? 'true').toLowerCase() === 'true';
const ENV_RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || undefined;
const ENV_RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || undefined;

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 */
export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  // If disabled globally via env, return a no-op middleware
  if (!ENV_RATE_LIMIT_ENABLED) {
    return (req: Request, res: Response, next: NextFunction): void => next();
  }

  // Resolve effective config (env overrides defaults unless explicit args provided)
  const effectiveWindowMs = ENV_RATE_LIMIT_WINDOW_MS || windowMs;
  const effectiveMaxRequests = ENV_RATE_LIMIT_MAX_REQUESTS || maxRequests;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    // Get or create rate limit data for this IP
    let limitData = rateLimitStore.get(ip);

    if (!limitData || now > limitData.resetTime) {
      // Create new window
      limitData = {
        count: 1,
        resetTime: now + effectiveWindowMs,
      };
      rateLimitStore.set(ip, limitData);
      next();
      return;
    }

    // Increment request count
    limitData.count++;

    if (limitData.count > effectiveMaxRequests) {
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
// Cleanup old entries periodically (no-op when rate limiter disabled)
setInterval(() => {
  if (!ENV_RATE_LIMIT_ENABLED) return;
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Clean up every minute


