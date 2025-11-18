// ===============================================
// RENT INSURANCE MODEL
// ===============================================

export type PolicyStatus = 'issued' | 'active' | 'cancelled';

export interface RentInsurancePolicy {
  id?: number;
  policy_number?: string;
  user_id: number;
  insurance_type_id?: number;
  status?: PolicyStatus;
  start_date: Date;
  end_date?: Date | null; // NULL for issued/active, set when cancelled
  premium_amount?: number;
  coverage_amount: number;
  rent_details?: {
    address: string;
    property_value: number;
    usage_type: 'residential' | 'commercial';
    square_meters: number;
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateRentInsuranceDTO {
  user_id: number;
  coverage_amount: number;
  start_date: Date;
  end_date?: Date; // Optional, will be NULL for new policies
  address: string;
  property_value: number;
  usage_type: 'residential' | 'commercial';
  square_meters: number;
}

export interface QuoteRentInsuranceDTO {
  coverage_amount: number;
  start_date: Date;
  end_date: Date;
  property_value: number;
  usage_type: 'residential' | 'commercial';
}


