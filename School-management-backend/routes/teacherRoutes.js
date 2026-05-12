const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacherController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getTeachers)
  .post(protect, authRole('admin'), createTeacher);

router.route('/:id')
  .get(protect, getTeacher)
  .put(protect, authRole('admin'), updateTeacher)
  .delete(protect, authRole('admin'), deleteTeacher);

module.exports = router;
