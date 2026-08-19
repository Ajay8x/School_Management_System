const mongoose = require('mongoose');

const faqCategorySchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#3b82f6' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('FAQCategory', faqCategorySchema);
