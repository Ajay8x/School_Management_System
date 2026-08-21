const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNo: { type: String, required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },
  templateName: { type: String, required: true },
  applicableFor: { type: String, enum: ['Student', 'Staff', 'Other'], default: 'Student' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  toName: { type: String, required: true },
  toCode: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  isDuplicate: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  customData: {
    fatherName: { type: String, default: '' },
    className: { type: String, default: '' },
    section: { type: String, default: '' },
    rollNo: { type: String, default: '' },
    dob: { type: String, default: '' },
    conduct: { type: String, default: 'Good' },
    reason: { type: String, default: '' },
    remarks: { type: String, default: '' }
  },
  createdBy: { type: String, default: '-' },
  createdAt: { type: Date, default: Date.now }
});

certificateSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
certificateSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Certificate', certificateSchema);
