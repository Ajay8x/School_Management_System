const User = require('../models/User');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all users with their roles
// @route   GET /api/users
// @access  Private/SuperAdmin-Admin
exports.getUsers = async (req, res) => {
  try {
    const { schoolId } = req.query;
    const filter = {};
    if (schoolId) {
      filter.schoolId = schoolId;
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent changing your own role if you are the only super admin
      if (req.user._id.toString() === user._id.toString() && user.role === 'super-admin' && req.body.role !== 'super-admin') {
        const superAdminCount = await User.countDocuments({ role: 'super-admin' });
        if (superAdminCount <= 1) {
          return res.status(400).json({ message: 'Cannot demote the last super admin' });
        }
      }

      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      await logActivity({ req, user: req.user, activity: `Updated user role for ${updatedUser.name} to ${updatedUser.role}` });
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'super-admin') {
        const superAdminCount = await User.countDocuments({ role: 'super-admin' });
        if (superAdminCount <= 1) {
          return res.status(400).json({ message: 'Cannot delete the last super admin' });
        }
      }
      
      await User.deleteOne({ _id: user._id });
      await logActivity({ req, user: req.user, activity: `Deleted user: ${user.name}` });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with their credentials (email and serial number)
// @route   GET /api/users/credentials
// @access  Private/SuperAdmin
exports.getUserCredentials = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role serialNumber createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset user password to default (serial number)
// @route   PUT /api/users/:id/reset-password
// @access  Private/SuperAdmin
exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set password to serialNumber or default password (123456)
    const defaultPassword = user.serialNumber || process.env.DEFAULT_PASSWORD || '123456';
    user.password = defaultPassword;
    await user.save();
    await logActivity({ req, user: req.user, activity: `Reset password for user: ${user.name}` });

    res.json({ message: `Password reset to default (${defaultPassword}) successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
