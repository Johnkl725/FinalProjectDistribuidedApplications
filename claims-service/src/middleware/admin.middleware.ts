// ===============================================
// ADMIN MIDDLEWARE (for Claims Service)
// ===============================================

import { Request, Response, NextFunction } from 'express';
import { errorResponse, HTTP_STATUS } from 'shared';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Access denied. Admin or employee privileges required.')
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

