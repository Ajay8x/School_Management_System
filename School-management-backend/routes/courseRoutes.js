const express = require('express');
const router = express.Router();
const { 
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, duplicateCourse, reorderCourses, addBatchToCourse,
  getCourseIncharges, addCourseIncharge, getEnrollmentSeats, createEnrollmentSeat
} = require('../controllers/courseController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getCourses)
  .post(protect, authRole('admin', 'super-admin'), createCourse);

router.post('/reorder', protect, authRole('admin', 'super-admin'), reorderCourses);

// Course Incharges Routes
router.get('/incharges/all', protect, getCourseIncharges);
router.post('/incharges/add', protect, authRole('admin', 'super-admin'), addCourseIncharge);

// Enrollment Seats Routes
router.get('/enrollment-seats/all', protect, getEnrollmentSeats);
router.post('/enrollment-seats/add', protect, authRole('admin', 'super-admin'), createEnrollmentSeat);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authRole('admin', 'super-admin'), updateCourse)
  .delete(protect, authRole('admin', 'super-admin'), deleteCourse);

router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateCourse);
router.post('/:id/batches', protect, authRole('admin', 'super-admin'), addBatchToCourse);

module.exports = router;
