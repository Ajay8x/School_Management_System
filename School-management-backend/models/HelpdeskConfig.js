const mongoose = require('mongoose');

const helpdeskConfigSchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  faqTitle: { type: String, default: '' },
  faqDescription: { type: String, default: '' },
  ticketPrefix: { type: String, default: 'HT' },
  ticketDigit: { type: Number, default: 3 },
  ticketSuffix: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('HelpdeskConfig', helpdeskConfigSchema);
