const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'employee', 'guardian', 'other'], default: 'student' },
  rollNo: { type: String, default: '' },
  className: { type: String, default: '' },
  batchName: { type: String, default: '' },
  departmentName: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Waived', 'Refunded'], default: 'Paid' },
  feeAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  paymentDate: { type: Date, default: Date.now },
  consentReceived: { type: Boolean, default: true },
  registeredAt: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
}, { _id: true });

const tripSchema = new mongoose.Schema({
  tripType: { 
    type: String, 
    enum: [
      'Educational Trip', 
      'Excursion Trip', 
      'Field Visit', 
      'Historical Tour', 
      'Industrial Visit', 
      'Adventure Camp', 
      'Sports Tour', 
      'Science & Nature Exploration', 
      'Cultural Exchange',
      'Other'
    ], 
    default: 'Educational Trip',
    required: true 
  },
  title: { type: String, required: true, trim: true },
  destination: { type: String, default: '', trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  fee: { type: Number, default: 0 },
  audience: [{ type: String, trim: true }], // e.g., 'Batch Wise Student', 'Department Wise Employee', 'All Students'
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  batchNames: [{ type: String }],
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  departmentNames: [{ type: String }],
  incharge: { type: String, default: '' },
  inchargeContact: { type: String, default: '' },
  maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
  description: { type: String, default: '' },
  itinerary: { type: String, default: '' },
  guidelines: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  },
  participants: [participantSchema],
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tripSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// tripSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Trip', tripSchema);
