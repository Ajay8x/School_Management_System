const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a class name'] },
  section: { type: String, required: [true, 'Please add a section'] },
  roomNumber: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  studentsCount: { type: Number, default: 0 },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdAt: { type: Date, default: Date.now }
});


classSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
classSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Class', classSchema);
