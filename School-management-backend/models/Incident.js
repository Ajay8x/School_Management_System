const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please select an incident category'],
    trim: true,
    default: 'Behavioral'
  },
  title: {
    type: String,
    required: [true, 'Please provide an incident title'],
    trim: true
  },
  nature: {
    type: String,
    enum: ['Minor', 'Moderate', 'Major', 'Severe', 'Critical'],
    default: 'Minor'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  date: {
    type: Date,
    default: Date.now
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
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
  reportedBy: {
    type: String,
    trim: true,
    default: 'School Administration'
  },
  reportedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: [true, 'Please provide an incident description'],
    default: ''
  },
  action: {
    type: String,
    default: ''
  },
  actionStatus: {
    type: String,
    enum: ['Pending', 'Under Investigation', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  attachments: [
    {
      name: { type: String, default: '' },
      url: { type: String, default: '' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
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

module.exports = mongoose.model('Incident', incidentSchema);
