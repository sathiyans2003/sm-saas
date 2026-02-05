const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: String,          // Starter, Pro, Agency
    price: Number,         // monthly price
    duration: Number,      // days (30)
    features: [String]
});

module.exports = mongoose.model('Plan', planSchema);
