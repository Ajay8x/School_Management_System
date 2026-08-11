const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true }, date: { type: Date }, location: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
