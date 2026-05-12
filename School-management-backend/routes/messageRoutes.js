const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/messageController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getMessages)
  .post(protect, authRole('admin'), createMessage);

module.exports = router;
