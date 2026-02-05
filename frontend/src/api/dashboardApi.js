import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/dashboard';

export const fetchDashboardMetrics = (startDate, endDate) => {
    return axios.get(`${API_BASE}/metrics`, {
        params: { startDate, endDate }
    });
};
