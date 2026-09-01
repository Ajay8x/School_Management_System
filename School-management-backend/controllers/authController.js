const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const LoginSession = require('../models/LoginSession');
const SessionTimeout = require('../models/SessionTimeout');
const { logActivity } = require('../utils/logActivity');

// Generate JWT and Session
const createSessionAndToken = async (req, user) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  const deviceInfo = req.headers['user-agent'] || 'Unknown';
  
  const loginSession = await LoginSession.create({
    user: user._id,
    ipAddress,
    deviceInfo
  });

  let expiresIn = '30d'; // default
  try {
    const timeoutConfig = await SessionTimeout.findOne({ role: user.role });
    if (timeoutConfig && timeoutConfig.durationMinutes) {
      expiresIn = `${timeoutConfig.durationMinutes}m`;
    }
  } catch (err) {
    console.error('Error fetching session timeout config:', err);
  }

  const token = jwt.sign({ id: user._id, sessionId: loginSession._id }, process.env.JWT_SECRET, {
    expiresIn
  });
  return token;
};

// @desc    Register a new user (Admin can create others, or open registration for first admin)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, schoolId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student', // Default to student if not specified
      schoolId: schoolId || null
    });

    if (user) {
      await logActivity({
        req,
        user,
        activity: `Registered new user: ${user.name}`
      });

      const token = await createSessionAndToken(req, user);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        schoolId: user.schoolId,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email, explicitly select password since it's select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      await logActivity({
        req,
        user,
        activity: 'User logged in.'
      });

      const token = await createSessionAndToken(req, user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Log out user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res) => {
  try {
    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: 'User logged out.'
      });
      
      // Mark session as inactive
      if (req.sessionId) {
        await LoginSession.findByIdAndUpdate(req.sessionId, { isActive: false });
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set in the authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update last activity for session
    if (req.sessionId) {
      await LoginSession.findByIdAndUpdate(req.sessionId, { lastActivity: Date.now() });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a student by Roll Number + Password
// @route   POST /api/auth/student-login
// @access  Public
exports.studentLogin = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: 'Please provide roll number and password' });
    }

    // Find the student record by rollNumber (Case-insensitive)
    const student = await Student.findOne({ 
      rollNumber: { $regex: new RegExp(`^${rollNumber.trim()}$`, 'i') } 
    });
    if (!student) {
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }

    // Find the linked User account (by studentId reference)
    const user = await User.findOne({ studentId: student._id, role: 'student' }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'No login account found for this student. Contact administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }

    await logActivity({
      req,
      user,
      activity: 'User logged in.'
    });

    const token = await createSessionAndToken(req, user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: student.rollNumber,
      className: student.className,
      studentId: student._id,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      req,
      user,
      activity: 'Changed password'
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

