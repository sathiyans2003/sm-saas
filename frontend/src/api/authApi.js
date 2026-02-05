import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api/auth';

// Add token to requests
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export const getProfile = () => axios.get(`${API_BASE}/me`);
export const updateProfile = (data) => axios.put(`${API_BASE}/profile`, data);
export const register = (userData) => axios.post(`${API_BASE}/register`, userData); // Legacy
export const login = (userData) => axios.post(`${API_BASE}/login`, userData);

// New Signup Flow
export const initiateSignup = (data) => axios.post(`${API_BASE}/signup/initiate`, data);
export const verifySignup = (data) => axios.post(`${API_BASE}/signup/verify`, data);
export const forgotPassword = (email) => axios.post(`${API_BASE}/forgot-password`, { email });
