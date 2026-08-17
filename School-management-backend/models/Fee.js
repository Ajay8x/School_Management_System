const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: [true, 'Please associate a student'] 
  },
  feeType: { 
    type: String, 
    required: [true, 'Please specify fee type'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Please specify total amount'] 
  },
  paidAmount: { 
    type: Number, 
    default: 0 
  },
  dueDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Partial', 'Paid'], 
    default: 'Pending' 
  },
  paymentMethod: { 
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'],
    default: 'Cash'
  },
  transactionId: { 
    type: String 
  },
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


feeSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
feeSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Fee', feeSchema);
