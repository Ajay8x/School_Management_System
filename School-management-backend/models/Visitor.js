const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  purpose: { type: String, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  idNumber: { type: String }, // ID Proof
  visitTo: { type: String }, // Person being visited
  inTime: { type: Date, default: Date.now },
  outTime: { type: Date },
  date: { type: Date, default: Date.now },
  note: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


visitorSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
visitorSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Visitor', visitorSchema);
