const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // One health record per student
  },
  bloodGroup: { type: String },
  height: { type: String }, // e.g. "160 cm"
  weight: { type: String }, // e.g. "55 kg"
  allergies: { type: [String], default: [] },
  medicalConditions: { type: [String], default: [] },
  vaccinations: [{
    name: String,
    date: Date,
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' }
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
