const mongoose = require('mongoose');

const courseInchargeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  course: {
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
    trim: true,
    default: 'ESM001'
  },
  period: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseIncharge', courseInchargeSchema);
