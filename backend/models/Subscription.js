const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    startDate: Date,
    endDate: Date,
    paymentId: String,
    status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Subscription', subSchema);
