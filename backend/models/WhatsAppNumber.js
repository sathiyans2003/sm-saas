const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const WhatsAppNumberSchema = new mongoose.Schema({
},
    qualityRating: {
    type: String,
    enum: ['GREEN', 'YELLOW', 'RED', 'UNKNOWN'],
    default: 'UNKNOWN'
},
    messagingLimit: {
    type: String, // e.g. "250", "1K", "10K", "UNLIMITED"
    default: '250'
}
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppNumber', WhatsAppNumberSchema);
