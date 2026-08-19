const mongoose = require('mongoose');

const studentConfigOptionSchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  type: {
    type: String,
    required: true,
    enum: [
      'registration-stage',
      'enrollment-type',
      'enrollment-status',
      'dialogue-category',
      'document-type',
      'attendance-type',
      'house',
      'leave-category',
      'transfer-reason',
      'student-group'
    ],
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  description: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  subType: {
    type: String,
    default: ''
  },
  hasNumber: {
    type: Boolean,
    default: false
  },
  hasExpiryDate: {
    type: Boolean,
    default: false
  },
  isRequired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentConfigOption', studentConfigOptionSchema);
