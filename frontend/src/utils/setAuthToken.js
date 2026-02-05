import axios from 'axios';

const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        // Also set Authorization header for Bearer token compatibility if needed
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
        delete axios.defaults.headers.common['Authorization'];
    }
};

export default setAuthToken;
