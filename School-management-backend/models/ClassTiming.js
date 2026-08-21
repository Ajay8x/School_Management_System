const mongoose = require('mongoose');

const sessionItemSchema = new mongoose.Schema({
  session: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  isBreak: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  endTime: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });

const classTimingSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  sessionName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sessions: [sessionItemSchema],
  totalDurationText: {
    type: String,
    trim: true
  },
  timeRangeText: {
    type: String,
    trim: true
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  breakCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClassTiming', classTimingSchema);
