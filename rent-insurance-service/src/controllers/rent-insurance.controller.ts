// ===============================================
// RENT INSURANCE CONTROLLER
// ===============================================

import { Request, Response } from "express";
import { RentInsuranceService } from "../services/rent-insurance.service";
import {
  successResponse,
  errorResponse,
  HTTP_STATUS,
  generatePolicyPDF,
  PolicyPDFData,
} from "shared";

export class RentInsuranceController {
  private service: RentInsuranceService;

  constructor() {
    this.service = new RentInsuranceService();
  }

  createPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policyData = {
        user_id: userId,
        ...req.body,
      };

      const policy = await this.service.createPolicy(policyData);

      res
        .status(HTTP_STATUS.CREATED)
        .json(
          successResponse(policy, "Rent insurance policy created successfully")
        );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(error.message));
    }
  };

  getQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const quote = await this.service.getQuote(req.body);

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(quote, "Quote calculated successfully"));
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(error.message));
    }
  };

  getUserPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policies = await this.service.getUserPolicies(userId);

      res.status(HTTP_STATUS.OK).json(successResponse(policies));
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message));
    }
  };

  getPolicyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.getPolicyById(
        policyId,
        userRole === "admin" ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(successResponse(policy));
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(error.message));
    }
  };

  getPolicyByNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { policyNumber } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.getPolicyByNumber(
        policyNumber,
        userRole === "admin" ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(successResponse(policy));
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(error.message));
    }
  };

  getAllPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const policies = await this.service.getAllPolicies();

      res.status(HTTP_STATUS.OK).json(successResponse(policies));
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(errorResponse(error.message));
    }
  };

  activatePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const policy = await this.service.activatePolicy(policyId);

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(policy, "Policy activated successfully"));
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(error.message));
    }
  };

  cancelPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const policy = await this.service.cancelPolicy(
        policyId,
        userRole === "admin" ? undefined : userId
      );

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(policy, "Policy cancelled successfully"));
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(error.message));
    }
  };

  /**
   * Generate PDF for policy
   * GET /rent-insurance/policies/:id/pdf
   */
  generatePolicyPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      // Get policy with user information
      const policyData = await this.service.getPolicyWithUserInfo(
        policyId,
        userRole === "admin" ? undefined : userId
      );

      // Parse JSONB if needed
      const rentDetails =
        typeof policyData.rent_details === "string"
          ? JSON.parse(policyData.rent_details)
          : policyData.rent_details;

      // Prepare data for PDF
      const pdfData: PolicyPDFData = {
        policyNumber: policyData.policy_number,
        customerName: `${policyData.first_name} ${policyData.last_name}`,
        customerEmail: policyData.email,
        insuranceType: "rent",
        status: policyData.status,
        startDate: policyData.start_date,
        endDate: policyData.end_date,
        premiumAmount: parseFloat(policyData.premium_amount || 0),
        coverageAmount: parseFloat(policyData.coverage_amount || 0),
        details: {
          rent_details: rentDetails,
        },
        createdAt: policyData.created_at,
      };

      // Generate PDF
      const pdfBuffer = await generatePolicyPDF(pdfData);

      // inline=1 → previsualización; default: descarga
      const asInline = req.query.inline === "1";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `${asInline ? "inline" : "attachment"}; filename="poliza-${
          policyData.policy_number
        }.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(error.message));
    }
  };

  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res
      .status(HTTP_STATUS.OK)
      .json(
        successResponse({
          status: "healthy",
          service: "rent-insurance-service",
        })
      );
  };
}
