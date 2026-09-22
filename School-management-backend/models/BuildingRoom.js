const mongoose = require('mongoose');

const buildingRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide room name or number'],
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
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingFloor'
  },
  floorName: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['Classroom', 'Laboratory', 'Staff Room', 'Office', 'Library', 'Store Room', 'Hall', 'Other'],
    default: 'Classroom'
  },
  capacity: {
    type: Number,
    default: 40
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

module.exports = mongoose.model('BuildingRoom', buildingRoomSchema);
