const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
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
  alias: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  incharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  inchargeName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
