const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    default: ''
  },
  isPaymentGateway: {
    type: Boolean,
    default: false
  },
  hasInstrumentNumber: {
    type: Boolean,
    default: false
  },
  hasInstrumentDate: {
    type: Boolean,
    default: false
  },
  hasClearingDate: {
    type: Boolean,
    default: false
  },
  hasBankDetail: {
    type: Boolean,
    default: false
  },
  hasBranchDetail: {
    type: Boolean,
    default: false
  },
  hasReferenceNumber: {
    type: Boolean,
    default: false
  },
  hasCardProvider: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
