const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please add a transaction title'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Please add an amount'] 
  },
  type: { 
    type: String, 
    enum: ['Income', 'Expense'], 
    required: [true, 'Please specify transaction type'] 
  },
  category: {
    type: String,
    enum: ['Fee Payment', 'Salary', 'Infrastructure', 'Utilities', 'Maintenance', 'Library', 'Events', 'Other'],
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'],
    default: 'Cash'
  },
  description: { type: String },
  date: { 
    type: Date, 
    default: Date.now 
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Account', accountSchema);
