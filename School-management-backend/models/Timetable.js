const mongoose = require('mongoose');

const periodAllocationSchema = new mongoose.Schema({
  periodName: {
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
    trim: true
  },
  endTime: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true,
    default: ''
  },
  teacher: {
    type: String,
    trim: true,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, { _id: true });

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  classTiming: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassTiming'
  },
  classTimingName: {
    type: String,
    trim: true
  },
  allocations: [periodAllocationSchema]
}, { _id: true });

const timetableSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    trim: true,
    default: ''
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  daySchedules: [dayScheduleSchema],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
