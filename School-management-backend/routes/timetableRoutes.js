const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

router.get('/', timetableController.getTimetables);
router.get('/teacher', timetableController.getTeacherTimetable);
router.get('/:id', timetableController.getTimetableById);
router.post('/', timetableController.createTimetable);
router.put('/:id', timetableController.updateTimetable);
router.put('/:id/allocations', timetableController.updateAllocations);
router.delete('/:id', timetableController.deleteTimetable);

module.exports = router;
