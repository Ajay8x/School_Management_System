const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true }, receiverId: { type: String, required: true }, content: { type: String },
  createdAt: { type: Date, default: Date.now }
});


messageSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
messageSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Message', messageSchema);
