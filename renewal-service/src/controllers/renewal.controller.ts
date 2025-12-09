import { Request, Response } from "express";
import { RenewalService } from "../services/renewal.service";
import { successResponse, errorResponse, HTTP_STATUS } from "shared";

const DEFAULT_WINDOW_DAYS = 30;

export class RenewalController {
  private service: RenewalService;

  constructor() {
    this.service = new RenewalService();
  }

  health = async (_req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(successResponse({ status: "ok" }));
  };

  expiring = async (req: Request, res: Response): Promise<void> => {
    try {
      const windowDays = parseInt((req.query.days as string) || "", 10);
      const days = Number.isFinite(windowDays) ? windowDays : DEFAULT_WINDOW_DAYS;
      const expiring = await this.service.listExpiring(days);
      res.status(HTTP_STATUS.OK).json(
        successResponse(
          expiring.map((item) => ({
            policy: item.policy,
            expiryDate: item.expiryDate,
            daysToExpiry: item.daysToExpiry,
            remindersSent: item.remindersSent,
            pendingReminders: item.pendingReminders,
          }))
        )
      );
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error?.message || "Error fetching expiring policies"));
    }
  };

  run = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.runSweep();
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error?.message || "Error running renewals"));
    }
  };

  notify = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id, 10);
      const reminderDay = req.query.day ? parseInt(req.query.day as string, 10) : undefined;
      const result = await this.service.notifyPolicy(policyId, reminderDay);
      res.status(HTTP_STATUS.OK).json(successResponse(result, "Reminder sent"));
    } catch (error: any) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse(error?.message || "Error sending reminder"));
    }
  };
}

