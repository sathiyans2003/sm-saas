const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },

  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],

  importId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImportHistory',
    default: null
  },

  // Dynamic fields for CRM
  custom_fields: {
    type: Map,
    of: String,
    default: {}
  },

  source: {
    type: String, // e.g., 'API', 'Import', 'WhatsApp Inbound'
    default: 'Manual'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', ContactSchema);
