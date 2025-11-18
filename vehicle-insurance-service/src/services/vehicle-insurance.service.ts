// ===============================================
// VEHICLE INSURANCE SERVICE - BUSINESS LOGIC
// ===============================================

import { VehicleInsuranceRepository } from '../repositories/vehicle-insurance.repository';
import { 
  CreateVehicleInsuranceDTO, 
  QuoteVehicleInsuranceDTO, 
  VehicleInsurancePolicy 
} from '../models/vehicle-insurance.model';
import { 
  InsuranceFactory, 
  VehicleInsuranceData 
} from 'shared';

export class VehicleInsuranceService {
  private repository: VehicleInsuranceRepository;

  constructor() {
    this.repository = new VehicleInsuranceRepository();
  }

  async createPolicy(data: CreateVehicleInsuranceDTO): Promise<VehicleInsurancePolicy> {
    const insuranceData: VehicleInsuranceData = {
      userId: data.user_id,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      make: data.make,
      model: data.model,
      year: data.year,
      vin: data.vin,
      licensePlate: data.license_plate,
    };

    const vehicleInsurance = InsuranceFactory.createInsurance('vehicle', insuranceData);

    if (!vehicleInsurance.validate()) {
      throw new Error('Invalid vehicle insurance data');
    }

    const premiumAmount = vehicleInsurance.calculatePremium();
    const insuranceTypeId = await this.repository.getVehicleInsuranceTypeId();
    const policyNumber = await this.repository.generatePolicyNumber();

    const policyData = {
      policy_number: policyNumber,
      user_id: data.user_id,
      insurance_type_id: insuranceTypeId,
      status: 'issued' as const, // New policy starts as 'issued', pending admin approval
      start_date: data.start_date,
      end_date: null, // NULL until policy is cancelled
      premium_amount: premiumAmount,
      coverage_amount: data.coverage_amount,
      vehicle_details: vehicleInsurance.getDetails(),
    };

    const policy = await this.repository.createPolicy(policyData);
    return policy;
  }

  async getQuote(data: QuoteVehicleInsuranceDTO): Promise<{ premium: number; details: any }> {
    const insuranceData: VehicleInsuranceData = {
      userId: 0,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      make: 'N/A',
      model: 'N/A',
      year: data.year,
      vin: 'N/A',
      licensePlate: 'N/A',
    };

    const vehicleInsurance = InsuranceFactory.createInsurance('vehicle', insuranceData);
    const premium = vehicleInsurance.calculatePremium();

    return {
      premium,
      details: {
        coverage_amount: data.coverage_amount,
        year: data.year,
        duration_months: this.calculateMonths(data.start_date, data.end_date),
      },
    };
  }

  async getUserPolicies(userId: number): Promise<VehicleInsurancePolicy[]> {
    return await this.repository.getPoliciesByUserId(userId);
  }

  async getPolicyById(policyId: number, userId?: number): Promise<VehicleInsurancePolicy> {
    const policy = await this.repository.findById(policyId);

    if (!policy) {
      throw new Error('Policy not found');
    }

    if (userId && policy.user_id !== userId) {
      throw new Error('Unauthorized access to policy');
    }

    return policy;
  }

  async getPolicyByNumber(policyNumber: string, userId?: number): Promise<VehicleInsurancePolicy> {
    const policy = await this.repository.getPolicyByNumber(policyNumber);

    if (!policy) {
      throw new Error('Policy not found');
    }

    if (userId && policy.user_id !== userId) {
      throw new Error('Unauthorized access to policy');
    }

    return policy;
  }

  async getAllPolicies(): Promise<VehicleInsurancePolicy[]> {
    return await this.repository.getAllVehiclePolicies();
  }

  async activatePolicy(policyId: number): Promise<VehicleInsurancePolicy> {
    const policy = await this.repository.updatePolicyStatus(policyId, 'active');

    if (!policy) {
      throw new Error('Policy not found');
    }

    return policy;
  }

  async cancelPolicy(policyId: number, userId?: number): Promise<VehicleInsurancePolicy> {
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

  private calculateMonths(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }
}


