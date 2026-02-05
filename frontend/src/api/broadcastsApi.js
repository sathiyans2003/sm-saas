import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/broadcasts';

/* FETCH ALL BROADCASTS */
export const fetchBroadcasts = () => {
    return axios.get(API_BASE);
};

/* CREATE BROADCAST */
export const createBroadcast = (data) => {
    return axios.post(API_BASE, data);
};

/* GET AUDIENCE COUNT */
export const getAudienceCount = (data) => {
    return axios.post(`${API_BASE}/audience-count`, data);
};

/* GET SINGLE BROADCAST */
export const getBroadcast = (id) => {
    return axios.get(`${API_BASE}/${id}`);
};

/* GET BROADCAST LOGS */
export const getBroadcastLogs = (id) => {
    return axios.get(`${API_BASE}/${id}/logs`);
};
