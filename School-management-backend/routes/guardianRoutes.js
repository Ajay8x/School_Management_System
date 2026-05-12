const express = require('express');
const router = express.Router();
const {
  getGuardians,
  getGuardian,
  createGuardian,
  updateGuardian,
  deleteGuardian
} = require('../controllers/guardianController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getGuardians)
  .post(protect, authRole('admin'), createGuardian);

router.route('/:id')
  .get(protect, getGuardian)
  .put(protect, authRole('admin'), updateGuardian)
  .delete(protect, authRole('admin'), deleteGuardian);

module.exports = router;
