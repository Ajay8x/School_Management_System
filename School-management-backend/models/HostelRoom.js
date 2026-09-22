const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema({
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
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelFloor'
  },
  floorName: {
    type: String,
    trim: true,
    default: ''
  },
  roomNumber: {
    type: String,
    required: [true, 'Please provide room number or name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['AC', 'Non-AC', 'Deluxe', 'Dormitory', 'Single', 'Double', 'Triple', 'Other'],
    default: 'Non-AC'
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
    default: 2
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  costPerBed: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Available', 'Full', 'Maintenance', 'Inactive'],
    default: 'Available'
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

module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
