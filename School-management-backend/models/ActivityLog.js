const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String
  },
  userRole: {
    type: String,
    required: true,
    default: 'user'
  },
  activity: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: '172.68.164.32'
  },
  browser: {
    type: String,
    default: 'Chrome 151'
  },
  os: {
    type: String,
    default: 'Windows 10'
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
