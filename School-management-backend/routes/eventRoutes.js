const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getEvents)
  .post(protect, authRole('admin', 'super-admin'), createEvent);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authRole('admin', 'super-admin'), updateEvent)
  .delete(protect, authRole('admin', 'super-admin'), deleteEvent);

module.exports = router;

