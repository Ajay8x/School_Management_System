const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  shortCode: {
    type: String,
    trim: true
  },
  program: {
    type: String,
    trim: true,
    default: 'Senior Secondary'
  },
  programSub: {
    type: String,
    trim: true,
    default: '-'
  },
  incharge: {
    type: String,
    trim: true,
    default: '-'
  },
  description: {
    type: String,
    trim: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Division', divisionSchema);
