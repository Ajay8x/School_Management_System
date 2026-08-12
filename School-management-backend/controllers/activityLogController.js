const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all activity logs with filtering & pagination
// @route   GET /api/activity-logs
// @access  Private (Admin & Super-Admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const { search, role, activityType, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    // Text search filter
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { activity: searchRegex },
        { ip: searchRegex },
        { browser: searchRegex },
        { os: searchRegex }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      query.userRole = role;
    }

    // Activity type filter
    if (activityType && activityType !== 'all') {
      if (activityType === 'login') {
        query.activity = /logged in/i;
      } else if (activityType === 'logout') {
        query.activity = /logged out/i;
      } else if (activityType === 'updated') {
        query.activity = /updated/i;
      } else {
        query.activity = new RegExp(activityType, 'i');
      }
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email role');

    res.json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Server error while fetching activity logs' });
  }
};

// @desc    Manually record an activity log (e.g., from frontend logout)
// @route   POST /api/activity-logs
// @access  Private
exports.postActivityLog = async (req, res) => {
  try {
    const { activity } = req.body;
    if (!activity) {
      return res.status(400).json({ message: 'Activity description is required' });
    }

    await logActivity({
      req,
      user: req.user,
      userName: req.user ? req.user.name : undefined,
      userEmail: req.user ? req.user.email : undefined,
      userRole: req.user ? req.user.role : undefined,
      activity: activity
    });

    res.status(201).json({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Error recording activity log:', error);
    res.status(500).json({ message: 'Server error while recording activity' });
  }
};

// @desc    Delete single activity log
// @route   DELETE /api/activity-logs/:id
// @access  Private (Admin / Super Admin)
exports.deleteActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Activity log entry not found' });
    }
    res.json({ success: true, message: 'Activity log deleted' });
  } catch (error) {
    console.error('Error deleting activity log:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all activity logs
// @route   DELETE /api/activity-logs/clear
// @access  Private (Super Admin)
exports.clearActivityLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: 'All activity logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
