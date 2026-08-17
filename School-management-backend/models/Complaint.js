const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintType: { type: String, required: true },
  source: { type: String },
  complainantName: { type: String, required: true },
  contact: { type: String },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  actionTaken: { type: String },
  assignedTo: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


complaintSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
complaintSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Complaint', complaintSchema);
