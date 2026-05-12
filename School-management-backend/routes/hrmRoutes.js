const express = require('express');
const router = express.Router();
const { getHRMs, createHRM } = require('../controllers/hrmController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getHRMs)
  .post(protect, authRole('admin'), createHRM);

module.exports = router;
