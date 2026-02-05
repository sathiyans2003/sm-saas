const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    lastMessage: { type: String, default: '' },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'PENDING'],
        default: 'OPEN'
    },

    assigned_agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

// Index for sorting
ConversationSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
