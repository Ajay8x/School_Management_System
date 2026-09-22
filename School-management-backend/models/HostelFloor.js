const mongoose = require('mongoose');

const hostelFloorSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Please select a hostel']
  },
  hostelName: {
    type: String,
    trim: true,
    default: ''
  },
  name: {
    type: String,
    required: [true, 'Please provide floor name/number'],
    trim: true
  },
  floorNumber: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    trim: true,
    default: ''
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

module.exports = mongoose.model('HostelFloor', hostelFloorSchema);
