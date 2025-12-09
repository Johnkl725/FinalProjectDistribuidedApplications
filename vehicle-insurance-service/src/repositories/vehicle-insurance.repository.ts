// ===============================================
// VEHICLE INSURANCE REPOSITORY
// ===============================================

import { BaseRepository } from "shared";
import { VehicleInsurancePolicy } from "../models/vehicle-insurance.model";

export class VehicleInsuranceRepository extends BaseRepository<VehicleInsurancePolicy> {
  constructor() {
    super("policies");
  }

  async createPolicy(policyData: any): Promise<VehicleInsurancePolicy> {
    const query = `
      INSERT INTO policies (
        policy_number, user_id, insurance_type_id, status,
        start_date, end_date, premium_amount, coverage_amount, vehicle_details
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
      JSON.stringify(policyData.vehicle_details),
    ];

    const result = await this.executeQuery<VehicleInsurancePolicy>(
      query,
      values
    );
    return result.rows[0];
  }

  async getPoliciesByUserId(userId: number): Promise<VehicleInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.user_id = $1 AND it.name = 'vehicle' AND p.is_current = true
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query, [
      userId,
    ]);
    return result.rows;
  }

  async findById(policyId: number): Promise<VehicleInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.id = $1 AND it.name = 'vehicle' AND p.is_current = true
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query, [
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async getPolicyByNumber(
    policyNumber: string
  ): Promise<VehicleInsurancePolicy | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      WHERE p.policy_number = $1 AND it.name = 'vehicle' AND p.is_current = true
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query, [
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
      WHERE p.id = $1 AND it.name = 'vehicle'
    `;
    const result = await this.executeQuery(query, [policyId]);
    return result.rows[0] || null;
  }

  async getAllVehiclePolicies(): Promise<VehicleInsurancePolicy[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name, 
             u.email, u.first_name, u.last_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE it.name = 'vehicle' AND p.is_current = true
      ORDER BY p.created_at DESC
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query);
    return result.rows;
  }

  async updatePolicyStatus(
    policyId: number,
    status: string
  ): Promise<VehicleInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query, [
      status,
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async cancelPolicy(policyId: number): Promise<VehicleInsurancePolicy | null> {
    const query = `
      UPDATE policies
      SET status = 'cancelled', 
          end_date = CURRENT_DATE, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery<VehicleInsurancePolicy>(query, [
      policyId,
    ]);
    return result.rows[0] || null;
  }

  async getVehicleInsuranceTypeId(): Promise<number> {
    const query = `SELECT id FROM insurance_types WHERE name = 'vehicle'`;
    const result = await this.executeQuery<{ id: number }>(query);
    return result.rows[0].id;
  }

  async generatePolicyNumber(): Promise<string> {
    const prefix = "VEH";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }
}
