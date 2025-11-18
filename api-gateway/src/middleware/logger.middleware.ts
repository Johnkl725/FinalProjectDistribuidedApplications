// ===============================================
// API GATEWAY - REQUEST LOGGER MIDDLEWARE
// ===============================================

import { Request, Response, NextFunction } from 'express';

/**
 * Logs all incoming requests with details
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request
  console.log(`🔹 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`   IP: ${req.ip || 'unknown'}`);
  console.log(`   User-Agent: ${req.get('user-agent') || 'unknown'}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode < 400 ? '✅' : '❌';
    console.log(`${statusEmoji} [${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};


