const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  purpose: { type: String, enum: ['Admission', 'General', 'Feedback'], default: 'Admission' },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  date: { type: Date, default: Date.now },
  description: { type: String },
  source: { type: String }, // e.g. Social Media, Website, Walk-in
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  status: { type: String, enum: ['Pending', 'Follow-up', 'Resolved'], default: 'Pending' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


enquirySchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
enquirySchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Enquiry', enquirySchema);
