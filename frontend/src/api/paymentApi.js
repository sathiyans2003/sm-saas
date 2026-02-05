import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/payment';

// Ensure token is attached if not already handled globally
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getKey = () => axios.get(`${API_BASE}/config/key`);

export const createOrder = (amount, planId) =>
    axios.post(`${API_BASE}/create-order`, { amount, planId }, { headers: getAuthHeaders() });

export const verifyPayment = (data) =>
    axios.post(`${API_BASE}/verify`, data, { headers: getAuthHeaders() });
