const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  bookName: { type: String, required: true }, author: { type: String }, status: { type: String, enum: ['Available', 'Issued'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});


librarySchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
librarySchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Library', librarySchema);
