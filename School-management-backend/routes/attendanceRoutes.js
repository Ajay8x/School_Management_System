const express = require('express');
const router = express.Router();
const { getAttendanceByClassAndDate, bulkSaveAttendance } = require('../controllers/attendanceController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getAttendanceByClassAndDate)
  .post(protect, authRole('admin', 'teacher'), bulkSaveAttendance); // Both Admin and Teacher can mark attendance

module.exports = router;
