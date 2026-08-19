const mongoose = require('mongoose');

const ticketPrioritySchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#f59e0b' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TicketPriority', ticketPrioritySchema);
