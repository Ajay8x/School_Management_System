const express = require('express');
const router = express.Router();
const { getPeriods, getPeriod, createPeriod, updatePeriod, deletePeriod, toggleDefault, duplicatePeriod, toggleArchive, toggleLockExam } = require('../controllers/periodController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getPeriods)
  .post(protect, authRole('admin', 'super-admin'), createPeriod);

router.route('/:id')
  .get(protect, getPeriod)
  .put(protect, authRole('admin', 'super-admin'), updatePeriod)
  .delete(protect, authRole('admin', 'super-admin'), deletePeriod);

router.patch('/:id/toggle-default', protect, authRole('admin', 'super-admin'), toggleDefault);
router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicatePeriod);
router.patch('/:id/toggle-archive', protect, authRole('admin', 'super-admin'), toggleArchive);
router.patch('/:id/toggle-lock-exam', protect, authRole('admin', 'super-admin'), toggleLockExam);

module.exports = router;
