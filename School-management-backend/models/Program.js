const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  type: {
    type: String,
    default: 'K-12',
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  shortCode: {
    type: String,
    trim: true
  },
  alias: {
    type: String,
    trim: true
  },
  enableRegistration: {
    type: Boolean,
    default: true
  },
  duration: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  benefits: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  incharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  inchargeName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });


programSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
programSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Program', programSchema);
