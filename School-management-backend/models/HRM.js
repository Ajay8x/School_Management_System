const mongoose = require('mongoose');

const hrmSchema = new mongoose.Schema({
  employeeName: { type: String, required: true }, position: { type: String }, salary: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HRM', hrmSchema);
