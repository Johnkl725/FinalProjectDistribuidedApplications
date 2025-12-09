// ===============================================
// RENT INSURANCE REPOSITORY
// ===============================================

import { BaseRepository } from "shared";
import { RentInsurancePolicy } from "../models/rent-insurance.model";

export class RentInsuranceRepository extends BaseRepository<RentInsurancePolicy> {
  constructor() {
    super("policies");
  }

  async createPolicy(policyData: any): Promise<RentInsurancePolicy> {
    const query = `
      INSERT INTO policies (
        policy_number, user_id, insurance_type_id, status,
        start_date, end_date, premium_amount, coverage_amount, rent_details
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      policyData.policy_number,
      policyData.user_id,
      policyData.insurance_type_id,
      policyData.status || "pending",
      policyData.start_date,
      policyData.end_date,
      policyData.premium_amount,
      policyData.coverage_amount,
      JSON.stringify(policyData.rent_details),
    ];

    const result = await this.executeQuery<RentInsurancePolicy>(query, values);
    return result.rows[0];
  }

  async getPoliciesByUserId(userId: number): Promise<RentInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.user_id = $1 AND it.name = 'rent' AND p.is_current = true
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query, [
      userId,
    ]);
    return result.rows;
  }

  async findById(policyId: number): Promise<RentInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.id = $1 AND it.name = 'rent' AND p.is_current = true
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query, [
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async getPolicyByNumber(
    policyNumber: string
  ): Promise<RentInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.policy_number = $1 AND it.name = 'rent' AND p.is_current = true
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query, [
      policyNumber,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Get policy with user information (for PDF generation)
   */
  async getPolicyWithUserInfo(policyId: number): Promise<any | null> {
    const query = `
      SELECT 
        p.*,
        it.name as insurance_type_name,
        u.first_name,
        u.last_name,
        u.email
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND it.name = 'rent'
    `;
    const result = await this.executeQuery(query, [policyId]);
    return result.rows[0] || null;
  }

  async getAllRentPolicies(): Promise<RentInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name, 
             u.email, u.first_name, u.last_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE it.name = 'rent' AND p.is_current = true
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query);
    return result.rows;
  }

  async updatePolicyStatus(
    policyId: number,
    status: string
  ): Promise<RentInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query, [
      status,
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async cancelPolicy(policyId: number): Promise<RentInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = 'cancelled', 
          end_date = CURRENT_DATE, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery<RentInsurancePolicy>(query, [
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async getRentInsuranceTypeId(): Promise<number> {
    const query = `SELECT id FROM insurance_types WHERE name = 'rent'`;
    const result = await this.executeQuery<{ id: number }>(query);
    return result.rows[0].id;
  }

  async generatePolicyNumber(): Promise<string> {
    const prefix = "RENT";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }
}
