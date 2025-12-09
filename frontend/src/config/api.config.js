// ===============================================
// API CONFIGURATION
// Centralized API URL configuration
// ===============================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/profile`,
  users: `${API_BASE_URL}/auth/users`,
  employees: `${API_BASE_URL}/auth/employees`,
  departments: `${API_BASE_URL}/auth/departments`,
  stats: `${API_BASE_URL}/auth/stats`,
  
  // Insurance endpoints
  lifeInsurance: `${API_BASE_URL}/life-insurance`,
  vehicleInsurance: `${API_BASE_URL}/vehicle-insurance`,
  rentInsurance: `${API_BASE_URL}/rent-insurance`,
  
  // Claims endpoints
  claims: `${API_BASE_URL}/claims`,
};

export default API_BASE_URL;
