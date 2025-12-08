// ===============================================
// CLAIM SERVICE - BUSINESS LOGIC
// ===============================================

import { ClaimRepository } from '../repositories/claim.repository';
import {
  CreateClaimDTO,
  UpdateClaimStatusDTO,
  PolicyClaim,
  ClaimWithPolicy,
} from '../models/claim.model';

export class ClaimService {
  private repository: ClaimRepository;

  constructor() {
    this.repository = new ClaimRepository();
  }

  /**
   * Create a new claim
   */
  async createClaim(data: CreateClaimDTO, userId: number): Promise<PolicyClaim> {
    // Validate policy exists and is active (issued or active status)
    const isValidPolicy = await this.repository.validatePolicyForClaim(data.policy_id);
    if (!isValidPolicy) {
      throw new Error('Policy not found or not valid. Only issued or active policies can have claims.');
    }

    // Generate claim number
    const claimNumber = await this.repository.generateClaimNumber();

    // Validate claim amount
    if (data.claim_amount <= 0) {
      throw new Error('Claim amount must be greater than 0');
    }

    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    // Create claim
    const claim = await this.repository.createClaim({
      policy_id: data.policy_id,
      claim_number: claimNumber,
      claim_date: data.claim_date,
      claim_amount: data.claim_amount,
      description: data.description,
      status: 'submitted',
    });

    return claim;
  }

  /**
   * Get user's claims
   */
  async getUserClaims(userId: number): Promise<ClaimWithPolicy[]> {
    return await this.repository.getClaimsByUserId(userId);
  }

  /**
   * Get claims for a specific policy
   */
  async getPolicyClaims(policyId: number, userId?: number): Promise<ClaimWithPolicy[]> {
    return await this.repository.getClaimsByPolicyId(policyId, userId);
  }

  /**
   * Get claim by ID
   */
  async getClaimById(claimId: number, userId?: number): Promise<ClaimWithPolicy> {
    const claim = await this.repository.getClaimById(claimId, userId);
    if (!claim) {
      throw new Error('Claim not found');
    }
    return claim;
  }

  /**
   * Get claim by claim number
   */
  async getClaimByNumber(claimNumber: string, userId?: number): Promise<ClaimWithPolicy> {
    const claim = await this.repository.getClaimByNumber(claimNumber, userId);
    if (!claim) {
      throw new Error('Claim not found');
    }
    return claim;
  }

  /**
   * Get all claims (admin only)
   */
  async getAllClaims(): Promise<ClaimWithPolicy[]> {
    return await this.repository.getAllClaims();
  }

  /**
   * Update claim status (admin/employee only)
   */
  async updateClaimStatus(
    claimId: number,
    statusUpdate: UpdateClaimStatusDTO
  ): Promise<PolicyClaim> {
    const validStatuses = ['under_review', 'approved', 'rejected', 'paid'];
    if (!validStatuses.includes(statusUpdate.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const claim = await this.repository.updateClaimStatus(claimId, statusUpdate.status);
    if (!claim) {
      throw new Error('Claim not found');
    }

    return claim;
  }
}

