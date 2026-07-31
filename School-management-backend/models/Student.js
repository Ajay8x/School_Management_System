const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  relation: { type: String, required: true }
});

const studentSchema = new mongoose.Schema({
  // Keep 'name' for backward compatibility - auto-generated from firstName + middleName + lastName
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  rollNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  className: {
    type: String,
    required: [true, 'Please add a class']
  },
  // Keep 'parentName' for backward compatibility
  parentName: {
    type: String,
    required: [true, 'Please add parent name']
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number']
  },
  address: {
    type: String
  },
  // New fields
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  dateOfBirth: {
    type: Date
  },
  period: {
    type: String
  },
  course: {
    type: String
  },
  enrollmentType: {
    type: String,
    enum: ['New', 'Transfer', 'Re-admission'],
    default: 'New'
  },
  dateOfRegistration: {
    type: Date,
    default: Date.now
  },
  studentType: {
    type: String,
    enum: ['New Student', 'Existing Student'],
    default: 'New Student'
  },
  guardians: [guardianSchema],
  bloodGroup: { type: String },
  religion: { type: String },
  nationality: { type: String, default: 'Indian' },
  category: { type: String },
  aadharNumber: { type: String },
  email: { 
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  serialNumber: {
    type: String,
    unique: true
  },
  avatar: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate 'name' and 'parentName' before validation
studentSchema.pre('validate', function() {
  if (this.firstName) {
    this.name = [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
  }
  if (!this.parentName && this.guardians && this.guardians.length > 0) {
    this.parentName = this.guardians[0].name;
  }
  if (!this.rollNumber) {
    this.rollNumber = undefined;
  }
});

module.exports = mongoose.model('Student', studentSchema);
