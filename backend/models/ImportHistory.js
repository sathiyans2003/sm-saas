const mongoose = require('mongoose');

const ImportHistorySchema = new mongoose.Schema({
    filename: { type: String, required: true },
    count: { type: Number, default: 0 },
    status: { type: String, default: 'Completed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImportHistory', ImportHistorySchema);
