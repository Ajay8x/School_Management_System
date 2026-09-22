const mongoose = require('mongoose');

const stoppageFeeSchema = new mongoose.Schema({
  stoppageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportStoppage'
  },
  stoppageName: {
    type: String,
    required: true,
    trim: true
  },
  arrivalAmount: {
    type: Number,
    default: 0
  },
  departureAmount: {
    type: Number,
    default: 0
  },
  roundtripAmount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const transportFeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide transport fee plan name'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  stoppageFees: [stoppageFeeSchema],
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

module.exports = mongoose.model('TransportFee', transportFeeSchema);
