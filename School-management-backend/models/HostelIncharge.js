const mongoose = require('mongoose');

const hostelInchargeSchema = new mongoose.Schema({
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
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  employeeName: {
    type: String,
    required: [true, 'Please provide employee name'],
    trim: true
  },
  employeePhone: {
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
    enum: ['Present', 'Former', 'On Leave'],
    default: 'Present'
  },
  remarks: {
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

module.exports = mongoose.model('HostelIncharge', hostelInchargeSchema);
