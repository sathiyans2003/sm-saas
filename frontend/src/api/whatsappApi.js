import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/whatsapp';

export const syncTemplates = (data) => axios.post(`http://localhost:5000/api/templates/sync`, data);
export const getTemplates = (wabaId) => axios.get(`http://localhost:5000/api/templates`, { params: { wabaId } });
export const createTemplate = (data) => axios.post(`http://localhost:5000/api/templates`, data);
export const getPhoneNumbers = () => axios.get(`${API_BASE}/phone-numbers`);
export const syncPhoneNumbers = () => axios.post(`${API_BASE}/phone-numbers/sync`);
export const checkPhoneNumberLimit = () => axios.get(`${API_BASE}/phone-numbers/limit-check`);
export const requestAuthCode = (data) => axios.post(`${API_BASE}/phone-numbers/request-code`, data);
export const registerNumber = (data) => axios.post(`${API_BASE}/phone-numbers/register`, data);
export const setTwoStepVerification = (data) => axios.post(`${API_BASE}/phone-numbers/set-2fa`, data);
export const deleteNumber = (id) => axios.delete(`${API_BASE}/phone-numbers/${id}`);
export const getProfile = () => axios.get(`${API_BASE}/profile`);
export const sendMessage = (data) => axios.post(`${API_BASE}/send`, data);
export const uploadProfileImage = (formData) => axios.post(`http://localhost:5000/api/profile/upload-photo`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});
export const updateProfile = (data) => axios.put(`${API_BASE}/profile`, data);
