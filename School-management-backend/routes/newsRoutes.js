const express = require('express');
const router = express.Router();
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  bulkDeleteNews,
  toggleNewsStatus
} = require('../controllers/newsController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getNews)
  .post(protect, authRole('admin', 'super-admin', 'teacher'), createNews);

router.post('/bulk-delete', protect, authRole('admin', 'super-admin'), bulkDeleteNews);

router.route('/:id')
  .get(protect, getNewsById)
  .put(protect, authRole('admin', 'super-admin', 'teacher'), updateNews)
  .delete(protect, authRole('admin', 'super-admin'), deleteNews);

router.patch('/:id/status', protect, authRole('admin', 'super-admin'), toggleNewsStatus);

module.exports = router;
