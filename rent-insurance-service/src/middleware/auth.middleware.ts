// ===============================================
// AUTH MIDDLEWARE (for Rent Insurance Service)
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from 'shared';
import { errorResponse, HTTP_STATUS } from 'shared';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('No token provided')
      );
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid or expired token')
    );
  }
};


