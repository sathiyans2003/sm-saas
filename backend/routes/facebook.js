const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // Fixed middleware name
const axios = require('axios');
const crypto = require('crypto');

// Environment Variables
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/facebook/callback';
const API_VERSION = 'v20.0'; // Updated to v20.0 for better compatibility

// @route    GET api/facebook/status
// @desc     Check if user is connected
// @access   Private
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            connected: user.facebook?.connected || false,
            pageName: user.facebook?.pageName || null
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/facebook/auth
// @desc     Initiate Facebook Login
// @access   Private
router.get('/auth', async (req, res) => {
    try {
        const state = crypto.randomBytes(16).toString('hex');
        const scope = 'pages_show_list,pages_read_engagement,whatsapp_business_management';
        const facebookAuthUrl = `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=${scope}`;
        res.json({ url: facebookAuthUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/facebook/callback
// @desc     Handle Facebook Auth Callback
// @access   Public
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('Authorization failed: No code provided');
    }

    try {
        // 1. Exchange Code for User Access Token
        const tokenUrl = `https://graph.facebook.com/${API_VERSION}/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`;
        const tokenRes = await axios.get(tokenUrl);
        const { access_token: userAccessToken } = tokenRes.data;

        // 2. Identify User & Workspace
        const userId = state;
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found from state');

        // Find User's Workspace (Assuming single workspace for MVP)
        const Workspace = require('../models/Workspace');
        // Find workspace where user is owner or member
        const workspace = await Workspace.findOne({
            $or: [{ owner: userId }, { 'team.user': userId }]
        });

        // 3. Update Workspace Whatsapp State
        if (workspace) {
            // Fetch WABA & Phone Numbers using User Token
            let wabaId = null;
            let phoneNumberId = null;
            let displayPhone = null;

            try {
                // A. Try direct discovery first (if granular scopes allowed)
                const wabaRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/me`, {
                    params: {
                        fields: 'whatsapp_business_accounts',
                        access_token: userAccessToken
                    }
                });

                let accounts = wabaRes.data.whatsapp_business_accounts?.data;

                // B. If no accounts, try Business Manager discovery
                if (!accounts || accounts.length === 0) {
                    const businessesRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/me/businesses`, {
                        params: { access_token: userAccessToken }
                    });
                    const businesses = businessesRes.data.data;

                    if (businesses && businesses.length > 0) {
                        // Check first business for WABAs
                        const bizId = businesses[0].id;
                        const bizWabaRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${bizId}/client_whatsapp_business_accounts`, {
                            params: { access_token: userAccessToken }
                        });
                        accounts = bizWabaRes.data.data;
                    }
                }

                if (accounts && accounts.length > 0) {
                    wabaId = accounts[0].id;

                    // B. Get Phone Numbers
                    const phoneRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`, {
                        params: { access_token: userAccessToken }
                    });

                    const phones = phoneRes.data.data;
                    if (phones && phones.length > 0) {
                        phoneNumberId = phones[0].id;
                        displayPhone = phones[0].display_phone_number;
                    }
                }
            } catch (apiErr) {
                console.error('Graph API Fetch Error:', apiErr.response?.data || apiErr.message);
            }

            workspace.whatsapp = {
                connected: true,
                wabaId: wabaId,
                phoneNumberId: phoneNumberId,
                displayPhone: displayPhone,
                accessToken: userAccessToken
            };
            await workspace.save();
        }

        // 4. Update User
        user.facebook = {
            connected: true,
            userAccessToken: userAccessToken
        };
        await user.save();

        // 5. Return HTML to Close Popup & Notify Parent
        const successHtml = `
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'FB_CONNECT_SUCCESS' }, '*');
                            window.close();
                        } else {
                            window.location.href = 'http://localhost:3000/dashboard';
                        }
                    </script>
                    <h3>Authentication Successful! Closing...</h3>
                </body>
            </html>
        `;
        res.send(successHtml);

    } catch (err) {
        console.error('FB Callback Error:', err.response?.data || err.message);
        res.status(500).send(`Authentication Failed: ${JSON.stringify(err.response?.data || err.message)}`);
    }
});

// @route    GET api/facebook/connect
// @desc     Embedded Signup / Partner Onboarding Redirect
// @access   Private (JWT required)
router.get('/connect', auth, (req, res) => {
    const state = req.user.id;
    // Params from User's Partner Config
    const configId = '571327815813729';
    const solutionId = '1328819835227886';
    const appId = process.env.FACEBOOK_APP_ID || '1781062642653655';

    // Construct Extras JSON (Matching User Request)
    const extras = JSON.stringify({
        setup: {
            solutionID: solutionId
        },
        sessionInfoVersion: "3",
        features: [
            { name: "marketing_messages_lite" }
        ],
        version: "v3"
    });

    // Use v20.0 and display=popup
    const redirectUrl = `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${REDIRECT_URI}&state=${state}&config_id=${configId}&response_type=code&display=popup&extras=${encodeURIComponent(extras)}`;

    res.redirect(redirectUrl);
});

// Allow Token in Query (Frontend Handler)
router.get('/connect-with-token', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(401).send('No token');

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const state = decoded.user.id;
        // Params from User's Partner Config
        const configId = '571327815813729';
        const solutionId = '1328819835227886';
        const appId = process.env.FACEBOOK_APP_ID || '1781062642653655'; // Fallback ifenv missing logic handled by restart

        const extras = JSON.stringify({
            setup: {
                solutionID: solutionId
            },
            sessionInfoVersion: "3",
            features: [
                { name: "marketing_messages_lite" }
            ],
            version: "v3"
        });

        const redirectUrl = `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${REDIRECT_URI}&state=${state}&config_id=${configId}&response_type=code&display=popup&extras=${encodeURIComponent(extras)}`;

        res.redirect(redirectUrl);
    } catch (e) {
        res.status(401).send('Invalid Token');
    }
});

module.exports = router;
