// ===============================================
// VEHICLE INSURANCE MODEL
// ===============================================

export type PolicyStatus = 'issued' | 'active' | 'cancelled';

export interface VehicleInsurancePolicy {
  id?: number;
  policy_number?: string;
  user_id: number;
  insurance_type_id?: number;
  status?: PolicyStatus;
  start_date: Date;
  end_date?: Date | null; // NULL for issued/active, set when cancelled
  premium_amount?: number;
  coverage_amount: number;
  vehicle_details?: {
    make: string;
    model: string;
    year: number;
    vin: string;
    license_plate: string;
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateVehicleInsuranceDTO {
  user_id: number;
  coverage_amount: number;
  start_date: Date;
  end_date?: Date; // Optional, will be NULL for new policies
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
}

export interface QuoteVehicleInsuranceDTO {
  coverage_amount: number;
  start_date: Date;
  end_date: Date;
  year: number;
}


