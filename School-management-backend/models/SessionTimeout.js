const mongoose = require('mongoose');

const sessionTimeoutSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 43200 // Default 30 days in minutes
  }
}, { timestamps: true });

// Do NOT use tenantPlugin here. Timeout config spans all academic sessions.
// sessionTimeoutSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('SessionTimeout', sessionTimeoutSchema);
