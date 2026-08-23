const mongoose = require('mongoose');

const editRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  studentName: {
    type: String,
    required: true
  },
  contact: {
    type: String
  },
  fatherName: {
    type: String
  },
  motherName: {
    type: String
  },
  parentName: {
    type: String
  },
  dateOfAdmission: {
    type: String
  },
  admissionNumber: {
    type: String,
    required: true
  },
  course: {
    type: String
  },
  section: {
    type: String
  },
  birthDate: {
    type: String
  },
  requestBy: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  status: {
    type: String,
    enum: ['Approved', 'Rejected', 'Pending'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  attachment: {
    fileName: String,
    fileSize: String,
    url: String
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

editRequestSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('EditRequest', editRequestSchema);
