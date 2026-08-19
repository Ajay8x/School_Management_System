const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  updateRollNumbers
} = require('../controllers/studentController');
const {
  getConfig,
  updateConfig,
  getOptions,
  createOption,
  updateOption,
  deleteOption
} = require('../controllers/studentConfigController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Student Config Routes
router.route('/config')
  .get(protect, getConfig)
  .put(protect, authRole('admin', 'super-admin'), updateConfig);

router.route('/config/options/:type')
  .get(protect, getOptions)
  .post(protect, authRole('admin', 'super-admin'), createOption);

router.route('/config/options/:type/:id')
  .put(protect, authRole('admin', 'super-admin'), updateOption)
  .delete(protect, authRole('admin', 'super-admin'), deleteOption);

// Standard Student Management Routes
router.route('/')
  .get(protect, getStudents)
  .post(protect, authRole('admin', 'super-admin'), createStudent);

router.post('/roll-numbers', protect, authRole('admin', 'super-admin'), updateRollNumbers);

router.route('/:id')
  .get(protect, getStudent)
  .put(protect, authRole('admin', 'super-admin'), updateStudent)
  .delete(protect, authRole('admin', 'super-admin'), deleteStudent);

module.exports = router;
