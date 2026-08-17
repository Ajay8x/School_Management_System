const mongoose = require('mongoose');

const enrollmentSeatSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentType: {
    type: String,
    required: true,
    enum: ['Regular', 'Private', 'Distance'],
    default: 'Regular'
  },
  usedSeat: {
    type: Number,
    default: 0
  },
  maxSeat: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EnrollmentSeat', enrollmentSeatSchema);
