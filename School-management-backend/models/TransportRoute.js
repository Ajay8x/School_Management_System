const mongoose = require('mongoose');

const routeStoppageSchema = new mongoose.Schema({
  stoppageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportStoppage'
  },
  stoppageName: {
    type: String,
    required: true,
    trim: true
  },
  pickupTime: {
    type: String,
    default: ''
  },
  dropTime: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 1
  }
}, { _id: false });

const transportRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide route name'],
    trim: true
  },
  routeType: {
    type: String,
    default: 'Round Trip',
    enum: ['Round Trip', 'One Way', 'Morning Pickup', 'Evening Drop']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  vehicleName: {
    type: String,
    trim: true,
    default: ''
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: ''
  },
  startTime: {
    type: String,
    default: '5:30 AM'
  },
  endTime: {
    type: String,
    default: '1:15 PM'
  },
  maxCapacity: {
    type: Number,
    default: 45
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  incharge: {
    type: String,
    trim: true,
    default: ''
  },
  inchargePhone: {
    type: String,
    trim: true,
    default: ''
  },
  stoppages: [routeStoppageSchema],
  circle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportCircle'
  },
  circleName: {
    type: String,
    trim: true,
    default: ''
  },
  feePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportFee'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive', 'Suspended']
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

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
