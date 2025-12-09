// ===============================================
// RENT INSURANCE SERVICE - BUSINESS LOGIC
// ===============================================

import { RentInsuranceRepository } from "../repositories/rent-insurance.repository";
import {
  CreateRentInsuranceDTO,
  QuoteRentInsuranceDTO,
  RentInsurancePolicy,
} from "../models/rent-insurance.model";
import { InsuranceFactory, RentInsuranceData } from "shared";

export class RentInsuranceService {
  private repository: RentInsuranceRepository;

  constructor() {
    this.repository = new RentInsuranceRepository();
  }

  async createPolicy(
    data: CreateRentInsuranceDTO
  ): Promise<RentInsurancePolicy> {
    const insuranceData: RentInsuranceData = {
      userId: data.user_id,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      address: data.address,
      propertyValue: data.property_value,
      usageType: data.usage_type,
      squareMeters: data.square_meters,
    };

    const rentInsurance = InsuranceFactory.createInsurance(
      "rent",
      insuranceData
    );

    if (!rentInsurance.validate()) {
      throw new Error("Invalid rent insurance data");
    }

    const premiumAmount = rentInsurance.calculatePremium();
    const insuranceTypeId = await this.repository.getRentInsuranceTypeId();
    const policyNumber = await this.repository.generatePolicyNumber();

    const policyData = {
      policy_number: policyNumber,
      user_id: data.user_id,
      insurance_type_id: insuranceTypeId,
      status: "issued" as const, // New policy starts as 'issued', pending admin approval
      start_date: data.start_date,
      end_date: null, // NULL until policy is cancelled
      premium_amount: premiumAmount,
      coverage_amount: data.coverage_amount,
      rent_details: rentInsurance.getDetails(),
    };

    const policy = await this.repository.createPolicy(policyData);
    return policy;
  }

  async getQuote(
    data: QuoteRentInsuranceDTO
  ): Promise<{ premium: number; details: any }> {
    const insuranceData: RentInsuranceData = {
      userId: 0,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      address: "N/A",
      propertyValue: data.property_value,
      usageType: data.usage_type,
      squareMeters: 0,
    };

    const rentInsurance = InsuranceFactory.createInsurance(
      "rent",
      insuranceData
    );
    const premium = rentInsurance.calculatePremium();

    return {
      premium,
      details: {
        coverage_amount: data.coverage_amount,
        property_value: data.property_value,
        usage_type: data.usage_type,
        duration_months: this.calculateMonths(data.start_date, data.end_date),
      },
    };
  }

  async getUserPolicies(userId: number): Promise<RentInsurancePolicy[]> {
    return await this.repository.getPoliciesByUserId(userId);
  }

  async getPolicyById(
    policyId: number,
    userId?: number
  ): Promise<RentInsurancePolicy> {
    const policy = await this.repository.findById(policyId);

    if (!policy) {
      throw new Error("Policy not found");
    }

    if (userId && policy.user_id !== userId) {
      throw new Error("Unauthorized access to policy");
    }

    return policy;
  }

  async getPolicyByNumber(
    policyNumber: string,
    userId?: number
  ): Promise<RentInsurancePolicy> {
    const policy = await this.repository.getPolicyByNumber(policyNumber);

    if (!policy) {
      throw new Error("Policy not found");
    }

    if (userId && policy.user_id !== userId) {
      throw new Error("Unauthorized access to policy");
    }

    return policy;
  }

  async getAllPolicies(): Promise<RentInsurancePolicy[]> {
    return await this.repository.getAllRentPolicies();
  }

  async activatePolicy(policyId: number): Promise<RentInsurancePolicy> {
    const policy = await this.repository.updatePolicyStatus(policyId, "active");

    if (!policy) {
      throw new Error("Policy not found");
    }

    return policy;
  }

  async cancelPolicy(
    policyId: number,
    userId?: number
  ): Promise<RentInsurancePolicy> {
    if (userId) {
      const policy = await this.repository.findById(policyId);
      if (!policy || policy.user_id !== userId) {
        throw new Error("Unauthorized or policy not found");
      }
    }

    const policy = await this.repository.cancelPolicy(policyId);

    if (!policy) {
      throw new Error("Policy not found");
    }

    return policy;
  }

  /**
   * Get policy with user info (for PDF)
   */
  async getPolicyWithUserInfo(policyId: number, userId?: number): Promise<any> {
    const policyData = await this.repository.getPolicyWithUserInfo(policyId);

    if (!policyData) {
      throw new Error("Policy not found");
    }

    if (userId && policyData.user_id !== userId) {
      throw new Error("Unauthorized: You do not have access to this policy");
    }

    return policyData;
  }

  private calculateMonths(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Math.max(1, months);
  }
}
