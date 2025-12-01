import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getAllUsers: () => api.get('/auth/users'),
  getUserStats: () => api.get('/auth/stats'),
};

// ========== LIFE INSURANCE API ==========
export const lifeInsuranceAPI = {
  getQuote: (data) => api.post('/life-insurance/quote', data),
  createPolicy: (data) => api.post('/life-insurance/policies', data),
  getMyPolicies: () => api.get('/life-insurance/policies/my'),
  getPolicyById: (id) => api.get(`/life-insurance/policies/id/${id}`),
  getPolicyByNumber: (policyNumber) => api.get(`/life-insurance/policies/${policyNumber}`),
  cancelPolicy: (id) => api.put(`/life-insurance/policies/${id}/cancel`),
  getAllPolicies: () => api.get('/life-insurance/policies'),
  activatePolicy: (id) => api.put(`/life-insurance/policies/${id}/activate`),
};

// ========== VEHICLE INSURANCE API ==========
export const vehicleInsuranceAPI = {
  getQuote: (data) => api.post('/vehicle-insurance/quote', data),
  createPolicy: (data) => api.post('/vehicle-insurance/policies', data),
  getMyPolicies: () => api.get('/vehicle-insurance/policies/my'),
  getPolicyById: (id) => api.get(`/vehicle-insurance/policies/id/${id}`),
  getPolicyByNumber: (policyNumber) => api.get(`/vehicle-insurance/policies/${policyNumber}`),
  cancelPolicy: (id) => api.put(`/vehicle-insurance/policies/${id}/cancel`),
  getAllPolicies: () => api.get('/vehicle-insurance/policies'),
  activatePolicy: (id) => api.put(`/vehicle-insurance/policies/${id}/activate`),
};

// ========== RENT INSURANCE API ==========
export const rentInsuranceAPI = {
  getQuote: (data) => api.post('/rent-insurance/quote', data),
  createPolicy: (data) => api.post('/rent-insurance/policies', data),
  getMyPolicies: () => api.get('/rent-insurance/policies/my'),
  getPolicyById: (id) => api.get(`/rent-insurance/policies/id/${id}`),
  getPolicyByNumber: (policyNumber) => api.get(`/rent-insurance/policies/${policyNumber}`),
  cancelPolicy: (id) => api.put(`/rent-insurance/policies/${id}/cancel`),
  getAllPolicies: () => api.get('/rent-insurance/policies'),
  activatePolicy: (id) => api.put(`/rent-insurance/policies/${id}/activate`),
};

export default api;
