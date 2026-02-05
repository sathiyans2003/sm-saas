// E:\zacx\backend\routes\auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const auth = require('../middleware/authMiddleware');
const OTP = require('../models/OTP');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');

// @route    POST api/auth/signup/initiate
// @desc     Initiate signup process (Validate & Send OTPs)
// @access   Public
router.post(
    '/signup/initiate',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('mobile', 'Mobile number is required').not().isEmpty(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, mobile, password } = req.body;

        try {
            // 1. Check if user exists (Email or Mobile)
            let user = await User.findOne({
                $or: [{ email }, { mobile }]
            });

            if (user) {
                if (user.email === email) return res.status(400).json({ msg: 'Email already exists' });
                if (user.mobile === mobile) return res.status(400).json({ msg: 'Mobile number already exists' });
            }

            // 2. Generate OTPs
            const emailOTP = crypto.randomInt(100000, 999999).toString();
            const mobileOTP = crypto.randomInt(100000, 999999).toString();

            // 3. Hash Data
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const emailOTPHash = await bcrypt.hash(emailOTP, salt);
            const mobileOTPHash = await bcrypt.hash(mobileOTP, salt);

            // 4. Store OTPs with Context (User Data)
            // Remove existing OTPs for this email/mobile
            await OTP.deleteMany({ identifier: { $in: [email, mobile] }, purpose: 'SIGNUP' });

            const otpPayload = {
                name,
                email,
                mobile,
                passwordHash
            };

            // Create Email OTP Record (Optional for strict verify now)
            await OTP.create({
                identifier: email,
                purpose: 'SIGNUP',
                otpHash: emailOTPHash,
                method: 'EMAIL',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
                contextData: otpPayload // Keep context here too just in case
            });

            // Create Mobile OTP Record - NOW WITH CONTEXT
            await OTP.create({
                identifier: mobile,
                purpose: 'SIGNUP',
                otpHash: mobileOTPHash,
                method: 'SMS',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                contextData: otpPayload
            });

            // 5. Send OTPs using Utilities
            try {
                const sendEmail = require('../utils/emailService');
                await sendEmail(email, 'Your Zacx Signup OTP', `Your OTP for Zacx registration is: ${emailOTP}. Valid for 5 minutes.`);
            } catch (emailErr) {
                console.warn('Failed to send email OTP', emailErr.message);
            }

            try {
                const sendSMS = require('../utils/smsService');
                await sendSMS(mobile, `Your Zacx OTP is: ${mobileOTP}`);
            } catch (smsErr) {
                console.warn('Failed to send SMS OTP', smsErr.message);
            }

            res.json({ msg: 'OTPs sent successfully' });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route    POST api/auth/signup/verify
// @desc     Verify OTPs and Create Account + Workspace
// @access   Public
router.post(
    '/signup/verify',
    [
        check('mobile', 'Mobile is required').not().isEmpty(),
        check('mobileOTP', 'Mobile OTP is required').not().isEmpty(),
        // Email OTP is now optional for the strict flow based on UI requirements
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, mobile, mobileOTP } = req.body;

        try {
            // 1. Fetch OTP Record (Mobile Only)
            const mobileRecord = await OTP.findOne({ identifier: mobile, purpose: 'SIGNUP' });

            if (!mobileRecord) return res.status(400).json({ msg: 'Mobile OTP expired or invalid' });

            // 2. Verify OTP
            const isMobileValid = await bcrypt.compare(mobileOTP, mobileRecord.otpHash);

            if (!isMobileValid) return res.status(400).json({ msg: 'Invalid Mobile OTP' });

            // 3. Create User
            // Context is now stored on Mobile Record too
            if (!mobileRecord.contextData) {
                return res.status(400).json({ msg: 'Context data missing from OTP record. Please signup again.' });
            }

            const { name, email: savedEmail, passwordHash } = mobileRecord.contextData;

            // Use the email from context if not provided/matching
            const userEmail = savedEmail || email;

            let user = new User({
                name,
                email: userEmail,
                mobile,
                password: passwordHash,
                emailVerified: false, // Not verified in this flow
                mobileVerified: true,
                whatsappVerified: false
            });

            await user.save();

            // 4. Create Default Workspace
            const Workspace = require('../models/Workspace');
            const newWorkspace = new Workspace({
                name: `${name}'s Workspace`,
                owner: user._id,
                team: [{
                    user: user._id,
                    role: 'Owner',
                    status: 'Active'
                }]
            });

            await newWorkspace.save();

            // 5. Cleanup OTPs
            await OTP.deleteMany({ identifier: { $in: [userEmail, mobile] }, purpose: 'SIGNUP' });

            // 6. Generate Token
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, msg: 'Account and Workspace created successfully!' });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route    GET api/auth/me
// @desc     Get current user profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        // Fetch active subscription
        const subscription = await Subscription.findOne({
            userId: req.user.id,
            status: 'active',
            endDate: { $gt: new Date() }
        }).populate('planId');

        // Append subscription to user object
        const userObj = user.toObject();
        userObj.subscription = subscription;

        res.json(userObj);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/auth/profile
// @desc     Update user profile
// @access   Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, timezone, whatsappNumber, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.timezone = timezone || user.timezone;
            user.whatsappNumber = whatsappNumber || user.whatsappNumber;
            user.avatar = avatar || user.avatar;

            // Name should be updated if first/last changed
            if (firstName || lastName) {
                user.name = `${user.firstName} ${user.lastName}`.trim();
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            user = new User({
                name,
                email,
                password,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Default Workspace creation removed as per requirements
            // Users will create workspaces manually or be added to existing ones via invitation


            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' }, // Token expires in 1 hour
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' }, // Token expires in 1 hour
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route    POST api/auth/forgot-password
// @desc     Send password reset link
// @access   Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token for storage (SHA256 allows lookup, unlike bcrypt)
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store Token in OTP collection (reusing it for reset tokens)
        // Clear existing reset tokens
        await OTP.deleteMany({ identifier: email, purpose: 'PASSWORD_RESET' });

        await OTP.create({
            identifier: email,
            purpose: 'PASSWORD_RESET',
            otpHash: resetTokenHash,
            method: 'EMAIL',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        });

        // Send Email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        const sendEmail = require('../utils/emailService');
        await sendEmail(email, 'Password Reset Token', message);

        res.json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route    POST api/auth/reset-password
// @desc     Reset password
// @access   Public
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        // We can't query by hash directly with bcrypt, so we need to find by identifier?
        // But we don't have identifier in body.
        // We must query ALL active password resets and check which one matches? -> Inefficient.
        // BETTER: The user should send email AND token? Or the link should contain a standard ID?

        // STANDARD WAY: Store plain token hash in DB field `resetPasswordToken` in User.
        // BUT using OTP collection:
        // Attempt to find the specific OTP record is hard if we only have the "token" which is hashed.
        // UNLESS we use a simple hash (SHA256) instead of bcrypt for lookup?
        // OR we change the flow: User enters Email + OTP code (like signup).

        // FIX: Let's assume the link includes the ID of the OTP record? No, that exposes DB IDs.

        // REVISED APPROACH:
        // Use User model fields `resetPasswordToken` and `resetPasswordExpire` for simplicity in this legacy component.
        // OR
        // Require Email + Token in the reset form.
        // The URL is usually `/reset-password/:token`.
        // If we want lookup, we store `resetToken` in DB.
        // Let's modify User model to have `resetPasswordToken` and `resetPasswordExpire`.
        // It's the standard way for MERN apps.

        // Wait, I cannot modify User model easily without migration risk? 
        // Actually, adding fields is fine in Mongoose.

        // LET'S STICK TO OTP COLLECTION BUT REQUIRE EMAIL.
        // The frontend page should verify the token?
        // Usually: user clicks link -> lands on page -> enters new password -> submits (token from URL, password).
        // Backend needs to find the user.
        // If we only have token, we need to be able to look it up.
        // Store `token` (plain or sha256) in `identifier` for a special purpose? No.

        // Let's revert to NON-BCRYPT hash for the token search.
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        // We need to store this SHA256 hash in the DB.
        // OTP model has `otpHash`.
        // Let's store the SHA256 hash in `otpHash`.
        // And when verifying, we hash the incoming token and search for it.

        const otpRecord = await OTP.findOne({
            purpose: 'PASSWORD_RESET',
            otpHash: resetPasswordToken,
            expiresAt: { $gt: Date.now() }
        });

        if (!otpRecord) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        const user = await User.findOne({ email: otpRecord.identifier });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Delete OTP
        await OTP.findByIdAndDelete(otpRecord._id);

        res.json({ success: true, data: 'Password updated' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;