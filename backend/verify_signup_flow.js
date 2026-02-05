const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const OTP = require('./models/OTP');
const Workspace = require('./models/Workspace');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    name: 'Verification User',
    email: `verify_${Date.now()}@example.com`,
    mobile: `+9199999${Math.floor(Math.random() * 100000)}`,
    password: 'password123'
};

async function runVerification() {
    console.log('Starting Verification (from backend dir)...');

    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zacx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    try {
        // 1. Initiate Signup
        console.log(`\n1. Initiating Signup for ${TEST_USER.email}...`);
        try {
            const initRes = await axios.post(`${API_URL}/signup/initiate`, TEST_USER);
            console.log('Response:', initRes.data);
        } catch (e) {
            console.error('Initiate Failed:', e.response ? e.response.data : e.message);
            // If user already exists (from previous run), that's fine, we proceed to cleanup and retry or just use it.
            // But better to fail here for clean test.
        }

        // 2. Mock OTPs for Verification Step
        // (Since we can't easily get the hashed values from the initiation without reading logs/email)

        console.log('\n2. Mocking OTPs in DB for Verification...');

        // Ensure bcrypt is available (it's in backend dependencies)
        const bcrypt = require('bcryptjs');

        const mockEmailOTP = '123456';
        const mockMobileOTP = '654321';

        const salt = await bcrypt.genSalt(10);
        const emailOTPHash = await bcrypt.hash(mockEmailOTP, salt);
        const mobileOTPHash = await bcrypt.hash(mockMobileOTP, salt);
        const passwordHash = await bcrypt.hash(TEST_USER.password, salt);

        const otpPayload = {
            name: TEST_USER.name,
            email: TEST_USER.email,
            mobile: TEST_USER.mobile,
            passwordHash
        };

        // Clean up any existing OTPs/Users to ensure clean slate
        await OTP.deleteMany({ identifier: { $in: [TEST_USER.email, TEST_USER.mobile] }, purpose: 'SIGNUP' });
        await User.deleteOne({ email: TEST_USER.email });
        // Also clean up workspace if it exists
        // Need user ID first? No, we deleted the user.
        // We can find workspace by name for this test user?
        await Workspace.deleteOne({ name: `${TEST_USER.name}'s Workspace` });

        await OTP.create({
            identifier: TEST_USER.email,
            purpose: 'SIGNUP',
            otpHash: emailOTPHash,
            method: 'EMAIL',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            contextData: otpPayload
        });

        await OTP.create({
            identifier: TEST_USER.mobile,
            purpose: 'SIGNUP',
            otpHash: mobileOTPHash,
            method: 'SMS',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        console.log('Inserted Mock OTP records.');

        // 3. Call Verify
        console.log('\n3. Calling Verify Endpoint...');
        try {
            const verifyRes = await axios.post(`${API_URL}/signup/verify`, {
                email: TEST_USER.email,
                mobile: TEST_USER.mobile,
                emailOTP: mockEmailOTP,
                mobileOTP: mockMobileOTP
            });
            console.log('Verify Response:', verifyRes.data);

            if (verifyRes.data.token) {
                console.log('SUCCESS: Token received.');
            } else {
                console.error('FAILURE: No token received.');
            }

            // 4. Check Workspace
            console.log('\n4. Checking Workspace Creation & Owner Role...');
            const user = await User.findOne({ email: TEST_USER.email });
            if (!user) {
                console.error('FAILURE: User not found in DB.');
            } else {
                console.log('User ID:', user._id);
                // Find workspace owned by user
                const workspace = await Workspace.findOne({ owner: user._id });

                if (workspace) {
                    console.log(`Workspace Found: "${workspace.name}"`);
                    console.log('Checking Team Roles...');

                    const teamMember = workspace.team.find(t => t.user.toString() === user._id.toString());

                    if (teamMember) {
                        console.log(`User Role in Team: ${teamMember.role}`);
                        if (teamMember.role === 'Owner') {
                            console.log('SUCCESS: User is correctly mapped as OWNER.');
                        } else {
                            console.error('FAILURE: User role is NOT Owner.');
                        }
                    } else {
                        console.error('FAILURE: User not found in Workspace Team.');
                    }
                } else {
                    console.error('FAILURE: Workspace was not created for the user.');
                }
            }

        } catch (e) {
            console.error('Verify Failed:', e.response ? e.response.data : e.message);
        }

    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

runVerification();
