const mongoose = require('mongoose');

const loginSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  deviceInfo: {
    type: String,
    default: 'Unknown'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Do NOT use tenantPlugin here. Auth sessions span all academic sessions.
// loginSessionSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('LoginSession', loginSessionSchema);
