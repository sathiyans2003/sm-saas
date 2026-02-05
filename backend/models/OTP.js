const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    identifier: {
        type: String, // Email or Phone Number
        required: true,
        index: true
    },
    purpose: {
        type: String, // 'SIGNUP', 'LOGIN_2FA', 'PASSWORD_RESET', 'VERIFY_CONTACT'
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    method: {
        type: String, // 'EMAIL', 'WHATSAPP', 'SMS'
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Auto-delete after expiry
    },
    contextData: {
        type: mongoose.Schema.Types.Mixed // For temporary storage during signup (e.g., hashed password)
    }
}, { timestamps: true });

module.exports = mongoose.model('OTP', OTPSchema);
