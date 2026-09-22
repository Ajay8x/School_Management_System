const mongoose = require('mongoose');

const hostelAllocationSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  hostelName: {
    type: String,
    trim: true,
    default: ''
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelRoom',
    required: [true, 'Please select a room']
  },
  roomName: {
    type: String,
    trim: true,
    default: ''
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please select a student']
  },
  studentName: {
    type: String,
    trim: true,
    default: ''
  },
  studentRoll: {
    type: String,
    trim: true,
    default: ''
  },
  studentClass: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Allocated', 'Active', 'Vacated', 'Transferred'],
    default: 'Active'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  feeAmount: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('HostelAllocation', hostelAllocationSchema);
