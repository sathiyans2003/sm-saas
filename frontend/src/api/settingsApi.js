import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/settings';

export const getSettings = () => axios.get(API_BASE);
export const getWorkspaces = () => axios.get(`${API_BASE}/list`);
export const updateSettings = (data) => axios.put(API_BASE, data);
export const createWorkspace = (data) => axios.post(API_BASE, data);
export const generateApiKey = () => axios.post(`${API_BASE}/api-keys`);
export const revokeApiKey = (id) => axios.delete(`${API_BASE}/api-keys/${id}`);

export const getTeam = () => axios.get(`${API_BASE}/team`);
export const updateMember = (userId, data) => axios.put(`${API_BASE}/team/${userId}`, data);
export const deleteMember = (userId) => axios.delete(`${API_BASE}/team/${userId}`);
export const inviteMember = (data) => axios.post(`${API_BASE}/team/invite`, data);
