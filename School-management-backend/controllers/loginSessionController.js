const LoginSession = require('../models/LoginSession');
const SessionTimeout = require('../models/SessionTimeout');

// @desc    Get all active login sessions (Admin) or user's own sessions
// @route   GET /api/login-sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    let filter = { isActive: true };
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      filter.user = req.user._id;
    }

    const sessions = await LoginSession.find(filter)
      .populate('user', 'name email role')
      .sort({ lastActivity: -1 })
      .limit(50); 

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Revoke a login session
// @route   PUT /api/login-sessions/:id/revoke
// @access  Private
exports.revokeSession = async (req, res) => {
  try {
    const session = await LoginSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (req.user.role !== 'super-admin' && req.user.role !== 'admin' && session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to revoke this session' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get session timeouts config
// @route   GET /api/login-sessions/timeouts
// @access  Private/Admin
exports.getTimeouts = async (req, res) => {
  try {
    const timeouts = await SessionTimeout.find({});
    res.json(timeouts);
  } catch (error) {
    console.error('Error fetching timeouts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update session timeout config
// @route   PUT /api/login-sessions/timeouts
// @access  Private/Admin
exports.updateTimeout = async (req, res) => {
  try {
    const { role, durationMinutes } = req.body;
    if (!role || durationMinutes === undefined) {
      return res.status(400).json({ message: 'Role and duration are required' });
    }

    let timeoutConfig = await SessionTimeout.findOne({ role });
    
    if (timeoutConfig) {
      timeoutConfig.durationMinutes = durationMinutes;
      await timeoutConfig.save();
    } else {
      timeoutConfig = await SessionTimeout.create({ role, durationMinutes });
    }

    res.json({ message: 'Session timeout updated', data: timeoutConfig });
  } catch (error) {
    console.error('Error updating timeout:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
