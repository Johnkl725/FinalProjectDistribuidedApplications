// ===============================================
// LIFE INSURANCE REPOSITORY
// ===============================================

import { BaseRepository } from 'shared';
import { LifeInsurancePolicy } from '../models/life-insurance.model';

export class LifeInsuranceRepository extends BaseRepository<LifeInsurancePolicy> {
  constructor() {
    super('policies');
  }

  /**
   * Create a new life insurance policy
   */
  async createPolicy(policyData: any): Promise<LifeInsurancePolicy> {
    const query = `
      INSERT INTO policies (
        policy_number, user_id, insurance_type_id, status,
        start_date, end_date, premium_amount, coverage_amount, life_details
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      policyData.policy_number,
      policyData.user_id,
      policyData.insurance_type_id,
      policyData.status || 'pending',
      policyData.start_date,
      policyData.end_date,
      policyData.premium_amount,
      policyData.coverage_amount,
      JSON.stringify(policyData.life_details),
    ];

    const result = await this.executeQuery<LifeInsurancePolicy>(query, values);
    return result.rows[0];
  }

  /**
   * Get all policies for a specific user
   */
  async getPoliciesByUserId(userId: number): Promise<LifeInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.user_id = $1 AND it.name = 'life'
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query, [userId]);
    return result.rows;
  }

  /**
   * Get policy by ID
   */
  async findById(policyId: number): Promise<LifeInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.id = $1 AND it.name = 'life'
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query, [policyId]);
    return result.rows[0] || null;
  }

  /**
   * Get policy by policy number
   */
  async getPolicyByNumber(policyNumber: string): Promise<LifeInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.policy_number = $1 AND it.name = 'life'
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query, [policyNumber]);
    return result.rows[0] || null;
  }

  /**
   * Get all life insurance policies (admin)
   */
  async getAllLifePolicies(): Promise<LifeInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name, 
             u.email, u.first_name, u.last_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE it.name = 'life'
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query);
    return result.rows;
  }

  /**
   * Update policy status
   */
  async updatePolicyStatus(policyId: number, status: string): Promise<LifeInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query, [status, policyId]);
    return result.rows[0] || null;
  }

  /**
   * Cancel policy (set status to 'cancelled' and set end_date to current date)
   */
  async cancelPolicy(policyId: number): Promise<LifeInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = 'cancelled', 
          end_date = CURRENT_DATE, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery<LifeInsurancePolicy>(query, [policyId]);
    return result.rows[0] || null;
  }

  /**
   * Get insurance type ID for life insurance
   */
  async getLifeInsuranceTypeId(): Promise<number> {
    const query = `SELECT id FROM insurance_types WHERE name = 'life'`;
    const result = await this.executeQuery<{ id: number }>(query);
    return result.rows[0].id;
  }

  /**
   * Generate unique policy number
   */
  async generatePolicyNumber(): Promise<string> {
    const prefix = 'LIFE';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }
}


