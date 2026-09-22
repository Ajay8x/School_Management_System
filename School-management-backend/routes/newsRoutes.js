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
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getNews)
  .post(protect, createNews);

router.post('/bulk-delete', protect, bulkDeleteNews);

router.route('/:id')
  .get(protect, getNewsById)
  .put(protect, updateNews)
  .delete(protect, deleteNews);

router.patch('/:id/status', protect, toggleNewsStatus);

module.exports = router;
