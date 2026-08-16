const express = require('express');
const router = express.Router();
const { getSessions, getSession, createSession, updateSession, deleteSession } = require('../controllers/sessionController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getSessions)
  .post(protect, authRole('admin', 'super-admin'), createSession);

router.route('/:id')
  .get(protect, getSession)
  .put(protect, authRole('admin', 'super-admin'), updateSession)
  .delete(protect, authRole('admin', 'super-admin'), deleteSession);

module.exports = router;
