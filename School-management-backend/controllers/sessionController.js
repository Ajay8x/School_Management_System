const mongoose = require('mongoose');
const Session = require('../models/Session');
const School = require('../models/School');
const { logActivity } = require('../utils/logActivity');

// Helper to check valid Mongoose ObjectId
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined' && id !== '';

// Helper to format date string to human readable format (e.g. "April 1, 2025")
const formatDateString = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    const sessions = await Session.find(filter).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create session
// @route   POST /api/sessions
// @access  Private (Admin)
exports.createSession = async (req, res) => {
  try {
    const sessionData = { ...req.body };
    
    // Attach school if valid
    if (req.schoolId && isValidId(req.schoolId)) {
      sessionData.school = req.schoolId;
    } else if (req.user && req.user.school && isValidId(req.user.school)) {
      sessionData.school = req.user.school;
    } else {
      delete sessionData.school;
    }

    // Auto calculate period if not explicitly given
    if (!sessionData.period) {
      if (sessionData.startDate && sessionData.endDate) {
        const startStr = formatDateString(sessionData.startDate);
        const endStr = formatDateString(sessionData.endDate);
        sessionData.period = `${startStr} to ${endStr}`;
      } else if (sessionData.name) {
        sessionData.period = sessionData.name;
      }
    }

    // Default code if missing
    if (!sessionData.code && sessionData.name) {
      sessionData.code = sessionData.name;
    }

    const session = await Session.create(sessionData);

    await logActivity({ req, user: req.user, activity: `Created new session: ${session.name}` });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(400).json({ message: error.message || 'Failed to create session' });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Admin)
exports.updateSession = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const updateData = { ...req.body };

    if (!updateData.period && updateData.startDate && updateData.endDate) {
      const startStr = formatDateString(updateData.startDate);
      const endStr = formatDateString(updateData.endDate);
      updateData.period = `${startStr} to ${endStr}`;
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await logActivity({ req, user: req.user, activity: `Updated session: ${session.name}` });

    return res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    return res.status(400).json({ message: error.message || 'Failed to update session' });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Admin)
exports.deleteSession = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    await Session.findByIdAndDelete(req.params.id);

    await logActivity({ req, user: req.user, activity: `Deleted session: ${session.name}` });

    return res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
