const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#10b981' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TicketCategory', ticketCategorySchema);
