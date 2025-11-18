// ===============================================
// LIFE INSURANCE MODEL
// ===============================================

export type PolicyStatus = 'issued' | 'active' | 'cancelled';

export interface LifeInsurancePolicy {
  id?: number;
  policy_number?: string;
  user_id: number;
  insurance_type_id?: number;
  status?: PolicyStatus;
  
  // Common policy fields
  start_date: Date;
  end_date?: Date | null; // NULL for issued/active, set when cancelled
  premium_amount?: number;
  coverage_amount: number;
  
  // Life insurance specific details
  life_details?: {
    age: number;
    medical_history: string;
    smoker: boolean;
    beneficiaries: Array<{
      name: string;
      relationship: string;
      percentage: number;
    }>;
  };
  
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateLifeInsuranceDTO {
  user_id: number;
  coverage_amount: number;
  start_date: Date;
  end_date?: Date; // Optional, will be NULL for new policies
  age: number;
  medical_history: string;
  smoker: boolean;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
}

export interface QuoteLifeInsuranceDTO {
  coverage_amount: number;
  start_date: Date;
  end_date: Date;
  age: number;
  smoker: boolean;
}


