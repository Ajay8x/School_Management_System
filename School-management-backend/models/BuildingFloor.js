const mongoose = require('mongoose');

const buildingFloorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide floor name'],
    trim: true
  },
  alias: {
    type: String,
    trim: true,
    default: ''
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingBlock',
    required: [true, 'Please select a block']
  },
  blockName: {
    type: String,
    trim: true,
    default: ''
  },
  floorNumber: {
    type: Number,
    default: 1
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

module.exports = mongoose.model('BuildingFloor', buildingFloorSchema);
