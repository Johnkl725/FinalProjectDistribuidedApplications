// ===============================================
// USER MODEL
// ===============================================

export interface User {
  id?: number;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'employee' | 'admin';
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'customer' | 'employee' | 'admin';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
}


