// E:\zacx\backend\models\User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    facebook: {
        connected: { type: Boolean, default: false },
        userID: String, // Store FB User ID
        userAccessToken: String, // For WABA Management
        pageAccessToken: String, // For Page Management
        pageId: String,
        pageName: String
    },
    // New Profile Fields
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    whatsappNumber: { type: String, default: '' },
    whatsappVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    profile_image: { type: String, default: '' }, // Single Source of Truth
    avatar: { type: String, default: '' }, // Deprecated, keeping for backward compatibility if needed
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);