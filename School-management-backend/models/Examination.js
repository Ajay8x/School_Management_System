const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  name: { type: String, required: true }, date: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Examination', examinationSchema);
