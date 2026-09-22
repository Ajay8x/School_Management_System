const mongoose = require('mongoose');

const buildingBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide block name'],
    trim: true
  },
  alias: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BuildingBlock', buildingBlockSchema);
