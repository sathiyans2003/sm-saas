const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
    name: { type: String, default: 'My Workspace' },
    timezone: { type: String, default: 'UTC' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, default: 'Editor' }, // Admin, Editor, Viewer
        status: { type: String, default: 'Active' }
    }],
    apiKeys: [{
        key: String,
        label: String,
        createdAt: { type: Date, default: Date.now },
        lastUsed: Date
    }],
    plan: {
        type: { type: String, default: 'free' },
        status: { type: String, default: 'active' } // active, whatever
    },
    integrations: {
        slack: { enabled: Boolean },
        zapier: { enabled: Boolean }
    },
    whatsapp: {
        connected: { type: Boolean, default: false },
        wabaId: String,
        phoneNumberId: String,
        displayPhone: String,
        accessToken: String
    }
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
