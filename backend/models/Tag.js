const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    required: true
  },
  color: {
    type: String,
    default: '#6c757d'
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  }
}, { timestamps: true });

// Ensure tag names are unique ONLY within a workspace
TagSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);
