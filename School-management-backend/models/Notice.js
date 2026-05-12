const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please add a title'] 
  },
  content: { 
    type: String, 
    required: [true, 'Please add notice content'] 
  },
  category: { 
    type: String, 
    enum: ['General', 'Urgent', 'Holiday', 'Event', 'Academic'], 
    default: 'General' 
  },
  postedBy: { 
    type: String,
    default: 'School Administration'
  },
  targetAudience: { 
    type: String, 
    enum: ['All', 'Students', 'Teachers', 'Parents'], 
    default: 'All' 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notice', noticeSchema);
