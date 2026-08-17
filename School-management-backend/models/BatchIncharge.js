const mongoose = require('mongoose');

const batchInchargeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  employee: {
    type: String,
    required: true,
    trim: true
  },
  employeeCode: {
    type: String,
    default: 'ESM001'
  },
  period: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BatchIncharge', batchInchargeSchema);
