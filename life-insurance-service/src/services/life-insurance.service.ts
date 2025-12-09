// ===============================================
// LIFE INSURANCE SERVICE - BUSINESS LOGIC
// ===============================================

import { LifeInsuranceRepository } from '../repositories/life-insurance.repository';
import { 
  CreateLifeInsuranceDTO, 
  QuoteLifeInsuranceDTO, 
  LifeInsurancePolicy 
} from '../models/life-insurance.model';
import { 
  InsuranceFactory, 
  LifeInsuranceData 
} from 'shared';

export class LifeInsuranceService {
  private repository: LifeInsuranceRepository;

  constructor() {
    this.repository = new LifeInsuranceRepository();
  }

  /**
   * Create a new life insurance policy
   */
  async createPolicy(data: CreateLifeInsuranceDTO): Promise<LifeInsurancePolicy> {
    // Validate beneficiaries
    this.validateBeneficiaries(data.beneficiaries);

    // Create insurance instance using Factory Pattern
    const insuranceData: LifeInsuranceData = {
      userId: data.user_id,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      age: data.age,
      medicalHistory: data.medical_history,
      smoker: data.smoker,
      beneficiaries: data.beneficiaries,
    };

    const lifeInsurance = InsuranceFactory.createInsurance('life', insuranceData);

    // Validate insurance data
    if (!lifeInsurance.validate()) {
      throw new Error('Invalid life insurance data');
    }

    // Calculate premium
    const premiumAmount = lifeInsurance.calculatePremium();

    // Get insurance type ID
    const insuranceTypeId = await this.repository.getLifeInsuranceTypeId();

    // Generate policy number
    const policyNumber = await this.repository.generatePolicyNumber();

    // Create policy in database with 'issued' status and NULL end_date
    const policyData = {
      policy_number: policyNumber,
      user_id: data.user_id,
      insurance_type_id: insuranceTypeId,
      status: 'issued' as const, // New policy starts as 'issued', pending admin approval
      start_date: data.start_date,
      end_date: null, // NULL until policy is cancelled
      premium_amount: premiumAmount,
      coverage_amount: data.coverage_amount,
      life_details: lifeInsurance.getDetails(),
    };

    const policy = await this.repository.createPolicy(policyData);

    return policy;
  }

  /**
   * Get a quote for life insurance (no policy creation)
   */
  async getQuote(data: QuoteLifeInsuranceDTO): Promise<{ premium: number; details: any }> {
    // If end_date is not provided, assume a 12-month duration from start_date
    const startDate = new Date(data.start_date);
    const endDate = data.end_date ? new Date(data.end_date) : this.addMonths(startDate, 12);

    const insuranceData: LifeInsuranceData = {
      userId: 0, // Dummy user ID for quote
      coverageAmount: data.coverage_amount,
      startDate,
      endDate,
      age: data.age,
      medicalHistory: 'N/A',
      smoker: data.smoker,
      beneficiaries: [], // Not required for quote
    };

    const lifeInsurance = InsuranceFactory.createInsurance('life', insuranceData);
    const premium = lifeInsurance.calculatePremium();

    return {
      premium,
      details: {
        coverage_amount: data.coverage_amount,
        age: data.age,
        smoker: data.smoker,
        duration_months: this.calculateMonths(startDate, endDate),
      },
    };
  }

  /**
   * Get user's policies
   */
  async getUserPolicies(userId: number): Promise<LifeInsurancePolicy[]> {
    return await this.repository.getPoliciesByUserId(userId);
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: number, userId?: number): Promise<LifeInsurancePolicy> {
    const policy = await this.repository.findById(policyId);

    if (!policy) {
      throw new Error('Policy not found');
    }

    // If userId is provided, verify ownership
    if (userId && policy.user_id !== userId) {
      throw new Error('Unauthorized access to policy');
    }

    return policy;
  }

  /**
   * Get policy by policy number
   */
  async getPolicyByNumber(policyNumber: string, userId?: number): Promise<LifeInsurancePolicy> {
    const policy = await this.repository.getPolicyByNumber(policyNumber);

    if (!policy) {
      throw new Error('Policy not found');
    }

    // If userId is provided, verify ownership
    if (userId && policy.user_id !== userId) {
      throw new Error('Unauthorized access to policy');
    }

    return policy;
  }

  /**
   * Get all life insurance policies (admin only)
   */
  async getAllPolicies(): Promise<LifeInsurancePolicy[]> {
    return await this.repository.getAllLifePolicies();
  }

  /**
   * Activate a policy (admin only - changes status from 'issued' to 'active')
   */
  async activatePolicy(policyId: number): Promise<LifeInsurancePolicy> {
    const policy = await this.repository.updatePolicyStatus(policyId, 'active');

    if (!policy) {
      throw new Error('Policy not found');
    }

    return policy;
  }

  /**
   * Cancel a policy (sets status to 'cancelled' and end_date to current date)
   */
  async cancelPolicy(policyId: number, userId?: number): Promise<LifeInsurancePolicy> {
    // Verify ownership if userId provided
    if (userId) {
      const policy = await this.repository.findById(policyId);
      if (!policy || policy.user_id !== userId) {
        throw new Error('Unauthorized or policy not found');
      }
    }

    const policy = await this.repository.cancelPolicy(policyId);

    if (!policy) {
      throw new Error('Policy not found');
    }

    return policy;
  }

  /**
   * Private: Validate beneficiaries
   */
  private validateBeneficiaries(beneficiaries: any[]): void {
    if (!beneficiaries || beneficiaries.length === 0) {
      throw new Error('At least one beneficiary is required');
    }

    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      throw new Error('Beneficiaries percentages must sum to 100');
    }

    for (const beneficiary of beneficiaries) {
      if (!beneficiary.name || !beneficiary.relationship) {
        throw new Error('Beneficiary name and relationship are required');
      }
      if (beneficiary.percentage <= 0 || beneficiary.percentage > 100) {
        throw new Error('Beneficiary percentage must be between 1 and 100');
      }
    }
  }

  /**
   * Private: Calculate months between dates
   */
  private calculateMonths(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(1, months);
  }

  /**
   * Private: Add months to a date without mutating the original
   */
  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}


