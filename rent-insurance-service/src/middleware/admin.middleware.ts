// ===============================================
// ADMIN MIDDLEWARE (for Rent Insurance Service)
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from 'shared';

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


