const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who did it
    actorName: { type: String }, // Snapshot of name in case user is deleted
    action: { type: String, required: true, index: true }, // e.g., 'LOGIN', 'BROADCAST_SEND', 'SETTINGS_UPDATE'
    targetResouce: { type: String }, // e.g., 'Broadcast', 'Contact'
    targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the resource affected
    details: { type: mongoose.Schema.Types.Mixed }, // Structured changes or metadata
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' },
    createdAt: { type: Date, default: Date.now, expires: '90d' } // Auto-delete logs after 90 days
});

// Index for getting recent logs for a workspace
AuditLogSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
