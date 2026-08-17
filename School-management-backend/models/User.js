const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 3,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: [
      'super-admin', 'admin', 'accountant', 'librarian',
      'attendance-assistant', 'exam-incharge', 'guardian', 'hostel-incharge', 
      'inventory-incharge', 'manager', 'mess-incharge', 'observer', 'principal', 
      'receptionist', 'staff', 'transport-incharge', 'user', 'vice-principal', 'student'
    ],
    default: 'student'
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Link to Student document (for student role users)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
