const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  priority: {
    type: String,
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'],
    default: 'Open'
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
