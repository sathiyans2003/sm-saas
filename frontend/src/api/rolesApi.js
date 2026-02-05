import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/roles';

export const getRoles = () => axios.get(API_BASE);
export const createRole = (data) => axios.post(API_BASE, data);
export const updateRole = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteRole = (id) => axios.delete(`${API_BASE}/${id}`);
