const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  className: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


attendanceSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
attendanceSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Attendance', attendanceSchema);
