const mongoose = require('mongoose');

const MessageLogSchema = new mongoose.Schema({
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    broadcastId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Broadcast'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    direction: {
        type: String,
        enum: ['INBOUND', 'OUTBOUND'],
        required: true
    },
    type: {
        type: String, // TEXT, TEMPLATE, IMAGE, etc.
        default: 'TEXT'
    },
    content: String, // Or structure for template
    status: {
        type: String,
        enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
        default: 'SENT'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MessageLog', MessageLogSchema);
