const mongoose = require('mongoose');

const hrmSchema = new mongoose.Schema({
  employeeName: { type: String, required: true }, position: { type: String }, salary: { type: Number },
  createdAt: { type: Date, default: Date.now }
});


hrmSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
hrmSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('HRM', hrmSchema);
