const express = require('express');
const router = express.Router();
const { getLeaves, createLeave } = require('../controllers/leaveController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getLeaves)
  .post(protect, authRole('admin'), createLeave);

module.exports = router;
