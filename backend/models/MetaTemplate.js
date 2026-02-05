const mongoose = require('mongoose');

const MetaTemplateSchema = new mongoose.Schema({
    metaId: { type: String, unique: true }, // Meta's ID
    wabaId: { type: String, required: true }, // WABA ID this template belongs to
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    category: String, // MARKETING, UTILITY, AUTHENTICATION
    language: String, // en_US, ta_IN
    status: String, // APPROVED, REJECTED, PENDING
    components: Array, // Header, Body, Footer structure
    lastSyncedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MetaTemplate', MetaTemplateSchema);
