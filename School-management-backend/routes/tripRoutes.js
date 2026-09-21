const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addParticipant,
  updateParticipant,
  removeParticipant,
  importTrips
} = require('../controllers/tripController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getTrips)
  .post(protect, authRole('admin', 'super-admin', 'teacher'), createTrip);

router.route('/import')
  .post(protect, authRole('admin', 'super-admin'), importTrips);

router.route('/:id')
  .get(protect, getTripById)
  .put(protect, authRole('admin', 'super-admin', 'teacher'), updateTrip)
  .delete(protect, authRole('admin', 'super-admin'), deleteTrip);

router.route('/:id/participants')
  .post(protect, addParticipant);

router.route('/:id/participants/:participantId')
  .put(protect, updateParticipant)
  .delete(protect, removeParticipant);

module.exports = router;
