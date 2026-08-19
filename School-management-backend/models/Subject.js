const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  alias: {
    type: String,
    trim: true,
    default: ''
  },
  code: {
    type: String,
    trim: true,
    default: ''
  },
  shortCode: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Both', 'Extra Curricular'],
    default: 'Theory'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
