const mongoose = require('mongoose');

const transportStoppageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide stoppage name'],
    trim: true
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

module.exports = mongoose.model('TransportStoppage', transportStoppageSchema);
