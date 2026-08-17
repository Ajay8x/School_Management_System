const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: String, required: true }, reason: { type: String }, status: { type: String, default: 'Pending' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


leaveSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
leaveSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Leave', leaveSchema);
