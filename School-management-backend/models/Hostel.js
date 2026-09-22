const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide hostel name'],
    trim: true
  },
  alias: {
    type: String,
    trim: true,
    default: ''
  },
  contactNumber: {
    type: String,
    trim: true,
    default: ''
  },
  contactEmail: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-Ed', 'Staff', 'Other'],
    default: 'Boys'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hostel', hostelSchema);
