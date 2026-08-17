const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  registration: {
    type: Boolean,
    default: true
  },
  session: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isExamLocked: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);
