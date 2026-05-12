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
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getStudents)
  .post(protect, authRole('admin', 'super-admin'), createStudent);

router.post('/roll-numbers', protect, authRole('admin', 'super-admin'), updateRollNumbers);

router.route('/:id')
  .get(protect, getStudent)
  .put(protect, authRole('admin', 'super-admin'), updateStudent)
  .delete(protect, authRole('admin', 'super-admin'), deleteStudent);

module.exports = router;
