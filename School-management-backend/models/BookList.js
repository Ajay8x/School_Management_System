const mongoose = require('mongoose');

const bookListSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  type: {
    type: String,
    enum: ['Textbook', 'Reference Book', 'Workbook', 'Story Book', 'Notebook', 'Other'],
    default: 'Textbook'
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  publisher: {
    type: String,
    trim: true,
    default: 'PROVIDED IN THE SCHOOL'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('BookList', bookListSchema);
