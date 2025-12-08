// ===============================================
// CLAIM REPOSITORY - DATA ACCESS LAYER
// ===============================================

import { BaseRepository } from 'shared';
import { PolicyClaim, ClaimWithPolicy } from '../models/claim.model';

export class ClaimRepository extends BaseRepository<PolicyClaim> {
  constructor() {
    super('policy_claims');
  }

  /**
   * Create a new claim
   */
  async createClaim(claimData: any): Promise<PolicyClaim> {
    const query = `
      INSERT INTO policy_claims (
        policy_id, claim_number, claim_date, claim_amount, status, description
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      claimData.policy_id,
      claimData.claim_number,
      claimData.claim_date,
      claimData.claim_amount,
      claimData.status || 'submitted',
      claimData.description,
    ];

    const result = await this.executeQuery<PolicyClaim>(query, values);
    return result.rows[0];
  }

  /**
   * Get all claims for a specific user's policies
   */
  async getClaimsByUserId(userId: number): Promise<ClaimWithPolicy[]> {
    const query = `
      SELECT 
        c.*,
        p.policy_number,
        p.user_id,
        it.name as insurance_type_name,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM policy_claims c
      JOIN policies p ON c.policy_id = p.id
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY c.created_at DESC
    `;

    const result = await this.executeQuery<ClaimWithPolicy>(query, [userId]);
    return result.rows;
  }

  /**
   * Get all claims for a specific policy
   */
  async getClaimsByPolicyId(policyId: number, userId?: number): Promise<ClaimWithPolicy[]> {
    let query = `
      SELECT 
        c.*,
        p.policy_number,
        p.user_id,
        it.name as insurance_type_name,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM policy_claims c
      JOIN policies p ON c.policy_id = p.id
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE c.policy_id = $1
    `;

    const values: any[] = [policyId];
    
    if (userId) {
      query += ' AND p.user_id = $2';
      values.push(userId);
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await this.executeQuery<ClaimWithPolicy>(query, values);
    return result.rows;
  }

  /**
   * Get claim by ID with policy info
   */
  async getClaimById(claimId: number, userId?: number): Promise<ClaimWithPolicy | null> {
    let query = `
      SELECT 
        c.*,
        p.policy_number,
        p.user_id,
        it.name as insurance_type_name,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM policy_claims c
      JOIN policies p ON c.policy_id = p.id
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE c.id = $1
    `;

    const values: any[] = [claimId];
    
    if (userId) {
      query += ' AND p.user_id = $2';
      values.push(userId);
    }

    const result = await this.executeQuery<ClaimWithPolicy>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Get claim by claim number
   */
  async getClaimByNumber(claimNumber: string, userId?: number): Promise<ClaimWithPolicy | null> {
    let query = `
      SELECT 
        c.*,
        p.policy_number,
        p.user_id,
        it.name as insurance_type_name,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM policy_claims c
      JOIN policies p ON c.policy_id = p.id
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE c.claim_number = $1
    `;

    const values: any[] = [claimNumber];
    
    if (userId) {
      query += ' AND p.user_id = $2';
      values.push(userId);
    }

    const result = await this.executeQuery<ClaimWithPolicy>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Get all claims (admin only)
   */
  async getAllClaims(): Promise<ClaimWithPolicy[]> {
    const query = `
      SELECT 
        c.*,
        p.policy_number,
        p.user_id,
        it.name as insurance_type_name,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM policy_claims c
      JOIN policies p ON c.policy_id = p.id
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    const result = await this.executeQuery<ClaimWithPolicy>(query);
    return result.rows;
  }

  /**
   * Update claim status
   */
  async updateClaimStatus(claimId: number, status: string): Promise<PolicyClaim | null> {
    const query = `
      UPDATE policy_claims
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.executeQuery<PolicyClaim>(query, [status, claimId]);
    return result.rows[0] || null;
  }

  /**
   * Check if policy exists and is active (issued or active status)
   */
  async validatePolicyForClaim(policyId: number): Promise<boolean> {
    const query = `
      SELECT id FROM policies
      WHERE id = $1 AND status IN ('issued', 'active')
    `;

    const result = await this.executeQuery(query, [policyId]);
    return result.rows.length > 0;
  }

  /**
   * Generate unique claim number
   */
  async generateClaimNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `CLAIM-${timestamp}-${random}`;
  }
}

