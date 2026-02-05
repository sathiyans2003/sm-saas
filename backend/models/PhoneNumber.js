const mongoose = require('mongoose');

const PhoneNumberSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    wabaId: {
        type: String,
        required: true
    },
    phoneNumberId: {
        type: String,
        required: true,
        unique: true
    },
    displayPhoneNumber: {
        type: String,
        required: true
    },
    verifiedName: {
        type: String,
        default: ''
    },
    qualityRating: {
        type: String, // GREEN, YELLOW, RED, UNKNOWN
        default: 'UNKNOWN'
    },
    messagingLimit: {
        type: String, // TIER_50, TIER_250, etc.
        default: 'TIER_250'
    },
    codeVerificationStatus: {
        type: String,
        default: 'NOT_VERIFIED'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    lastSyncedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('PhoneNumber', PhoneNumberSchema);
