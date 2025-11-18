// ===============================================
// VEHICLE INSURANCE CONTROLLER
// ===============================================

import { Request, Response } from 'express';
import { VehicleInsuranceService } from '../services/vehicle-insurance.service';
import { successResponse, errorResponse, HTTP_STATUS } from 'shared';

export class VehicleInsuranceController {
  private service: VehicleInsuranceService;

  constructor() {
    this.service = new VehicleInsuranceService();
  }

  createPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policyData = {
        user_id: userId,
        ...req.body,
      };

      const policy = await this.service.createPolicy(policyData);

      res.status(HTTP_STATUS.CREATED).json(
        successResponse(policy, 'Vehicle insurance policy created successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  getQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const quote = await this.service.getQuote(req.body);

      res.status(HTTP_STATUS.OK).json(
        successResponse(quote, 'Quote calculated successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  getUserPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policies = await this.service.getUserPolicies(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(policies)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  getPolicyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.getPolicyById(
        policyId,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(policy)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(error.message)
      );
    }
  };

  getPolicyByNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { policyNumber } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.getPolicyByNumber(
        policyNumber,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(policy)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(error.message)
      );
    }
  };

  getAllPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const policies = await this.service.getAllPolicies();

      res.status(HTTP_STATUS.OK).json(
        successResponse(policies)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  activatePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const policy = await this.service.activatePolicy(policyId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(policy, 'Policy activated successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  cancelPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.cancelPolicy(
        policyId,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(policy, 'Policy cancelled successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(
      successResponse({ status: 'healthy', service: 'vehicle-insurance-service' })
    );
  };
}


