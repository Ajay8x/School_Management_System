const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  codeNumber: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  studentName: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  parentName: {
    type: String,
    default: ''
  },
  dateOfAdmission: {
    type: String,
    default: ''
  },
  admissionNumber: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    default: ''
  },
  section: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    default: 'Mess'
  },
  requestType: {
    type: String,
    enum: ['Opt In', 'Opt Out'],
    default: 'Opt In'
  },
  description: {
    type: String,
    default: ''
  },
  attachment: {
    fileName: String,
    fileSize: String,
    url: String
  },
  status: {
    type: String,
    enum: ['Approved', 'Requested', 'Rejected', 'Pending'],
    default: 'Requested'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }
}, { timestamps: true });

serviceRequestSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
