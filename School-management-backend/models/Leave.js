const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: String, required: true }, reason: { type: String }, status: { type: String, default: 'Pending' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', leaveSchema);
