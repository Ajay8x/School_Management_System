const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a class name'] },
  section: { type: String, required: [true, 'Please add a section'] },
  roomNumber: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  studentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
