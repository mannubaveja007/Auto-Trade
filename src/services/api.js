import axios from 'axios';
import { getApiBaseUrl } from '../lib/env';

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, message);

    // Create a user-friendly error object
    const enhancedError = {
      ...error,
      userMessage: message,
      status: error.response?.status,
    };

    return Promise.reject(enhancedError);
  }
);

// Helper function to wrap API calls with consistent error handling
const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.userMessage || error.message,
        status: error.status,
        original: error
      }
    };
  }
};

// Procurement Requests
export const createProcurementRequest = async (requestData) => {
  return apiCall(() => api.post('/requests', requestData));
};

export const getProcurementRequests = async (params = {}) => {
  return apiCall(() => api.get('/requests', { params }));
};

export const getProcurementRequest = async (id) => {
  return apiCall(() => api.get(`/requests/${id}`));
};

export const deleteProcurementRequest = async (id) => {
  return apiCall(() => api.delete(`/requests/${id}`));
};

// Vendors
export const getVendors = async (params = {}) => {
  return apiCall(() => api.get('/vendors', { params }));
};

export const getVendor = async (id) => {
  return apiCall(() => api.get(`/vendors/${id}`));
};

// Quotes
export const getQuotes = async (params = {}) => {
  return apiCall(() => api.get('/quotes', { params }));
};

export const createQuote = async (quoteData) => {
  return apiCall(() => api.post('/quotes', quoteData));
};

// AI Operations
export const triggerVendorMatching = async (requestId) => {
  return apiCall(() => api.post(`/ai/match-vendors/${requestId}`));
};

export const sendNegotiationMessage = async (quoteId, message, sender) => {
  return apiCall(() => api.post(`/ai/negotiate/${quoteId}`, {
    message,
    sender
  }));
};

// Negotiations
export const getNegotiations = async (quoteId) => {
  return apiCall(() => api.get(`/negotiations/${quoteId}`));
};

// Orders
export const getOrders = async (params = {}) => {
  return apiCall(() => api.get('/orders', { params }));
};

export const createOrder = async (orderData) => {
  return apiCall(() => api.post('/orders', orderData));
};

// Buyers
export const getBuyers = async () => {
  return apiCall(() => api.get('/buyers'));
};

export default api;