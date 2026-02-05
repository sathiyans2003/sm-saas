const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const OTP = require('./backend/models/OTP');
const Workspace = require('./backend/models/Workspace');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    name: 'Verification User',
    email: `verify_${Date.now()}@example.com`,
    mobile: `+9199999${Math.floor(Math.random() * 100000)}`,
    password: 'password123'
};

async function runVerification() {
    console.log('Starting Verification...');

    // 1. Connect to DB to check data directly
    // Assuming mongoURI is in .env or default local
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zacx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    try {
        // 2. Initiate Signup
        console.log(`\n1. Initiating Signup for ${TEST_USER.email}...`);
        try {
            const initRes = await axios.post(`${API_URL}/signup/initiate`, TEST_USER);
            console.log('Response:', initRes.data);
        } catch (e) {
            console.error('Initiate Failed:', e.response ? e.response.data : e.message);
            process.exit(1);
        }

        // 3. Get OTPs from DB
        console.log('\n2. Fetching OTPs from DB...');
        // Wait a moment for DB write
        await new Promise(r => setTimeout(r, 1000));

        const emailOTPRecord = await OTP.findOne({ identifier: TEST_USER.email, purpose: 'SIGNUP' });
        const mobileOTPRecord = await OTP.findOne({ identifier: TEST_USER.mobile, purpose: 'SIGNUP' });

        if (!emailOTPRecord || !mobileOTPRecord) {
            console.error('OTPs not found in DB!');
            process.exit(1);
        }

        // We can't get the plain OTPs because they are hashed!
        // Ah, the verification endpoint expects the PLAIN OTPs.
        // But we hashed them in the backend. 
        // We can't verify the flow fully if we can't see the mock logs.
        // Wait, for verification purposes, let's look at the Mock Log output... but I can't see it easily.

        // HACK: For this verification script to work WITHOUT reading logs,
        // we need to temporarily rely on the fact that I can't reverse the hash.

        // ALTERNATIVE: I will temporarily modify auth.js to return the OTPs in the response, 
        // OR I will parse the console logs if run_command supported it well,
        // OR I can just trust the unit test of 'generate -> send -> verify'.

        // Actually, since I can't get the plain OTP from the DB (it's hashed), 
        // and I can't read the server logs live...

        // I will use a different approach:
        // I will manually INSERT valid OTP records with KNOWN hashes into the DB for this user,
        // effectively "mocking" the initiation step's result, to test the VERIFY step.
        // But verifying Initiate is also important.

        console.log('Skipping real OTP retrieval (hashed). Proceeding to verify "Verify" step manually.');
    } catch (err) {
        console.error(err);
    }

    // NEW PLAN: Test the VERIFY logic directly by creating the state we expect "Initiate" to produce.

    console.log('\n--- Testing Verify Route Logic ---');

    const bcrypt = require('bcryptjs'); // Need to install or require from backend/node_modules

    const mockEmailOTP = '123456';
    const mockMobileOTP = '654321';

    // Manually create the OTP records exactly how Initiate would
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

    await OTP.deleteMany({ identifier: { $in: [TEST_USER.email, TEST_USER.mobile] }, purpose: 'SIGNUP' });

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

    console.log('Inserted Mock OTP records into DB.');

    // Now call Verify
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
        console.log('\n4. Checking Workspace Creation...');
        const user = await User.findOne({ email: TEST_USER.email });
        if (!user) {
            console.error('FAILURE: User not found in DB.');
        } else {
            console.log('User ID:', user._id);
            const workspace = await Workspace.findOne({ owner: user._id });
            if (workspace) {
                console.log('Workspace Found:', workspace.name);
                // Check Role
                const teamMember = workspace.team.find(t => t.user.toString() === user._id.toString());
                if (teamMember && teamMember.role === 'Owner') {
                    console.log('SUCCESS: User is mapped as OWNER in Workspace.');
                } else {
                    console.error('FAILURE: User is NOT mapped as Owner.', teamMember);
                }
            } else {
                console.error('FAILURE: Workspace was not created.');
            }
        }

    } catch (e) {
        console.error('Verify Failed:', e.response ? e.response.data : e.message);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
