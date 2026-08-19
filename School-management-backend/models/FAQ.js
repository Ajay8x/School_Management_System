const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true, 
    default: 'General' 
  },
  tag: { 
    type: String, 
    trim: true 
  },
  answer: { 
    type: String, 
    required: true 
  },
  publish: { 
    type: Boolean, 
    default: true 
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

module.exports = mongoose.model('FAQ', faqSchema);
