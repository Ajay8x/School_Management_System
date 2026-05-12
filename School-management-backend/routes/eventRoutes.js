const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getEvents)
  .post(protect, authRole('admin'), createEvent);

module.exports = router;
