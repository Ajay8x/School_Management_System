const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, type: { type: String }, dateIssued: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
