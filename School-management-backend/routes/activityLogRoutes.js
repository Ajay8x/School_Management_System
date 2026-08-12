const express = require('express');
const router = express.Router();
const { 
  getActivityLogs, 
  postActivityLog, 
  deleteActivityLog, 
  clearActivityLogs 
} = require('../controllers/activityLogController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(authRole('admin', 'super-admin'), getActivityLogs)
  .post(postActivityLog);

router.delete('/clear', authRole('super-admin'), clearActivityLogs);
router.delete('/:id', authRole('admin', 'super-admin'), deleteActivityLog);

module.exports = router;
