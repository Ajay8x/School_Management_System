const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private (Admin)
exports.createTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    
    // Generate serial number
    const count = await Teacher.countDocuments();
    const serialNumber = `TCH-${1001 + count}`;
    teacherData.serialNumber = serialNumber;

    // Check if a user with this email already exists
    const existingUserByEmail = await User.findOne({ email: teacherData.email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already in use by another user' });
    }

    const teacher = await Teacher.create(teacherData);

    // Auto-create a User account so the teacher can login
    await User.create({
      name: teacher.name,
      email: teacher.email,
      password: serialNumber, // default password
      role: 'teacher',
      serialNumber: serialNumber
    });

    res.status(201).json({ ...teacher.toObject(), serialNumber, defaultPassword: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await teacher.deleteOne();
    res.json({ message: 'Teacher removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
