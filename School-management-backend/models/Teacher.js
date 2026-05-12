const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  employeeId: {
    type: String,
    required: [true, 'Please add an employee ID'],
    unique: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number']
  },
  salary: {
    type: Number,
    required: [true, 'Please add salary']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Teacher', teacherSchema);
