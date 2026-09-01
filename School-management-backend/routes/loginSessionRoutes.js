const express = require('express');
const router = express.Router();
const { getSessions, revokeSession, getTimeouts, updateTimeout } = require('../controllers/loginSessionController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Get all active sessions
router.route('/').get(protect, getSessions);

// Revoke a session
router.route('/:id/revoke').put(protect, revokeSession);

// Config timeouts (Admin only)
router.route('/timeouts')
  .get(protect, authRole('admin', 'super-admin'), getTimeouts)
  .put(protect, authRole('admin', 'super-admin'), updateTimeout);

module.exports = router;
