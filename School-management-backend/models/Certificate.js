const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, type: { type: String }, dateIssued: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});


certificateSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
certificateSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Certificate', certificateSchema);
