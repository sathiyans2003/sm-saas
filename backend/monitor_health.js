const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function checkHealth() {
    try {
        console.log('Checking root...');
        const res = await axios.get(BASE_URL + '/');
        console.log('Root status:', res.status, res.data);
    } catch (err) {
        console.error('Root failed:', err.message);
    }

    try {
        console.log('Checking Login (expected 400 or 401)...');
        const res = await axios.post(BASE_URL + '/api/auth/login', {
            email: 'test@test.com',
            password: 'password'
        });
        console.log('Login status:', res.status);
    } catch (err) {
        if (err.response) {
            console.log('Login failed as expected with status:', err.response.status, err.response.data);
        } else {
            console.error('Login connection failed:', err.message);
        }
    }
}

checkHealth();
