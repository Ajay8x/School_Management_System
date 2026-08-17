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
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  serialNumber: {
    type: String,
    unique: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


teacherSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
teacherSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Teacher', teacherSchema);
