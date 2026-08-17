const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: String,
    trim: true
  },
  division: {
    type: String,
    trim: true,
    default: 'Senior Secondary'
  },
  divisionSub: {
    type: String,
    trim: true,
    default: 'Senior Secondary'
  },
  code: {
    type: String,
    trim: true
  },
  shortCode: {
    type: String,
    trim: true
  },
  paymentAccount: {
    type: String,
    trim: true
  },
  feeAmount: {
    type: Number,
    default: 100
  },
  incharge: {
    type: String,
    trim: true,
    default: '-'
  },
  inchargeDates: {
    type: String,
    trim: true
  },
  batches: [{
    type: String
  }],
  subjects: [{
    type: String
  }],
  registration: {
    type: Boolean,
    default: true
  },
  batchSameSubject: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Course', courseSchema);
