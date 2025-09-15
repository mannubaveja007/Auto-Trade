import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://auto-trade-yellow-network.netlify.app/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Procurement Requests
export const createProcurementRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

export const getProcurementRequests = async (params = {}) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const getProcurementRequest = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const deleteProcurementRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};

// Vendors
export const getVendors = async (params = {}) => {
  const response = await api.get('/vendors', { params });
  return response.data;
};

export const getVendor = async (id) => {
  const response = await api.get(`/vendors/${id}`);
  return response.data;
};

// Quotes
export const getQuotes = async (params = {}) => {
  const response = await api.get('/quotes', { params });
  return response.data;
};

export const createQuote = async (quoteData) => {
  const response = await api.post('/quotes', quoteData);
  return response.data;
};

// AI Operations
export const triggerVendorMatching = async (requestId) => {
  const response = await api.post(`/ai/match-vendors/${requestId}`);
  return response.data;
};

export const sendNegotiationMessage = async (quoteId, message, sender) => {
  const response = await api.post(`/ai/negotiate/${quoteId}`, {
    message,
    sender
  });
  return response.data;
};

// Negotiations
export const getNegotiations = async (quoteId) => {
  const response = await api.get(`/negotiations/${quoteId}`);
  return response.data;
};

// Orders
export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Buyers
export const getBuyers = async () => {
  const response = await api.get('/buyers');
  return response.data;
};

export default api;