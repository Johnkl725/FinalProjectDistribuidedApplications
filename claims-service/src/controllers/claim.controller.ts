// ===============================================
// CLAIM CONTROLLER - REQUEST HANDLER LAYER
// ===============================================

import { Request, Response } from 'express';
import { ClaimService } from '../services/claim.service';
import { successResponse, errorResponse, HTTP_STATUS } from 'shared';

export class ClaimController {
  private service: ClaimService;

  constructor() {
    this.service = new ClaimService();
  }

  /**
   * Create a new claim
   * POST /claims
   */
  createClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const claim = await this.service.createClaim(req.body, userId);

      res.status(HTTP_STATUS.CREATED).json(
        successResponse(claim, 'Claim created successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get user's claims
   * GET /claims/my
   */
  getUserClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const claims = await this.service.getUserClaims(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(claims)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get claims for a specific policy
   * GET /claims/policy/:policyId
   */
  getPolicyClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyId = parseInt(req.params.policyId);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      // Users can only see their own policy claims, admins can see all
      const claims = await this.service.getPolicyClaims(
        policyId,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(claims)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get claim by ID
   * GET /claims/id/:id
   */
  getClaimById = async (req: Request, res: Response): Promise<void> => {
    try {
      const claimId = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const claim = await this.service.getClaimById(
        claimId,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(claim)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get claim by claim number
   * GET /claims/:claimNumber
   */
  getClaimByNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimNumber } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const claim = await this.service.getClaimByNumber(
        claimNumber,
        userRole === 'admin' ? undefined : userId
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(claim)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get all claims (admin/employee only)
   * GET /claims
   */
  getAllClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const claims = await this.service.getAllClaims();

      res.status(HTTP_STATUS.OK).json(
        successResponse(claims)
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Update claim status (admin/employee only)
   * PUT /claims/:id/status
   */
  updateClaimStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const claimId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Status is required')
        );
        return;
      }

      const claim = await this.service.updateClaimStatus(claimId, { status });

      res.status(HTTP_STATUS.OK).json(
        successResponse(claim, 'Claim status updated successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Health check
   * GET /claims/health
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(
      successResponse({ status: 'healthy', service: 'claims-service' })
    );
  };
}

