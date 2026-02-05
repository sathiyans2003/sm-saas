const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
    name: { type: String, required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },

    // Audience
    audienceType: { type: String, enum: ['ALL', 'TAG', 'CUSTOM'], default: 'ALL' },
    audienceTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    targetCount: { type: Number, default: 0 },

    // Template
    templateName: String,
    templateCategory: { type: String, enum: ['Marketing', 'Utility', 'Authentication'], default: 'Marketing' },
    messageBody: String,

    // Financials
    cost: { type: Number, default: 0 }, // Total cost for this broadcast

    // Stats
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['Scheduled', 'Sent', 'Processing', 'Stopped', 'Draft'],
        default: 'Processing'
    },

    scheduledAt: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Broadcast', BroadcastSchema);
