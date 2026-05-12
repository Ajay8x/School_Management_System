const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create student + auto-create login account
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res) => {
  try {
    const { password, ...studentData } = req.body;

    // 1. Create the student record
    const student = await Student.create(studentData);

    // 2. Auto-create a User account so the student can login
    const loginPassword = password || student.rollNumber; // default password = rollNumber
    
    // Ensure we have a unique email for the User model
    let loginEmail = (student.email && student.email.trim()) || `${student.rollNumber}@campuspilot.local`;
    
    // Check if a user with this email already exists
    const existingUserByEmail = await User.findOne({ email: loginEmail });
    if (existingUserByEmail) {
      // If email is taken, fall back to rollNumber based email to avoid crash
      loginEmail = `${student.rollNumber}-${Date.now()}@campuspilot.local`;
    }

    await User.create({
      name: student.name || student.firstName || student.rollNumber,
      email: loginEmail,
      password: loginPassword,
      role: 'student',
      studentId: student._id,
    });

    res.status(201).json({ ...student.toObject(), loginEmail, defaultPassword: !password });
  } catch (error) {
    console.error('Student Creation Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    console.log(`Backend: Delete requested by user with role: ${req.user.role}`);
    console.log('Backend: Attempting to delete student with ID:', req.params.id);
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      console.log('Backend: Student not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log('Backend: Student deleted successfully:', req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error('Backend Delete Error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Bulk update roll numbers
// @route   POST /api/students/roll-numbers
// @access  Private (Admin)
exports.updateRollNumbers = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, rollNumber }
    
    const results = await Promise.all(
      updates.map(u => 
        Student.findByIdAndUpdate(u.id, { rollNumber: u.rollNumber }, { new: true })
      )
    );
    
    res.json({ message: 'Roll numbers updated successfully', results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
