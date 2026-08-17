const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['event', 'holiday', 'celebration'], 
    default: 'event' 
  },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, default: '' },
  targetAudience: { 
    type: String, 
    enum: ['all', 'students', 'teachers', 'parents'], 
    default: 'all' 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  organizer: { type: String, default: '' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});


eventSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
eventSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Event', eventSchema);

