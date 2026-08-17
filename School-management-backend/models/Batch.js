const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    default: '',
    trim: true
  },
  shortCode: {
    type: String,
    default: '',
    trim: true
  },
  maxStrength: {
    type: Number,
    default: 45
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  rollPrefix: {
    type: String,
    default: '',
    trim: true
  },
  paymentAccount: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  incharge: {
    type: String,
    default: '-'
  },
  inchargeDates: {
    type: String,
    default: ''
  },
  subjects: [{
    name: { type: String, required: true },
    code: { type: String, default: '' },
    isElective: { type: Boolean, default: false },
    hasGrading: { type: Boolean, default: false },
    hasNoExam: { type: Boolean, default: false }
  }],
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
