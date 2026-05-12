const express = require('express');
const router = express.Router();
const { getNotices, getNotice, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getNotices)
  .post(protect, authRole('admin', 'super-admin'), createNotice);

router.route('/:id')
  .get(protect, getNotice)
  .put(protect, authRole('admin', 'super-admin'), updateNotice)
  .delete(protect, authRole('admin', 'super-admin'), deleteNotice);

module.exports = router;
