const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide vehicle name'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    trim: true
  },
  registrationPlace: {
    type: String,
    trim: true,
    default: ''
  },
  registrationDate: {
    type: Date,
    default: null
  },
  type: {
    type: String,
    default: 'Bus',
    enum: ['Bus', 'Mini Bus', 'Van', 'Auto', 'Car', 'Cruiser', 'Other']
  },
  engineNumber: {
    type: String,
    trim: true,
    default: ''
  },
  chassisNumber: {
    type: String,
    trim: true,
    default: ''
  },
  cubicCapacity: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    trim: true,
    default: ''
  },
  modelNumber: {
    type: String,
    trim: true,
    default: ''
  },
  make: {
    type: String,
    trim: true,
    default: ''
  },
  vehicleClass: {
    type: String,
    trim: true,
    default: ''
  },
  seatingCapacity: {
    type: Number,
    default: 40
  },
  maxSeatingAllowed: {
    type: Number,
    default: 45
  },
  fuelType: {
    type: String,
    default: 'Diesel',
    enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid']
  },
  fuelCapacity: {
    type: String,
    trim: true,
    default: ''
  },
  // Owner Info
  ownership: {
    type: String,
    default: 'School Owned',
    enum: ['School Owned', 'Rented', 'Leased', 'Contract', 'Private']
  },
  ownershipDate: {
    type: Date,
    default: null
  },
  ownerName: {
    type: String,
    trim: true,
    default: ''
  },
  ownerPhone: {
    type: String,
    trim: true,
    default: ''
  },
  ownerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  ownerAddress: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive', 'Under Maintenance']
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

module.exports = mongoose.model('Vehicle', vehicleSchema);
