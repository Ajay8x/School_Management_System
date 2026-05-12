const express = require('express');
const router = express.Router();
const { 
  getHealthRecords, 
  getHealthRecordByStudent, 
  upsertHealthRecord, 
  deleteHealthRecord 
} = require('../controllers/healthController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getHealthRecords)
  .post(protect, authRole('admin', 'super-admin'), upsertHealthRecord);

router.route('/student/:studentId')
  .get(protect, getHealthRecordByStudent);

router.route('/:id')
  .delete(protect, authRole('admin', 'super-admin'), deleteHealthRecord);

module.exports = router;
