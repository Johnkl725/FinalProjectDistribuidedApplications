// ===============================================
// CLAIM MODEL - Type Definitions
// ===============================================

export interface PolicyClaim {
  id?: number;
  policy_id: number;
  claim_number: string;
  claim_date: Date | string;
  claim_amount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  description: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface CreateClaimDTO {
  policy_id: number;
  claim_date: string;
  claim_amount: number;
  description: string;
}

export interface UpdateClaimStatusDTO {
  status: 'under_review' | 'approved' | 'rejected' | 'paid';
}

export interface ClaimWithPolicy extends PolicyClaim {
  policy_number?: string;
  user_id?: number;
  insurance_type_name?: string;
  user_email?: string;
  user_name?: string;
}

