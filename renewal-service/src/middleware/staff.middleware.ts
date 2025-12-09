import { Request, Response, NextFunction } from "express";
import { errorResponse, HTTP_STATUS } from "shared";

export const staffMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user || (user.role !== "admin" && user.role !== "employee")) {
    res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(errorResponse("Access denied. Staff only."));
    return;
  }
  next();
};

