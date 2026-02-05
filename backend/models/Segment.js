const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    criteria: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }, // Stores filter logic e.g. { tags: [], city: 'Chennai' }
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', SegmentSchema);
