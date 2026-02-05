import axios from 'axios';

// Use same base as other APIs or hardcode if needed, but best to follow pattern
// Assuming authApi uses relative or localhost, let's look at pattern using authApi.
// Actually user code snippet used direct localhost, I will adapt to use axios interceptor if possible
// or just use the same pattern as user provided but with correct port if needed.
// IMPORTANT: User specified http://localhost:5000/api/facebook/status.
// But I previously changed authApi to 127.0.0.1. I should probably stick to that or relative path proxy.
// Let's use relative path if proxy is set, or 127.0.0.1 to be safe based on recent fixes.

/*
// User provided:
export const getFacebookStatus = () => {
  return axios.get('http://localhost:5000/api/facebook/status', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
*/

const API_BASE = 'http://127.0.0.1:5000/api/facebook';

// Helper to get headers (redundant if using global interceptor, but safe for standalone file)
const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

export const getFacebookStatus = () => {
    return axios.get(`${API_BASE}/status`, getHeaders());
};

export const connectFacebook = () => {
    // This usually redirects the browser, not an axios call, but if it's an API that returns redirect URL:
    // User example was a link: <a href="http://localhost:5000/api/facebook/connect">
    // So we might not need an API function for the connect action, just the URL.
    return `${API_BASE}/connect`;
};
