const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  schoolName: { type: String }, logoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
